"use client";

import { useTransition } from "react";

export function PublishButton({ action }: { action: () => Promise<void> }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => action())}
      disabled={pending}
      className="w-full rounded-xl bg-amber px-4 py-3.5 font-semibold text-[#1a1209] shadow-lg transition hover:bg-amber-deep disabled:opacity-60"
    >
      {pending ? "Publishing…" : "Publish to staff →"}
    </button>
  );
}
