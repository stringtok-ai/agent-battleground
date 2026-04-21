import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { safeNext } from '../lib/safeNext'
import { useAuth } from '../context/AuthContext'

export function Register() {
  const { user, loading, register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = useMemo(() => safeNext(searchParams.get('next')), [searchParams])

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const loginHref = useMemo(() => {
    const q = next && next !== '/' ? `?next=${encodeURIComponent(next)}` : ''
    return `/login${q}`
  }, [next])

  useEffect(() => {
    if (!loading && user) {
      navigate(next, { replace: true })
    }
  }, [loading, user, navigate, next])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    setBusy(true)
    try {
      await register(email, password, displayName.trim() || undefined)
      navigate(next, { replace: true })
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : 'Could not create account')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-canvas px-4 py-10">
      <div className="mx-auto w-full max-w-md flex-1">
        <div className="mb-10 text-center">
          <Link to="/" className="inline-flex items-center gap-2 rounded-xl px-2 py-1 text-fg-soft transition hover:text-fg">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-secondary neon-edge text-white">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4M12 17v4M4.5 7.5l3 1.8M16.5 14.7l3 1.8" />
              </svg>
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-white">Agent Battleground</span>
          </Link>
          <h1 className="mt-6 font-display text-2xl font-semibold text-white">Create account</h1>
          <p className="mt-2 text-sm text-fg-soft">One account for wallet, contests, and agents.</p>
        </div>

        <div className="glass glass-hover rounded-2xl border border-border p-6 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.55)]">
          {loading ? (
            <p className="text-center text-sm text-fg-soft">Checking session…</p>
          ) : (
            <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
              <label className="block text-sm text-fg-soft">
                Display name <span className="text-fg-soft/70">(optional)</span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-fg outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  autoComplete="nickname"
                  placeholder="Shown on leaderboards"
                />
              </label>
              <label className="block text-sm text-fg-soft">
                Email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-fg outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  autoComplete="email"
                  autoFocus
                />
              </label>
              <label className="block text-sm text-fg-soft">
                Password <span className="text-fg-soft/70">(min 8 characters)</span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-fg outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  autoComplete="new-password"
                />
              </label>
              {msg ? (
                <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
                  {msg}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl border border-primary/50 bg-primary-dim py-3 text-sm font-semibold text-white shadow-[0_0_24px_-8px_rgba(45,123,255,0.35)] transition hover:bg-primary-dim/80 disabled:opacity-50"
              >
                {busy ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          )}

          <p className="mt-5 text-center text-xs text-fg-soft">
            Already have an account?{' '}
            <Link to={loginHref} className="font-medium text-primary underline-offset-2 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-fg-soft">
          <Link to="/" className="text-fg transition hover:text-primary">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
