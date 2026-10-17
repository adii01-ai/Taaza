import Image from "next/image";
import Link from "next/link";
import { SettingsForm } from "@/components/profile/settings-form";
import { BackIcon } from "@/components/ui/icons";
import { getCurrentKitchen, initials } from "@/lib/kitchen/current";

export const metadata = { title: "My profile – Taaza" };

export default async function ProfilePage() {
  const { supabase, user, profile, householdId, householdName } = await getCurrentKitchen();
  const { data: members } = await supabase.from("household_members").select("user_id").eq("household_id", householdId);
  const memberIds = (members ?? []).map((m) => m.user_id);
  const { data: memberProfiles } = await supabase.from("profiles").select("id, full_name, email, avatar_url").in("id", memberIds);

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col gap-3.5 bg-cream px-5 pb-10 pt-12">
      <header className="flex items-center justify-between">
        <Link href="/" aria-label="Back to home" className="flex size-11 items-center justify-center rounded-full border border-line bg-white">
          <BackIcon />
        </Link>
        <h1 className="font-display text-xl font-bold">My profile</h1>
        <span className="size-11" />
      </header>

      <section className="flex items-center gap-3.5 rounded-3xl bg-ink p-[18px] text-white">
        <span className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-brand font-display text-2xl font-bold text-ink">
          {profile?.avatar_url ? <Image src={profile.avatar_url} alt="" fill sizes="64px" className="object-cover" /> : initials(profile?.full_name, user.email)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-[21px] font-bold">{profile?.full_name ?? "Your name"}</p>
          <p className="truncate text-sm text-[#E9E6D8]">{user.email}</p>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-[18px] bg-white px-4 py-3.5">
        <div>
          <h2 className="font-bold">{householdName}</h2>
          <p className="text-[13px] text-muted">
            {memberIds.length} member{memberIds.length === 1 ? "" : "s"} share this kitchen
          </p>
        </div>
        <ul className="flex flex-wrap gap-2">
          {(memberProfiles ?? []).map((m) => (
            <li
              key={m.id}
              title={m.full_name ?? m.email ?? ""}
              className="relative flex size-10 items-center justify-center overflow-hidden rounded-full bg-brand-soft text-sm font-bold"
            >
              {m.avatar_url ? <Image src={m.avatar_url} alt={m.full_name ?? ""} fill sizes="40px" className="object-cover" /> : initials(m.full_name, m.email)}
            </li>
          ))}
        </ul>
        <p className="text-[13px] text-muted">Family invites are coming soon.</p>
      </section>

      <SettingsForm
        diet={profile?.diet ?? "veg"}
        language={profile?.language ?? "en"}
        reminderTime={profile?.reminder_time ?? "08:00"}
        notificationsOn={profile?.notifications_on ?? true}
      />

      <Link href="/pricing" className="flex items-center gap-3 rounded-[18px] border-2 border-ink bg-brand px-4 py-3.5">
        <span className="flex-1">
          <span className="block font-display text-[17px] font-bold">Taaza Plus</span>
          <span className="text-[13px]">200 scans a month · ₹2,000/month</span>
        </span>
        <span className="rounded-xl bg-ink px-3.5 py-2.5 text-sm font-bold text-brand">See plan</span>
      </Link>

      <form action="/auth/signout" method="post" className="flex justify-end">
        <button type="submit" className="h-11 px-1 font-bold text-danger">
          Log out
        </button>
      </form>
    </main>
  );
}
