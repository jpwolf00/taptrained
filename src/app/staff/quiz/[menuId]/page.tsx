import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StaffQuiz } from "./staff-quiz";

type Props = { params: Promise<{ menuId: string }> };

export default async function StaffQuizPage({ params }: Props) {
  const { menuId } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, venue_id")
    .single();
  if (!profile) notFound();

  const { data: menu } = await supabase
    .from("menus")
    .select(`
      id, title,
      menu_items ( id, name, is_new )
    `)
    .eq("id", menuId)
    .eq("status", "published")
    .single();
  if (!menu) notFound();

  const { data: questions } = await supabase
    .from("questions")
    .select("id, category, prompt, choices, correct_index, explanation, menu_item_id")
    .eq("menu_id", menuId);

  const newItemIds = new Set(
    (menu.menu_items as { id: string; is_new: boolean }[])
      .filter((i) => i.is_new)
      .map((i) => i.id)
  );

  return (
    <StaffQuiz
      menuId={menuId}
      menuTitle={menu.title}
      questions={questions ?? []}
      newItemIds={[...newItemIds]}
      profileId={profile.id}
      venueId={profile.venue_id}
    />
  );
}
