import { NextResponse } from "next/server";
import { AiRefusalError, suggestRecipes } from "@/lib/ai/claude";
import { daysUntil, todayInIndia } from "@/lib/kitchen/expiry";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const [{ data: profile }, { data: items }] = await Promise.all([
    supabase.from("profiles").select("diet").eq("id", user.id).maybeSingle(),
    supabase
      .from("items")
      .select("name, expires_on")
      .eq("status", "fresh")
      .order("expires_on", { ascending: true, nullsFirst: false })
      .limit(12),
  ]);

  if (!items?.length) {
    return NextResponse.json({ recipes: [], empty: true });
  }

  const today = todayInIndia();
  try {
    const recipes = await suggestRecipes({
      items: items.map((item) => ({ name: item.name, daysLeft: daysUntil(item.expires_on, today) })),
      diet: profile?.diet ?? "veg",
    });
    return NextResponse.json({ recipes });
  } catch (error) {
    if (error instanceof AiRefusalError) {
      return NextResponse.json({ error: "Couldn't suggest recipes right now." }, { status: 422 });
    }
    console.error("recipes failed", error);
    return NextResponse.json({ error: "Recipe ideas are unavailable right now. Please try again." }, { status: 502 });
  }
}
