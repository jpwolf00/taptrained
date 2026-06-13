import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role, venues(name)")
    .single();

  if (!profile) redirect("/login");

  // Admins can view staff pages too (for testing), but redirect to admin home
  // if they have no staff profile intent.
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
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-3">
          <div>
            <Link href="/staff" className="text-amber font-semibold tracking-tight">
              🍺 TapTrained
            </Link>
            {venue?.name && (
              <span className="ml-2 text-xs text-muted">{venue.name}</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted text-xs hidden sm:inline">{profile.display_name}</span>
            {profile.role === "admin" && (
              <Link href="/admin" className="text-xs text-amber hover:underline">
                Admin
              </Link>
            )}
            <form action={signOut}>
              <button className="text-muted hover:text-foreground transition text-xs">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-md px-5 py-6">{children}</main>
    </div>
  );
}
