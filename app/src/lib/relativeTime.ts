/** Tiempo relativo en español, corto — para metadatos de feed ("hoy", "hace 3 días"). */
export function relativeTimeEs(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffMs = now - then
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  if (diffMs < hour) {
    const mins = Math.max(1, Math.round(diffMs / minute))
    return mins === 1 ? 'hace 1 min' : `hace ${mins} min`
  }
  if (diffMs < day) {
    const hours = Math.round(diffMs / hour)
    return hours === 1 ? 'hace 1 h' : `hace ${hours} h`
  }
  const days = Math.round(diffMs / day)
  if (days === 0) return 'hoy'
  if (days === 1) return 'ayer'
  if (days < 7) return `hace ${days} días`
  const weeks = Math.round(days / 7)
  if (weeks < 5) return weeks === 1 ? 'hace 1 sem.' : `hace ${weeks} sem.`
  const months = Math.round(days / 30)
  return months === 1 ? 'hace 1 mes' : `hace ${months} meses`
}
