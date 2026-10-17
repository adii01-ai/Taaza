"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentKitchen } from "@/lib/kitchen/current";

const ProfileInput = z.object({
  diet: z.enum(["veg", "non_veg", "eggetarian", "jain", "vegan"]),
  language: z.enum(["en", "hi"]),
  reminder_time: z.string().regex(/^\d{2}:\d{2}$/),
  notifications_on: z.boolean(),
});

export type ProfileFormState = { ok?: boolean; error?: string };

export async function updateProfile(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const parsed = ProfileInput.safeParse({
    diet: formData.get("diet"),
    language: formData.get("language"),
    reminder_time: formData.get("reminder_time"),
    notifications_on: formData.get("notifications_on") === "on",
  });
  if (!parsed.success) return { error: "Please check your settings." };

  const { supabase, user } = await getCurrentKitchen();
  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id);
  if (error) return { error: "Couldn't save. Please try again." };

  revalidatePath("/profile");
  return { ok: true };
}
