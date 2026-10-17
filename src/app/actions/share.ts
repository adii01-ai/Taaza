"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentKitchen } from "@/lib/kitchen/current";

export type FormState = { error?: string; ok?: boolean };

const PostInput = z.object({
  title: z.string().trim().min(2, "Say what you're sharing.").max(80),
  area: z.string().trim().max(60).optional(),
  pickupHours: z.coerce.number().int().min(1).max(24),
});

export async function createSharePost(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = PostInput.safeParse({
    title: formData.get("title"),
    area: formData.get("area") || undefined,
    pickupHours: formData.get("pickupHours"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };

  const { supabase, user } = await getCurrentKitchen();
  const now = new Date();
  const { error } = await supabase.from("share_posts").insert({
    user_id: user.id,
    title: parsed.data.title,
    area: parsed.data.area ?? null,
    cooked_at: now.toISOString(),
    pickup_by: new Date(now.getTime() + parsed.data.pickupHours * 3600_000).toISOString(),
  });
  if (error) return { error: "Couldn't post right now. Please try again." };

  revalidatePath("/share");
  return { ok: true };
}

export async function requestSharePost(formData: FormData) {
  const postId = z.string().uuid().safeParse(formData.get("postId"));
  if (!postId.success) return;

  const { supabase, user } = await getCurrentKitchen();
  await supabase.from("share_requests").insert({ post_id: postId.data, requester_id: user.id });
  revalidatePath("/share");
}

export async function closeSharePost(formData: FormData) {
  const postId = z.string().uuid().safeParse(formData.get("postId"));
  if (!postId.success) return;

  const { supabase } = await getCurrentKitchen();
  await supabase.from("share_posts").update({ status: "closed" }).eq("id", postId.data);
  revalidatePath("/share");
}
