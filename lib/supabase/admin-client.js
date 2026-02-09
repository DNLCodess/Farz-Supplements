import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client
 *
 * This client uses the service role key and bypasses RLS.
 * Use ONLY in server-side code (API routes, server actions).
 * Never expose the service role key to the client.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

/**
 * Get Supabase admin client
 * This function exists for consistency but returns the same instance
 */
export function getSupabaseAdmin() {
  return supabaseAdmin;
}
