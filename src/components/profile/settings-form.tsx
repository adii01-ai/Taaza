"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileFormState } from "@/app/actions/profile";

type Props = {
  diet: string;
  language: string;
  reminderTime: string;
  notificationsOn: boolean;
};

const rowClass = "flex min-h-[52px] items-center gap-3 border-b border-[#F1E7B8] px-4 text-[15px] last:border-b-0";
const selectClass = "rounded-lg bg-transparent py-1 text-right text-sm text-muted";

export function SettingsForm({ diet, language, reminderTime, notificationsOn }: Props) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(updateProfile, {});

  return (
    <form action={action} className="flex flex-col gap-2">
      <div className="flex flex-col rounded-[18px] bg-white">
        <label className={rowClass}>
          <span className="flex-1">Food preference</span>
          <select name="diet" defaultValue={diet} className={selectClass}>
            <option value="veg">Veg</option>
            <option value="eggetarian">Eggetarian</option>
            <option value="jain">Jain</option>
            <option value="vegan">Vegan</option>
            <option value="non_veg">Non-veg</option>
          </select>
        </label>
        <label className={rowClass}>
          <span className="flex-1">Language</span>
          <select name="language" defaultValue={language} className={selectClass}>
            <option value="en">English</option>
            <option value="hi">हिंदी (coming soon)</option>
          </select>
        </label>
        <label className={rowClass}>
          <span className="flex-1">Daily reminder</span>
          <input type="time" name="reminder_time" defaultValue={reminderTime.slice(0, 5)} className={selectClass} />
        </label>
        <label className={rowClass}>
          <span className="flex-1">Reminder notifications</span>
          <input type="checkbox" name="notifications_on" defaultChecked={notificationsOn} className="size-[22px] accent-ink" />
        </label>
      </div>
      <div className="flex items-center justify-between">
        <span role="status" className={`text-sm font-bold ${state.error ? "text-danger" : "text-veg"}`}>
          {state.error ?? (state.ok ? "Saved" : "")}
        </span>
        <button type="submit" disabled={pending} className="h-10 rounded-xl bg-ink px-4 text-sm font-bold text-brand disabled:opacity-50">
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
