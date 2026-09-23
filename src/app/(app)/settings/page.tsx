import type { Metadata } from "next";
import { Building2, ShieldCheck, Key, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Settings | ClauseWise",
  description: "Manage your manufacturing plant organization, team members, and search parameters.",
};

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Plant & Account Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your manufacturing organization details and search preferences.
        </p>
      </div>

      {/* Organization Settings */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-foreground font-semibold text-base border-b border-border pb-3">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          Organization Profile
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Company / Factory Name
            </label>
            <Input defaultValue="Apex Textiles Ltd." />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Industry Sector
            </label>
            <Input defaultValue="Textile Manufacturing (Weaving & Dyeing)" />
          </div>
        </div>
        <div className="pt-2 flex justify-end">
          <Button size="sm" className="bg-[var(--brand-navy)] text-white">
            Save Changes
          </Button>
        </div>
      </div>

      {/* Compliance Standard Preferences */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-foreground font-semibold text-base border-b border-border pb-3">
          <ShieldCheck className="h-5 w-5 text-muted-foreground" />
          Compliance Standards
        </div>
        <p className="text-xs text-muted-foreground">
          Active audit standards configured for automated clause referencing:
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="secondary">ISO 9001:2015</Badge>
          <Badge variant="secondary">ISO 45001 (OH&S)</Badge>
          <Badge variant="secondary">Factories Act, 1948</Badge>
          <Badge variant="secondary">GOTS (Global Organic Textile)</Badge>
        </div>
      </div>
    </div>
  );
}
