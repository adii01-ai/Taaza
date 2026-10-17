import { NextResponse, type NextRequest } from "next/server";
import { getSafeAuthRedirect } from "@/lib/auth/redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const nextPath = getSafeAuthRedirect(searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(nextPath, origin));
  }

  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", "callback");
  return NextResponse.redirect(loginUrl);
}
