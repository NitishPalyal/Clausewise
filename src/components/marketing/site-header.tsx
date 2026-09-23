import Link from "next/link";
import { SearchCode, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="border-b border-foreground/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="ClauseWise home"
        >
          <span className="flex size-9 items-center justify-center rounded-md bg-ink text-paper">
            <SearchCode className="size-4" />
          </span>
          <span className="font-semibold tracking-tight text-ink">
            ClauseWise
          </span>
        </Link>
        <nav
          className="hidden items-center gap-7 text-sm text-ink/65 md:flex"
          aria-label="Main navigation"
        >
          <a href="#how-it-works" className="transition-colors hover:text-ink">
            How it works
          </a>
          <a href="#who-its-for" className="transition-colors hover:text-ink">
            Who it&apos;s for
          </a>
          <a href="#pricing" className="transition-colors hover:text-ink">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button
            render={<Link href="/sign-in" />}
            variant="ghost"
            size="sm"
            className="hidden text-ink/75 sm:inline-flex"
          >
            Sign in
          </Button>
          <Button
            render={<Link href="/sign-up" />}
            size="sm"
            className="bg-steel text-white hover:bg-steel/90"
          >
            Start free <ArrowUpRight className="ml-1 size-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
