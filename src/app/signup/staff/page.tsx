import { redirect } from "next/navigation";

/**
 * The staff join flow now lives at the shareable /join landing page.
 * Keep this path working (and carry any ?code= through) for old links.
 */
export default async function StaffSignupRedirect({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  redirect(code ? `/join?code=${encodeURIComponent(code)}` : "/join");
}
