import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { getPublicSupabaseConfig } from "./env";

export function createSupabaseBrowserClient() {
  const { url, anonKey } = getPublicSupabaseConfig();
  return createBrowserClient<Database>(url, anonKey);
}
