/* Public Supabase settings. Both values are safe to commit: the key is the
   project's public "anon" / "publishable" key, and all write access is
   enforced by row-level security in supabase/schema.sql.
   Leave the placeholders in place to run the board in browser-only mode. */
window.APP_CONFIG = {
  SUPABASE_URL: "https://tnrkcjyzdkkuzcjovvil.supabase.co",
  SUPABASE_KEY: "sb_publishable_hAvcguuACZmStPPelzMDTA_ZOozVIgP"
};
