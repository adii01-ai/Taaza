import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

const MODEL = "claude-opus-5-5";
// Re-runs a declined request on the server-defined fallback model instead of failing.
const FALLBACK_BETA = "server-side-fallback-2026-07-01";

let client: Anthropic | null = null;
function getClient() {
  client ??= new Anthropic();
  return client;
}

export class AiRefusalError extends Error {}

export const SCAN_KINDS = ["fridge_photo", "grocery_bill", "order_screenshot"] as const;
export type ScanKind = (typeof SCAN_KINDS)[number];

const ScannedItem = z.object({
  name: z.string().describe("Short everyday name, e.g. 'Tomatoes', 'Paneer', 'Milk (Amul)'"),
  quantity: z.number().nullable().describe("Amount, if visible or printed; otherwise null"),
  unit: z.string().nullable().describe("kg, g, L, ml, pcs, pack, bunch… or null"),
  category: z.enum(["vegetables", "fruits", "dairy", "bakery", "pantry", "cooked", "meat", "other"]),
  place: z.enum(["fridge", "pantry", "freezer"]).describe("Where an Indian home would normally keep it"),
  shelf_life_days: z.number().describe("Typical days it stays good from today in that place"),
  price_inr: z.number().nullable().describe("Price in rupees if printed on a bill/order, else null"),
});

const ScanResult = z.object({
  items: z.array(ScannedItem),
  note: z.string().nullable().describe("One short sentence if the image was unclear or had no food, else null"),
});

export type ScannedItem = z.infer<typeof ScannedItem>;

const SCAN_SYSTEM = `You read photos for Taaza, an Indian kitchen app that reminds families before food spoils.
List each distinct food item you can actually see or read. Merge duplicates. Skip non-food items, containers you cannot identify, and taxes/fees/discount lines on bills.
Use common Indian names (e.g. "Palak" → "Spinach (palak)", "Dahi" → "Curd").
For shelf_life_days, give a realistic estimate for a typical Indian home kitchen (warm climate) for fresh produce bought today; for packaged goods use typical unopened life.`;

const SCAN_PROMPTS: Record<ScanKind, string> = {
  fridge_photo: "This is a photo of a fridge shelf or kitchen counter. List the food items in it.",
  grocery_bill: "This is a grocery bill or receipt. List the food items bought, with quantities and prices.",
  order_screenshot:
    "This is a screenshot of an online grocery order (Blinkit, Zepto, BigBasket, Swiggy Instamart, etc.). List the food items ordered, with quantities and prices.",
};

export async function extractFoodItems(input: {
  base64: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  kind: ScanKind;
}) {
  const response = await getClient().beta.messages.parse({
    model: MODEL,
    max_tokens: 8000,
    betas: [FALLBACK_BETA],
    fallbacks: "default",
    system: SCAN_SYSTEM,
    output_config: { effort: "low", format: betaZodOutputFormat(ScanResult) },
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: input.mediaType, data: input.base64 } },
          { type: "text", text: SCAN_PROMPTS[input.kind] },
        ],
      },
    ],
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new AiRefusalError("Could not read this image.");
  }
  return response.parsed_output;
}

const Recipe = z.object({
  title: z.string(),
  description: z.string().describe("One appetising sentence"),
  minutes: z.number().describe("Total cooking time"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  servings: z.number(),
  uses: z.array(z.string()).describe("Which of the listed kitchen items this recipe uses up"),
  other_ingredients: z.array(z.string()).describe("Common staples also needed (oil, salt, spices…)"),
  steps: z.array(z.string()).describe("Short numbered-style steps, 4 to 8"),
  vegetarian: z.boolean(),
});

const RecipeResult = z.object({ recipes: z.array(Recipe) });
export type SuggestedRecipe = z.infer<typeof Recipe>;

const DIET_TEXT: Record<string, string> = {
  veg: "vegetarian (no meat, fish or eggs)",
  eggetarian: "vegetarian plus eggs",
  jain: "Jain (vegetarian, no onion, garlic, potato or other root vegetables)",
  vegan: "vegan (no dairy, meat, fish or eggs)",
  non_veg: "no restrictions",
};

export async function suggestRecipes(input: {
  items: { name: string; daysLeft: number | null }[];
  diet: string;
}) {
  const list = input.items
    .map((item) => `- ${item.name}${item.daysLeft === null ? "" : ` (use within ${Math.max(item.daysLeft, 0)} days)`}`)
    .join("\n");

  const response = await getClient().beta.messages.parse({
    model: MODEL,
    max_tokens: 12000,
    betas: [FALLBACK_BETA],
    fallbacks: "default",
    system:
      "You suggest simple home-style Indian recipes for Taaza, an app that helps families use food before it spoils. Prefer dishes that use up the items closest to expiry, need only common pantry staples, and suit a weekday home kitchen.",
    output_config: { effort: "low", format: betaZodOutputFormat(RecipeResult) },
    messages: [
      {
        role: "user",
        content: `Food in my kitchen that needs using soon:\n${list}\n\nDiet: ${DIET_TEXT[input.diet] ?? "no restrictions"}.\nSuggest 4 recipes.`,
      },
    ],
  });

  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new AiRefusalError("Could not suggest recipes right now.");
  }
  return response.parsed_output.recipes;
}
