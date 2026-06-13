"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type LookupUrl = { label: string; url: string };

export default function AdminSettingsPage() {
  const [lookupUrls, setLookupUrls] = useState<LookupUrl[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [venueName, setVenueName] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        setLookupUrls(d.lookup_urls ?? []);
        setInviteCode(d.invite_code ?? "");
        setVenueName(d.name ?? "");
        setLoading(false);
      });
  }, []);

  function addUrl() {
    if (!newLabel.trim() || !newUrl.trim()) return;
    try { new URL(newUrl); } catch {
      setError("That doesn't look like a valid URL.");
      return;
    }
    if (lookupUrls.length >= 5) {
      setError("Maximum 5 URLs.");
      return;
    }
    setError(null);
    setLookupUrls((prev) => [...prev, { label: newLabel.trim(), url: newUrl.trim() }]);
    setNewLabel("");
    setNewUrl("");
  }

  function removeUrl(i: number) {
    setLookupUrls((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lookup_urls: lookupUrls }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data?.error ?? "Save failed."); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return <div className="py-12 text-center text-sm text-muted">Loading…</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin" className="text-muted hover:text-foreground text-sm transition">
          ← Dashboard
        </Link>
        <span className="text-border">|</span>
        <h1 className="text-lg font-bold">Settings</h1>
      </div>

      {/* Venue info */}
      <section className="mb-8 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-3">Venue</h2>
        <div className="flex items-center justify-between">
          <span className="font-medium">{venueName}</span>
          <span className="text-xs text-muted">
            Invite code:{" "}
            <span className="font-mono font-semibold text-foreground">{inviteCode}</span>
          </span>
        </div>
      </section>

      {/* Lookup URLs */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-1">
          Beer lookup URLs
        </h2>
        <p className="mb-4 text-sm text-muted">
          Save your brewery&apos;s beer pages here. During menu setup, one click
          enriches all beers at once from any of these URLs — no pasting per beer.
          Up to 5 URLs.
        </p>

        {/* Saved URLs */}
        {lookupUrls.length > 0 && (
          <div className="mb-4 flex flex-col gap-2">
            {lookupUrls.map((u, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{u.label}</p>
                  <p className="text-xs text-muted truncate">{u.url}</p>
                </div>
                <button
                  onClick={() => removeUrl(i)}
                  className="shrink-0 text-muted hover:text-red-400 transition text-lg leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new */}
        {lookupUrls.length < 5 && (
          <div className="rounded-xl border border-dashed border-border bg-surface p-4">
            <p className="mb-3 text-xs font-medium text-muted uppercase tracking-wide">
              Add a URL
            </p>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Label (e.g. Our tap menu)"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-amber"
              />
              <input
                type="url"
                placeholder="https://yourbrewery.com/beers"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addUrl()}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-amber"
              />
              <button
                onClick={addUrl}
                disabled={!newLabel.trim() || !newUrl.trim()}
                className="rounded-lg bg-surface-2 px-3 py-2 text-sm font-medium text-amber hover:bg-border transition disabled:opacity-40"
              >
                + Add
              </button>
            </div>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <button
          onClick={save}
          disabled={saving}
          className="mt-4 w-full rounded-xl bg-amber px-4 py-3.5 font-semibold text-[#1a1209] hover:bg-amber-deep transition disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save settings"}
        </button>
      </section>
    </div>
  );
}
