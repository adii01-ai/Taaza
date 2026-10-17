export type ExpiryTone = "expired" | "today" | "soon" | "fresh" | "unknown";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Today's date as YYYY-MM-DD in India time, which is how dates are stored. */
export function todayInIndia(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return new Date(date.getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

/** Whole days from `today` until `expiresOn` (negative when already past). */
export function daysUntil(expiresOn: string | null, today: string): number | null {
  if (!expiresOn) return null;
  const diff = Date.parse(`${expiresOn}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`);
  return Math.round(diff / DAY_MS);
}

export function expiryTone(days: number | null): ExpiryTone {
  if (days === null) return "unknown";
  if (days < 0) return "expired";
  if (days === 0) return "today";
  if (days <= 3) return "soon";
  return "fresh";
}

export function expiryLabel(days: number | null): string {
  if (days === null) return "No date";
  if (days < -1) return `${-days} days ago`;
  if (days === -1) return "Yesterday";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 30) return `${days} days`;
  const months = Math.round(days / 30);
  return months === 1 ? "1 month" : `${months} months`;
}

export const toneClasses: Record<ExpiryTone, string> = {
  expired: "bg-danger text-white",
  today: "bg-danger-soft text-danger",
  soon: "bg-brand-soft text-ink",
  fresh: "bg-sand text-ink",
  unknown: "bg-sand text-muted",
};
