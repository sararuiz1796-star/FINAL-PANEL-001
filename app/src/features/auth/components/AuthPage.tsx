import { useState, type FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Card } from '../../../components/ui/Card'
import { signInWithPassword, signUpWithPassword } from '../api'

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
    <div className="flex min-h-screen items-center justify-center bg-bg-light p-6">
      <Card className="w-full max-w-sm">
        <h1 className="text-h1 font-bold">PARNASO</h1>
        <p className="mt-1 text-caption text-text-on-light">
          {mode === 'signin' ? 'Iniciá sesión para continuar.' : 'Creá tu cuenta.'}
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-2">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          {error && <p className="text-caption text-state-error">{error}</p>}
          <Button type="submit" disabled={loading}>
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
      </Card>
    </div>
  )
}
