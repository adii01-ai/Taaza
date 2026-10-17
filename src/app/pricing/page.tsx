import Link from "next/link";
import { BackIcon, CheckIcon, LockIcon } from "@/components/ui/icons";

export const metadata = { title: "Taaza Plus" };

const FEATURES = [
  "200 scans a month",
  "Expiry reminders every day",
  "Recipes from what you have",
  "Weekly meal plans",
  "Smart shopping list",
  "Up to 6 family members",
  "Monthly savings report",
  "Share food with neighbours",
];

export default function PricingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col gap-4 bg-cream px-5 pb-8 pt-12">
      <Link href="/profile" aria-label="Back" className="flex size-11 items-center justify-center rounded-full border border-line bg-white">
        <BackIcon />
      </Link>
      <header>
        <h1 className="font-display text-[28px] font-bold">Taaza Plus</h1>
        <p className="text-[15px] text-muted">One simple plan for your whole kitchen.</p>
      </header>

      <section className="flex flex-col gap-4 rounded-3xl bg-ink px-5 py-6 text-white">
        <div>
          <p>
            <span className="font-display text-[44px] font-bold leading-none text-brand">₹2,000</span>
            <span className="text-[#E9E6D8]"> / month</span>
          </p>
          <p className="text-sm text-[#E9E6D8]">Billed monthly · cancel anytime</p>
        </div>
        <hr className="border-[#3A3A34]" />
        <ul className="flex flex-col gap-2.5 text-[15px]">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2.5">
              <CheckIcon size={18} strokeWidth={3} className="text-brand" />
              {f}
            </li>
          ))}
        </ul>
        <button type="button" disabled className="h-[54px] rounded-2xl bg-brand text-[17px] font-bold text-ink opacity-60">
          Payments coming soon
        </button>
        <p className="-mt-1.5 text-center text-[13px] text-[#E9E6D8]">The 7-day free trial starts when payments go live.</p>
      </section>

      <p className="mt-auto flex items-center justify-center gap-2 text-[13px] text-muted">
        <LockIcon size={16} /> Secure payment · UPI, cards and wallets
      </p>
    </main>
  );
}
