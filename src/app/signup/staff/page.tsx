"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function StaffSignupPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    // 1. Create auth user
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // 2. Join venue via RPC
    const { error: rpcError } = await supabase.rpc("join_venue_with_code", {
      p_code: inviteCode.toUpperCase().trim(),
      p_display_name: displayName,
    });
    if (rpcError) {
      setError(
        rpcError.message === "invalid invite code"
          ? "That invite code isn't recognised. Double-check it with your manager."
          : rpcError.message
      );
      setLoading(false);
      return;
    }

    router.push("/staff");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-12">
      <Link href="/" className="mb-8 text-amber font-semibold tracking-tight">
        🍺 TapTrained
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">Join your team</h1>
      <p className="mt-1 text-sm text-muted">
        Get the 6-letter invite code from your manager, then create your
        account.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Invite code</label>
          <input
            type="text"
            required
            placeholder="e.g. BREW42"
            maxLength={6}
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            className="w-full rounded-xl border border-border bg-surface px-3 py-3 font-mono text-sm uppercase tracking-widest outline-none focus:border-amber"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Your name (shown on scoreboard)</label>
          <input
            type="text"
            required
            placeholder="e.g. Jordan"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-amber"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-amber"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-amber"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-xl bg-amber px-4 py-3.5 font-semibold text-[#1a1209] transition hover:bg-amber-deep disabled:opacity-50"
        >
          {loading ? "Joining…" : "Join team →"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-amber underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
