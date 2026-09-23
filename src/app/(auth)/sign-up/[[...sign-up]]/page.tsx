import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create a ClauseWise account for your organization.",
};

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        elements: {
          rootBox: "w-full",
          card: "w-full border border-ink/15 rounded-none shadow-[8px_8px_0_#d7dddc]",
          headerTitle: "text-ink",
          headerSubtitle: "text-ink/55",
          formButtonPrimary: "bg-steel hover:bg-steel/90",
        },
      }}
    />
  );
}
