export type CategoryKey = "veggies" | "dairy" | "fruits" | "bakery" | "grains" | "cooked" | "other";

export const CATEGORIES: { key: CategoryKey; label: string; icon: string }[] = [
  { key: "veggies", label: "Veggies", icon: "/icons/vegetables.svg" },
  { key: "dairy", label: "Dairy", icon: "/icons/dairy.svg" },
  { key: "fruits", label: "Fruits", icon: "/icons/fruits.svg" },
  { key: "bakery", label: "Bakery", icon: "/icons/bakery.svg" },
  { key: "grains", label: "Pantry", icon: "/icons/grocery.svg" },
  { key: "cooked", label: "Cooked", icon: "/icons/biryani.svg" },
  { key: "other", label: "Other", icon: "/icons/snacks.svg" },
];

const MATCHERS: [CategoryKey, RegExp][] = [
  ["dairy", /dairy|milk|curd|dahi|paneer|cheese|butter|ghee|egg|yogurt|cream/i],
  ["fruits", /fruit|apple|banana|mango|orange|grape|papaya|lemon|berry|melon|guava/i],
  ["bakery", /bak|bread|bun|pav|cake|biscuit|roti|chapati|paratha/i],
  ["cooked", /cooked|leftover|dal|curry|sabzi|rice dish|pulao|biryani|khichdi/i],
  ["grains", /pantry|grain|rice|atta|flour|pulse|lentil|spice|oil|sugar|tea|coffee|snack/i],
  ["veggies", /veg|herb|tomato|onion|potato|spinach|palak|coriander|chilli|carrot|capsicum|cabbage|cauliflower|beans|peas|ginger|garlic|cucumber/i],
];

/** Maps a free-text category (or item name) to one of the app's category groups. */
export function categoryKey(category: string | null, name = ""): CategoryKey {
  const text = `${category ?? ""} ${name}`;
  for (const [key, pattern] of MATCHERS) {
    if (pattern.test(text)) return key;
  }
  return "other";
}

export function categoryIcon(category: string | null, name = ""): string {
  const key = categoryKey(category, name);
  return CATEGORIES.find((c) => c.key === key)?.icon ?? "/icons/snacks.svg";
}
