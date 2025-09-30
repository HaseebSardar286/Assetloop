const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_*_KEY in environment.");
} else {
  try {
    const maskedKey = `${supabaseKey.slice(0, 6)}...${supabaseKey.slice(-4)}`;
    console.log(`[Supabase] URL: ${supabaseUrl}, Key: ${maskedKey}`);
  } catch {}
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
