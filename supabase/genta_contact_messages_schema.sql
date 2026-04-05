-- genta_contact_messages + genta_projects — idempotent DDL for Supabase SQL Editor.
-- Mirrors owolf_dot_com_contact_messages shape: project FK, read/responded flags, indexes.
-- API: POST /api/contact (service role). RLS on; no policies (same pattern as genta_waitlist).

-- Canonical row for this site (API default project_id — keep in sync with src/lib/gentaProject.ts).
create table if not exists public.genta_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  display_name text not null,
  created_at timestamptz not null default now(),
  constraint genta_projects_slug_key unique (slug)
);

insert into public.genta_projects (id, slug, display_name)
values (
  'a1b2c3d4-e5f6-4a90-8c12-3456789abcde',
  'genta',
  'Genta'
)
on conflict (slug) do nothing;

create table if not exists public.genta_contact_messages (
  id uuid not null default gen_random_uuid(),
  name text not null,
  email text not null,
  company text null,
  message text not null,
  created_at timestamptz null default now(),
  read boolean null default false,
  responded boolean null default false,
  project_id uuid not null,
  constraint genta_contact_messages_pkey primary key (id),
  constraint genta_contact_messages_project_id_fkey
    foreign key (project_id) references public.genta_projects (id) on delete restrict
);

create index if not exists idx_genta_contact_messages_email
  on public.genta_contact_messages using btree (email);

create index if not exists idx_genta_contact_messages_created_at
  on public.genta_contact_messages using btree (created_at desc);

create index if not exists idx_genta_contact_messages_read_created_at
  on public.genta_contact_messages using btree (read, created_at desc);

create index if not exists idx_genta_contact_messages_project_id
  on public.genta_contact_messages using btree (project_id);

create index if not exists idx_genta_contact_messages_project_created
  on public.genta_contact_messages using btree (project_id, created_at desc);

comment on table public.genta_contact_messages is
  'Inbound messages from trygenta.com /contact (genta-website).';

alter table public.genta_contact_messages enable row level security;
