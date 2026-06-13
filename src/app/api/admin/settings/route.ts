import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const LookupUrlSchema = z.object({
  label: z.string().min(1).max(60),
  url: z.string().url(),
});

const PatchSchema = z.object({
  lookup_urls: z.array(LookupUrlSchema).max(5),
});

async function getAdminVenueId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, venue_id")
    .single();
  if (!profile || profile.role !== "admin") return null;
  return profile.venue_id as string;
}

/** GET /api/admin/settings — returns venue settings */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const venueId = await getAdminVenueId(supabase);
  if (!venueId) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { data: venue } = await supabase
    .from("venues")
    .select("name, invite_code, lookup_urls")
    .eq("id", venueId)
    .single();

  return NextResponse.json(venue ?? {});
}

/** PATCH /api/admin/settings — saves lookup_urls */
export async function PATCH(req: Request) {
  const supabase = await createClient(true);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const venueId = await getAdminVenueId(supabase);
  if (!venueId) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  }

  const { error } = await supabase
    .from("venues")
    .update({ lookup_urls: parsed.data.lookup_urls })
    .eq("id", venueId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
