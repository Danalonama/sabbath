create schema if not exists embed;
set search_path to embed, public;

create table if not exists embed_clients (
  id uuid primary key,
  name text not null,
  allowed_origin text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists embed_events (
  id text primary key,
  client_id uuid not null references embed_clients(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  title text,
  priority text not null default 'medium',
  status text not null default 'new',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint embed_events_priority_check check (priority in ('high', 'medium', 'low')),
  constraint embed_events_status_check check (status in ('new', 'active', 'resolved'))
);

alter table embed_events
add column if not exists priority text not null default 'medium';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'embed_events_priority_check'
      and conrelid = 'embed_events'::regclass
  ) then
    alter table embed_events
    add constraint embed_events_priority_check
    check (priority in ('high', 'medium', 'low'));
  end if;
end;
$$;

create index if not exists embed_events_client_id_idx on embed_events(client_id);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists embed_clients_set_updated_at on embed_clients;
create trigger embed_clients_set_updated_at
before update on embed_clients
for each row execute function set_updated_at();

drop trigger if exists embed_events_set_updated_at on embed_events;
create trigger embed_events_set_updated_at
before update on embed_events
for each row execute function set_updated_at();

create or replace function notify_embed_event_change()
returns trigger as $$
declare
  event_record record;
  operation text;
begin
  operation := lower(tg_op);

  if tg_op = 'DELETE' then
    event_record := old;
  else
    event_record := new;
  end if;

  perform pg_notify(
    'embed_events_changed',
    json_build_object(
      'operation', operation,
      'event', json_build_object(
        'id', event_record.id,
        'client_id', event_record.client_id,
        'latitude', event_record.latitude,
        'longitude', event_record.longitude,
        'title', event_record.title,
        'priority', event_record.priority,
        'status', event_record.status,
        'payload', event_record.payload,
        'updated_at', event_record.updated_at
      )
    )::text
  );

  return event_record;
end;
$$ language plpgsql;

drop trigger if exists embed_events_notify_change on embed_events;
create trigger embed_events_notify_change
after insert or update or delete on embed_events
for each row execute function notify_embed_event_change();
