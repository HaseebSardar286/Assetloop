const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_*_KEY in environment.");
  console.error("Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file");
} else {
  try {
    const maskedKey = `${supabaseKey.slice(0, 6)}...${supabaseKey.slice(-4)}`;
    console.log(`[Supabase] URL: ${supabaseUrl}, Key: ${maskedKey}`);
  } catch (err) {
    console.error("[Supabase] Error masking key:", err.message);
  }
}

// Create Supabase client with error handling
let supabase = null;
try {
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } else {
    console.error("[Supabase] Cannot create client: missing configuration");
  }
} catch (error) {
  console.error("[Supabase] Error creating client:", error.message);
}

module.exports = supabase;
