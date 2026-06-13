import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role, venues(name, invite_code)")
    .single();

  if (!profile || profile.role !== "admin") redirect("/staff");

  const venue = Array.isArray(profile.venues) ? profile.venues[0] : profile.venues;

  async function signOut() {
    "use server";
    const sb = await createClient(true);
    await sb.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-10 border-b border-border bg-[#14110f]/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3">
          <div>
            <Link href="/admin" className="text-amber font-semibold tracking-tight">
              🍺 TapTrained
            </Link>
            <span className="ml-2 text-xs text-muted">{venue?.name}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted hidden sm:inline">
              Invite: <span className="font-mono font-medium text-foreground">{venue?.invite_code}</span>
            </span>
            <Link href="/admin/settings" className="text-muted hover:text-foreground transition text-xs">
              Settings
            </Link>
            <form action={signOut}>
              <button className="text-muted hover:text-foreground transition text-xs">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-2xl px-5 py-6">{children}</main>
    </div>
  );
}
