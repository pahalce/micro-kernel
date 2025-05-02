import {
  Kafka,
  logLevel,
  type EachMessagePayload,
  type Producer,
} from "kafkajs";

/* ---------- シングルトン Kafka インスタンス ---------- */
export const kafka = new Kafka({
  clientId: "reanavi",
  brokers: ["localhost:9092"],
  logLevel: logLevel.ERROR,
});

/* ---------- ユーティリティ ---------- */

/** JSON 文字列 → オブジェクト。パース失敗時 undefined を返す */
export const safeJSON = <T>(raw: string): T | undefined => {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
};

/** 汎用 JSON Produce */
export const produceJSON = (
  producer: Producer,
  topic: string,
  key: string,
  value: unknown,
) =>
  producer.send({
    topic,
    messages: [{ key, value: JSON.stringify(value) }],
  });

/** Consumer で使う基本ハンドラ型 */
export type MessageHandler = (payload: EachMessagePayload) => Promise<void>;
