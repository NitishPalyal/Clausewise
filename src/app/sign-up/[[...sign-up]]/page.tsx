// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex flex-col h-100">
      <div className="m-auto">
        <SignUp />
      </div>
    </div>
  );
}
