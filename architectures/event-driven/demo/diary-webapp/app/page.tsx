import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <main className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-6 items-center text-center py-12">
          <h1 className="text-4xl font-bold tracking-tight">
            あなたの日記、新しい視点で
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            毎日の出来事を記録し、AI分析で自分自身の感情や傾向を把握しましょう。
            リアルタイムフィードバックで日記をより深く理解できます。
          </p>

          <div className="flex gap-4 mt-6">
            <Button asChild size="lg">
              <Link href="/diary">日記を書く</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/analytics">分析を見る</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">リアルタイム分析</h3>
            <p className="text-muted-foreground">
              日記を投稿するとすぐに感情分析が始まり、リアルタイムで結果が表示されます。
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">トレンド把握</h3>
            <p className="text-muted-foreground">
              長期間の感情の変化やパターンを視覚化して、自己理解を深めましょう。
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">プライバシー重視</h3>
            <p className="text-muted-foreground">
              あなたの日記は安全に保管され、プライバシーが守られます。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
