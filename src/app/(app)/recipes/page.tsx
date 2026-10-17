import Link from "next/link";
import { RecipeIdeas } from "@/components/recipes/recipe-ideas";
import { VegMark } from "@/components/ui/icons";
import { getCurrentKitchen } from "@/lib/kitchen/current";
import { daysUntil, expiryLabel, expiryTone, todayInIndia, toneClasses } from "@/lib/kitchen/expiry";

export const metadata = { title: "Recipes – Taaza" };

const DIET_LABEL = { veg: "Veg", non_veg: "Non-veg", eggetarian: "Eggetarian", jain: "Jain", vegan: "Vegan" } as const;

export default async function RecipesPage() {
  const { supabase, profile } = await getCurrentKitchen();
  const { data } = await supabase
    .from("items")
    .select("id, name, expires_on")
    .eq("status", "fresh")
    .order("expires_on", { ascending: true, nullsFirst: false })
    .limit(8);
  const today = todayInIndia();
  const items = (data ?? []).map((i) => ({ ...i, days: daysUntil(i.expires_on, today) }));

  return (
    <main className="flex flex-col gap-4 px-5 pt-12">
      <header>
        <h1 className="font-display text-[28px] font-extrabold tracking-tight">Recipes</h1>
        <p className="text-sm text-muted">Made from what&apos;s in your kitchen</p>
      </header>

      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        <Link href="/profile" className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-ink px-3.5 text-sm font-bold text-white">
          {profile?.diet !== "non_veg" ? <VegMark /> : null}
          {DIET_LABEL[profile?.diet ?? "veg"]}
        </Link>
        {items.map((item) => (
          <span key={item.id} className={`flex h-10 shrink-0 items-center rounded-full px-3.5 text-sm font-bold ${toneClasses[expiryTone(item.days)]}`}>
            {item.name} · {expiryLabel(item.days)}
          </span>
        ))}
      </div>

      <RecipeIdeas hasItems={items.length > 0} />
    </main>
  );
}
