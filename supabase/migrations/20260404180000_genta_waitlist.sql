-- genta_waitlist (genta-website) — single migration, safe to re-run on shared Supabase projects.
-- RLS on, no policies: service role (API route) inserts. See POST /api/waitlist.

create table if not exists public.genta_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'genta-website-waitlist',
  created_at timestamptz not null default now()
);

alter table public.genta_waitlist
  add column if not exists privacy_accepted_at timestamptz,
  add column if not exists privacy_policy_version text;

create unique index if not exists genta_waitlist_email_lower_key
  on public.genta_waitlist (lower(email));

create index if not exists genta_waitlist_created_at_idx
  on public.genta_waitlist (created_at desc);

comment on table public.genta_waitlist is 'Genta marketing waitlist emails from genta-website.';

comment on column public.genta_waitlist.privacy_accepted_at is
  'When the user submitted the waitlist with privacy acknowledgement.';
comment on column public.genta_waitlist.privacy_policy_version is
  'Policy version string at signup (e.g. matches PRIVACY_POLICY_VERSION env).';

alter table public.genta_waitlist enable row level security;
