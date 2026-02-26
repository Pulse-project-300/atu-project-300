import { createClient } from "@supabase/supabase-js";

//supabase client initialized with service role key for backend operations
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
        "Missing Supabase credentials. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
}

//export single supabase client instance
export const supabase = createClient(supabaseUrl, supabaseServiceKey);