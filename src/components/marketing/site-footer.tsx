import Link from "next/link";
import { SearchCode } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-foreground/10 bg-paper">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-ink/55 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-medium text-ink">
          <SearchCode className="size-4 text-steel" /> ClauseWise
        </Link>
        <p>Built for quality teams who need to be right the first time.</p>
        <p className="font-mono text-xs">
          © {new Date().getFullYear()} ClauseWise
        </p>
      </div>
    </footer>
  );
}
