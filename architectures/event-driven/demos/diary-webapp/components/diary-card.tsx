import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ScoreComputed } from "@event-driven/events";
import React from "react";

type Props = {
  diaryId: string;
  text: string;
  scores?: ScoreComputed["scores"];
};

export function DiaryCard({ diaryId, text, scores }: Props) {
  // 個別 SSE ではなく親で受け取って Prop で渡すなら不要
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-md font-mono">{diaryId}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2 whitespace-pre-wrap">{text}</p>
        <Separator className="my-2" />
        {scores ? (
          <div className="flex gap-2 flex-wrap">
            {Object.entries(scores).map(([k, v]) => (
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
      </CardContent>
    </Card>
  );
}
