"use client";
import { useSSE } from "@/lib/useSSE";
import { DiaryCard } from "@/components/diary-card";
import { DiaryForm } from "@/components/diary-form";
import { Hero } from "@/components/ui/hero";
import { Button } from "@/components/ui/button";
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
    <main>
      <Hero
        heading="Reflect on Your Day"
        subheading="Document your thoughts and get AI-powered insights about your emotions and motivations."
        imageUrl="https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1470&auto=format&fit=crop"
      >
        <Button size="lg" className="mt-2">
          Start Writing
        </Button>
      </Hero>

      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4 order-2 lg:order-1">
            <h2 className="text-2xl font-bold">Your Journal Entries</h2>
            <div className="space-y-4">
              {[...list.values()].reverse().map((item) => (
                <DiaryCard
                  key={item.diaryId}
                  diaryId={item.diaryId}
                  initialScores={item.scores}
                />
              ))}
              {list.size === 0 && (
                <div className="text-center p-8 border rounded-lg text-muted-foreground">
                  Your entries will appear here once you start writing
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2">
            <DiaryForm />
          </div>
        </div>
      </div>
    </main>
  );
}
