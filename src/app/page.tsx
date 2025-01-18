import ModeToggle from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { SignedOut , SignedIn , SignInButton , UserButton} from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="m-4">
      {/*these are the compenents of ClerkProvider */}

      <SignedOut> {/*if user is signed out show them signin*/}
        <SignInButton mode="modal">
          <Button>Sign in</Button>
          </SignInButton>
      </SignedOut>

      <SignedIn> {/*if user is signed in show them userbutton*/}
        <UserButton />
      </SignedIn>

      <ModeToggle />
      <Button variant={"secondary"}>Click Me</Button>
    </div>
  );
}
