import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL) {
  throw new Error(`Expected supabase URL`);
}
if (!process.env.SUPABASE_KEY) {
  throw new Error(`Expected supabase KEY`);
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);
