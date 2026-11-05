"use client";

import {
  ArrowRight,
  Check,
  FileCheck2,
  FileText,
  Search,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden border-b border-foreground/10"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div className="max-w-xl">
          <p className="mb-6 flex items-center gap-2 text-sm font-medium text-steel">
            <span className="size-2 rounded-full bg-verified" />
            Document search for manufacturing quality teams
          </p>
          <h1
            id="hero-heading"
            className="max-w-lg text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-ink sm:text-6xl"
          >
            Ask your SOPs a question. Get the exact clause.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-ink/65">
            ClauseWise searches your SOPs, audit reports, compliance checklists,
            and vendor certificates, then shows you exactly where the answer
            came from.
          </p>
          <div className="mt-8">
            <Button
              render={<Link href="/sign-up" />}
              nativeButton={false}
              size="lg"
              className="bg-steel text-white hover:bg-steel/90"
            >
              Start free <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
          <p className="mt-4 text-xs text-ink/45">
            No credit card. Start with the documents you already use.
          </p>
        </div>
        <div
          className="relative mx-auto w-full max-w-[38rem] lg:ml-auto"
          role="img"
          aria-label="ClauseWise document search preview showing an answer with its verified source"
        >
          <div className="absolute inset-8 rounded-full bg-steel/10 blur-3xl" />
          <div className="relative rounded-2xl border border-ink/10 bg-white/90 p-3 shadow-2xl shadow-ink/10 sm:p-5">
            <div className="flex items-center justify-between border-b border-ink/10 px-2 pb-3">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-steel text-white">
                  <FileCheck2 className="size-4" />
                </span>
                <span className="text-sm font-semibold text-ink">
                  ClauseWise
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-verified">
                <ShieldCheck className="size-3.5" />
                Your workspace
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-xl border border-ink/10 bg-paper/70 p-3">
                <p className="mb-3 text-[10px] font-semibold tracking-[0.14em] text-ink/45">
                  YOUR DOCUMENTS
                </p>
                <div className="space-y-2.5">
                  {[
                    ["SOP-014", "Equipment cleaning"],
                    ["WI-008", "Line inspection"],
                    ["QA-021", "Audit checklist"],
                  ].map(([code, name]) => (
                    <div key={code} className="flex items-center gap-2">
                      <FileText className="size-4 shrink-0 text-steel" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium text-ink">
                          {code}
                        </p>
                        <p className="truncate text-[10px] text-ink/50">
                          {name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg border border-ink/10 bg-white px-3 py-2.5">
                  <Search className="size-4 shrink-0 text-steel" />
                  <span className="text-xs text-ink/55">
                    How often should the equipment be cleaned?
                  </span>
                </div>
                <div className="rounded-xl border border-verified/20 bg-verified/5 p-3.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-verified">
                    <Check className="size-4" />
                    Answer found in your documents
                  </div>
                  <p className="mt-2 text-xs leading-5 text-ink/75">
                    Clean equipment after each production run and before
                    switching product lines.
                  </p>
                  <div className="mt-3 rounded-lg border-l-2 border-brass bg-white/80 px-3 py-2">
                    <p className="text-[10px] font-medium text-ink">
                      SOP-014 · Section 4.2
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-ink/55">
                      Verified source · Equipment cleaning procedure
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-4 right-2 flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 shadow-lg sm:right-6">
            <span className="grid size-7 place-items-center rounded-full bg-verified/10 text-verified">
              <Check className="size-4" />
            </span>
            <span className="text-xs font-medium text-ink">
              Source verified
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
