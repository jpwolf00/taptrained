"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { PhoneFrame } from "@/components/marketing/frames";
import { StaffHomeScreen } from "@/components/marketing/screens";

export default function JoinClient() {
  const router = useRouter();
  const params = useSearchParams();
  const codeFromUrl = (params.get("code") ?? "").toUpperCase().trim();

  const [inviteCode, setInviteCode] = useState(codeFromUrl);
  const [venueName, setVenueName] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Best-effort: resolve the venue name from the code so the page can greet
  // staff by their workplace. Silently ignored if the lookup isn't available.
  useEffect(() => {
    if (!codeFromUrl) return;
    const supabase = createClient();
    supabase
      .rpc("venue_name_for_code", { p_code: codeFromUrl })
      .then(({ data }) => {
        if (typeof data === "string" && data.length) setVenueName(data);
      });
  }, [codeFromUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    if (!signUpData.session) {
      setError(
        "Email confirmation is enabled in Supabase. Go to Supabase → Authentication → Providers → Email and turn off 'Confirm email', then try again."
      );
      setLoading(false);
      return;
    }

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
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 mkt-hero-glow" />
      <div className="absolute inset-0 mkt-grid opacity-50" />

      <div className="relative mx-auto grid min-h-screen max-w-5xl items-center gap-10 px-5 py-12 lg:grid-cols-2">
        {/* ── Pitch ── */}
        <div>
          <Link href="/" className="text-lg font-bold tracking-tight text-amber">
            🍺 TapTrained
          </Link>

          <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-hop" />
            You&apos;ve been invited to train
          </span>

          <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            {venueName ? (
              <>
                Join{" "}
                <span className="mkt-amber-text">{venueName}</span>&apos;s team.
              </>
            ) : (
              <>
                Join your team on{" "}
                <span className="mkt-amber-text">TapTrained.</span>
              </>
            )}
          </h1>

          <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
            A 2-minute quiz before your shift keeps you sharp on what&apos;s on
            tap — so you always know what to pour when a guest asks.
          </p>

          <ul className="mt-6 flex flex-col gap-3 text-[15px]">
            {[
              "Quick quizzes on this week's menu — right on your phone",
              "Build a daily streak and climb the team scoreboard",
              "Learn what to recommend for any guest, not just beer trivia",
            ].map((b) => (
              <li key={b} className="flex gap-3">
                <span className="mt-0.5 text-hop">✓</span>
                <span className="text-foreground/90">{b}</span>
              </li>
            ))}
          </ul>

          {/* phone flourish on desktop */}
          <div className="mt-10 hidden lg:block">
            <PhoneFrame>
              <StaffHomeScreen />
            </PhoneFrame>
          </div>
        </div>

        {/* ── Form ── */}
        <div className="rounded-2xl border border-border mkt-card p-6 shadow-2xl shadow-black/30 sm:p-8">
          <h2 className="text-xl font-bold tracking-tight">Create your account</h2>
          <p className="mt-1 text-sm text-muted">
            {codeFromUrl
              ? "Your invite code is filled in — just add your details."
              : "Enter the 6-letter code from your manager, then your details."}
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
              <label className="mb-1 block text-sm font-medium">
                Your name (shown on scoreboard)
              </label>
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
        </div>
      </div>
    </div>
  );
}
