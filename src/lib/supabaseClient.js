import { createClient } from "@supabase/supabase-js";

// Supabase project (Steam Room App). The anon key is public and exposed to the browser.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://qymqgovxghrigylrccfc.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "VITE_SUPABASE_ANON_KEY is not set — the Supabase backend will not work. Add it to your environment."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || "missing-anon-key", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const SUPABASE_PROJECT_URL = SUPABASE_URL;
