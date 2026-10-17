import { redirect } from "next/navigation";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Signed-in user, their profile and the kitchen (household) they belong to. */
export const getCurrentKitchen = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("household_members")
      .select("household_id, role, households(name)")
      .eq("user_id", user.id)
      .order("joined_at")
      .limit(1)
      .maybeSingle(),
  ]);

  if (!membership) {
    throw new Error("No kitchen found for this account.");
  }

  return {
    supabase,
    user,
    profile,
    householdId: membership.household_id,
    householdName: membership.households?.name ?? "My Kitchen",
    role: membership.role,
  };
});

export function firstName(fullName: string | null | undefined, email?: string | null): string {
  const name = fullName?.trim() || email?.split("@")[0] || "there";
  return name.split(/\s+/)[0];
}

export function initials(fullName: string | null | undefined, email?: string | null): string {
  const source = fullName?.trim() || email || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : source.slice(0, 2)).toUpperCase();
}
