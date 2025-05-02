"use client";

import React from "react";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, MessageSquare, AlertCircle } from "lucide-react";
import { ScoreBadge } from "@/components/score-badge";
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
  const { data: diary, error } = useSWR<{ text: string; createdAt: string }>(
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

  // Format the date if available
  const formattedDate = diary?.createdAt
    ? new Date(diary.createdAt).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Card className="w-full overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium text-muted-foreground truncate max-w-[200px]">
              {diaryId}
            </CardTitle>
            {formattedDate && (
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarDays className="mr-1 h-3 w-3" />
                {formattedDate}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* ── 日記本文 ── */}
        <div className="mb-4">
          {diary ? (
            <p className="whitespace-pre-wrap text-sm">{diary.text}</p>
          ) : error ? (
            <div className="flex items-center text-destructive gap-1">
              <AlertCircle className="h-4 w-4" />
              <span>Failed to load entry</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="h-4 w-4 animate-pulse" />
              <span>Loading entry...</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start pt-0">
        <Separator className="mb-3 w-full" />

        {/* ── スコア表示 ── */}
        {displayScores ? (
          <div className="flex gap-1.5 flex-wrap">
            {Object.entries(displayScores).map(([name, value]) => (
              <ScoreBadge key={name} name={name} value={value} />
            ))}
          </div>
        ) : (
          <Badge variant="outline" className="animate-pulse">
            Analyzing...
          </Badge>
        )}

        {/* Show instruction if diary service is down */}
        {isDiaryServiceDown && (
          <div className="mt-4 p-2 bg-amber-50 text-amber-700 rounded text-sm w-full">
            <div className="flex items-center gap-1 font-medium">
              <AlertCircle className="h-4 w-4" />
              <span>Diary service offline</span>
            </div>
            <p className="text-xs mt-1">
              Start it with:
              <code className="block mt-1 p-1 bg-background rounded font-mono text-xs border">
                cd ../../../apps/diary-service && pnpm dev
              </code>
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
