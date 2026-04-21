import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, apiRequest } from '../api/client'
import type { AgentDto } from '../api/types'
import { useAuth } from '../context/AuthContext'
import { DEFAULT_GAME_ID } from '../data/games'
import { PageHeader } from '../components/PageHeader'
import { GlassCard } from '../components/GlassCard'

export function MyAgents() {
  const { user, loading: authLoading } = useAuth()
  const [agents, setAgents] = useState<AgentDto[]>([])
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !user) {
      setAgents([])
      setErr(null)
      return
    }
    setErr(null)
    apiRequest<AgentDto[]>('/agents')
      .then(setAgents)
      .catch((e) => setErr(e instanceof ApiError ? e.message : 'Failed to load agents'))
  }, [user, authLoading])

  return (
    <div>
      <PageHeader
        title="My agents"
        subtitle="Your purchased agents appear here when you are signed in."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/train?game=${DEFAULT_GAME_ID}`}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_-8px_rgba(45,123,255,0.8)]"
            >
              Train now
            </Link>
            <Link
              to="/contests"
              className="rounded-xl border border-accent/40 bg-accent-dim px-4 py-2.5 text-sm font-semibold text-accent hover:brightness-110"
            >
              Enter contest
            </Link>
            <Link to="/buy" className="rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10">
              Buy agent
            </Link>
          </div>
        }
      />

      {!user && !authLoading ? (
        <p className="mb-6 text-sm text-fg-soft">
          <Link to="/login?next=/agents" className="font-medium text-primary hover:underline">
            Sign in
          </Link>{' '}
          to see your agents.
        </p>
      ) : null}
      {err ? <p className="mb-6 text-sm text-danger">{err}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <GlassCard className="p-0">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-display text-lg font-semibold text-white">Inventory</h2>
            <p className="text-sm text-fg-soft">Name, tier, ratings, and training shortcuts.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-fg-soft">
                <tr className="border-b border-border">
                  <th className="px-5 py-3 font-medium">Agent</th>
                  <th className="px-5 py-3 font-medium">SKU</th>
                  <th className="px-5 py-3 font-medium">Elo</th>
                  <th className="px-5 py-3 font-medium">MMR</th>
                  <th className="px-5 py-3 font-medium">Train Lv</th>
                  <th className="px-5 py-3 font-medium">Model id</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {agents.length === 0 && user ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-fg-soft">
                      No agents yet — purchase one from Buy Agent, then start training.
                    </td>
                  </tr>
                ) : null}
                {agents.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.03]">
                    <td className="px-5 py-4 font-medium text-white">{row.name}</td>
                    <td className="px-5 py-4 font-mono text-xs text-secondary">{row.sku_tier}</td>
                    <td className="px-5 py-4 font-mono text-xs text-fg">{row.elo}</td>
                    <td className="px-5 py-4 font-mono text-xs text-fg">{row.mmr}</td>
                    <td className="px-5 py-4 text-fg-soft">{row.training_level}</td>
                    <td className="px-5 py-4 font-mono text-xs text-primary">{row.latest_model_id ?? '—'}</td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/train?game=${DEFAULT_GAME_ID}&agentId=${row.id}`}
                        className="mr-3 text-sm font-medium text-primary hover:underline"
                      >
                        Train
                      </Link>
                      <Link to="/contests" className="text-sm font-medium text-accent hover:underline">
                        Contest
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard>
            <h3 className="font-display text-base font-semibold text-white">Tips</h3>
            <p className="mt-2 text-sm text-fg-soft">
              Use <strong className="text-fg">Train</strong> to start a run from the Training lab.
            </p>
            <p className="mt-2 text-sm text-fg-soft">
              New agents get a starter model so you can join contests right away.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
