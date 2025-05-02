"use client";

import React from "react";
import { useSSE } from "@/lib/useSSE";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScoreBadge } from "@/components/score-badge";
import { Separator } from "@/components/ui/separator";
import {
  PieChart,
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
} from "lucide-react";
import type { ScoreComputed } from "@event-driven/events";

export default function AnalyticsPage() {
  // Get real-time updates for diary entries
  const evt = useSSE<ScoreComputed>("/api/diaries");

  // Store all diary entries
  const [list, setList] = React.useState(
    () => new Map<string, ScoreComputed>(),
  );

  // Update diary list when new entries arrive
  React.useEffect(() => {
    if (evt) setList((prev) => new Map(prev).set(evt.diaryId, evt));
  }, [evt]);

  // Calculate average scores
  const averageScores = React.useMemo(() => {
    // Initialize score categories
    const scoreCategories = [
      "creativity",
      "effort",
      "motivation",
      "efficiency",
      "goal",
    ];
    const scoreMap: Record<
      string,
      { total: number; count: number; average: number }
    > = {};

    // Initialize score map
    for (const category of scoreCategories) {
      scoreMap[category] = { total: 0, count: 0, average: 0 };
    }

    // Calculate totals and counts
    for (const entry of [...list.values()]) {
      const scores = entry.scores || {};
      for (const [category, value] of Object.entries(scores)) {
        if (scoreMap[category]) {
          scoreMap[category].total += value;
          scoreMap[category].count += 1;
        }
      }
    }

    // Calculate averages
    for (const category of Object.keys(scoreMap)) {
      const { total, count } = scoreMap[category];
      scoreMap[category].average = count > 0 ? total / count : 0;
    }

    return scoreMap;
  }, [list]);

  // Find highest and lowest scoring categories
  const topCategory = React.useMemo(() => {
    return Object.entries(averageScores)
      .filter(([_, data]) => data.count > 0)
      .sort((a, b) => b[1].average - a[1].average)[0];
  }, [averageScores]);

  const bottomCategory = React.useMemo(() => {
    return Object.entries(averageScores)
      .filter(([_, data]) => data.count > 0)
      .sort((a, b) => a[1].average - b[1].average)[0];
  }, [averageScores]);

  // Count entries by sentiment
  const sentimentCounts = React.useMemo(() => {
    const counts = { positive: 0, neutral: 0, negative: 0 };

    for (const entry of [...list.values()]) {
      const scores = entry.scores || {};
      const avgScore =
        Object.values(scores).reduce((sum, score) => sum + score, 0) /
        Math.max(1, Object.values(scores).length);

      if (avgScore > 0.3) counts.positive++;
      else if (avgScore < -0.3) counts.negative++;
      else counts.neutral++;
    }

    return counts;
  }, [list]);

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex flex-col mb-8 space-y-4">
        <div className="flex items-center gap-3">
          <PieChartIcon className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Analytics</h1>
        </div>
        <p className="text-muted-foreground">
          Insights and patterns from your journal entries
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 mb-8 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{list.size}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {list.size === 0
                ? "Start writing to see analytics"
                : "Journal entries analyzed"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Mood Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                Positive: {sentimentCounts.positive}
              </div>
              <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                Neutral: {sentimentCounts.neutral}
              </div>
              <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                Negative: {sentimentCounts.negative}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Entry Frequency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {list.size > 0
                ? Math.round(list.size / (list.size > 5 ? 5 : 1))
                : 0}
              <span className="text-sm font-normal text-muted-foreground">
                /day
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average writing frequency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Score Analysis */}
      <div className="grid gap-6 mb-8 grid-cols-1 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Average Scores
            </CardTitle>
            <CardDescription>
              Your average scores across all categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {list.size > 0 ? (
              <div className="space-y-4">
                {Object.entries(averageScores).map(([category, data]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">
                        {category}
                      </span>
                      <span className="text-sm">
                        {data.count > 0 ? data.average.toFixed(2) : "N/A"}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          data.average > 0
                            ? "bg-green-500"
                            : data.average < 0
                              ? "bg-red-500"
                              : "bg-gray-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, Math.abs(data.average) * 50 + 50),
                          )}%`,
                          marginLeft: data.average < 0 ? "50%" : "0",
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                No data available yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Key Insights
            </CardTitle>
            <CardDescription>
              Notable patterns from your journal entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {list.size > 0 ? (
              <div className="space-y-4">
                {topCategory && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">
                          Highest Score: {topCategory[0]}
                        </h4>
                        <p className="text-sm text-green-700 mt-1">
                          Your average {topCategory[0]} score is{" "}
                          {topCategory[1].average.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {bottomCategory && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-start gap-3">
                      <TrendingDown className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">
                          Lowest Score: {bottomCategory[0]}
                        </h4>
                        <p className="text-sm text-red-700 mt-1">
                          Your average {bottomCategory[0]} score is{" "}
                          {bottomCategory[1].average.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-start gap-3">
                    <PieChart className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Sentiment Analysis</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        {sentimentCounts.positive > sentimentCounts.negative
                          ? `${Math.round(
                              (sentimentCounts.positive / list.size) * 100,
                            )}% of your entries have a positive tone`
                          : sentimentCounts.negative > sentimentCounts.positive
                            ? `${Math.round(
                                (sentimentCounts.negative / list.size) * 100,
                              )}% of your entries have a negative tone`
                            : "Your entries have a balanced sentiment"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                No data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
