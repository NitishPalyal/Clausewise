import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign in", description: "Sign in to ClauseWise and search your organization documents." };

export default function SignInPage() {
  return <SignIn appearance={{ elements: { rootBox: "w-full", card: "w-full border border-ink/15 rounded-none shadow-[8px_8px_0_#d7dddc]", headerTitle: "text-ink", headerSubtitle: "text-ink/55", formButtonPrimary: "bg-steel hover:bg-steel/90" } }} />;
}
