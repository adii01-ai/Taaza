import Image from "next/image";
import Link from "next/link";
import { UsedButton, WastedButton } from "@/components/kitchen/item-actions";
import { ArrowRightIcon, ChevronDownIcon, ScanIcon, SearchIcon } from "@/components/ui/icons";
import { CATEGORIES, categoryIcon, categoryKey, type CategoryKey } from "@/lib/kitchen/categories";
import { firstName, getCurrentKitchen, initials } from "@/lib/kitchen/current";
import { daysUntil, expiryLabel, expiryTone, todayInIndia, toneClasses } from "@/lib/kitchen/expiry";
import { amountLabel } from "@/lib/kitchen/format";

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q = "", cat } = await searchParams;
  const { supabase, user, profile, householdName } = await getCurrentKitchen();
  const { data } = await supabase
    .from("items")
    .select("id, name, category, quantity, unit, place, expires_on")
    .eq("status", "fresh")
    .order("expires_on", { ascending: true, nullsFirst: false });

  const today = todayInIndia();
  const all = (data ?? []).map((item) => ({ ...item, days: daysUntil(item.expires_on, today) }));
  const activeCat = CATEGORIES.some((c) => c.key === cat) ? (cat as CategoryKey) : null;
  const query = q.trim().toLowerCase();
  const items = all.filter(
    (item) =>
      (!activeCat || categoryKey(item.category, item.name) === activeCat) &&
      (!query || item.name.toLowerCase().includes(query)),
  );
  const urgent = all.filter((item) => item.days !== null && item.days <= 1);
  const soon = items.filter((item) => item.days !== null && item.days <= 3);
  const later = items.filter((item) => item.days === null || item.days > 3);
  const name = firstName(profile?.full_name, user.email);

  return (
    <main className="flex flex-col gap-4 px-5 pt-12">
      <header className="flex items-center gap-3">
        <Link
          href="/profile"
          aria-label="My profile"
          className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-ink bg-brand font-display font-bold"
        >
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt="" fill sizes="44px" className="object-cover" />
          ) : (
            initials(profile?.full_name, user.email)
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted">
            {greeting()}, {name}
          </p>
          <p className="flex items-center gap-1 font-display text-xl font-bold">
            {householdName} <ChevronDownIcon size={18} strokeWidth={2.4} />
          </p>
        </div>
        <Link
          href="/scan"
          aria-label="Add food"
          className="flex size-11 items-center justify-center rounded-full border border-line bg-white"
        >
          <ScanIcon size={20} />
        </Link>
      </header>

      <form className="flex h-[52px] items-center gap-2.5 rounded-2xl border border-line bg-white px-3.5" role="search">
        <SearchIcon className="text-muted" />
        <input
          type="search"
          name="q"
          defaultValue={q}
          aria-label="Search your kitchen"
          placeholder="Search your kitchen"
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
        />
        {activeCat ? <input type="hidden" name="cat" value={activeCat} /> : null}
      </form>

      {urgent.length > 0 ? (
        <section className="flex h-[148px] items-center gap-3 overflow-hidden rounded-3xl bg-ink pl-[18px] pr-3.5">
          <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
            <span className="rounded-full bg-danger px-2.5 py-1 text-[11px] font-bold tracking-wide text-white">
              {urgent.some((i) => (i.days ?? 0) <= 0) ? "EXPIRES TODAY" : "USE BY TOMORROW"}
            </span>
            <h2 className="line-clamp-2 font-display text-[21px] font-bold leading-tight text-white">
              {urgent
                .slice(0, 2)
                .map((i) => i.name)
                .join(" & ")}
            </h2>
            <Link
              href="/recipes"
              className="mt-1 flex h-9 items-center gap-1.5 rounded-xl bg-brand px-3.5 text-sm font-bold"
            >
              Cook now <ArrowRightIcon size={16} strokeWidth={2.6} />
            </Link>
          </div>
          <div className="size-[124px] shrink-0 rounded-full bg-brand p-1.5">
            <div className="relative size-full overflow-hidden rounded-full">
              <Image src="/images/curries.jpg" alt="" fill sizes="112px" className="scale-[2.6] object-cover object-[92%_22%]" />
            </div>
          </div>
        </section>
      ) : (
        <section className="flex items-center gap-3 rounded-3xl bg-ink p-[18px] text-white">
          <div className="flex-1">
            <h2 className="font-display text-xl font-bold">{all.length ? "Nothing expiring soon" : "Let's fill your kitchen"}</h2>
            <p className="mt-1 text-[13px] text-[#E9E6D8]">
              {all.length ? "Everything is fresh. Scan new groceries when you shop." : "Scan your fridge, a bill or an online order."}
            </p>
          </div>
          <Link href="/scan" className="flex h-11 items-center gap-1.5 rounded-xl bg-brand px-4 text-sm font-bold text-ink">
            Scan <ArrowRightIcon size={16} strokeWidth={2.6} />
          </Link>
        </section>
      )}

      <section aria-label="Categories">
        <h2 className="mb-2.5 font-display text-[19px] font-bold">Categories</h2>
        <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
          <CategoryLink href={query ? `/?q=${encodeURIComponent(q)}` : "/"} label="All" active={!activeCat} />
          {CATEGORIES.map((c) => (
            <CategoryLink
              key={c.key}
              href={`/?cat=${c.key}${query ? `&q=${encodeURIComponent(q)}` : ""}`}
              label={c.label}
              icon={c.icon}
              active={activeCat === c.key}
            />
          ))}
        </div>
      </section>

      {soon.length > 0 ? (
        <section aria-labelledby="soon-heading">
          <h2 id="soon-heading" className="mb-2.5 font-display text-[19px] font-bold">
            Expiring soon
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {soon.map((item) => {
              const tone = expiryTone(item.days);
              return (
                <article key={item.id} className="flex flex-col gap-2 rounded-[22px] bg-white p-2.5 shadow-[var(--shadow-card)]">
                  <div className="relative flex h-[82px] items-center justify-center rounded-2xl border border-[#F1E2CF] bg-tile">
                    <Image src={categoryIcon(item.category, item.name)} alt="" width={64} height={64} />
                    <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-bold ${toneClasses[tone]}`}>
                      {expiryLabel(item.days)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-0.5">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[15px] font-bold">{item.name}</h3>
                      <p className="truncate text-[13px] text-muted">{amountLabel(item.quantity, item.unit, item.place)}</p>
                    </div>
                    <UsedButton id={item.id} name={item.name} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {later.length > 0 ? (
        <section aria-labelledby="later-heading">
          <h2 id="later-heading" className="mb-2.5 font-display text-[19px] font-bold">
            In your kitchen
          </h2>
          <ul className="flex flex-col gap-2">
            {later.map((item) => (
              <li key={item.id} className="flex items-center gap-3 rounded-[18px] bg-white py-2.5 pl-3 pr-2.5 shadow-[var(--shadow-card)]">
                <Image src={categoryIcon(item.category, item.name)} alt="" width={44} height={44} className="rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold">{item.name}</p>
                  <p className="truncate text-[13px] text-muted">{amountLabel(item.quantity, item.unit, item.place)}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${toneClasses[expiryTone(item.days)]}`}>
                  {expiryLabel(item.days)}
                </span>
                <WastedButton id={item.id} name={item.name} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {items.length === 0 ? (
        <section className="flex flex-col items-center rounded-3xl bg-white px-6 py-8 text-center shadow-[var(--shadow-card)]">
          <Image src="/images/p1.png" alt="" width={120} height={120} className="rounded-3xl" />
          <h2 className="mt-3 font-display text-xl font-bold">{all.length ? "Nothing matches" : "Your kitchen is empty"}</h2>
          <p className="mt-1 text-sm text-muted">
            {all.length ? "Try another search or category." : "Scan a fridge shelf, a grocery bill or an online order to start."}
          </p>
          {all.length ? null : (
            <Link href="/scan" className="mt-4 flex h-12 items-center gap-2 rounded-2xl bg-ink px-5 font-bold text-brand">
              <ScanIcon size={20} /> Scan food
            </Link>
          )}
        </section>
      ) : null}
    </main>
  );
}

function CategoryLink({ href, label, icon, active }: { href: string; label: string; icon?: string; active: boolean }) {
  return (
    <Link href={href} aria-current={active ? "true" : undefined} className="flex shrink-0 flex-col items-center gap-1.5 text-[13px]">
      <span
        className={`flex size-14 items-center justify-center rounded-[18px] ${
          active ? "border-2 border-ink bg-brand" : "border border-[#F1E2CF] bg-tile"
        }`}
      >
        {icon ? (
          <Image src={icon} alt="" width={40} height={40} />
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        )}
      </span>
      <span className={active ? "font-bold" : ""}>{label}</span>
    </Link>
  );
}
