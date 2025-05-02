"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useSSE } from "@/lib/useSSE";
import { DiaryDetail } from "@/components/diary-detail";
import type { ScoreComputed } from "@event-driven/events";

export default function DiaryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const diaryId = params.id as string;

  // Get real-time updates
  const evt = useSSE<ScoreComputed>("/api/diaries");

  // Track all entries for score updates
  const [entries, setEntries] = React.useState(
    () => new Map<string, ScoreComputed>(),
  );

  React.useEffect(() => {
    if (evt) setEntries((prev) => new Map(prev).set(evt.diaryId, evt));
  }, [evt]);

  // Get scores for this diary entry
  const currentEntry = entries.get(diaryId);

  // Handle navigation back to the diary list
  const handleBack = () => {
    router.push("/diary");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <DiaryDetail
          diaryId={diaryId}
          initialScores={currentEntry?.scores}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
