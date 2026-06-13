import { createBrowserClient } from "@supabase/ssr";

/**
 * Client-side Supabase client — use in "use client" components.
 * Safe to call multiple times; @supabase/ssr memoises per tab.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
