import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";

import { kafka, produceJSON } from "@event-driven/kafka";
import {
  Topics,
  type DiarySubmitted,
  DiarySubmittedSchema,
} from "@event-driven/events";

const producer = kafka.producer();
const app = new Hono();

/* ▼▼▼ 追　加　部　分 ────────────────────────────── */
// シンプルにメモリ保持 (本番なら DB へ置き換え)
const diaryStore = new Map<string, DiarySubmitted>();
/* ▲▲▲ 追　加　部　分 ────────────────────────────── */

/* ───────── 既存: POST /diaries ───────── */
app.post("/diaries", async (c) => {
  const body = await c.req.json<{ userId: string; text: string }>();

  const payload: DiarySubmitted = {
    diaryId: uuid(),
    userId: body.userId,
    text: body.text,
    createdAt: dayjs().toISOString(),
  };

  DiarySubmittedSchema.parse(payload); // zod validate

  /* ▼▼▼ 追　加　部　分 ────────────────────────────── */
  diaryStore.set(payload.diaryId, payload); // メモリに保存
  /* ▲▲▲ 追　加　部　分 ────────────────────────────── */

  const res = await produceJSON(
    producer,
    Topics.DiarySubmitted,
    payload.diaryId,
    payload,
  );

  console.log("[diary] produced →", payload.diaryId);
  console.log("[diary] res      →", res);

  return c.json({ id: payload.diaryId }, 201);
});

/* ▼▼▼ 追　加　エンドポイント: POST /diaries/{diaryId} ───────── */
app.get("/diaries/:diaryId", async (c) => {
  const { diaryId } = c.req.param();
  const diary = diaryStore.get(diaryId);
  if (!diary) return c.json({ error: "Diary not found" }, 404);
  return c.json(diary);
});
/* ▲▲▲ 追　加　エンドポイント ────────────────────────── */

/* ───────── 起動処理（既存） ───────── */
(async () => {
  await producer.connect();
})();

serve({ port: 8000, fetch: app.fetch }, (info) => {
  console.log(`DiaryService 🚀  http://localhost:${info.port}`);
});
