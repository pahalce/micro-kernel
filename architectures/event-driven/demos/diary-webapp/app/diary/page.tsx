"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSSE } from "@/lib/useSSE";
import { DiaryCard } from "@/components/diary-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Search,
  SlidersHorizontal,
  BookText,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import type { ScoreComputed } from "@event-driven/events";

export default function DiaryPage() {
  const router = useRouter();
  // Get real-time updates for diary entries
  const evt = useSSE<ScoreComputed>("/api/diaries");

  // Store all diary entries
  const [list, setList] = React.useState(
    () => new Map<string, ScoreComputed>(),
  );

  // Search and filter state
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<"newest" | "oldest">(
    "newest",
  );
  const [filterPositive, setFilterPositive] = React.useState(false);
  const [filterNegative, setFilterNegative] = React.useState(false);

  // Update diary list when new entries arrive
  React.useEffect(() => {
    if (evt) setList((prev) => new Map(prev).set(evt.diaryId, evt));
  }, [evt]);

  // Filter and sort entries based on search and filter settings
  const filteredEntries = React.useMemo(() => {
    let entries = [...list.values()];

    // Sort entries by date
    if (sortOrder === "newest") {
      entries = entries.reverse();
    }

    // Apply filters for positive/negative scores
    if (filterPositive || filterNegative) {
      entries = entries.filter((entry) => {
        const scores = entry.scores || {};
        const avgScore =
          Object.values(scores).reduce((sum, score) => sum + score, 0) /
          Math.max(1, Object.values(scores).length);

        if (filterPositive && avgScore > 0.3) return true;
        if (filterNegative && avgScore < -0.3) return true;
        return !(filterPositive || filterNegative);
      });
    }

    // Apply search filter if search term exists
    if (searchTerm.trim()) {
      entries = entries.filter((entry) =>
        entry.diaryId.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return entries;
  }, [list, searchTerm, sortOrder, filterPositive, filterNegative]);

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"));
  };

  // Handle diary card click to view details
  const handleDiaryClick = (diaryId: string) => {
    router.push(`/diary/${diaryId}`);
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex flex-col mb-8 space-y-4">
        <div className="flex items-center gap-3">
          <BookText className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">My Diary</h1>
        </div>
        <p className="text-muted-foreground">
          View and search through all your journal entries
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="grid gap-4 mb-8 md:grid-cols-[1fr,auto,auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={filterPositive ? "bg-green-50 border-green-200" : ""}
            onClick={() => setFilterPositive(!filterPositive)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Positive
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={filterNegative ? "bg-red-50 border-red-200" : ""}
            onClick={() => setFilterNegative(!filterNegative)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Negative
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={toggleSortOrder}>
          <ArrowUpDown className="mr-2 h-4 w-4" />
          {sortOrder === "newest" ? "Newest First" : "Oldest First"}
        </Button>
      </div>

      {/* Diary Entries */}
      <div className="space-y-6">
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => (
            <div
              key={entry.diaryId}
              className="cursor-pointer transition-transform hover:scale-[1.01]"
              onClick={() => handleDiaryClick(entry.diaryId)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleDiaryClick(entry.diaryId);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <DiaryCard diaryId={entry.diaryId} initialScores={entry.scores} />
            </div>
          ))
        ) : (
          <div className="text-center p-12 border rounded-lg">
            <BookText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No entries found</h3>
            <p className="text-muted-foreground mt-1">
              {list.size === 0
                ? "Start writing to see your entries here"
                : "Try adjusting your search filters"}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
