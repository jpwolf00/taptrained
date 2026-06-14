"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

/**
 * Manager-facing invite sharing: the venue invite code, a one-click copy of the
 * full /join?code= link, and a QR code (with PNG download) to print for the
 * back of house.
 */
export function InviteShare({
  code,
  venueName,
}: {
  code: string;
  venueName?: string;
}) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const qrWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const joinLink = origin ? `${origin}/join?code=${code}` : "";

  async function copyLink() {
    if (!joinLink) return;
    try {
      await navigator.clipboard.writeText(joinLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — user can select the text manually */
    }
  }

  function downloadQr() {
    const canvas = qrWrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `taptrained-join-${code}.png`;
    a.click();
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Invite your team</h2>
          <p className="mt-0.5 text-xs text-muted">
            Share the link or QR — the code is filled in for them.
          </p>
        </div>
        <span className="shrink-0 rounded-lg border border-border bg-surface-2 px-2.5 py-1 font-mono text-sm font-semibold tracking-widest text-amber">
          {code}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={copyLink}
          disabled={!joinLink}
          className="rounded-xl bg-amber px-4 py-2.5 text-sm font-semibold text-[#1a1209] transition hover:bg-amber-deep disabled:opacity-50"
        >
          {copied ? "Copied ✓" : "Copy invite link"}
        </button>
        <button
          type="button"
          onClick={() => setShowQr((v) => !v)}
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted transition hover:border-amber/60 hover:text-foreground"
        >
          {showQr ? "Hide QR code" : "Show QR code"}
        </button>
      </div>

      {origin && (
        <p className="mt-2 truncate text-xs text-muted" title={joinLink}>
          {joinLink}
        </p>
      )}

      {showQr && joinLink && (
        <div className="mt-4 flex flex-col items-center gap-3 border-t border-border pt-4">
          <div ref={qrWrapRef} className="rounded-xl bg-[#f5ede2] p-3">
            <QRCodeCanvas
              value={joinLink}
              size={200}
              level="M"
              marginSize={1}
              fgColor="#1a1209"
              bgColor="#f5ede2"
            />
          </div>
          <p className="text-center text-xs text-muted">
            {venueName ? `${venueName} — ` : ""}staff scan to join
          </p>
          <button
            type="button"
            onClick={downloadQr}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted transition hover:border-amber/60 hover:text-foreground"
          >
            ⬇ Download QR (PNG)
          </button>
        </div>
      )}
    </div>
  );
}
