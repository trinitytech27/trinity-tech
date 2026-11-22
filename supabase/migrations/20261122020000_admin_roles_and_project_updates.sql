-- which named admin opened each workspace session (for roles: superadmin / admin)
alter table public.studio_sessions add column if not exists admin_id text;
-- editable history of client-visible project updates [{id, text, at, by}]
alter table public.studio_projects add column if not exists updates jsonb not null default '[]'::jsonb;
