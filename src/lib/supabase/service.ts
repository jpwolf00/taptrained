import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses RLS.
 * SERVER-SIDE ONLY. Never import in "use client" files or expose to browser.
 * Use for admin API routes that need to write across RLS boundaries.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase service-role env vars");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false },
  });
}
