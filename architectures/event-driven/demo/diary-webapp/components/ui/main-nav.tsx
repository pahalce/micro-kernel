import { Button } from "@/components/button";
import Link from "next/link";

export function MainNav() {
  return (
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
      <Button variant="ghost" size="sm" asChild>
        <Link href="/profile">プロフィール</Link>
      </Button>
    </nav>
  );
}
