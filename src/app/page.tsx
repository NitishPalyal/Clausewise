import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/marketing/site-header";
import { HeroSection } from "@/components/marketing/hero-section";
import { AboutSection } from "@/components/marketing/about-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: "ClauseWise | The exact clause, when you need it",
  description:
    "Search manufacturing SOPs, audit reports, compliance checklists, and vendor certificates with exact citations.",
};

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main>
        <HeroSection />
        <AboutSection />
        <PricingSection />
      </main>
      <SiteFooter />
    </div>
  );
}
