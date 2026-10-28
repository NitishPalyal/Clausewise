import { SearchCode } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-paper lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden bg-ink p-10 text-paper lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-md bg-paper text-ink">
            <SearchCode className="size-5" />
          </span>
          <span className="text-lg font-semibold">ClauseWise</span>
        </div>
        <div className="max-w-md">
          <p className="font-mono text-xs text-brass">THE SOURCE MATTERS</p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight">
            When the answer is important, show where it came from.
          </h1>
          <p className="mt-5 text-sm leading-6 text-paper/65">
            Ask questions about your organization&apos;s documents and review
            citations back to their sources.
          </p>
        </div>
        <p className="text-xs text-paper/40">
          Built for manufacturing quality teams.
        </p>
      </section>
      <section className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex size-8 items-center justify-center rounded-md bg-ink text-paper">
              <SearchCode className="size-4" />
            </span>
            <span className="font-semibold text-ink">ClauseWise</span>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
