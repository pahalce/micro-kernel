import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";

import { kafka } from "@event-driven/kafka";
import { Topics, DiarySubmittedSchema } from "@event-driven/events";
const producer = kafka.producer();

// CommonJSモジュールでは即時実行関数を使用してトップレベルawaitを回避
(async () => {
  await producer.connect();
})();

const app = new Hono();

app.post("/diaries", async (c) => {
  // ❶ ボディ取得
  const body = await c.req.json<{ userId: string; text: string }>();
  const payload = {
    diaryId: uuid(),
    userId: body.userId,
    text: body.text,
    createdAt: dayjs().toISOString(),
  };

  // ❷ Zod で型バリデーション
  DiarySubmittedSchema.parse(payload);

  // ❸ Kafka へ Publish
  const res = await producer.send({
    topic: Topics.DiarySubmitted,
    messages: [{ key: payload.diaryId, value: JSON.stringify(payload) }],
  });

  console.log("[diary] produced →", payload.diaryId);
  console.log("[diary] res →", res);

  return c.json({ id: payload.diaryId }, 201);
});

// Node.js でリッスン（既定ポート 3000）
serve(app, (info) => {
  console.log(`DiaryService 🚀  http://localhost:${info.port}`);
});
