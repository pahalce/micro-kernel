import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookText, PieChart, Home } from "lucide-react";

export function Header() {
  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <BookText className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Diary</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            asChild
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            asChild
          >
            <Link href="/diary">
              <BookText className="h-4 w-4" />
              <span>My Diary</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            asChild
          >
            <Link href="/analytics">
              <PieChart className="h-4 w-4" />
              <span>Analytics</span>
            </Link>
          </Button>
        </nav>
        <div className="flex md:hidden">
          <Button variant="ghost" size="sm" className="text-base">
            <BookText className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
