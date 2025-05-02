"use client";
import { useSSE } from "@/lib/useSSE";
import { DiaryCard } from "@/components/diary-card";
import { DiaryForm } from "@/components/diary-form";
import type { ScoreComputed } from "@event-driven/events";
import React from "react";

export default function Page() {
  // score-computed をリアルタイム取得
  const evt = useSSE<ScoreComputed>("/api/diaries");

  // in-memory に一覧を持つだけ（簡易実装）
  const [list, setList] = React.useState(
    () => new Map<string, ScoreComputed>(),
  );

  React.useEffect(() => {
    if (evt) setList((prev) => new Map(prev).set(evt.diaryId, evt));
  }, [evt]);

  return (
    <main className="container mx-auto py-8 space-y-8">
      <DiaryForm />

      <div className="space-y-4">
        {[...list.values()].reverse().map((item) => (
          <DiaryCard
            key={item.diaryId}
            diaryId={item.diaryId}
            initialScores={item.scores}
          />
        ))}
      </div>
    </main>
  );
}
