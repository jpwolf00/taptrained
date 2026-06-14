import { Suspense } from "react";
import JoinClient from "./join-client";

export const metadata = {
  title: "Join your team on TapTrained",
  description:
    "Your manager invited you to TapTrained. Create your account and start a 2-minute pre-shift quiz on what's on tap.",
};

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted">
          Loading…
        </div>
      }
    >
      <JoinClient />
    </Suspense>
  );
}
