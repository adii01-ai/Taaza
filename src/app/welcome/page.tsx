import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/logo";

const PEOPLE = [
  { src: "/images/p1.png", tilt: "-rotate-2" },
  { src: "/images/p2.png", tilt: "rotate-2 translate-y-2.5" },
  { src: "/images/p3.png", tilt: "rotate-2" },
  { src: "/images/p4.png", tilt: "-rotate-2 translate-y-2.5" },
];

export default function WelcomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-brand px-6 pb-7 pt-12">
      <div className="flex items-center justify-between">
        <Logo />
        <Link href="/login" className="rounded-full bg-ink/10 px-4 py-2.5 text-sm font-bold">
          Skip
        </Link>
      </div>

      <div aria-hidden="true" className="mt-6 grid grid-cols-2 gap-3">
        {PEOPLE.map((person) => (
          <div
            key={person.src}
            className={`relative aspect-square overflow-hidden rounded-[26px] bg-white shadow-[0_10px_24px_rgb(17_17_17/0.12)] ${person.tilt}`}
          >
            <Image src={person.src} alt="" fill sizes="200px" className="object-cover object-[50%_30%]" priority />
          </div>
        ))}
      </div>

      <h1 className="mt-9 font-display text-4xl font-extrabold leading-[1.05] tracking-tight">
        Eat well.
        <br />
        Waste less.
        <br />
        Save more.
      </h1>
      <p className="mt-3 text-base leading-relaxed text-[#2B2B26]">
        Track what&apos;s in your kitchen, get a reminder before food spoils, and cook it in time.
      </p>

      <div className="mt-auto flex flex-col gap-1.5 pt-8">
        <Link
          href="/login"
          className="flex h-14 items-center justify-center gap-2.5 rounded-[18px] bg-ink text-[17px] font-bold text-brand"
        >
          Get Started <ArrowRightIcon size={20} strokeWidth={2.4} />
        </Link>
        <Link href="/login" className="flex h-11 items-center justify-center text-[15px] font-bold underline">
          I already have an account
        </Link>
      </div>
    </main>
  );
}
