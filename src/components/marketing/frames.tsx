/**
 * Device frames for the marketing "screenshots." These wrap faithful
 * recreations of the real app screens so the landing page can showcase the
 * product without depending on live data or a running server.
 */
import type { ReactNode } from "react";

/** A phone bezel with a notch and a translucent app top-bar. For staff screens. */
export function PhoneFrame({
  children,
  label,
  className = "",
}: {
  children: ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative w-[270px] shrink-0 rounded-[2.6rem] border border-border bg-[#0d0b09] p-2.5 shadow-2xl shadow-black/50 ${className}`}
    >
      {/* glow */}
      <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[3rem] bg-amber/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-[2.1rem] bg-background">
        {/* notch */}
        <div className="absolute left-1/2 top-0 z-20 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-[#0d0b09]" />
        {/* status bar */}
        <div className="flex items-center justify-between px-6 pt-2.5 text-[10px] font-medium text-muted">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span>●●●</span>
            <span>📶</span>
            <span>🔋</span>
          </span>
        </div>
        {/* app top nav */}
        <div className="flex items-center justify-between border-b border-border px-4 pb-2.5 pt-1.5">
          <span className="text-[13px] font-semibold tracking-tight text-amber">
            🍺 TapTrained
          </span>
          <span className="text-[10px] text-muted">The Cellar Door</span>
        </div>
        {/* screen body */}
        <div className="h-[480px] overflow-hidden px-4 py-4">{children}</div>
      </div>
      {label && (
        <p className="mt-3 text-center text-xs font-medium text-muted">{label}</p>
      )}
    </div>
  );
}

/** A desktop browser window. For the manager / admin screens. */
export function BrowserFrame({
  children,
  url = "taptrained.app/admin",
  label,
  className = "",
}: {
  children: ReactNode;
  url?: string;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`w-full ${className}`}>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/40">
        {/* title bar */}
        <div className="flex items-center gap-2 border-b border-border bg-[#0d0b09] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <div className="mx-auto flex items-center gap-2 rounded-md bg-surface-2 px-3 py-1 text-[11px] text-muted">
            <span className="text-hop">🔒</span>
            {url}
          </div>
        </div>
        <div className="p-5 sm:p-7">{children}</div>
      </div>
      {label && (
        <p className="mt-3 text-center text-xs font-medium text-muted">{label}</p>
      )}
    </div>
  );
}
