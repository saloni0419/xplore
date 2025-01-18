import { SignedOut , SignedIn , SignInButton , UserButton} from "@clerk/nextjs";

export default function Home() {
  return (
    <div>

      {/*these are the compenents of ClerkProvider */}

      <SignedOut> {/*if user is signed out show them signin*/}
        <SignInButton mode="modal">
          <button className="bg-red-500">
              Sign In
          </button>
          </SignInButton>
      </SignedOut>

      <SignedIn> {/*if user is signed in show them userbutton*/}
        <UserButton />
      </SignedIn>
    </div>
  );
}
