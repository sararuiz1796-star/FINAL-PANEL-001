/**
 * Muesca geométrica (diamante, no círculo) en la costura entre dos piezas —
 * más "mecanismo/corte" que "burbuja" (ver plan visual, punto sobre
 * geometrías más contundentes). Se posiciona como primer hijo de la pieza
 * que está DESPUÉS de la costura, ancladas a su propio borde superior —
 * así queda bien puesta sin depender de medir alturas reales.
 */
export function Notch({ className = '' }: { className?: string }) {
  return <div className={`absolute z-10 h-5 w-5 rotate-45 border border-bg-dark/20 bg-bg-light ${className}`} />
}
