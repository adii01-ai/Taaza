import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSafeAuthRedirect } from "@/lib/auth/redirect";
import { getPublicSupabaseConfig } from "@/lib/supabase/env";

const PUBLIC_PATHS = ["/welcome", "/login"];

export async function middleware(request: NextRequest) {
  const { url, anonKey } = getPublicSupabaseConfig();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/auth/") || pathname.startsWith("/api/")) {
    return response;
  }

  const isPublic = PUBLIC_PATHS.includes(pathname);
  if ((!user && !isPublic) || (user && isPublic)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.search = "";
    if (user) {
      redirectUrl.pathname = getSafeAuthRedirect(request.nextUrl.searchParams.get("next"));
    } else {
      redirectUrl.pathname = "/welcome";
      if (pathname !== "/") redirectUrl.searchParams.set("next", `${pathname}${search}`);
    }

    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|icons/).*)"],
};
