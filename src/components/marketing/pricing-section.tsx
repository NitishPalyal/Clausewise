import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLANS: {
  name: string;
  price: string;
  note: string;
  features: string[];
  featured?: boolean;
}[] = [
  {
    name: "Starter",
    price: "₹4,999",
    note: "For one factory getting organized",
    features: [
      "1 factory",
      "Up to 500 documents",
      "Up to 5 team members",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: "₹14,999",
    note: "Most chosen by growing manufacturers",
    features: [
      "Up to 3 factories",
      "Unlimited documents",
      "Up to 25 team members",
      "Certificate expiry alerts",
      "Priority support (<4h)",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Talk to us",
    note: "For multi-site quality operations",
    features: [
      "Unlimited factories",
      "Unlimited documents",
      "Unlimited team members",
      "Certificate expiry alerts",
      "Dedicated support + SLA",
      "SSO",
    ],
  },
] as const;

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"
    >
      <div className="max-w-2xl">
        <p className="font-mono text-xs text-steel">PRICING</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Start with one factory. Grow when your process does.
        </h2>
      </div>
      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={
              plan.featured
                ? "relative border border-steel bg-white p-7 shadow-[8px_8px_0_#c5d0d2] lg:-translate-y-3"
                : "border border-ink/15 bg-white/55 p-7"
            }
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
              {plan.featured && (
                <span className="font-mono text-[10px] text-brass">
                  RECOMMENDED
                </span>
              )}
            </div>
            <p className="mt-6 text-3xl font-semibold tracking-tight text-ink">
              {plan.price}
              {plan.name !== "Enterprise" && (
                <span className="text-sm font-normal text-ink/45">
                  {" "}
                  / month
                </span>
              )}
            </p>
            <p className="mt-2 min-h-10 text-sm text-ink/55">{plan.note}</p>
            <Button
              render={
                <Link
                  href={
                    plan.name === "Enterprise"
                      ? "mailto:hello@clausewise.in"
                      : "/sign-up"
                  }
                />
              }
              className={
                plan.featured
                  ? "mt-7 w-full bg-steel text-white hover:bg-steel/90"
                  : "mt-7 w-full border-ink/20 text-ink"
              }
              variant={plan.featured ? "default" : "outline"}
            >
              {plan.name === "Enterprise" ? "Talk to us" : "Start free"}
              <ArrowUpRight className="ml-2 size-4" />
            </Button>
            <div className="mt-8 space-y-3 border-t border-ink/10 pt-6">
              {plan.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-2 text-sm text-ink/70"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-verified" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-xs text-ink/45">
        All plans are billed in INR. // TODO(logic): connect enterprise
        enquiries to a contact form when one exists.
      </p>
    </section>
  );
}
