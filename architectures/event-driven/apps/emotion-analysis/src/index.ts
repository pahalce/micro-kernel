import { kafka, produceJSON } from "@event-driven/kafka";
import {
  Topics,
  DiarySubmittedSchema,
  DiaryAnalyzedSchema,
  type DiaryAnalyzed,
} from "@event-driven/events";
import { JA_SENTI_DICT, type Polarity } from "./semanticDict.js";
import kuromoji from "kuromoji";
import emojiRegex from "emoji-regex";

// ――― (1) Kuromoji ビルド（dict は内蔵なのでそのまま）
const tokenizer = await new Promise<
  kuromoji.Tokenizer<kuromoji.IpadicFeatures>
>((res) =>
  kuromoji
    .builder({ dicPath: "node_modules/kuromoji/dict" })
    .build((_, tk) => res(tk)),
);

// ――― (2) Kafka 接続
const consumer = kafka.consumer({ groupId: "emotion-analysis" });
const producer = kafka.producer();
await Promise.all([consumer.connect(), producer.connect()]);
await consumer.subscribe({ topic: Topics.DiarySubmitted, fromBeginning: true });

consumer.run({
  eachMessage: async ({ message }) => {
    const src = JSON.parse(message.value?.toString() || "");
    const diary = DiarySubmittedSchema.parse(src);

    // ――― (3) 日本語テキストをトークン化
    const tokens = tokenizer
      .tokenize(diary.text)
      .map((t) => (t.basic_form === "*" ? t.surface_form : t.basic_form));

    // ――― (4) 感情スコア初期化
    const score: Record<Polarity, number> = {
      joy: 0,
      anger: 0,
      sadness: 0,
      fear: 0,
      surprise: 0,
    };

    // ――― (5) 単語辞書でカウント
    for (const w of tokens) {
      const p = JA_SENTI_DICT[w];
      if (p) score[p] += 1;
    }

    // ――― (6) 絵文字ヒント
    const emojiHits = [...diary.text.matchAll(emojiRegex())].map((m) => m[0]);
    for (const e of emojiHits) {
      if ("🤣😂😊😄😁😆".includes(e)) score.joy += 1;
      else if ("😡🤬".includes(e)) score.anger += 1;
      else if ("😢😭".includes(e)) score.sadness += 1;
      else if ("😱😨".includes(e)) score.fear += 1;
      else if ("😲😳".includes(e)) score.surprise += 1;
    }

    // ――― (7) 正規化（最大 1.0 に）
    const max = Math.max(...Object.values(score)) || 1;
    for (const k of Object.keys(score)) {
      score[k as Polarity] = +(score[k as Polarity] / max).toFixed(3);
    }

    const analyzed: DiaryAnalyzed = {
      ...diary,
      emotions: score,
      analyzedAt: new Date().toISOString(),
    };

    DiaryAnalyzedSchema.parse(analyzed);
    await produceJSON(
      producer,
      Topics.DiaryAnalyzed,
      analyzed.diaryId,
      analyzed,
    );
    console.log("[emotion-ja] analyzed", analyzed.diaryId, analyzed.emotions);
  },
});
