import {
  OrganizationSwitcher,
  Show,
  SignedIn,
  SignIn,
  UserButton,
} from "@clerk/nextjs";
import { Organization } from "@clerk/nextjs/server";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Show when="signed-in">
        <nav>
          <OrganizationSwitcher />
          <UserButton />
        </nav>
      </Show>
      <Show when="signed-out">
        <nav>
          <a href="/sign-in">SignIn</a>
          <a href="/sign-up">SignUp</a>
        </nav>
      </Show>
      <div>
        <h1>ClauseWise</h1>
      </div>
    </div>
  );
}
