"use client";

import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Check,
  FileText,
  SearchCode,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// TODO(logic): replace these illustrative examples with real query examples from organization documents.
const DEMO_QUERY = {
  question: "What is the calibration interval for Machine 4?",
  clause:
    "Equipment must be calibrated every 90 days, or immediately after any repair affecting measurement accuracy.",
  section: "SOP-04 §3.2",
};

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden border-b border-foreground/10"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-8 lg:py-24">
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
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              render={<Link href="/sign-up" />}
              size="lg"
              className="bg-steel text-white hover:bg-steel/90"
            >
              Start free <ArrowRight className="ml-2 size-4" />
            </Button>
            <Button
              render={<a href="#demo" />}
              size="lg"
              variant="outline"
              className="border-ink/20 text-ink hover:bg-white"
            >
              See it work <ArrowDown className="ml-2 size-4" />
            </Button>
          </div>
          <p className="mt-4 text-xs text-ink/45">
            No credit card. Start with the documents you already use.
          </p>
        </div>
        <DemoPanel />
      </div>
    </section>
  );
}

function DemoPanel() {
  return (
    <div
      id="demo"
      className="relative border border-ink/15 bg-white p-3 shadow-[12px_12px_0_#d7dddc] sm:p-5"
    >
      <div className="flex items-center justify-between border-b border-ink/10 pb-3 text-xs text-ink/55">
        <span className="flex items-center gap-2 font-medium text-ink">
          <SearchCode className="size-4 text-steel" /> Live document search
        </span>
        <span className="font-mono">DEMO / 01</span>
      </div>
      <div className="grid gap-4 pt-4 sm:grid-cols-[0.8fr_1.2fr]">
        <div className="border border-ink/10 bg-paper/60 p-4 text-sm leading-6 text-ink/65">
          <div className="mb-4 flex items-center gap-2 text-xs font-medium text-ink">
            <FileText className="size-4 text-steel" /> SOP-04.pdf
          </div>
          <p className="font-mono text-[11px] text-ink/45">
            §3 EQUIPMENT CONTROL
          </p>
          <p className="mt-3">
            3.1 Record each instrument in the equipment register.
          </p>
          <motion.p
            initial={{ backgroundColor: "#f0f2f0" }}
            animate={{ backgroundColor: ["#f0f2f0", "#ead9ad", "#f0f2f0"] }}
            transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3 }}
            className="my-2 border-l-2 border-brass px-2 text-ink"
          >
            3.2 {DEMO_QUERY.clause}
          </motion.p>
          <p>3.3 Keep calibration records for the life of the equipment.</p>
        </div>
        <motion.div
          className="flex flex-col justify-between bg-ink p-4 text-paper sm:p-5"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div>
            <p className="font-mono text-[10px] tracking-wide text-paper/45">
              QUESTION
            </p>
            <p className="mt-2 text-base leading-6">{DEMO_QUERY.question}</p>
          </div>
          <div className="my-6 h-px bg-paper/15" />
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs text-paper/55">
              <span className="size-1.5 animate-pulse rounded-full bg-brass" />{" "}
              Searching your documents
            </div>
            <p className="text-sm leading-6 text-paper/75">
              {DEMO_QUERY.clause}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 border border-brass/60 bg-brass/10 px-2.5 py-1.5 font-mono text-xs text-[#e8cc91]">
              <Check className="size-3.5" /> {DEMO_QUERY.section}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
