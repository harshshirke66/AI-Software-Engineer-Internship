import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aaaeklbylfscnhoozydf.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_TkpFpHscvz_IKvmXBAfdbw_J-5Ko1Vq";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
