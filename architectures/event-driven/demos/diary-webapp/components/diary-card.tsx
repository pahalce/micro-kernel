"use client";

import React from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ScoreComputed } from "@event-driven/events";

type Props = {
  diaryId: string;
  initialScores?: ScoreComputed["scores"];
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Mock scores for demo when diary service is unavailable
const MOCK_SCORES = {
  creativity: 0.0,
  effort: 0.0,
  motivation: 0.0,
  efficiency: 1.0, // One positive value for visual distinction
  goal: 0.0,
};

export function DiaryCard({ diaryId, initialScores }: Props) {
  const { data: diary, error } = useSWR<{ text: string }>(
    `/api/diaries/${diaryId}`,
    fetcher,
  );

  /* スコアは親コンポーネントが props で上書きしてくる想定 */
  const [scores, setScores] = React.useState(initialScores);
  React.useEffect(() => {
    if (initialScores) setScores(initialScores);
  }, [initialScores]);

  // If we have a diary and it's a mock diary (contains the error message),
  // and we don't have scores, use mock scores
  const isDiaryServiceDown = diary?.text?.includes(
    "diary service couldn't be reached",
  );
  const displayScores =
    scores || (isDiaryServiceDown ? MOCK_SCORES : undefined);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-mono text-sm">{diaryId}</CardTitle>
      </CardHeader>

      <CardContent>
        {/* ── 日記本文 ── */}
        <p className="mb-2 whitespace-pre-wrap">
          {diary ? diary.text : error ? "Failed to load diary" : "loading…"}
        </p>

        <Separator className="my-2" />

        {/* ── スコア表示 ── */}
        {displayScores ? (
          <div className="flex gap-2 flex-wrap">
            {Object.entries(displayScores).map(([k, v]) => (
              <Badge key={k} variant="outline">
                {k}:{" "}
                <span
                  className={
                    v > 0.5 ? "text-green-600" : v < -0.3 ? "text-red-600" : ""
                  }
                >
                  {v.toFixed(2)}
                </span>
              </Badge>
            ))}
          </div>
        ) : (
          <Badge variant="secondary">scoring…</Badge>
        )}

        {/* Show instruction if diary service is down */}
        {isDiaryServiceDown && (
          <div className="mt-4 p-2 bg-amber-50 text-amber-700 rounded text-sm">
            <strong>Note:</strong> The diary service appears to be offline.
            Start it with:
            <code className="block mt-1 p-1 bg-gray-100 rounded font-mono text-xs">
              cd ../../../apps/diary-service && pnpm dev
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
