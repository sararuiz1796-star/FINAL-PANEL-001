import { useState, type FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { signInWithPassword, signUpWithPassword } from '../api'

/**
 * Split asimétrico: panel negro con el wordmark a escala hero (identidad,
 * no una card chica flotando en crema) + panel de formulario, quieto pero
 * no tímido. En mobile el panel negro pasa arriba, más bajo.
 */
export function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'signin') {
        await signInWithPassword(email, password)
      } else {
        await signUpWithPassword(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la acción.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex min-h-40 flex-shrink-0 items-end overflow-hidden bg-bg-dark p-6 md:min-h-screen md:w-3/5 md:p-12">
        <div className="w-full">
          <p className="text-caption uppercase tracking-wide text-text-on-dark/50">Infraestructura de investigación</p>
          <h1
            className="-ml-1 whitespace-nowrap font-bold leading-[0.8] text-text-on-dark"
            style={{ fontSize: 'clamp(72px, 16vw, 260px)' }}
          >
            PARNASO
          </h1>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 md:w-2/5 md:p-12">
        <div className="w-full max-w-sm">
          <p className="text-h2 font-semibold text-text-on-light">
            {mode === 'signin' ? 'Iniciá sesión' : 'Creá tu cuenta'}
          </p>
          <p className="mt-1 text-caption text-text-on-light">
            {mode === 'signin' ? 'Para continuar tu universo.' : 'Para empezar tu universo.'}
          </p>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-2">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            {error && <p className="text-caption text-state-error">{error}</p>}
            <Button type="submit" disabled={loading} className="mt-2">
              {mode === 'signin' ? 'Iniciar sesión' : 'Crear cuenta'}
            </Button>
          </form>
          <button
            type="button"
            className="mt-4 text-caption text-text-on-light underline"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          >
            {mode === 'signin' ? 'No tenés cuenta? Creá una.' : 'Ya tenés cuenta? Iniciá sesión.'}
          </button>
        </div>
      </div>
    </div>
  )
}
