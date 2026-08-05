import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Server Auth client (publishable key). No browser persistence. */
export function createSupabaseServer(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    throw new Error("Missing SUPABASE_URL (or VITE_SUPABASE_URL) for the server Auth client.");
  }
  if (!publishableKey) {
    throw new Error("Missing VITE_SUPABASE_PUBLISHABLE_KEY for the server Auth client.");
  }

  return createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
