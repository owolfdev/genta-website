-- genta_waitlist (genta-website) — idempotent DDL for Supabase SQL Editor.
-- RLS on, no policies: service role (API route) inserts. See POST /api/waitlist.
--
-- API (app/api/waitlist/route.ts) tries inserts in order: full row (with privacy columns),
-- then without privacy_accepted, then { email, source } only — so a minimal table with just
-- id, email, source, created_at still works. Run the ALTERs below when you want consent timestamps
-- and policy version stored in Supabase.

create table if not exists public.genta_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'genta-website-waitlist',
  created_at timestamptz not null default now()
);

alter table public.genta_waitlist
  add column if not exists privacy_accepted boolean not null default true,
  add column if not exists privacy_accepted_at timestamptz,
  add column if not exists privacy_policy_version text;

create unique index if not exists genta_waitlist_email_lower_key
  on public.genta_waitlist (lower(email));

create index if not exists genta_waitlist_created_at_idx
  on public.genta_waitlist (created_at desc);

comment on table public.genta_waitlist is 'Genta marketing waitlist emails from genta-website.';

comment on column public.genta_waitlist.privacy_accepted is
  'Signup implied consent to the Privacy Policy (see marketing dialog). API sends true.';
comment on column public.genta_waitlist.privacy_accepted_at is
  'When the user submitted the waitlist with privacy acknowledgement.';
comment on column public.genta_waitlist.privacy_policy_version is
  'Policy version string at signup (e.g. matches PRIVACY_POLICY_VERSION env).';

alter table public.genta_waitlist enable row level security;
