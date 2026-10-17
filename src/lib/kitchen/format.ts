const PLACE_LABEL = { fridge: "Fridge", pantry: "Pantry", freezer: "Freezer" } as const;

export function amountLabel(quantity: number | null, unit: string | null, place: keyof typeof PLACE_LABEL) {
  const amount = quantity ? `${Number(quantity)}${unit ? ` ${unit}` : ""}` : unit ?? "";
  return [amount, PLACE_LABEL[place]].filter(Boolean).join(" · ");
}

export function rupees(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}
