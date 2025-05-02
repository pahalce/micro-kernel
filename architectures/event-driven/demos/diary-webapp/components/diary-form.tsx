"use client";

import React from "react";
import { v4 as uuid } from "uuid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, RefreshCcw, PenLine } from "lucide-react";

export function DiaryForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [text, setText] = React.useState("");
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(null);

    try {
      const response = await fetch("/api/diaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: uuid(), // Generate a random user ID for demo purposes
          text: text.trim(),
        }),
      });

      if (response.ok) {
        // Clear the form on success
        setText("");
        setSubmitSuccess(true);

        // Auto-reset success state after 3 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
          // Focus the textarea for continued writing
          if (textareaRef.current) {
            textareaRef.current.focus();
          }
        }, 3000);
      } else {
        const errorText = await response.text().catch(() => null);
        console.error("Failed to submit diary", errorText);
        setSubmitError(
          "Failed to submit diary. The diary service might be unreachable.",
        );
      }
    } catch (error) {
      console.error("Error submitting diary:", error);
      setSubmitError("Error submitting diary. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-sm border-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <PenLine className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">New Entry</CardTitle>
        </div>
        <CardDescription>
          Write about your day and receive AI-powered insights about your
          emotional state
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="diary-text" className="text-base">
              What's on your mind today?
            </Label>
            <Textarea
              id="diary-text"
              ref={textareaRef}
              placeholder="Write your thoughts here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-40 text-base resize-y p-4"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your entries are analyzed to help you understand your emotions and
              motivations.
            </p>
          </div>

          {submitError && (
            <div className="p-3 bg-destructive/10 text-destructive rounded text-sm">
              {submitError}
              <div className="mt-1 text-xs">
                Make sure the diary service is running by executing:
                <code className="block mt-1 p-2 bg-background rounded font-mono border text-xs">
                  cd ../../../apps/diary-service && pnpm dev
                </code>
              </div>
            </div>
          )}

          <div className="flex justify-end items-center gap-2">
            {submitSuccess && (
              <span className="text-green-600 flex items-center gap-1 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                Entry saved!
              </span>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !text.trim()}
              className="flex items-center gap-1 px-6"
            >
              {isSubmitting ? (
                <>
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Entry"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
