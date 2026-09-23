import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "ClauseWise — Instant Compliance Search for Manufacturing Teams",
    template: "%s · ClauseWise",
  },
  description:
    "Ask a question about your SOPs, audit reports, compliance checklists, or vendor certificates and get an exact clause — not a guess. Built for quality managers and compliance officers in manufacturing.",
  keywords: [
    "compliance",
    "SOP search",
    "audit reports",
    "vendor certificates",
    "manufacturing compliance",
    "quality management",
    "ISO 9001",
  ],
  authors: [{ name: "ClauseWise" }],
  openGraph: {
    title: "ClauseWise — Instant Compliance Search",
    description:
      "Ask a question, get the exact clause. Built for manufacturing quality teams.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          {/* TooltipProvider is required by shadcn/ui Tooltip — uses 'delay' not 'delayDuration' */}
          <TooltipProvider delay={300}>{children}</TooltipProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
