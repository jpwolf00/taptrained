import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: menus } = await supabase
    .from("menus")
    .select("id, title, status, published_at, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Menus</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/settings"
            className="rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-muted hover:text-foreground hover:border-amber/60 transition"
          >
            ⚙ Settings
          </Link>
          <Link
            href="/admin/menus/new"
            className="rounded-xl bg-amber px-4 py-2.5 text-sm font-semibold text-[#1a1209] hover:bg-amber-deep transition"
          >
            + New menu
          </Link>
        </div>
      </div>

      {!menus?.length ? (
        <div className="mt-12 text-center">
          <p className="text-4xl">🍺</p>
          <p className="mt-3 font-semibold">No menus yet</p>
          <p className="mt-1 text-sm text-muted">
            Upload your tap list to generate your first quiz.
          </p>
          <Link
            href="/admin/menus/new"
            className="mt-4 inline-block rounded-xl bg-amber px-5 py-3 font-semibold text-[#1a1209] hover:bg-amber-deep transition"
          >
            Upload tap list →
          </Link>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {menus.map((m) => (
            <li key={m.id}>
              <Link
                href={`/admin/menus/${m.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3.5 hover:border-amber/60 transition"
              >
                <div>
                  <p className="font-semibold">{m.title}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {m.published_at
                      ? `Published ${new Date(m.published_at).toLocaleDateString()}`
                      : `Draft · created ${new Date(m.created_at).toLocaleDateString()}`}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    m.status === "published"
                      ? "bg-hop/20 text-hop"
                      : "bg-surface-2 text-muted"
                  }`}
                >
                  {m.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
