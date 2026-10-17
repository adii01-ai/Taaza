import Link from "next/link";
import { getCurrentKitchen } from "@/lib/kitchen/current";
import { todayInIndia } from "@/lib/kitchen/expiry";
import { rupees } from "@/lib/kitchen/format";

export const metadata = { title: "Your impact – Taaza" };

export default async function ReportPage() {
  const { supabase } = await getCurrentKitchen();
  const today = todayInIndia();
  const monthStart = `${today.slice(0, 7)}-01`;
  const monthName = new Date(`${today}T00:00:00Z`).toLocaleString("en-IN", { month: "long", timeZone: "UTC" });

  const { data } = await supabase
    .from("items")
    .select("name, status, price_inr, status_changed_at")
    .neq("status", "fresh")
    .gte("status_changed_at", `${monthStart}T00:00:00+05:30`);

  const rows = data ?? [];
  const saved = rows.filter((r) => r.status === "used" || r.status === "shared");
  const wasted = rows.filter((r) => r.status === "wasted");
  const money = saved.reduce((sum, r) => sum + (r.price_inr ?? 0), 0);
  const usedShare = rows.length ? Math.round((saved.length / rows.length) * 100) : 0;

  const weeks = [0, 0, 0, 0, 0];
  for (const r of saved) {
    const day = Number(
      new Intl.DateTimeFormat("en-IN", { day: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(r.status_changed_at!)),
    );
    weeks[Math.min(Math.floor((day - 1) / 7), 4)] += 1;
  }
  const weekCount = Math.ceil(Number(today.slice(8, 10)) / 7);
  const shownWeeks = weeks.slice(0, Math.max(weekCount, 1));
  const peak = Math.max(...shownWeeks, 1);

  const thrownCounts = new Map<string, number>();
  for (const r of wasted) thrownCounts.set(r.name, (thrownCounts.get(r.name) ?? 0) + 1);
  const topThrown = [...thrownCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <main className="flex flex-col gap-3 px-5 pt-12">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-[28px] font-extrabold tracking-tight">Your impact</h1>
        <span className="rounded-full border border-line bg-white px-3 py-2 text-sm font-bold">{monthName}</span>
      </header>

      <section className="rounded-3xl bg-ink p-5 text-white">
        <p className="text-sm text-brand">Food saved this month</p>
        <p className="font-display text-[40px] font-bold leading-tight text-brand">
          {saved.length} item{saved.length === 1 ? "" : "s"}
        </p>
        <p className="text-sm text-[#E9E6D8]">
          {money > 0 ? `Worth about ${rupees(money)} · ` : ""}
          {wasted.length} thrown away
        </p>
        <p className="mt-1.5 text-[13px] text-white/80">Money saved counts the prices read from your bills and orders.</p>
      </section>

      <section className="rounded-[18px] bg-white p-4">
        <h2 className="font-bold">Saved per week</h2>
        <div
          role="img"
          aria-label={`Items saved per week: ${shownWeeks.map((v, i) => `week ${i + 1}: ${v}`).join(", ")}`}
          className="mt-3 flex h-28 items-end gap-3"
        >
          {shownWeeks.map((value, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <span className={`text-xs ${i === shownWeeks.length - 1 ? "font-bold" : "text-muted"}`}>{value}</span>
              <div
                className={`w-full rounded-t-lg rounded-b-[3px] ${i === shownWeeks.length - 1 ? "bg-ink" : "bg-brand"}`}
                style={{ height: `${Math.max((value / peak) * 72, 4)}px` }}
              />
              <span className="text-xs text-muted">Wk {i + 1}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[18px] bg-white p-4">
        <div className="flex justify-between text-[15px]">
          <h2 className="font-bold">Used vs thrown</h2>
          <span className="text-muted">
            {saved.length} used · {wasted.length} thrown
          </span>
        </div>
        <div className="mt-2.5 flex h-3 overflow-hidden rounded-full bg-danger-soft">
          <div className="bg-ink" style={{ width: `${usedShare}%` }} />
        </div>
        <p className="mt-2 text-[13px] text-muted">
          {rows.length ? `${usedShare}% of your food was used.` : "Tap ✓ on Home when you use something, and it shows up here."}
        </p>
      </section>

      {topThrown.length ? (
        <section className="rounded-[18px] bg-white p-4">
          <h2 className="font-bold">Most often thrown</h2>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm">
            {topThrown.map(([name, count]) => (
              <li key={name} className="flex justify-between">
                <span>{name}</span>
                <span className="font-bold text-danger">
                  {count} time{count > 1 ? "s" : ""}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2.5 rounded-xl bg-sand px-3 py-2.5 text-[13px] text-muted">
            Tip: buy smaller amounts of {topThrown[0][0].toLowerCase()}, or{" "}
            <Link href="/recipes" className="font-bold underline">
              cook it sooner
            </Link>
            .
          </p>
        </section>
      ) : null}
    </main>
  );
}
