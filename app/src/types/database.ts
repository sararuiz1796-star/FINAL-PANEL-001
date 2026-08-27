/**
 * Espejo manual del esquema aplicado en supabase/migrations/0001_init.sql.
 * Se escribió a mano (no con `supabase gen types`) porque conectar el CLI
 * requiere un access token, y por ahora solo usamos credenciales públicas
 * (ver docs/HANDOFF_PRODUCT_UX.md). Si más adelante se habilita el CLI,
 * este archivo se puede reemplazar por el output real de
 * `supabase gen types typescript --project-id <ref>` sin tocar nada más.
 *
 * Cualquier columna agregada por una migración incremental (0002_*.sql en
 * adelante) debe reflejarse acá también.
 */

export type ProjectType =
  | 'journalism'
  | 'book'
  | 'novel'
  | 'poetry_collection'
  | 'essay'
  | 'documentary'
  | 'screenplay'
  | 'photo_series'
  | 'album'
  | 'exhibition'
  | 'artwork'
  | 'design_project'
  | 'academic_research'
  | 'artistic_research'
  | 'communication_project'
  | 'personal_research'
  | 'other'

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived'

export type SourceType =
  | 'person'
  | 'organization'
  | 'institution'
  | 'book'
  | 'article'
  | 'website'
  | 'film'
  | 'song'
  | 'artwork'
  | 'photograph'
  | 'archive'
  | 'conversation'
  | 'place'
  | 'object'
  | 'anonymous'
  | 'other'

export type ReliabilityLevel = 'unknown' | 'low' | 'medium' | 'high' | 'very_high'
export type VerificationStatus = 'unverified' | 'partially_verified' | 'verified' | 'disputed'
export type AttributionStatus = 'on_record' | 'off_record' | 'background' | 'anonymous' | 'not_specified'

export type DocumentFileType = 'pdf' | 'doc' | 'xls' | 'image' | 'audio' | 'video' | 'web' | 'email' | 'other'
export type Confidentiality = 'public' | 'internal' | 'confidential' | 'sensitive'

export type NoteType =
  | 'observation'
  | 'idea'
  | 'question'
  | 'hypothesis'
  | 'lead'
  | 'reminder'
  | 'interpretation'
  | 'personal_note'
export type NoteStatus = 'active' | 'resolved'

export type ClaimStatus = 'idea' | 'needs_evidence' | 'partially_supported' | 'supported' | 'contradicted' | 'verified'
export type ConfidenceLevel = 'unknown' | 'low' | 'medium' | 'high'

export type RelationshipEntityType = 'source' | 'document' | 'note' | 'claim' | 'project'
export type RelationshipType =
  | 'supports'
  | 'contradicts'
  | 'corroborates'
  | 'mentions'
  | 'references'
  | 'related_to'
  | 'derived_from'
  | 'originated_from'
  | 'concerns'
  | 'inspires'
  | 'contrasts_with'
  | 'influenced_by'

export interface ProfileRow {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface ProjectRow {
  id: string
  owner_id: string
  title: string
  subtitle: string | null
  description: string | null
  project_type: ProjectType
  status: ProjectStatus
  research_question: string | null
  cover_image: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

export interface ProjectInsert {
  title: string
  project_type: ProjectType
  owner_id: string
  subtitle?: string | null
  description?: string | null
  research_question?: string | null
}

export interface ProjectMemberRow {
  id: string
  project_id: string
  user_id: string
  role: 'owner' | 'editor' | 'viewer'
  created_at: string
}

export interface SourceRow {
  id: string
  project_id: string
  name: string
  type: SourceType | null
  role: string | null
  organization: string | null
  email: string | null
  phone: string | null
  location: string | null
  website: string | null
  how_found: string | null
  relationship_to_research: string | null
  reliability_level: ReliabilityLevel
  verification_status: VerificationStatus
  attribution_status: AttributionStatus
  notes: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

export interface DocumentRow {
  id: string
  project_id: string
  title: string
  description: string | null
  file_url: string | null
  file_type: DocumentFileType | null
  file_size: number | null
  source_id: string | null
  date: string | null
  author: string | null
  origin: string | null
  confidentiality: Confidentiality
  verification_status: VerificationStatus
  notes: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

export interface NoteRow {
  id: string
  project_id: string
  title: string | null
  content: string
  note_type: NoteType | null
  status: NoteStatus
  archived_at: string | null
  created_at: string
  updated_at: string
}

export interface ClaimRow {
  id: string
  project_id: string
  content: string
  status: ClaimStatus
  confidence_level: ConfidenceLevel
  archived_at: string | null
  created_at: string
  updated_at: string
}

export interface RelationshipRow {
  id: string
  project_id: string
  source_entity_type: RelationshipEntityType
  source_entity_id: string
  target_entity_type: RelationshipEntityType
  target_entity_id: string
  relationship_type: RelationshipType
  notes: string | null
  created_by: string | null
  created_at: string
}

/**
 * Nota: el cliente de Supabase (lib/supabase/client.ts) NO usa estos tipos
 * como genérico de `createClient<Database>()` — con supabase-js 2.112.4 +
 * moduleResolution "bundler" (el que usa este proyecto), esa combinación
 * rompe la inferencia de `.insert()`/`.update()` (bug de tipos aislado y
 * confirmado, no del esquema real). Cada función de features/.../api.ts
 * sigue tipando a mano su entrada y su retorno con los tipos de arriba
 * (`ProjectRow`, `ProjectInsert`, etc.) — se pierde el chequeo automático
 * de la forma exacta del payload en tiempo de compilación; la validación
 * real la siguen haciendo los CHECK constraints y el trigger de
 * `relationships` en la base, que no dependen de esto.
 */
