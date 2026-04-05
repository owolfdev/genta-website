/**
 * Default `project_id` for `genta_contact_messages` — must match the seeded row in
 * `supabase/genta_contact_messages_schema.sql` (`slug = 'genta'`).
 * Override with env `GENTA_CONTACT_PROJECT_ID` if this Supabase already uses another UUID.
 */
export const GENTA_WEBSITE_PROJECT_ID = "a1b2c3d4-e5f6-4a90-8c12-3456789abcde";

export function gentaContactProjectId(): string {
  return process.env.GENTA_CONTACT_PROJECT_ID?.trim() || GENTA_WEBSITE_PROJECT_ID;
}
