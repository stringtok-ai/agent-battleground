import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ApiError, apiRequest } from '../api/client'
import type { AgentDto } from '../api/types'
import { useAuth } from '../context/AuthContext'
import { PageHeader } from '../components/PageHeader'
import { GlassCard } from '../components/GlassCard'
import { ProgressBar } from '../components/ProgressBar'
import { Sparkline } from '../components/Sparkline'
import { TermTip } from '../components/TermTip'
import { DEFAULT_GAME_ID, GAMES } from '../data/games'
import { normalizeGameId } from '../lib/gameIds'

const presets = ['Balanced', 'Aggro ladder', 'Eco miner', 'Tournament prep'] as const

export function TrainingLab() {
  const { user, loading: authLoading } = useAuth()
  const [params, setParams] = useSearchParams()
  const gameId = params.get('game') ?? DEFAULT_GAME_ID
  const agentIdFromUrl = Number(params.get('agentId') || 0)
  const [agents, setAgents] = useState<AgentDto[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState(agentIdFromUrl)
  const [algo, setAlgo] = useState('PPO')
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (authLoading || !user) {
      setAgents([])
      return
    }
    apiRequest<AgentDto[]>('/agents')
      .then((list) => {
        setAgents(list)
        if (agentIdFromUrl && list.some((a) => a.id === agentIdFromUrl)) {
          setSelectedAgentId(agentIdFromUrl)
        } else if (list[0] && !agentIdFromUrl) {
          setSelectedAgentId(list[0].id)
        }
      })
      .catch(() => setAgents([]))
  }, [user, authLoading, agentIdFromUrl])

  function setGame(id: string) {
    const next = new URLSearchParams(params)
    next.set('game', id)
    setParams(next)
  }

  function setAgentId(id: number) {
    setSelectedAgentId(id)
    const next = new URLSearchParams(params)
    next.set('agentId', String(id))
    setParams(next)
  }

  async function startTraining() {
    setMsg(null)
    if (!user) {
      setMsg('Sign in on the Login page first.')
      return
    }
    if (!selectedAgentId) {
      setMsg('Select an agent (buy one if your list is empty).')
      return
    }
    setBusy(true)
    try {
      await apiRequest(`/agents/${selectedAgentId}/train`, {
        method: 'POST',
        body: JSON.stringify({ game: normalizeGameId(gameId), algo }),
      })
      setMsg('Training queued. Check My Agents in a few seconds for updates.')
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : 'Failed to start training')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Training lab"
        subtitle="Pick an agent and a game, then start a training run. Ratings are tracked per game."
        action={
          <button
            type="button"
            disabled={busy}
            onClick={() => void startTraining()}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? 'Starting…' : 'Start training'}
          </button>
        }
      />

      {msg ? <div className="mb-4 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-fg">{msg}</div> : null}

      <div className="space-y-4">
          <GlassCard>
            <h2 className="font-display text-lg font-semibold text-white">Bind training</h2>
            <p className="mt-1 text-sm text-fg-soft">
              Select agent and game — learning graphs below track this pair only.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-fg-soft">
                Agent
                <select
                  value={selectedAgentId || ''}
                  onChange={(e) => setAgentId(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border border-border bg-canvas px-3 py-2.5 text-sm text-fg outline-none focus:border-primary/40"
                >
                  {!agents.length ? <option value="">No agents (sign in & buy)</option> : null}
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-medium uppercase tracking-wide text-fg-soft">
                Game
                <select
                  value={gameId}
                  onChange={(e) => setGame(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-canvas px-3 py-2.5 text-sm text-fg outline-none focus:border-primary/40"
                >
                  {GAMES.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-fg-soft">
              RL algorithm
              <select
                value={algo}
                onChange={(e) => setAlgo(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-canvas px-3 py-2.5 text-sm text-fg outline-none focus:border-primary/40"
              >
                <option value="PPO">PPO (recommended)</option>
                <option value="SAC">SAC</option>
                <option value="Curiosity-PPO">Curiosity-PPO</option>
              </select>
            </label>
            <p className="mt-2 text-[11px] text-fg-soft">
              <abbr title="Proximal Policy Optimization — stable policy gradients for String Agent sims." className="cursor-help border-b border-dotted border-primary/50">
                PPO
              </abbr>{' '}
              is the default for most String Agents environments.
            </p>
          </GlassCard>

          <GlassCard>
            <h2 className="font-display text-lg font-semibold text-white">Run configuration</h2>
            <p className="mt-1 text-sm text-fg-soft">Pick a strategy preset. Each shows expected time and cost band.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="rounded-full border border-primary/40 bg-primary-dim px-4 py-2 text-sm font-medium text-white"
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-fg-soft">
              Runs use your included training slot. Typical jobs finish in under an hour in the demo.
            </p>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold text-white">Learning curve</h2>
              <span className="text-xs text-fg-soft">Eval win rate · last 40 checkpoints</span>
            </div>
            <p className="mt-1 text-sm text-fg-soft">
              Smooth line = stable learning. Spikes often mean <TermTip term="exploration" tip="Trying new actions to discover better strategies." /> noise.
            </p>
            <div className="mt-4 h-28 w-full rounded-xl border border-border bg-canvas/60 px-2 py-3">
              <Sparkline values={[44, 46, 45, 52, 54, 58, 57, 61, 60, 63, 62, 64, 63, 66]} className="h-full w-full" />
            </div>
            <ProgressBar value={64} label="Current eval vs baseline" tone="success" className="mt-4" />
          </GlassCard>
      </div>
    </div>
  )
}
