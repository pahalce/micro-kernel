// packages/events/src/index.ts
import { z } from "zod";

export const Topics = {
  DiarySubmitted: "diary-submitted",
  DiaryAnalyzed: "diary-analyzed",
  ScoreComputed: "score-computed",
  NotificationQueued: "notification-queued",
} as const;

/* DiarySubmitted */
export const DiarySubmittedSchema = z.object({
  diaryId: z.string().uuid(),
  userId: z.string().uuid(),
  text: z.string().min(1),
  createdAt: z.string().datetime(),
});
export type DiarySubmitted = z.infer<typeof DiarySubmittedSchema>;

/* DiaryAnalyzed */
export const DiaryAnalyzedSchema = DiarySubmittedSchema.extend({
  emotions: z.record(z.number()), // { joy:0.2 … }
  analyzedAt: z.string().datetime(),
});
export type DiaryAnalyzed = z.infer<typeof DiaryAnalyzedSchema>;

/* ScoreComputed */
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
