import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client — use in Server Components and Route Handlers.
 * Must be called fresh for each request (no shared state).
 * Pass canWrite=true only from Route Handlers/Server Actions where you can
 * actually set cookies; omit (or false) from Server Components.
 */
export async function createClient(canWrite = false) {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          if (!canWrite) return;
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Swallow — can't set cookies from a Server Component render
          }
        },
      },
    }
  );
}
