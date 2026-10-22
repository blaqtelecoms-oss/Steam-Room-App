import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function adminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

export const genId = () =>
  (globalThis.crypto?.randomUUID?.()?.replace(/-/g, "").slice(0, 24)) ||
  Math.random().toString(16).slice(2, 26).padEnd(24, "0");

export const nowISO = () => new Date().toISOString();
