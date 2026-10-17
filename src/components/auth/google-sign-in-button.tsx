"use client";

import { useState } from "react";
import { GoogleLogo } from "@/components/ui/icons";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function GoogleSignInButton({ next }: { next?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setPending(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const callback = new URL("/auth/callback", window.location.origin);
    if (next) callback.searchParams.set("next", next);

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString() },
    });
    if (signInError) {
      setError("Couldn't open Google sign-in. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={signIn}
        disabled={pending}
        className="flex h-14 items-center justify-center gap-3 rounded-2xl border border-[#DADCE0] bg-white text-base font-bold text-[#1F1F1F] shadow-[0_2px_6px_rgb(0_0_0/0.10)] disabled:opacity-60"
      >
        <GoogleLogo />
        {pending ? "Opening Google…" : "Continue with Google"}
      </button>
      {error ? (
        <p role="alert" className="text-center text-sm font-bold text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
