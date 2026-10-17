"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowRightIcon, ClockIcon, CloseIcon, SparkleIcon, VegMark } from "@/components/ui/icons";

type Recipe = {
  title: string;
  description: string;
  minutes: number;
  difficulty: "easy" | "medium" | "hard";
  servings: number;
  uses: string[];
  other_ingredients: string[];
  steps: string[];
  vegetarian: boolean;
};

const PHOTOS = ["/images/curries.jpg", "/images/pulao.jpg", "/images/curd-rice.jpg", "/images/thali.jpg", "/images/vada-pav.jpg"];

export function RecipeIdeas({ hasItems }: { hasItems: boolean }) {
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Recipe | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/recipes", { method: "POST" });
      const data = (await response.json()) as { recipes?: Recipe[]; error?: string };
      if (!response.ok || !data.recipes) setError(data.error ?? "Couldn't load ideas.");
      else setRecipes(data.recipes);
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!recipes) {
    return (
      <section className="relative overflow-hidden rounded-[26px] bg-ink p-5 text-white">
        <Image src="/images/curries.jpg" alt="" fill sizes="480px" className="object-cover opacity-35" />
        <div className="relative flex flex-col items-start gap-2">
          <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-ink">Made for your kitchen</span>
          <h2 className="font-display text-2xl font-bold leading-tight">What should I cook today?</h2>
          <p className="text-sm text-[#F1EEDF]">
            {hasItems
              ? "Get 4 easy recipes that use the food expiring first."
              : "Add some food to your kitchen first, then get recipe ideas."}
          </p>
          <button
            type="button"
            onClick={load}
            disabled={loading || !hasItems}
            className="mt-2 flex h-12 items-center gap-2 rounded-2xl bg-brand px-5 font-bold text-ink disabled:opacity-50"
          >
            <SparkleIcon size={18} /> {loading ? "Finding recipes…" : "Suggest recipes"}
          </button>
          {error ? (
            <p role="alert" className="text-sm font-bold text-brand">
              {error}
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  const [featured, ...rest] = recipes;
  return (
    <>
      {featured ? (
        <button
          type="button"
          onClick={() => setOpen(featured)}
          className="relative block h-[210px] w-full overflow-hidden rounded-[26px] bg-[#2A2A26] text-left"
        >
          <Image src={PHOTOS[0]} alt="" fill sizes="480px" className="object-cover object-[100%_15%]" />
          <span className="absolute inset-0 bg-gradient-to-b from-transparent from-30% to-black/80" />
          {featured.uses.length ? (
            <span className="absolute left-3.5 top-3.5 rounded-full bg-brand px-2.5 py-1.5 text-xs font-bold text-ink">
              Uses {featured.uses.slice(0, 2).join(" & ")}
            </span>
          ) : null}
          <span className="absolute inset-x-4 bottom-3.5 flex items-end gap-3">
            <span className="flex min-w-0 flex-1 flex-col gap-1 text-white">
              <span className="font-display text-2xl font-bold leading-tight">{featured.title}</span>
              <span className="text-[13px] text-[#F1EEDF]">
                {featured.minutes} min · {featured.difficulty} · Serves {featured.servings}
              </span>
            </span>
            <span className="flex h-11 items-center gap-1.5 rounded-2xl bg-brand px-4 text-sm font-bold text-ink">
              Cook <ArrowRightIcon size={16} strokeWidth={2.6} />
            </span>
          </span>
        </button>
      ) : null}

      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-[19px] font-bold">More for your kitchen</h2>
        <button type="button" onClick={load} disabled={loading} className="text-sm font-bold underline">
          {loading ? "Loading…" : "New ideas"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {rest.map((recipe, index) => (
          <button
            key={recipe.title}
            type="button"
            onClick={() => setOpen(recipe)}
            className="flex flex-col gap-2 rounded-[22px] bg-white p-2 text-left shadow-[var(--shadow-card)]"
          >
            <span className="relative block h-[104px] w-full overflow-hidden rounded-2xl">
              <Image src={PHOTOS[(index + 1) % PHOTOS.length]} alt="" fill sizes="220px" className="object-cover" />
            </span>
            <span className="flex items-center gap-2 px-1 pb-1">
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-[15px] font-bold">
                  {recipe.vegetarian ? <VegMark /> : null}
                  <span className="truncate">{recipe.title}</span>
                </span>
                <span className="text-[13px] text-muted">
                  {recipe.minutes} min · {recipe.difficulty}
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>

      {open ? <RecipeSheet recipe={open} onClose={() => setOpen(null)} /> : null}
    </>
  );
}

function RecipeSheet({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-label={recipe.title} className="fixed inset-0 z-30 flex items-end justify-center bg-black/50">
      <div className="max-h-[88dvh] w-full max-w-[480px] overflow-y-auto rounded-t-[28px] bg-white px-5 pb-10 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold leading-tight">{recipe.title}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <ClockIcon size={15} /> {recipe.minutes} min · {recipe.difficulty} · Serves {recipe.servings}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close recipe" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sand">
            <CloseIcon size={18} />
          </button>
        </div>
        <p className="mt-3 text-[15px] text-muted">{recipe.description}</p>

        <h3 className="mt-5 font-bold">Uses from your kitchen</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {recipe.uses.map((u) => (
            <span key={u} className="rounded-full bg-brand-soft px-2.5 py-1 text-[13px] font-bold">
              {u}
            </span>
          ))}
          {recipe.other_ingredients.map((u) => (
            <span key={u} className="rounded-full bg-sand px-2.5 py-1 text-[13px] text-muted">
              {u}
            </span>
          ))}
        </div>

        <h3 className="mt-5 font-bold">Steps</h3>
        <ol className="mt-2 flex flex-col gap-2.5">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-[15px]">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-brand">{i + 1}</span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
