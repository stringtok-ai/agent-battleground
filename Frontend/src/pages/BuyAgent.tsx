import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, apiRequest } from '../api/client'
import type { AgentDto } from '../api/types'
import { useAuth } from '../context/AuthContext'
import { PageHeader } from '../components/PageHeader'
import { GlassCard } from '../components/GlassCard'
import { ProgressBar } from '../components/ProgressBar'
import { TermTip } from '../components/TermTip'

const bundles = [
  {
    name: 'Striker Mk.I',
    sku: 'starter' as const,
    rarity: 'Starter',
    vps: 'Train-1 · 2 vCPU · 8 GB RAM',
    vpsTag: 'Included',
    learn: 72,
    pwr: 58,
    priceCents: 9_900,
    highlight: false,
    bestGames: ['GridWorld', 'Food Collector', 'Sorter'] as const,
  },
  {
    name: 'Vanguard Prime',
    sku: 'pro' as const,
    rarity: 'Competitive',
    vps: 'Train-2 · GPU · 16 GB RAM',
    vpsTag: 'Included',
    learn: 88,
    pwr: 76,
    priceCents: 19_900,
    highlight: true,
    bestGames: ['Walker', 'Soccer Twos', 'Push Block'] as const,
  },
  {
    name: 'Apex Singularity',
    sku: 'elite' as const,
    rarity: 'Elite',
    vps: 'Train-Pro · A100 slice · 64 GB',
    vpsTag: 'Included',
    learn: 96,
    pwr: 91,
    priceCents: 49_900,
    highlight: false,
    bestGames: ['Pyramids', 'Match 3', 'Cooperative Push Block'] as const,
  },
] as const

export function BuyAgent() {
  const { user, refreshUser } = useAuth()
  const [agentName, setAgentName] = useState('My battle agent')
  const [msg, setMsg] = useState<string | null>(null)
  const [msgTone, setMsgTone] = useState<'success' | 'error' | 'info'>('info')
  const [busySku, setBusySku] = useState<string | null>(null)

  useEffect(() => {
    // Avoid stale buy/login messages after auth changes.
    setMsg(null)
  }, [user?.id])

  async function buy(sku: (typeof bundles)[number]['sku'], defaultLabel: string) {
    setMsg(null)
    if (!user) {
      setMsgTone('error')
      setMsg('Sign in on the Login page, then return here to purchase.')
      return
    }
    setBusySku(sku)
    try {
      const agent = await apiRequest<AgentDto>('/agents/buy', {
        method: 'POST',
        body: JSON.stringify({ sku, name: (agentName.trim() || defaultLabel).slice(0, 128) }),
      })
      await refreshUser()
      setMsgTone('success')
      setMsg(`Purchased (${agent.sku_tier} tier). Open My Agents to train or enter contests.`)
    } catch (e) {
      setMsgTone('error')
      setMsg(e instanceof ApiError ? e.message : 'Purchase failed')
    } finally {
      setBusySku(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Buy battle agents"
        subtitle="Each tier includes an agent and a training slot (demo credits). Peer listings are under Resale."
        action={
          <Link
            to="/marketplace"
            className="rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Browse resale
          </Link>
        }
      />

      <div className="mb-6 rounded-2xl border border-primary/30 bg-primary-dim/40 px-4 py-3 text-sm text-fg sm:px-5">
        <strong className="text-white">Agent + training slot</strong> — buy once, then train and join contests.{' '}
        <TermTip term="RL" tip="Reinforcement learning: your agent improves from rewards over many episodes." /> jobs use your included slot until you upgrade.
      </div>

      <GlassCard className="mb-6">
        <label className="block text-sm text-fg-soft">
          Agent name (used on receipts)
          <input
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="mt-1 w-full max-w-md rounded-xl border border-border bg-canvas px-3 py-2 text-fg outline-none focus:border-primary/40"
            maxLength={128}
          />
        </label>
        {msg ? (
          <p className={`mt-3 text-sm ${msgTone === 'error' ? 'text-danger' : msgTone === 'success' ? 'text-success' : 'text-accent'}`}>{msg}</p>
        ) : null}
        {!user ? (
          <p className="mt-2 text-sm text-fg-soft">
            You are not signed in —{' '}
            <Link to="/login?next=/buy" className="font-medium text-primary hover:underline">
              open Login
            </Link>
            .
          </p>
        ) : null}
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-3">
        {bundles.map((b) => (
          <GlassCard
            key={b.name}
            className={`relative overflow-hidden p-0 ${b.highlight ? 'ring-1 ring-primary/45' : ''}`}
          >
            {b.highlight ? (
              <div className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Best pick
              </div>
            ) : null}
            <div className="border-b border-border bg-surface-2/50 px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-success/35 bg-success/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
                  Agent + VPS Included
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-secondary">{b.rarity}</span>
              </div>
              <h3 className="mt-2 font-display text-xl font-semibold text-white">{b.name}</h3>
              <p className="mt-1 text-xs text-fg-soft">{b.vps}</p>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <div className="text-xs text-fg-soft">
                  <TermTip term="Learning speed" tip="How fast this chassis converges on new strategies (hardware + architecture)." />
                </div>
                <ProgressBar value={b.learn} label="Training throughput" tone="primary" className="mt-2" />
              </div>
              <div>
                <div className="text-xs text-fg-soft">Battle power (baseline)</div>
                <ProgressBar value={b.pwr} label="Out-of-box strength" tone="secondary" className="mt-2" />
              </div>
              <div>
                <div className="text-xs text-fg-soft">Contest ROI (demo)</div>
                <p className="mt-1 text-sm text-fg-soft">
                  Avg. pool payout vs entry over last 30d — illustrative until your agent has history.
                </p>
                <ProgressBar value={b.highlight ? 72 : 54} label="Estimated value index" tone="accent" className="mt-2" />
              </div>
              <div>
                <div className="text-xs text-fg-soft">Best games for this chassis</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {b.bestGames.map((g) => (
                    <span key={g} className="rounded-lg border border-border bg-canvas/60 px-2 py-1 text-[11px] font-medium text-fg">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-end justify-between border-t border-border pt-4">
                <div>
                  <div className="text-xs text-fg-soft">Price (demo credits)</div>
                  <div className="font-mono text-2xl font-semibold text-white">{b.priceCents.toLocaleString()} credits</div>
                  <div className="text-xs text-fg-soft">Add-on plans optional · cancel anytime</div>
                </div>
                <button
                  type="button"
                  disabled={busySku !== null}
                  onClick={() => void buy(b.sku, b.name)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                    b.highlight
                      ? 'bg-primary text-white shadow-[0_0_24px_-6px_rgba(45,123,255,0.75)]'
                      : 'border border-border bg-white/5 text-white hover:bg-white/10'
                  } disabled:opacity-40`}
                >
                  {!user ? 'Sign in to buy' : busySku === b.sku ? 'Buying…' : 'Buy now'}
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
