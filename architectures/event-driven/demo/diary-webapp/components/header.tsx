import { MainNav } from "@/components/main-nav";

export function Header() {
  return (
    <header className="w-full flex items-center justify-between py-4 px-6 border-b">
      <div className="font-bold text-lg">Diary WebApp</div>
      <MainNav />
    </header>
  );
}
