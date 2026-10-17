"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentKitchen } from "@/lib/kitchen/current";
import { addDays, todayInIndia } from "@/lib/kitchen/expiry";

const NewItem = z.object({
  name: z.string().trim().min(1).max(80),
  quantity: z.number().positive().max(100000).nullable(),
  unit: z.string().trim().max(20).nullable(),
  category: z.string().trim().max(40).nullable(),
  place: z.enum(["fridge", "pantry", "freezer"]),
  days: z.number().int().min(0).max(730),
  price_inr: z.number().min(0).max(1000000).nullable(),
});

const AddItemsInput = z.object({
  source: z.enum(["manual", "fridge_photo", "grocery_bill", "order_screenshot"]),
  items: z.array(NewItem).min(1).max(60),
});

export type AddItemsInput = z.infer<typeof AddItemsInput>;

export async function addItems(input: AddItemsInput): Promise<{ error?: string; added?: number }> {
  const parsed = AddItemsInput.safeParse(input);
  if (!parsed.success) return { error: "Some items are missing a name or have an invalid amount." };

  const { supabase, user, householdId } = await getCurrentKitchen();
  const today = todayInIndia();
  const { error } = await supabase.from("items").insert(
    parsed.data.items.map((item) => ({
      household_id: householdId,
      added_by: user.id,
      source: parsed.data.source,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      place: item.place,
      price_inr: item.price_inr,
      expires_on: addDays(today, item.days),
    })),
  );
  if (error) return { error: "Couldn't save your items. Please try again." };

  revalidatePath("/", "layout");
  return { added: parsed.data.items.length };
}

const StatusInput = z.object({
  id: z.string().uuid(),
  status: z.enum(["fresh", "used", "wasted", "shared"]),
});

export async function setItemStatus(formData: FormData) {
  const parsed = StatusInput.safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return;

  const { supabase } = await getCurrentKitchen();
  await supabase.from("items").update({ status: parsed.data.status }).eq("id", parsed.data.id);
  revalidatePath("/", "layout");
}

export async function deleteItem(formData: FormData) {
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) return;

  const { supabase } = await getCurrentKitchen();
  await supabase.from("items").delete().eq("id", id.data);
  revalidatePath("/", "layout");
}
