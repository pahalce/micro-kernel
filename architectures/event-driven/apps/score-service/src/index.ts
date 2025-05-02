import { Hono } from "hono";

import { kafka } from "@event-driven/kafka";
import {
  type DiaryAnalyzed,
  DiaryAnalyzedSchema,
  type ScoreComputed,
  ScoreComputedSchema,
  Topics,
} from "@event-driven/events";

/* ───────── in-memory ストア ───────── */
const latest = new Map<string, ScoreComputed>();

/* ───────── Scoring Logic (example) ───────── */
function calcScores(e: DiaryAnalyzed): ScoreComputed["scores"] {
  const emo = e.emotions;

  /** 任意の重み付け例 */
  return {
    creativity: +((emo.joy ?? 0) * 0.6 + (emo.surprise ?? 0) * 0.4).toFixed(3),
    effort: +((emo.anger ?? 0) * 0.5 + (emo.disgust ?? 0) * 0.5).toFixed(3),
    motivation: +((emo.joy ?? 0) - (emo.sadness ?? 0)).toFixed(3),
    efficiency: +(1 - (emo.anger ?? 0) - (emo.sadness ?? 0)).toFixed(3),
    goal: +((emo.joy ?? 0) * 0.3 + (emo.trust ?? 0) * 0.7).toFixed(3),
  };
}

/* ───────── Kafka Setup ───────── */
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "score-service" });

async function kafkaLoop() {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: Topics.DiaryAnalyzed });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;
      const evt = DiaryAnalyzedSchema.parse(
        JSON.parse(message.value.toString()),
      );

      const computed = ScoreComputedSchema.parse({
        diaryId: evt.diaryId,
        userId: evt.userId,
        scores: calcScores(evt),
        computedAt: new Date().toISOString(),
      });

      latest.set(evt.userId, computed);

      await producer.send({
        topic: Topics.ScoreComputed,
        messages: [{ key: evt.userId, value: JSON.stringify(computed) }],
      });

      console.log("[score] computed", computed);
    },
  });
}

kafkaLoop().catch((err) => {
  console.error(err);
  process.exit(1);
});

/* ───────── REST API (GET /scores/:userId) ───────── */
const app = new Hono();

app.get("/scores/:userId", (c) => {
  const s = latest.get(c.req.param("userId"));
  return s ? c.json(s) : c.notFound();
});

export default app;
