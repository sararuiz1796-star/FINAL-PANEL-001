import { supabase } from '../../lib/supabase/client'
import type {
  ClaimStatus,
  NoteStatus,
  RelationshipEntityType,
  VerificationStatus,
} from '../../types/database'
import { pieceCodePrefix, pieceKindFromNoteType, type PieceKind } from '../../lib/universeTokens'
import { relativeTimeEs } from '../../lib/relativeTime'

/**
 * Datos para la pantalla "El universo" (handoff hifi). Enfoque: traer las
 * filas activas de cada tabla del proyecto (escala esperada para un
 * proyecto de investigación individual, no miles de filas) y derivar todo
 * lo demás — conteos, códigos, feed reciente, constelación — en JS. Evita
 * el escollo de contar con `note_type NOT IN (...)` cuando note_type puede
 * ser null (NULL en esa comparación se excluye solo, no cuenta como "resto").
 */

interface RawSource {
  id: string
  name: string
  role: string | null
  organization: string | null
  verification_status: VerificationStatus
  created_at: string
}

interface RawDocument {
  id: string
  title: string
  description: string | null
  verification_status: VerificationStatus
  created_at: string
}

interface RawNote {
  id: string
  title: string | null
  content: string
  note_type: string | null
  status: NoteStatus
  created_at: string
}

interface RawClaim {
  id: string
  content: string
  status: ClaimStatus
  created_at: string
}

interface RawRelationship {
  id: string
  source_entity_type: RelationshipEntityType
  source_entity_id: string
  target_entity_type: RelationshipEntityType
  target_entity_id: string
  relationship_type: string
}

export interface Piece {
  kind: PieceKind
  id: string
  codigo: string
  titulo: string
  cuerpo: string
  etiqueta: string
  cuando: string
  createdAt: string
  enlaces: number
}

export interface PieceConnection {
  texto: string
  tipo: PieceKind
}

export interface UniverseSummary {
  project: {
    collaborators: number
    tensions: number
    totalPieces: number
    lastMovement: string
    claimsNeedingEvidence: number
  }
  counts: {
    source: number
    note: number
    idea: number
    question: number
    claim: number
    document: number
  }
  recent: Piece[]
  constellation: Constellation | null
}

export interface ConstellationNode {
  id: string
  kind: PieceKind
  label: string
  r: number
  pulse?: boolean
}

export interface ConstellationEdge {
  from: string
  to: string
  tentative: boolean
}

export interface Constellation {
  threads: number
  headline: string
  headlineAccent: string
  nodes: ConstellationNode[]
  edges: ConstellationEdge[]
}

const SOURCE_STATUS_LABEL: Record<VerificationStatus, string> = {
  unverified: 'sin verificar',
  partially_verified: 'verificación parcial',
  verified: 'verificada',
  disputed: 'en disputa',
}

const NOTE_STATUS_LABEL: Record<NoteStatus, string> = {
  active: 'activa',
  resolved: 'resuelta',
}

const CLAIM_STATUS_LABEL: Record<ClaimStatus, string> = {
  idea: 'sin evidencia',
  needs_evidence: 'sin evidencia',
  partially_supported: 'parcialmente sostenida',
  supported: 'sostenida',
  contradicted: 'en tensión',
  verified: 'verificada',
}

function truncate(text: string, max: number): string {
  const clean = text.trim().replace(/\s+/g, ' ')
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean
}

function code(kind: PieceKind, index: number): string {
  return `${pieceCodePrefix[kind]}-${String(index + 1).padStart(3, '0')}`
}

function countLinks(entityType: RelationshipEntityType, entityId: string, relationships: RawRelationship[]): number {
  return relationships.filter(
    (r) =>
      (r.source_entity_type === entityType && r.source_entity_id === entityId) ||
      (r.target_entity_type === entityType && r.target_entity_id === entityId),
  ).length
}

export async function getUniverseSummary(projectId: string): Promise<UniverseSummary> {
  const [sourcesRes, documentsRes, notesRes, claimsRes, membersRes, relationshipsRes] = await Promise.all([
    supabase
      .from('sources')
      .select('id, name, role, organization, verification_status, created_at')
      .eq('project_id', projectId)
      .is('archived_at', null)
      .order('created_at', { ascending: true }),
    supabase
      .from('documents')
      .select('id, title, description, verification_status, created_at')
      .eq('project_id', projectId)
      .is('archived_at', null)
      .order('created_at', { ascending: true }),
    supabase
      .from('notes')
      .select('id, title, content, note_type, status, created_at')
      .eq('project_id', projectId)
      .is('archived_at', null)
      .order('created_at', { ascending: true }),
    supabase
      .from('claims')
      .select('id, content, status, created_at')
      .eq('project_id', projectId)
      .is('archived_at', null)
      .order('created_at', { ascending: true }),
    supabase.from('project_members').select('*', { count: 'exact', head: true }).eq('project_id', projectId),
    supabase
      .from('relationships')
      .select('id, source_entity_type, source_entity_id, target_entity_type, target_entity_id, relationship_type')
      .eq('project_id', projectId),
  ])

  for (const r of [sourcesRes, documentsRes, notesRes, claimsRes, membersRes, relationshipsRes]) {
    if (r.error) throw r.error
  }

  const sources = (sourcesRes.data ?? []) as RawSource[]
  const documents = (documentsRes.data ?? []) as RawDocument[]
  const notes = (notesRes.data ?? []) as RawNote[]
  const claims = (claimsRes.data ?? []) as RawClaim[]
  const relationships = (relationshipsRes.data ?? []) as RawRelationship[]

  const ideaNotes = notes.filter((n) => pieceKindFromNoteType(n.note_type) === 'idea')
  const questionNotes = notes.filter((n) => pieceKindFromNoteType(n.note_type) === 'question')
  const plainNotes = notes.filter((n) => pieceKindFromNoteType(n.note_type) === 'note')

  const piecesByKind: Record<PieceKind, Piece[]> = {
    source: sources.map((s, i) => ({
      kind: 'source' as const,
      id: s.id,
      codigo: code('source', i),
      titulo: s.name,
      cuerpo: [s.role, s.organization].filter(Boolean).join(' · ') || 'Fuente sin descripción adicional.',
      etiqueta: SOURCE_STATUS_LABEL[s.verification_status],
      cuando: relativeTimeEs(s.created_at),
      createdAt: s.created_at,
      enlaces: countLinks('source', s.id, relationships),
    })),
    document: documents.map((d, i) => ({
      kind: 'document' as const,
      id: d.id,
      codigo: code('document', i),
      titulo: d.title,
      cuerpo: d.description || 'Documento sin descripción adicional.',
      etiqueta: SOURCE_STATUS_LABEL[d.verification_status],
      cuando: relativeTimeEs(d.created_at),
      createdAt: d.created_at,
      enlaces: countLinks('document', d.id, relationships),
    })),
    note: plainNotes.map((n, i) => ({
      kind: 'note' as const,
      id: n.id,
      codigo: code('note', i),
      titulo: n.title || truncate(n.content, 70),
      cuerpo: n.content,
      etiqueta: NOTE_STATUS_LABEL[n.status],
      cuando: relativeTimeEs(n.created_at),
      createdAt: n.created_at,
      enlaces: countLinks('note', n.id, relationships),
    })),
    idea: ideaNotes.map((n, i) => ({
      kind: 'idea' as const,
      id: n.id,
      codigo: code('idea', i),
      titulo: n.title || truncate(n.content, 70),
      cuerpo: n.content,
      etiqueta: NOTE_STATUS_LABEL[n.status],
      cuando: relativeTimeEs(n.created_at),
      createdAt: n.created_at,
      enlaces: countLinks('note', n.id, relationships),
    })),
    question: questionNotes.map((n, i) => ({
      kind: 'question' as const,
      id: n.id,
      codigo: code('question', i),
      titulo: n.title || truncate(n.content, 70),
      cuerpo: n.content,
      etiqueta: NOTE_STATUS_LABEL[n.status],
      cuando: relativeTimeEs(n.created_at),
      createdAt: n.created_at,
      enlaces: countLinks('note', n.id, relationships),
    })),
    claim: claims.map((c, i) => ({
      kind: 'claim' as const,
      id: c.id,
      codigo: code('claim', i),
      titulo: truncate(c.content, 70),
      cuerpo: c.content,
      etiqueta: CLAIM_STATUS_LABEL[c.status],
      cuando: relativeTimeEs(c.created_at),
      createdAt: c.created_at,
      enlaces: countLinks('claim', c.id, relationships),
    })),
  }

  const allPieces = Object.values(piecesByKind).flat()
  const recent = [...allPieces].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 6)

  const lastMovement = allPieces.length
    ? relativeTimeEs(allPieces.reduce((max, p) => (p.createdAt > max ? p.createdAt : max), allPieces[0].createdAt))
    : 'sin movimiento'

  const totalPieces = sources.length + documents.length + notes.length + claims.length
  const tensions = claims.filter((c) => c.status === 'contradicted').length
  const claimsNeedingEvidence = claims.filter((c) => c.status === 'idea' || c.status === 'needs_evidence').length

  const constellation = buildConstellation(claims, sources, notes, relationships)

  return {
    project: {
      collaborators: membersRes.count ?? 0,
      tensions,
      totalPieces,
      lastMovement,
      claimsNeedingEvidence,
    },
    counts: {
      source: sources.length,
      note: plainNotes.length,
      idea: ideaNotes.length,
      question: questionNotes.length,
      claim: claims.length,
      document: documents.length,
    },
    recent,
    constellation,
  }
}

function buildConstellation(
  claims: RawClaim[],
  sources: RawSource[],
  notes: RawNote[],
  relationships: RawRelationship[],
): Constellation | null {
  if (claims.length === 0 || relationships.length === 0) return null

  let bestClaim: RawClaim | null = null
  let bestLinks: RawRelationship[] = []
  for (const claim of claims) {
    const links = relationships.filter(
      (r) =>
        (r.source_entity_type === 'claim' && r.source_entity_id === claim.id) ||
        (r.target_entity_type === 'claim' && r.target_entity_id === claim.id),
    )
    if (links.length > bestLinks.length) {
      bestClaim = claim
      bestLinks = links
    }
  }
  if (!bestClaim || bestLinks.length < 2) return null

  const centerId = `claim:${bestClaim.id}`
  const nodes: ConstellationNode[] = [{ id: centerId, kind: 'claim', label: 'afirmación', r: 15 }]
  const edges: ConstellationEdge[] = []
  let sourceCount = 0

  for (const link of bestLinks.slice(0, 5)) {
    const otherType = link.source_entity_type === 'claim' ? link.target_entity_type : link.source_entity_type
    const otherId = link.source_entity_type === 'claim' ? link.target_entity_id : link.source_entity_id
    let kind: PieceKind | null = null
    let label = ''
    let r = 8

    if (otherType === 'source') {
      const s = sources.find((x) => x.id === otherId)
      if (!s) continue
      kind = 'source'
      label = s.name
      r = sourceCount === 0 ? 9 : 7
      sourceCount += 1
    } else if (otherType === 'note') {
      const n = notes.find((x) => x.id === otherId)
      if (!n) continue
      const noteKind = pieceKindFromNoteType(n.note_type)
      kind = noteKind
      label = noteKind === 'idea' ? 'idea suelta' : n.title || truncate(n.content, 16)
      r = noteKind === 'idea' ? 8 : 10
    } else {
      continue
    }

    const nodeId = `${otherType}:${otherId}`
    if (!nodes.some((n) => n.id === nodeId)) {
      nodes.push({ id: nodeId, kind, label, r, pulse: kind === 'idea' })
    }
    edges.push({ from: centerId, to: nodeId, tentative: link.relationship_type === 'related_to' })
  }

  if (nodes.length < 3) return null

  const headlineAccent = 'afirmación'
  const headline =
    sourceCount > 0
      ? `${sourceCount === 1 ? 'Una fuente sostiene' : `${sourceCount} fuentes sostienen`} la misma ${headlineAccent}.`
      : `Varias piezas convergen sobre la misma ${headlineAccent}.`

  return {
    threads: bestLinks.length,
    headline,
    headlineAccent,
    nodes,
    edges,
  }
}

export async function getPieceConnections(kind: PieceKind, id: string, projectId: string): Promise<PieceConnection[]> {
  const entityType: RelationshipEntityType = kind === 'idea' || kind === 'question' ? 'note' : kind
  const { data, error } = await supabase
    .from('relationships')
    .select('source_entity_type, source_entity_id, target_entity_type, target_entity_id')
    .eq('project_id', projectId)
    .or(
      `and(source_entity_type.eq.${entityType},source_entity_id.eq.${id}),and(target_entity_type.eq.${entityType},target_entity_id.eq.${id})`,
    )
  if (error) throw error

  const others = (data ?? []).map((r) => {
    const isSource = r.source_entity_type === entityType && r.source_entity_id === id
    return { type: isSource ? r.target_entity_type : r.source_entity_type, id: isSource ? r.target_entity_id : r.source_entity_id }
  })

  const results: PieceConnection[] = []
  for (const other of others) {
    const label = await fetchEntityLabel(other.type, other.id)
    if (label) results.push(label)
  }
  return results
}

async function fetchEntityLabel(type: RelationshipEntityType, id: string): Promise<PieceConnection | null> {
  if (type === 'source') {
    const { data } = await supabase.from('sources').select('name').eq('id', id).maybeSingle()
    return data ? { texto: data.name, tipo: 'source' } : null
  }
  if (type === 'document') {
    const { data } = await supabase.from('documents').select('title').eq('id', id).maybeSingle()
    return data ? { texto: data.title, tipo: 'document' } : null
  }
  if (type === 'note') {
    const { data } = await supabase.from('notes').select('title, content, note_type').eq('id', id).maybeSingle()
    if (!data) return null
    return { texto: data.title || truncate(data.content, 40), tipo: pieceKindFromNoteType(data.note_type) }
  }
  if (type === 'claim') {
    const { data } = await supabase.from('claims').select('content').eq('id', id).maybeSingle()
    return data ? { texto: truncate(data.content, 40), tipo: 'claim' } : null
  }
  return null
}
