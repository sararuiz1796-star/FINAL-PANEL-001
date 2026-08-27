-- PARNASO — migración inicial (Sprint 1)
-- Traduce docs/ARCHITECTURE.md, docs/RELATIONSHIPS_REVIEW.md y docs/CREATIVE_CONTEXT.md a SQL ejecutable.
-- NO EJECUTAR sin revisión y confirmación explícita del usuario.

-- =========================================================================
-- 0. Extensiones
-- =========================================================================

create extension if not exists pgcrypto; -- gen_random_uuid()

-- =========================================================================
-- 1. profiles — identidad del creador (docs/ARCHITECTURE.md §3.10, docs/CREATIVE_CONTEXT.md §2)
-- =========================================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
  -- reservado, NO se implementa en Sprint 1:
  -- creative_practices text[]  -- multi-selección "¿Qué haces?" del futuro onboarding de Creator Profile
);

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function handle_new_user();

-- =========================================================================
-- Función genérica para mantener updated_at (usada en profiles, projects,
-- sources, documents, notes, claims — no en project_members ni relationships,
-- que no tienen updated_at).
-- =========================================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- =========================================================================
-- 2. projects (docs/ARCHITECTURE.md §3.1)
-- =========================================================================

create table projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  title text not null,
  subtitle text,
  description text,
  project_type text not null
    check (project_type in (
      'journalism','book','novel','poetry_collection','essay','documentary',
      'screenplay','photo_series','album','exhibition','artwork','design_project',
      'academic_research','artistic_research','communication_project','personal_research','other'
    )),
  status text not null default 'active'
    check (status in ('active','paused','completed','archived')),
  research_question text,
  cover_image text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_projects_owner_id on projects(owner_id);

create trigger trg_projects_updated_at
  before update on projects
  for each row execute function set_updated_at();

-- =========================================================================
-- 3. project_members (docs/ARCHITECTURE.md §3.2, decisión D3)
-- =========================================================================

create table project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  role text not null default 'owner'
    check (role in ('owner','editor','viewer')),
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create index idx_project_members_user_id on project_members(user_id);

-- crea automáticamente la membresía de owner al crear el proyecto
create or replace function create_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into project_members (project_id, user_id, role) values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

create trigger trg_create_owner_membership
  after insert on projects
  for each row execute function create_owner_membership();

-- =========================================================================
-- 4. sources — "Source / Reference" (docs/ARCHITECTURE.md §3.3, docs/CONCEPTUAL_REFRAMING.md §1)
-- =========================================================================

create table sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  type text
    check (type in (
      'person','organization','institution','book','article','website','film','song',
      'artwork','photograph','archive','conversation','place','object','anonymous','other'
    )),
  role text,
  organization text,
  email text,
  phone text,
  location text,
  website text,
  how_found text,
  relationship_to_research text,
  reliability_level text not null default 'unknown'
    check (reliability_level in ('unknown','low','medium','high','very_high')),
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified','partially_verified','verified','disputed')),
  attribution_status text not null default 'not_specified'
    check (attribution_status in ('on_record','off_record','background','anonymous','not_specified')),
  notes text,
  search_vector tsvector generated always as (
    to_tsvector('spanish', coalesce(name, '') || ' ' || coalesce(organization, '') || ' ' || coalesce(notes, ''))
  ) stored,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_sources_project_id on sources(project_id);
create index idx_sources_search_vector on sources using gin(search_vector);
create index idx_sources_active on sources(project_id) where archived_at is null;

create trigger trg_sources_updated_at
  before update on sources
  for each row execute function set_updated_at();

-- =========================================================================
-- 5. documents (docs/ARCHITECTURE.md §3.4)
-- =========================================================================

create table documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text,
  file_url text,
  file_type text
    check (file_type in ('pdf','doc','xls','image','audio','video','web','email','other')),
  file_size bigint,
  source_id uuid references sources(id) on delete set null,
  date date,
  author text,
  origin text,
  confidentiality text not null default 'internal'
    check (confidentiality in ('public','internal','confidential','sensitive')),
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified','partially_verified','verified','disputed')),
  notes text,
  search_vector tsvector generated always as (
    to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(notes, ''))
  ) stored,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_documents_project_id on documents(project_id);
create index idx_documents_source_id on documents(source_id);
create index idx_documents_search_vector on documents using gin(search_vector);
create index idx_documents_active on documents(project_id) where archived_at is null;

create trigger trg_documents_updated_at
  before update on documents
  for each row execute function set_updated_at();

-- =========================================================================
-- 6. notes (docs/ARCHITECTURE.md §3.5)
-- Nota: 'archived_at' y el ajuste de 'status' corrigen una inconsistencia
-- encontrada al traducir la documentación a SQL — ver mensaje de handoff.
-- =========================================================================

create table notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text,
  content text not null,
  note_type text
    check (note_type in (
      'observation','idea','question','hypothesis','lead','reminder','interpretation','personal_note'
    )),
  status text not null default 'active'
    check (status in ('active','resolved')),
  search_vector tsvector generated always as (
    to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(content, ''))
  ) stored,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_notes_project_id on notes(project_id);
create index idx_notes_search_vector on notes using gin(search_vector);
create index idx_notes_active on notes(project_id) where archived_at is null;

create trigger trg_notes_updated_at
  before update on notes
  for each row execute function set_updated_at();

-- =========================================================================
-- 7. claims (docs/ARCHITECTURE.md §3.6)
-- =========================================================================

create table claims (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  content text not null,
  status text not null default 'idea'
    check (status in ('idea','needs_evidence','partially_supported','supported','contradicted','verified')),
  confidence_level text not null default 'unknown'
    check (confidence_level in ('unknown','low','medium','high')),
  search_vector tsvector generated always as (
    to_tsvector('spanish', coalesce(content, ''))
  ) stored,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_claims_project_id on claims(project_id);
create index idx_claims_status on claims(status);
create index idx_claims_search_vector on claims using gin(search_vector);
create index idx_claims_active on claims(project_id) where archived_at is null;

create trigger trg_claims_updated_at
  before update on claims
  for each row execute function set_updated_at();

-- =========================================================================
-- 8. relationships (docs/ARCHITECTURE.md §3.7, docs/RELATIONSHIPS_REVIEW.md)
-- =========================================================================

create table relationships (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,

  source_entity_type text not null,
  source_entity_id uuid not null,
  target_entity_type text not null,
  target_entity_id uuid not null,

  relationship_type text not null default 'related_to',
  notes text,

  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),

  constraint relationships_source_entity_type_check
    check (source_entity_type in ('source','document','note','claim','project')),
  constraint relationships_target_entity_type_check
    check (target_entity_type in ('source','document','note','claim','project')),
  constraint relationships_type_check
    check (relationship_type in (
      'supports','contradicts','corroborates','mentions','references',
      'related_to','derived_from','originated_from','concerns',
      'inspires','contrasts_with','influenced_by'
    )),
  constraint relationships_no_self_reference
    check (not (source_entity_type = target_entity_type and source_entity_id = target_entity_id)),
  constraint relationships_unique_edge
    unique (project_id, source_entity_type, source_entity_id, target_entity_type, target_entity_id, relationship_type)
);

create index idx_relationships_project_id on relationships(project_id);
create index idx_relationships_source on relationships(source_entity_type, source_entity_id);
create index idx_relationships_target on relationships(target_entity_type, target_entity_id);
create index idx_relationships_type on relationships(relationship_type);

-- mapeo tipo → tabla (evita el bug de plurales irregulares; 'project' se
-- maneja aparte en el trigger, no acá — ver docs/RELATIONSHIPS_REVIEW.md §3)
create or replace function entity_table_name(p_entity_type text)
returns text
language sql
immutable
as $$
  select case p_entity_type
    when 'source'   then 'sources'
    when 'document' then 'documents'
    when 'note'     then 'notes'
    when 'claim'    then 'claims'
    else null
  end;
$$;

create or replace function validate_relationship_entities()
returns trigger
language plpgsql
as $$
declare
  v_source_table text;
  v_target_table text;
  v_exists boolean;
begin
  -- lado source
  if new.source_entity_type = 'project' then
    select exists(select 1 from projects where id = new.source_entity_id and id = new.project_id)
      into v_exists;
    if not v_exists then
      raise exception 'relationships: el proyecto % no coincide con project_id de la relación', new.source_entity_id;
    end if;
  else
    v_source_table := entity_table_name(new.source_entity_type);
    if v_source_table is null then
      raise exception 'relationships: tipo de entidad source "%" no reconocido', new.source_entity_type;
    end if;
    execute format('select exists(select 1 from %I where id = $1 and project_id = $2)', v_source_table)
      into v_exists using new.source_entity_id, new.project_id;
    if not v_exists then
      raise exception 'relationships: % % no existe en el proyecto %', new.source_entity_type, new.source_entity_id, new.project_id;
    end if;
  end if;

  -- lado target (mismo patrón)
  if new.target_entity_type = 'project' then
    select exists(select 1 from projects where id = new.target_entity_id and id = new.project_id)
      into v_exists;
    if not v_exists then
      raise exception 'relationships: el proyecto % no coincide con project_id de la relación', new.target_entity_id;
    end if;
  else
    v_target_table := entity_table_name(new.target_entity_type);
    if v_target_table is null then
      raise exception 'relationships: tipo de entidad target "%" no reconocido', new.target_entity_type;
    end if;
    execute format('select exists(select 1 from %I where id = $1 and project_id = $2)', v_target_table)
      into v_exists using new.target_entity_id, new.project_id;
    if not v_exists then
      raise exception 'relationships: % % no existe en el proyecto %', new.target_entity_type, new.target_entity_id, new.project_id;
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_validate_relationship_entities
  before insert or update on relationships
  for each row execute function validate_relationship_entities();

-- =========================================================================
-- 9. Row Level Security (docs/ARCHITECTURE.md §4, docs/RELATIONSHIPS_REVIEW.md §5,
--    docs/CREATIVE_CONTEXT.md §2)
-- =========================================================================

alter table profiles         enable row level security;
alter table projects         enable row level security;
alter table project_members  enable row level security;
alter table sources           enable row level security;
alter table documents         enable row level security;
alter table notes             enable row level security;
alter table claims            enable row level security;
alter table relationships     enable row level security;

-- profiles: solo la propia fila (se amplía cuando exista colaboración real, Phase 5)
create policy profiles_select_own on profiles
  for select using (auth.uid() = id);
create policy profiles_update_own on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- helper para el resto de las políticas
create or replace function user_has_project_access(p_project_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from project_members
    where project_id = p_project_id and user_id = auth.uid()
  );
$$;

-- projects
create policy projects_select on projects for select using (user_has_project_access(id));
create policy projects_insert on projects for insert with check (owner_id = auth.uid());
create policy projects_update on projects for update using (user_has_project_access(id));
create policy projects_delete on projects for delete using (owner_id = auth.uid());

-- project_members: cualquier miembro puede leer; solo el owner escribe
create policy project_members_select on project_members
  for select using (user_has_project_access(project_id));
create policy project_members_write on project_members
  for all using (
    exists (
      select 1 from project_members pm
      where pm.project_id = project_members.project_id
        and pm.user_id = auth.uid()
        and pm.role = 'owner'
    )
  );

-- sources, documents, notes, claims, relationships: mismo patrón
create policy sources_all on sources for all
  using (user_has_project_access(project_id))
  with check (user_has_project_access(project_id));
create policy documents_all on documents for all
  using (user_has_project_access(project_id))
  with check (user_has_project_access(project_id));
create policy notes_all on notes for all
  using (user_has_project_access(project_id))
  with check (user_has_project_access(project_id));
create policy claims_all on claims for all
  using (user_has_project_access(project_id))
  with check (user_has_project_access(project_id));
create policy relationships_all on relationships for all
  using (user_has_project_access(project_id))
  with check (user_has_project_access(project_id));
