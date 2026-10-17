import Image from "next/image";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { BellIcon, ClockIcon, LeafIcon, NoMailIcon, ShieldIcon } from "@/components/ui/icons";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <main className="relative mx-auto min-h-dvh max-w-[480px] overflow-hidden bg-[#F2B634]">
      <div className="relative h-[460px]">
        <Image
          src="/images/hero-milk.jpg"
          alt="A surprised man holding a bowl of cereal and a bottle of milk"
          fill
          priority
          sizes="480px"
          className="object-cover object-top"
        />

        <div className="absolute inset-x-4 top-12 flex items-center justify-between">
          <span className="flex h-11 items-center gap-2 rounded-full bg-ink pl-1.5 pr-3.5">
            <span className="flex size-8 items-center justify-center rounded-[10px] bg-brand text-ink">
              <LeafIcon size={18} strokeWidth={2.4} />
            </span>
            <span className="font-display text-[19px] font-bold text-white">Taaza</span>
          </span>
        </div>

        <div aria-hidden="true" className="absolute left-3.5 top-[120px] flex flex-col items-start gap-2">
          <div className="relative size-[100px] -rotate-[5deg] overflow-hidden rounded-3xl border-4 border-white bg-white shadow-[var(--shadow-float)]">
            <Image src="/images/chips-man.jpg" alt="" fill sizes="100px" className="object-cover object-[56%_30%]" />
          </div>
          <div className="flex flex-col rounded-xl bg-white px-2.5 py-1.5 shadow-[0_8px_20px_rgb(17_17_17/0.18)]">
            <span className="text-[13px] font-bold">Chips</span>
            <span className="text-xs text-muted">2 packs left</span>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="absolute right-3 top-[346px] flex items-center gap-2.5 rounded-2xl bg-ink px-3 py-2.5 text-white shadow-[var(--shadow-float)]"
        >
          <span className="flex size-[34px] items-center justify-center rounded-[10px] bg-brand text-ink">
            <BellIcon size={18} strokeWidth={2.2} />
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-bold">Milk expires tomorrow</span>
            <span className="text-xs text-[#E9E6D8]">Use it in breakfast today</span>
          </span>
        </div>
      </div>

      <section className="absolute inset-x-0 bottom-0 flex min-h-[414px] flex-col rounded-t-[32px] bg-white px-6 pb-6 pt-3.5 shadow-[0_-10px_30px_rgb(17_17_17/0.12)]">
        <div aria-hidden="true" className="mb-3.5 h-[5px] w-10 self-center rounded-full bg-line" />
        <h1 className="font-display text-[30px] font-extrabold leading-tight">Never waste food again</h1>
        <p className="mt-2 text-base leading-relaxed text-muted">
          Sign in to track your kitchen, get reminders and save money.
        </p>

        <div className="mt-6">
          <GoogleSignInButton next={next} />
          {error ? (
            <p role="alert" className="mt-2 text-center text-sm font-bold text-danger">
              Sign-in didn&apos;t finish. Please try again.
            </p>
          ) : null}
        </div>

        <ul className="mt-5 grid grid-cols-3 gap-2 text-center text-[13px] font-bold">
          <li className="flex flex-col items-center gap-1.5 rounded-2xl bg-cream px-1.5 py-3">
            <ShieldIcon />
            Private &amp; secure
          </li>
          <li className="flex flex-col items-center gap-1.5 rounded-2xl bg-cream px-1.5 py-3">
            <ClockIcon />
            7-day free trial
          </li>
          <li className="flex flex-col items-center gap-1.5 rounded-2xl bg-cream px-1.5 py-3">
            <NoMailIcon />
            No spam, ever
          </li>
        </ul>

        <p className="mt-auto pt-6 text-center text-[13px] leading-relaxed text-muted">
          By continuing you agree to our <span className="underline">Terms of Service</span>
          <br />
          and <span className="underline">Privacy Policy</span>.
        </p>
      </section>
    </main>
  );
}
