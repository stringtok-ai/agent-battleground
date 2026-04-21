import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { GlassCard } from '../components/GlassCard'
import { useAuth } from '../context/AuthContext'

export function Settings() {
  const { user, loading, logout } = useAuth()
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onLogout() {
    setBusy(true)
    try {
      await logout()
      setMsg('Signed out.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Account and profile. Sign in or register on their dedicated pages." />

      <GlassCard className="mb-6 border-primary/25 bg-primary-dim/20">
        <h2 className="font-display text-base font-semibold text-white">Account</h2>
        <p className="mt-1 text-sm text-fg-soft">
          Wallet, contests, and agents sync when you are signed in. Use the Login or Register page — not this screen — to authenticate.
        </p>
        {loading ? (
          <p className="mt-3 text-sm text-fg-soft">Checking session…</p>
        ) : user ? (
          <div className="mt-4 space-y-2 text-sm">
            <p className="text-fg">
              Signed in as <span className="font-mono text-white">{user.email}</span>
            </p>
            <button
              type="button"
              onClick={() => void onLogout()}
              disabled={busy}
              className="rounded-xl border border-border bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/login?next=/settings"
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_0_24px_-8px_rgba(45,123,255,0.55)] transition hover:brightness-110"
            >
              Sign in
            </Link>
            <Link
              to="/register?next=/settings"
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-primary/45 bg-primary-dim px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-primary-dim/80"
            >
              Create account
            </Link>
          </div>
        )}
        {msg ? <p className="mt-3 text-sm text-accent">{msg}</p> : null}
      </GlassCard>

      <GlassCard>
        <h2 className="font-display text-base font-semibold text-white">Profile</h2>
        <p className="mt-1 text-sm text-fg-soft">Name shown on leaderboards and receipts.</p>
        <label className="mt-4 block text-sm text-fg-soft">
          Display name
          <input
            className="mt-1 w-full max-w-md rounded-xl border border-border bg-canvas px-3 py-2 text-fg outline-none focus:border-primary/40"
            defaultValue={user?.display_name ?? ''}
            placeholder="Your name"
          />
        </label>
        <button type="button" className="mt-4 rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-white ring-1 ring-border hover:bg-white/10">
          Save (coming soon)
        </button>
      </GlassCard>
    </div>
  )
}
