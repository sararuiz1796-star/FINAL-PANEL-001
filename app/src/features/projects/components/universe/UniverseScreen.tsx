import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProject } from '../../api'
import { getUniverseSummary } from '../../universeApi'
import type { Piece } from '../../universeApi'
import { pieceColor, pieceLabel, universeColor, type PieceKind } from '../../../../lib/universeTokens'
import { projectTypeLabel } from '../../../../lib/projectTypeGroups'
import { Spinner } from '../../../../components/ui/Spinner'
import { ProjectHeader } from './ProjectHeader'
import { MosaicGrid } from './MosaicGrid'
import { ConstellationCard } from './ConstellationCard'
import { RecentFeed } from './RecentFeed'
import { PieceDetailSheet } from './PieceDetailSheet'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  active: { label: 'Vivo', color: pieceColor.note },
  paused: { label: 'Pausado', color: pieceColor.question },
  completed: { label: 'Completo', color: universeColor.textMutedOnBlack },
  archived: { label: 'Archivado', color: universeColor.textMutedOnBlack },
}

function splitTitle(title: string): [string, string] {
  const firstSpace = title.indexOf(' ')
  if (firstSpace === -1) return [title, '']
  return [title.slice(0, firstSpace), title.slice(firstSpace + 1)]
}

/**
 * Universo del proyecto (handoff hifi "Retratos del Valle" § 1). Pantalla
 * madre del proyecto: mosaico + constelación + feed reciente + hoja de
 * detalle, con `filtro`/`abierta` como único estado local (handoff §
 * State Management).
 */
export function UniverseScreen() {
  const { projectId } = useOutletContext<{ projectId: string }>()
  const [filtro, setFiltro] = useState<PieceKind | null>(null)
  const [abierta, setAbierta] = useState<Piece | null>(null)

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
  })
  const { data: universe, isLoading } = useQuery({
    queryKey: ['universe-summary', projectId],
    queryFn: () => getUniverseSummary(projectId),
  })

  if (isLoading || !project || !universe) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: universeColor.cream }}>
        <Spinner />
      </div>
    )
  }

  const [titleLine1, titleLine2] = splitTitle(project.title)
  const status = STATUS_LABEL[project.status] ?? STATUS_LABEL.active
  const createdYear = new Date(project.created_at).getFullYear()
  const nowYear = new Date().getFullYear()
  const yearRange = createdYear === nowYear ? `${createdYear}` : `${createdYear}—${String(nowYear).slice(2)}`
  const bajada = `${project.description || project.research_question || 'Un espacio para investigar sin apuro.'} ${universe.project.totalPieces} piezas respirando aquí adentro.`

  const list = filtro ? universe.recent.filter((p) => p.kind === filtro) : universe.recent

  return (
    <div className="mx-auto min-h-screen max-w-[480px] pb-24" style={{ backgroundColor: universeColor.cream }}>
      <ProjectHeader
        typeLabel={projectTypeLabel(project.project_type)}
        statusLabel={status.label}
        statusColor={status.color}
        titleLine1={titleLine1}
        titleLine2={titleLine2}
        verticalLabel={`${projectTypeLabel(project.project_type).toUpperCase()} · ${yearRange}`}
        bajada={bajada}
        collaborators={universe.project.collaborators}
        lastMovement={universe.project.lastMovement}
        tensions={universe.project.tensions}
      />

      <div className="pt-5">
        <MosaicGrid
          counts={universe.counts}
          claimsNeedingEvidence={universe.project.claimsNeedingEvidence}
          activeFilter={filtro}
          onSelect={(kind) => setFiltro((current) => (current === kind ? null : kind))}
          onClear={() => setFiltro(null)}
          recentCount={list.length}
          totalRecent={universe.recent.length}
        />
      </div>

      {universe.constellation && (
        <ConstellationCard constellation={universe.constellation} onEnter={() => {}} />
      )}

      <RecentFeed
        pieces={list}
        totalRecent={universe.recent.length}
        filterLabel={filtro ? `${pieceLabel[filtro]}s` : null}
        onOpen={setAbierta}
      />

      {abierta && <PieceDetailSheet piece={abierta} projectId={projectId} onClose={() => setAbierta(null)} />}
    </div>
  )
}
