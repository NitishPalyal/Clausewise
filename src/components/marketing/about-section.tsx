import {
  BadgeCheck,
  ClipboardCheck,
  Factory,
  FileCheck2,
  LockKeyhole,
  Search,
  Upload,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PEOPLE: [string, string, LucideIcon][] = [
  [
    "Quality Manager",
    "Pull the right clause into the room before the audit conversation moves on.",
    ClipboardCheck,
  ],
  [
    "Compliance Officer",
    "Track what each checklist and certificate actually requires, without a second spreadsheet.",
    BadgeCheck,
  ],
  [
    "Plant Manager",
    "Get a direct answer about a process without waiting for someone to find the binder.",
    Factory,
  ],
  [
    "Auditor",
    "Trace an answer back to the source document and section in one click.",
    Search,
  ],
] as const;
const COMPARISON: [string, string, string, string][] = [
  [
    "Finds the right clause",
    "Slow, easy to miss",
    "Confident-sounding, no source",
    "Cited to the exact section, every time",
  ],
  [
    "Knows your documents",
    "Only if you remember where",
    "No — paste them in each time",
    "Ingests all your SOPs and audits once",
  ],
  [
    "Tracks certificate expiry",
    "A separate spreadsheet",
    "No",
    "Built-in expiry flags",
  ],
  [
    "Data stays private",
    "Yes",
    "Sent to a third-party model",
    "Isolated per organization",
  ],
] as const;

const WORKFLOW: [LucideIcon, string, string][] = [
  [
    Upload,
    "Upload",
    "Bring in SOPs, audit reports, checklists, and vendor certificates.",
  ],
  [
    Search,
    "Ask",
    "Use plain language. Ask about a machine, a finding, or an expiry date.",
  ],
  [
    FileCheck2,
    "Get a cited answer",
    "See the answer alongside the exact document section it came from.",
  ],
];

const BENEFITS: [LucideIcon, string][] = [
  [
    LockKeyhole,
    "Your organization’s documents are never visible to another organization.",
  ],
  [BadgeCheck, "Every answer traces back to a real document and section."],
  [FileCheck2, "Never miss a vendor certificate expiry."],
  [
    ClipboardCheck,
    "Answer an auditor’s question on the spot, with the source open.",
  ],
];

export function AboutSection() {
  return (
    <>
      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"
      >
        <div className="max-w-2xl">
          <p className="font-mono text-xs text-steel">THE WORKFLOW</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Less searching. More certainty.
          </h2>
          <p className="mt-4 text-lg leading-8 text-ink/65">
            ClauseWise turns the documents your team already maintains into a
            dependable place to ask the next question.
          </p>
        </div>
        <div className="mt-12 grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-3">
          {WORKFLOW.map(([Icon, title, text], index) => (
            <div key={title as string} className="bg-paper p-6">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-brass">
                  0{index + 1}
                </span>
                <Icon className="size-5 text-steel" />
              </div>
              <h3 className="mt-10 text-lg font-semibold text-ink">
                {title as string}
              </h3>
              <p className="mt-2 text-sm leading-6 text-ink/60">
                {text as string}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section id="who-its-for" className="border-y border-ink/10 bg-white/55">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <p className="font-mono text-xs text-steel">WHO IT&apos;S FOR</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
            Made for the people who get asked first.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PEOPLE.map(([title, text, Icon]) => (
              <Card
                key={title}
                className="rounded-none border-ink/10 bg-paper shadow-none"
              >
                <CardHeader>
                  <Icon className="size-5 text-steel" />
                  <CardTitle className="pt-3 text-base text-ink">
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-ink/60">
                  {text}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
        <div>
          <p className="font-mono text-xs text-steel">WHY TEAMS KEEP IT OPEN</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
            The answer is only useful when you can prove it.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {BENEFITS.map(([Icon, text]) => (
            <div
              key={text as string}
              className="flex gap-3 border-t border-ink/15 pt-4"
            >
              <Icon className="mt-0.5 size-5 shrink-0 text-verified" />
              <p className="text-sm leading-6 text-ink/70">{text as string}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="border-t border-ink/10 bg-white/55">
        <div className="mx-auto max-w-7xl overflow-x-auto px-5 py-20 lg:px-8">
          <p className="font-mono text-xs text-steel">THE DIFFERENCE</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
            A better answer than Ctrl+F.
          </h2>
          <Table className="mt-10 min-w-180 border border-ink/10 bg-paper">
            <TableHeader>
              <TableRow className="border-ink/10 hover:bg-transparent">
                <TableHead className="w-[28%] text-ink">
                  When you need to...
                </TableHead>
                <TableHead className="text-ink/55">Manual</TableHead>
                <TableHead className="text-ink/55">
                  Generic AI chatbot
                </TableHead>
                <TableHead className="bg-steel/10 font-semibold text-steel">
                  ClauseWise
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {COMPARISON.map((row) => (
                <TableRow key={row[0]} className="border-ink/10">
                  <TableCell className="font-medium text-ink">
                    {row[0]}
                  </TableCell>
                  <TableCell className="text-ink/55">{row[1]}</TableCell>
                  <TableCell className="text-ink/55">{row[2]}</TableCell>
                  <TableCell className="bg-steel/5 font-medium text-steel">
                    {row[3]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </>
  );
}
