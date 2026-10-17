"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartIcon, HomeIcon, PotIcon, ScanIcon, UsersIcon } from "./icons";

const TABS = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/recipes", label: "Recipes", Icon: PotIcon },
  { href: "/share", label: "Share", Icon: UsersIcon },
  { href: "/report", label: "Report", Icon: ChartIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const tab = (t: (typeof TABS)[number]) => {
    const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
    return (
      <Link
        key={t.href}
        href={t.href}
        aria-current={active ? "page" : undefined}
        className={`flex w-16 flex-col items-center gap-1 text-[13px] ${active ? "font-bold text-ink" : "text-muted"}`}
      >
        <t.Icon size={22} />
        {t.label}
      </Link>
    );
  };

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-[480px] items-start justify-around border-t border-line bg-white px-1.5 pt-2.5 pb-[max(env(safe-area-inset-bottom),14px)]"
    >
      {TABS.slice(0, 2).map(tab)}
      <Link href="/scan" className="-mt-[30px] flex w-16 flex-col items-center gap-0.5 text-[13px] font-bold">
        <span className="flex size-[60px] items-center justify-center rounded-full border-2 border-ink bg-brand shadow-[0_6px_16px_rgb(0_0_0/0.25)]">
          <ScanIcon size={26} />
        </span>
        Scan
      </Link>
      {TABS.slice(2).map(tab)}
    </nav>
  );
}
