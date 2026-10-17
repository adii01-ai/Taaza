"use client";

import { useActionState, useEffect, useRef } from "react";
import { createSharePost, type FormState } from "@/app/actions/share";

export function ShareForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createSharePost, {});
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3 rounded-[18px] bg-white p-4">
      <h2 className="font-bold">Have extra food?</h2>
      <label className="flex flex-col gap-1.5 text-[13px] text-muted">
        What are you sharing
        <input name="title" required maxLength={80} placeholder="e.g. 4 rotis + dal" className="h-11 rounded-xl border border-line bg-[#FFFDF3] px-3 text-[15px] text-ink" />
      </label>
      <div className="grid grid-cols-2 gap-2.5">
        <label className="flex flex-col gap-1.5 text-[13px] text-muted">
          Area / building
          <input name="area" maxLength={60} placeholder="Tower B" className="h-11 rounded-xl border border-line bg-[#FFFDF3] px-3 text-[15px] text-ink" />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] text-muted">
          Pick up within
          <select name="pickupHours" defaultValue="4" className="h-11 rounded-xl border border-line bg-[#FFFDF3] px-2 text-[15px] text-ink">
            <option value="1">1 hour</option>
            <option value="2">2 hours</option>
            <option value="4">4 hours</option>
            <option value="8">8 hours</option>
          </select>
        </label>
      </div>
      {state.error ? (
        <p role="alert" className="text-sm font-bold text-danger">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="text-sm font-bold text-veg">
          Posted! Neighbours can now request it.
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="h-12 rounded-2xl bg-ink font-bold text-brand disabled:opacity-50">
        {pending ? "Posting…" : "Post to neighbours (free)"}
      </button>
    </form>
  );
}
