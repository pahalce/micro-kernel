"use client";

import React from "react";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScoreBadge } from "@/components/score-badge";
import {
  AlertCircle,
  CalendarDays,
  MessageSquare,
  User,
  ChevronLeft,
  XCircle,
  Share2,
} from "lucide-react";
import type { ScoreComputed } from "@event-driven/events";

type DiaryDetailProps = {
  diaryId: string;
  initialScores?: ScoreComputed["scores"];
  onBack?: () => void;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function DiaryDetail({
  diaryId,
  initialScores,
  onBack,
}: DiaryDetailProps) {
  const { data: diary, error } = useSWR<{
    text: string;
    createdAt: string;
    userId: string;
  }>(`/api/diaries/${diaryId}`, fetcher);

  const [scores, setScores] = React.useState(initialScores);
  React.useEffect(() => {
    if (initialScores) setScores(initialScores);
  }, [initialScores]);

  // If we have a diary and it's a mock diary (error message)
  const isDiaryServiceDown = diary?.text?.includes(
    "diary service couldn't be reached",
  );
  const displayScores = scores || (isDiaryServiceDown ? {} : undefined);

  // Format the date if available
  const formattedDate = diary?.createdAt
    ? new Date(diary.createdAt).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  // Calculate overall sentiment
  const overallSentiment = React.useMemo(() => {
    if (!displayScores || Object.keys(displayScores).length === 0)
      return "neutral";

    const values = Object.values(displayScores) as number[];
    const avgScore =
      values.reduce((sum, score) => sum + score, 0) /
      Math.max(1, values.length);

    if (avgScore > 0.3) return "positive";
    if (avgScore < -0.3) return "negative";
    return "neutral";
  }, [displayScores]);

  // Get sentiment label and color
  const getSentimentInfo = () => {
    switch (overallSentiment) {
      case "positive":
        return {
          label: "Positive",
          color: "text-green-600 bg-green-50 border-green-200",
        };
      case "negative":
        return {
          label: "Negative",
          color: "text-red-600 bg-red-50 border-red-200",
        };
      default:
        return {
          label: "Neutral",
          color: "text-blue-600 bg-blue-50 border-blue-200",
        };
    }
  };

  const sentimentInfo = getSentimentInfo();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 pl-2 h-8"
            onClick={onBack}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>

          <Badge className={`${sentimentInfo.color} px-3 py-1`}>
            {sentimentInfo.label} Entry
          </Badge>
        </div>

        <CardTitle className="text-xl">{diaryId}</CardTitle>
        {formattedDate && (
          <CardDescription className="flex items-center gap-1 mt-2">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </CardDescription>
        )}
        {diary?.userId && (
          <CardDescription className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            <span>User ID: {diary.userId}</span>
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        {/* Entry Content */}
        <div className="border rounded-lg p-4 bg-muted/20 mb-6">
          {diary ? (
            <p className="whitespace-pre-wrap text-base leading-relaxed">
              {diary.text}
            </p>
          ) : error ? (
            <div className="flex items-center text-destructive gap-2 p-4 border border-destructive/20 rounded-md bg-destructive/10">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Failed to load entry</p>
                <p className="text-sm mt-1">
                  The diary entry could not be retrieved from the server
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-muted-foreground py-8 justify-center">
              <MessageSquare className="h-4 w-4 animate-pulse mr-2" />
              <span>Loading entry content...</span>
            </div>
          )}
        </div>

        {/* Score Analysis */}
        <div>
          <h3 className="text-lg font-medium mb-3">AI Analysis</h3>

          {displayScores && Object.keys(displayScores).length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(displayScores).map(([name, value]) => (
                  <ScoreBadge key={name} name={name} value={value as number} />
                ))}
              </div>

              <div className="p-4 rounded-lg bg-muted/20 border">
                <h4 className="font-medium mb-2">AI Interpretation</h4>
                <p className="text-sm text-muted-foreground">
                  {overallSentiment === "positive"
                    ? "This entry shows overall positive indicators. You seem to be in a good mental state with high levels of motivation."
                    : overallSentiment === "negative"
                      ? "This entry indicates some negative patterns. You might be experiencing challenges or decreased motivation."
                      : "This entry shows a balanced mood with neither strongly positive nor negative indicators."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-6 border rounded-lg text-center">
              <Badge variant="outline" className="animate-pulse mb-2">
                Analysis in progress...
              </Badge>
              <p className="text-sm text-muted-foreground">
                The system is analyzing your entry to provide insights
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col pt-0">
        <Separator className="mb-4 w-full" />

        {/* Action Buttons */}
        <div className="flex justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>

          <Button
            variant="destructive"
            size="sm"
            className="flex items-center gap-1"
          >
            <XCircle className="h-4 w-4" />
            Delete
          </Button>
        </div>

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
