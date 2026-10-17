"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, useTransition } from "react";
import { addItems, type AddItemsInput } from "@/app/actions/items";
import { CameraIcon, CloseIcon, ImageIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { categoryIcon } from "@/lib/kitchen/categories";
import { resizeImage } from "./resize-image";

type Kind = "fridge_photo" | "grocery_bill" | "order_screenshot";
type Place = "fridge" | "pantry" | "freezer";

type DraftItem = {
  key: string;
  name: string;
  quantity: string;
  unit: string;
  category: string;
  place: Place;
  days: string;
  price_inr: number | null;
};

type ScannedItem = {
  name: string;
  quantity: number | null;
  unit: string | null;
  category: string;
  place: Place;
  shelf_life_days: number;
  price_inr: number | null;
};

const KINDS: { value: Kind; label: string; hint: string }[] = [
  { value: "fridge_photo", label: "Fridge", hint: "Point at your fridge shelf or counter" },
  { value: "grocery_bill", label: "Bill", hint: "Flatten the bill so every line is visible" },
  { value: "order_screenshot", label: "Online order", hint: "Upload a screenshot of your order" },
];

let counter = 0;
const newKey = () => `item-${counter++}`;

function blankItem(): DraftItem {
  return { key: newKey(), name: "", quantity: "", unit: "", category: "", place: "fridge", days: "3", price_inr: null };
}

export function ScanFlow() {
  const router = useRouter();
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<Kind>("fridge_photo");
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [items, setItems] = useState<DraftItem[]>([]);
  const [source, setSource] = useState<AddItemsInput["source"]>("manual");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const formId = useId();
  const activeKind = KINDS.find((k) => k.value === kind)!;

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setMessage(null);
    setScanning(true);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });

    try {
      const body = new FormData();
      body.set("image", await resizeImage(file), "scan.jpg");
      body.set("kind", kind);
      const response = await fetch("/api/scan", { method: "POST", body });
      const data = (await response.json()) as { items?: ScannedItem[]; note?: string | null; error?: string };
      if (!response.ok || !data.items) {
        setMessage(data.error ?? "Scanning failed. Please try again.");
        return;
      }
      setSource(kind);
      setItems((current) => [
        ...current,
        ...data.items!.map((item) => ({
          key: newKey(),
          name: item.name,
          quantity: item.quantity?.toString() ?? "",
          unit: item.unit ?? "",
          category: item.category,
          place: item.place,
          days: String(item.shelf_life_days),
          price_inr: item.price_inr,
        })),
      ]);
      setMessage(data.items.length ? data.note ?? null : data.note ?? "We couldn't spot any food. Try a closer photo.");
    } catch {
      setMessage("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setScanning(false);
    }
  }

  function update(key: string, patch: Partial<DraftItem>) {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function save() {
    const named = items.filter((item) => item.name.trim());
    if (!named.length) {
      setMessage("Add at least one item with a name.");
      return;
    }
    startSaving(async () => {
      const result = await addItems({
        source,
        items: named.map((item) => ({
          name: item.name.trim(),
          quantity: item.quantity ? Number(item.quantity) || null : null,
          unit: item.unit.trim() || null,
          category: item.category || null,
          place: item.place,
          days: Math.min(Math.max(Math.round(Number(item.days) || 0), 0), 730),
          price_inr: item.price_inr,
        })),
      });
      if (result.error) setMessage(result.error);
      else router.push("/");
    });
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-ink">
      <div className="flex flex-col gap-3 px-5 pb-4 pt-12">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="Close" className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white">
            <CloseIcon />
          </Link>
          <h1 className="font-display text-xl font-bold text-white">Add food</h1>
          <span className="size-11" />
        </div>

        <div role="tablist" aria-label="What are you scanning" className="grid grid-cols-3 gap-1 rounded-2xl bg-white/10 p-1">
          {KINDS.map((k) => (
            <button
              key={k.value}
              role="tab"
              type="button"
              aria-selected={kind === k.value}
              onClick={() => setKind(k.value)}
              className={`h-10 rounded-[10px] text-sm ${kind === k.value ? "bg-brand font-bold text-ink" : "text-[#E9E6D8]"}`}
            >
              {k.label}
            </button>
          ))}
        </div>

        <div className="relative flex h-44 flex-col items-center justify-end overflow-hidden rounded-[20px] bg-[#2A2A26] pb-4">
          {preview ? (
            <Image src={preview} alt="Your photo" fill unoptimized className="object-cover" />
          ) : (
            <Image src="/images/thali.jpg" alt="" fill sizes="480px" className="object-cover opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent from-35% to-black/75" />
          {(["left-3 top-3 border-l-[3px] border-t-[3px] rounded-tl-[10px]", "right-3 top-3 border-r-[3px] border-t-[3px] rounded-tr-[10px]", "bottom-3 left-3 border-b-[3px] border-l-[3px] rounded-bl-[10px]", "bottom-3 right-3 border-b-[3px] border-r-[3px] rounded-br-[10px]"] as const).map((pos) => (
            <span key={pos} className={`absolute size-[26px] border-brand ${pos}`} />
          ))}
          <p className="relative text-[15px] font-bold text-white" aria-live="polite">
            {scanning ? "Reading your photo…" : activeKind.hint}
          </p>
          {scanning ? (
            <span className="relative mt-2 h-1 w-32 overflow-hidden rounded-full bg-white/20">
              <span className="absolute inset-y-0 w-1/3 animate-pulse rounded-full bg-brand" />
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-3 items-center justify-items-center">
          <button type="button" onClick={() => galleryRef.current?.click()} disabled={scanning} className="flex h-11 flex-col items-center gap-0.5 text-[13px] text-white">
            <ImageIcon /> Gallery
          </button>
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            disabled={scanning}
            aria-label="Take photo"
            className="flex size-16 items-center justify-center rounded-full border-4 border-white bg-brand text-ink disabled:opacity-60"
          >
            <CameraIcon size={24} />
          </button>
          <button type="button" onClick={() => setItems((c) => [...c, blankItem()])} className="flex h-11 flex-col items-center gap-0.5 text-[13px] text-white">
            <PlusIcon /> Type
          </button>
        </div>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
        <input ref={galleryRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>

      <section className="flex flex-1 flex-col gap-2.5 rounded-t-[28px] bg-cream px-5 pb-8 pt-2.5">
        <div aria-hidden="true" className="h-[5px] w-10 self-center rounded-full bg-[#D8CFA8]" />
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-[21px] font-bold">
              {items.length ? `${items.length} item${items.length > 1 ? "s" : ""} to add` : "Nothing scanned yet"}
            </h2>
            <p className="text-[13px] text-muted">
              {items.length ? "Days left are estimates. Change anything that looks wrong." : "Take a photo, choose one from your gallery, or type items."}
            </p>
          </div>
        </div>

        {message ? (
          <p role="status" className="rounded-xl bg-danger-soft px-3 py-2 text-sm font-bold text-danger">
            {message}
          </p>
        ) : null}

        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.key} className="flex flex-col gap-2 rounded-2xl bg-white p-2.5 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={categoryIcon(item.category, item.name)} alt="" width={40} height={40} className="rounded-xl" />
                <label className="sr-only" htmlFor={`${formId}-${item.key}-name`}>
                  Item name
                </label>
                <input
                  id={`${formId}-${item.key}-name`}
                  value={item.name}
                  onChange={(e) => update(item.key, { name: e.target.value })}
                  placeholder="Item name"
                  className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-[#FFFDF3] px-2.5 text-[15px] font-bold"
                />
                <button
                  type="button"
                  aria-label={`Remove ${item.name || "item"}`}
                  onClick={() => setItems((c) => c.filter((i) => i.key !== item.key))}
                  className="flex size-10 items-center justify-center rounded-lg bg-sand text-muted"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted">
                <label className="flex flex-col gap-1">
                  Amount
                  <input
                    value={[item.quantity, item.unit].filter(Boolean).join(" ")}
                    onChange={(e) => {
                      const match = e.target.value.match(/^\s*([\d.]*)\s*(.*)$/);
                      update(item.key, { quantity: match?.[1] ?? "", unit: match?.[2] ?? "" });
                    }}
                    placeholder="1 kg"
                    className="h-9 rounded-lg border border-line bg-[#FFFDF3] px-2 text-sm text-ink"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Keep in
                  <select
                    value={item.place}
                    onChange={(e) => update(item.key, { place: e.target.value as Place })}
                    className="h-9 rounded-lg border border-line bg-[#FFFDF3] px-1.5 text-sm text-ink"
                  >
                    <option value="fridge">Fridge</option>
                    <option value="pantry">Pantry</option>
                    <option value="freezer">Freezer</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  Days left
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={730}
                    value={item.days}
                    onChange={(e) => update(item.key, { days: e.target.value })}
                    className="h-9 rounded-lg border border-line bg-[#FFFDF3] px-2 text-sm text-ink"
                  />
                </label>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={save}
          disabled={saving || scanning || !items.length}
          className="mt-auto h-[52px] shrink-0 rounded-2xl bg-ink font-bold text-brand disabled:opacity-40"
        >
          {saving ? "Saving…" : items.length ? `Add ${items.length} item${items.length > 1 ? "s" : ""} to my kitchen` : "Add to my kitchen"}
        </button>
      </section>
    </main>
  );
}
