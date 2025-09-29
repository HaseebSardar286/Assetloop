const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://jdzlyfpkskipkrdigorq.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkemx5ZnBrc2tpcGtyZGlnb3JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNDYxNTcsImV4cCI6MjA3NDcyMjE1N30.0fC3-5NnnAD4Ubh0U-lm39cMYd3rSH6K1XNTCqWn5RM";
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
