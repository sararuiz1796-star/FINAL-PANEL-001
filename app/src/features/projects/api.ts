import { supabase } from '../../lib/supabase/client'
import type { ProjectRow, ProjectType } from '../../types/database'

export async function listProjects(): Promise<ProjectRow[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .is('archived_at', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createProject(input: { title: string; project_type: ProjectType }): Promise<ProjectRow> {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!userData.user) throw new Error('No hay sesión activa.')

  const { data, error } = await supabase
    .from('projects')
    .insert({ title: input.title, project_type: input.project_type, owner_id: userData.user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getProject(id: string): Promise<ProjectRow> {
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export interface ProjectCounts {
  sources: number
  documents: number
  notes: number
  claims: number
}

/** Conteos reales para Overview (sección 25 del brief). Project Pulse completo es Sprint 7. */
export async function getProjectCounts(projectId: string): Promise<ProjectCounts> {
  const tables = ['sources', 'documents', 'notes', 'claims'] as const
  const results = await Promise.all(
    tables.map((table) =>
      supabase.from(table).select('*', { count: 'exact', head: true }).eq('project_id', projectId),
    ),
  )
  results.forEach((r) => {
    if (r.error) throw r.error
  })
  const [sources, documents, notes, claims] = results
  return {
    sources: sources.count ?? 0,
    documents: documents.count ?? 0,
    notes: notes.count ?? 0,
    claims: claims.count ?? 0,
  }
}
