"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function DiaryPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [isReceivingFeedback, setIsReceivingFeedback] = useState(false);

  // 日記を投稿する関数
  const submitDiary = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content) {
      alert("タイトルと内容を入力してください");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/diary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        throw new Error("日記の投稿に失敗しました");
      }

      const data = await response.json();

      // SSEを使って分析結果をリアルタイムで取得
      listenForAnalysis(data.id);
    } catch (error) {
      console.error("投稿エラー:", error);
      alert("投稿中にエラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  // SSEを使って分析結果を受け取る関数
  const listenForAnalysis = (diaryId: string) => {
    setIsReceivingFeedback(true);

    const eventSource = new EventSource(`/api/analysis/${diaryId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "progress") {
          setFeedback(data.message);
        } else if (data.type === "result") {
          setScore(data.score);
          setFeedback(data.feedback);
          eventSource.close();
          setIsReceivingFeedback(false);
        }
      } catch (error) {
        console.error("SSEデータの解析エラー:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE接続エラー:", error);
      eventSource.close();
      setIsReceivingFeedback(false);
      setFeedback("分析中にエラーが発生しました");
    };
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">新しい日記を書く</h1>

        <form onSubmit={submitDiary} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              タイトル
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="今日の日記のタイトル"
              disabled={isSubmitting || isReceivingFeedback}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              内容
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded-md min-h-[200px]"
              placeholder="今日はどんな一日でしたか？"
              disabled={isSubmitting || isReceivingFeedback}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isReceivingFeedback}
            className="w-full"
          >
            {isSubmitting ? "投稿中..." : "日記を投稿する"}
          </Button>
        </form>

        {(isReceivingFeedback || feedback) && (
          <div className="mt-8 p-4 border rounded-md bg-slate-50">
            <h2 className="text-xl font-semibold mb-2">AI分析フィードバック</h2>

            {isReceivingFeedback && (
              <div className="flex items-center text-blue-600 mb-2">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <title>ローディングスピナー</title>
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                分析中...
              </div>
            )}

            {feedback && <p className="mb-2">{feedback}</p>}

            {score !== null && (
              <div className="mt-4">
                <div className="text-sm text-muted-foreground mb-1">
                  感情スコア:
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      score > 7
                        ? "bg-green-600"
                        : score > 4
                          ? "bg-yellow-400"
                          : "bg-red-600"
                    }`}
                    style={{ width: `${score * 10}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>ネガティブ</span>
                  <span>ポジティブ</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
