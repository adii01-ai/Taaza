const DEFAULT_AUTH_REDIRECT = "/";

export function getSafeAuthRedirect(value?: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value === "/login" ||
    value === "/welcome" ||
    value.startsWith("/auth/")
  ) {
    return DEFAULT_AUTH_REDIRECT;
  }

  return value;
}
