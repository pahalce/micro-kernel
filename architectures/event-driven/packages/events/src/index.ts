/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { z } from "zod";

/* ───────────────────── トピック名 ───────────────────── */
export const Topics = {
  DiarySubmitted: "diary-submitted",
  DiaryAnalyzed: "diary-analyzed",
  ScoreComputed: "score-computed",
  NotificationQueued: "notification-queued",
} as const;
export type Topic = (typeof Topics)[keyof typeof Topics];

/* ───────────────────── DiarySubmitted ───────────────────── */
export const DiarySubmittedSchema = z.object({
  diaryId: z.string().uuid(),
  userId: z.string().uuid(),
  text: z.string().min(1),
  createdAt: z.string().datetime(), // ISO 8601
});
export type DiarySubmitted = z.infer<typeof DiarySubmittedSchema>;

/* ───────────────────── DiaryAnalyzed ───────────────────── */
export const DiaryAnalyzedSchema = DiarySubmittedSchema.extend({
  emotions: z.record(z.number()), // { joy:0.8, sadness:0.1, … }
  analyzedAt: z.string().datetime(),
});
export type DiaryAnalyzed = z.infer<typeof DiaryAnalyzedSchema>;

/* ───────────────────── ScoreComputed (5-axis) ───────────────────── */
export const ScoreComputedSchema = z.object({
  diaryId: z.string().uuid(),
  userId: z.string().uuid(),
  scores: z.object({
    creativity: z.number(),
    effort: z.number(),
    motivation: z.number(),
    efficiency: z.number(),
    goal: z.number(),
  }),
  computedAt: z.string().datetime(),
});
export type ScoreComputed = z.infer<typeof ScoreComputedSchema>;

/* ───────────────────── NotificationQueued ───────────────────── */
export const NotificationQueuedSchema = z.object({
  diaryId: z.string().uuid(),
  userId: z.string().uuid(),
  message: z.string().min(1),
  queuedAt: z.string().datetime(),
});
export type NotificationQueued = z.infer<typeof NotificationQueuedSchema>;
