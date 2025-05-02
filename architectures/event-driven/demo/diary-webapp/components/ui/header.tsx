import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="w-full flex items-center justify-between py-4 px-6 border-b">
      <Link href="/" className="font-bold text-lg">
        日記アプリ
      </Link>
      <nav className="flex flex-col md:flex-row items-center gap-1">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">ホーム</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/diary">日記</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/analytics">分析</Link>
        </Button>
      </nav>
    </header>
  );
}
