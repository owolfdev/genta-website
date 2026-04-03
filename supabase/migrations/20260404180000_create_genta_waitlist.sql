-- Waitlist signups from the marketing site (POST /api/waitlist).
-- RLS enabled with no policies: only the service role (server) can read/write.

create table if not exists public.genta_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'genta-website-waitlist',
  created_at timestamptz not null default now()
);

-- Case-insensitive one row per address (expression unique = unique index, not inline constraint)
create unique index if not exists genta_waitlist_email_lower_key
  on public.genta_waitlist (lower(email));

create index if not exists genta_waitlist_created_at_idx
  on public.genta_waitlist (created_at desc);

comment on table public.genta_waitlist is 'Genta marketing waitlist emails from genta-website.';

alter table public.genta_waitlist enable row level security;
