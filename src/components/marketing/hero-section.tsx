"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden border-b border-foreground/10"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
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
      </div>
    </section>
  );
}
