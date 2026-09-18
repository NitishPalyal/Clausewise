import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex flex-col h-100">
      <div className="m-auto">
        <SignIn />
      </div>
    </div>
  );
}
