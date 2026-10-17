import { LeafIcon } from "./icons";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={`flex size-10 items-center justify-center rounded-xl ${dark ? "bg-brand text-ink" : "bg-ink text-brand"}`}
      >
        <LeafIcon size={22} strokeWidth={2.4} />
      </span>
      <span className={`font-display text-2xl font-bold ${dark ? "text-white" : "text-ink"}`}>Taaza</span>
    </span>
  );
}
