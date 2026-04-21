import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, apiRequest } from '../api/client'
import type { WalletTx } from '../api/types'
import { useAuth } from '../context/AuthContext'
import { PageHeader } from '../components/PageHeader'
import { GlassCard } from '../components/GlassCard'
import { ProgressBar } from '../components/ProgressBar'
import { useWalletBalance } from '../hooks/useWalletBalance'
import { getGameById } from '../data/games'

const DEMO_CLAIM_LABEL = '50,000'

/** Illustrative 7-day split by String Agents environment (UI until wallet analytics API exists). */
const WEEKLY_EARNINGS_ROWS: { gameId: string; pct: number; netCr: number }[] = [
  { gameId: 'gridworld', pct: 32, netCr: 245 },
  { gameId: 'soccer-twos', pct: 26, netCr: 198 },
  { gameId: 'push-block', pct: 22, netCr: 172 },
  { gameId: 'food-collector', pct: 12, netCr: 94 },
]
const WEEKLY_OTHER = { pct: 8, netCr: 61 }

export function Wallet() {
  const { user, loading: authLoading, refreshUser } = useAuth()
  const { balance, loading: balLoading } = useWalletBalance()
  const [tx, setTx] = useState<WalletTx[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [claimBusy, setClaimBusy] = useState(false)
  const [claimMsg, setClaimMsg] = useState<string | null>(null)
  const [txRefresh, setTxRefresh] = useState(0)

  useEffect(() => {
    if (authLoading || !user) {
      setTx([])
      return
    }
    apiRequest<WalletTx[]>('/wallet/transactions?limit=50')
      .then(setTx)
      .catch((e) => setErr(e instanceof ApiError ? e.message : 'Could not load transactions'))
  }, [user, authLoading, txRefresh])

  async function claimDemo() {
    setClaimMsg(null)
    if (!user) {
      setClaimMsg('Sign in on the Login page first.')
      return
    }
    setClaimBusy(true)
    try {
      await apiRequest('/wallet/claim-demo', { method: 'POST' })
      await refreshUser()
      setTxRefresh((n) => n + 1)
      setClaimMsg(`Added ${DEMO_CLAIM_LABEL} demo credits.`)
    } catch (e) {
      setClaimMsg(e instanceof ApiError ? e.message : 'Claim failed')
    } finally {
      setClaimBusy(false)
    }
  }

  const spendable = !user ? '—' : balLoading ? '…' : balance !== null ? balance.toLocaleString() : '—'

  return (
    <div>
      <PageHeader
        title="Wallet & rewards"
        subtitle="Your credits and recent activity. Sign in to see live balances."
        action={
          <button
            type="button"
            disabled={!user || claimBusy}
            onClick={() => void claimDemo()}
            className="rounded-xl bg-accent/90 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {claimBusy ? 'Claiming…' : `Claim +${DEMO_CLAIM_LABEL} credits`}
          </button>
        }
      />

      {claimMsg ? <p className="mb-4 text-sm text-accent">{claimMsg}</p> : null}

      {!user && !authLoading ? (
        <p className="mb-6 text-sm text-fg-soft">
          <Link to="/login?next=/wallet" className="font-medium text-primary hover:underline">
            Sign in
          </Link>{' '}
          to load your wallet.
        </p>
      ) : null}
      {err ? <p className="mb-6 text-sm text-danger">{err}</p> : null}

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <GlassCard>
          <div className="text-xs font-medium uppercase tracking-wide text-fg-soft">Spendable</div>
          <div className="mt-1 font-mono text-3xl font-semibold text-white">
            {spendable}
            {spendable !== '—' && spendable !== '…' ? <span className="text-fg-soft"> credits</span> : null}
          </div>
        </GlassCard>
        <GlassCard>
          <div className="text-xs font-medium uppercase tracking-wide text-fg-soft">Staked (optional)</div>
          <div className="mt-1 font-mono text-3xl font-semibold text-secondary">
            0<span className="text-fg-soft"> credits</span>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mb-6">
        <h2 className="font-display text-lg font-semibold text-white">Earnings by game · last 7 days</h2>
        <p className="mt-1 text-sm text-fg-soft">Rough split by String Agents environment (sample view).</p>
        <ul className="mt-4 space-y-4">
          {WEEKLY_EARNINGS_ROWS.map((row) => {
            const g = getGameById(row.gameId)
            const title = g?.name ?? row.gameId
            const subtitle = g?.stringAgents ?? 'String Agents'
            return (
              <li key={row.gameId}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <div>
                    <span className="font-medium text-white">{title}</span>
                    <p className="text-[11px] text-fg-soft">{subtitle}</p>
                  </div>
                  <span className="font-mono text-success">+{row.netCr.toLocaleString()} credits</span>
                </div>
                <ProgressBar value={row.pct} label="Share of weekly net (demo)" tone="accent" className="mt-2" />
              </li>
            )
          })}
          <li>
            <div className="flex items-center justify-between gap-2 text-sm">
              <div>
                <span className="font-medium text-white">Other environments</span>
                <p className="text-[11px] text-fg-soft">Remaining String Agents titles</p>
              </div>
              <span className="font-mono text-success">+{WEEKLY_OTHER.netCr.toLocaleString()} credits</span>
            </div>
            <ProgressBar value={WEEKLY_OTHER.pct} label="Share of weekly net (demo)" tone="accent" className="mt-2" />
          </li>
        </ul>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_340px]">
        <GlassCard className="p-0">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-display text-lg font-semibold text-white">Transactions</h2>
            <p className="text-sm text-fg-soft">Newest activity first.</p>
          </div>
          <ul className="divide-y divide-border">
            {tx.length === 0 && user ? (
              <li className="px-5 py-6 text-sm text-fg-soft">No transactions yet.</li>
            ) : null}
            {tx.map((r) => {
              const sign = r.amount_cents >= 0 ? '+' : ''
              const amt = `${sign}${r.amount_cents.toLocaleString()}`
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-white/[0.02]">
                  <div>
                    <div className="font-medium text-white">{r.type.replace(/_/g, ' ')}</div>
                    <div className="font-mono text-xs text-fg-soft">#{r.id}</div>
                    <div className="text-xs text-fg-soft">{new Date(r.created_at).toLocaleString()}</div>
                  </div>
                  <div
                    className={`font-mono text-lg font-semibold ${r.amount_cents >= 0 ? 'text-success' : 'text-danger'}`}
                  >
                    {amt} credits
                  </div>
                </li>
              )
            })}
          </ul>
        </GlassCard>

        <GlassCard>
          <h3 className="font-display text-base font-semibold text-white">Account safety</h3>
          <p className="mt-2 text-sm text-fg-soft">Use a strong password and sign out on shared PCs. Extra security options will appear here in a future update.</p>
        </GlassCard>
      </div>
    </div>
  )
}
