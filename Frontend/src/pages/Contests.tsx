import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, apiRequest } from '../api/client'
import type { AgentDto, ContestDto } from '../api/types'
import { useAuth } from '../context/AuthContext'
import { PageHeader } from '../components/PageHeader'
import { GlassCard } from '../components/GlassCard'
import { ContestCountdown } from '../components/ContestCountdown'
import { DEFAULT_GAME_ID, GAMES, getGameById } from '../data/games'
import { normalizeGameId } from '../lib/gameIds'

type PoolTier = 'Beginner' | 'Pro' | 'Elite' | 'Tournament'

function backendGameToFrontendId(g: string) {
  if (g === 'pushblock') return 'push-block'
  if (g === 'soccertwos' || g === 'soccer_twos') return 'soccer-twos'
  if (g === 'foodcollector' || g === 'food_collector') return 'food-collector'
  return g
}

function poolTierLabel(tier: string): PoolTier {
  const t = tier.toLowerCase()
  if (t === 'micro') return 'Beginner'
  if (t === 'standard') return 'Pro'
  if (t === 'high') return 'Elite'
  if (t.includes('tournament')) return 'Tournament'
  return 'Pro'
}

function tierStyle(t: PoolTier) {
  if (t === 'Beginner') return 'border-success/35 bg-success/10 text-success'
  if (t === 'Pro') return 'border-primary/40 bg-primary-dim text-primary'
  if (t === 'Elite') return 'border-accent/40 bg-accent-dim text-accent'
  return 'border-secondary/40 bg-secondary-dim text-secondary'
}

function tierHeading(t: PoolTier) {
  if (t === 'Tournament') return 'Tournament pool'
  return `${t} pool`
}

export function Contests() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const filterGame = params.get('game')
  const { user, refreshUser } = useAuth()
  const [rows, setRows] = useState<ContestDto[]>([])
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [joinMsg, setJoinMsg] = useState<string | null>(null)
  const [joiningId, setJoiningId] = useState<number | null>(null)
  const [showAllHistory, setShowAllHistory] = useState(false)

  const load = useCallback(() => {
    setLoadErr(null)
    const q = showAllHistory ? '' : '?status=open'
    apiRequest<ContestDto[]>(`/contests${q}`)
      .then(setRows)
      .catch((e) => setLoadErr(e instanceof ApiError ? e.message : 'Could not reach API'))
  }, [showAllHistory])

  useEffect(() => {
    load()
  }, [load])

  const list = useMemo(() => {
    if (!filterGame) return rows
    const want = normalizeGameId(filterGame)
    return rows.filter((r) => normalizeGameId(backendGameToFrontendId(r.game)) === want)
  }, [rows, filterGame])

  const nextLockIso = useMemo(() => {
    const openDeadlines = rows
      .filter((r) => r.status === 'open')
      .map((r) => r.join_deadline)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    return openDeadlines[0] ?? null
  }, [rows])

  async function joinContest(contestId: number) {
    setJoinMsg(null)
    if (!user) {
      setJoinMsg('Sign in on the Login page, then try again.')
      return
    }
    setJoiningId(contestId)
    try {
      const agents = await apiRequest<AgentDto[]>('/agents')
      const pick = agents.find((a) => a.latest_model_id)
      if (!pick?.latest_model_id) {
        setJoinMsg('You need an agent with a model. Buy one or wait for training to finish.')
        setJoiningId(null)
        return
      }
      await apiRequest(`/contests/${contestId}/enter`, {
        method: 'POST',
        body: JSON.stringify({ contest_id: contestId, model_id: pick.latest_model_id }),
      })
      setJoinMsg(`Entered contest #${contestId}. Opening live battleground…`)
      await refreshUser()
      load()
      navigate(`/contests/${contestId}/battle`)
    } catch (e) {
      setJoinMsg(e instanceof ApiError ? e.message : 'Join failed')
    } finally {
      setJoiningId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Contests & pools"
        subtitle="Choose a game, pick an agent with a trained model, pay the entry fee, and join before the timer locks the pool."
        action={
          <Link
            to={`/contests?game=${DEFAULT_GAME_ID}`}
            className="rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10"
          >
            Filter to default game
          </Link>
        }
      />

      {loadErr ? (
        <div className="mb-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {loadErr} — check that the game server is running, then refresh.
        </div>
      ) : null}
      {joinMsg ? (
        <div className="mb-4 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-fg">{joinMsg}</div>
      ) : null}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        {nextLockIso ? (
          <ContestCountdown deadlineIso={nextLockIso} label="Next join lock" />
        ) : (
          <span className="rounded-xl border border-border bg-canvas/60 px-3 py-2 text-sm text-fg-soft">No open pools right now</span>
        )}
        <span className="text-xs text-fg-soft">
          Pools use a short join window (about five minutes); <strong className="text-fg">empty pools reopen</strong> so you can try again.
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowAllHistory(false)}
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            !showAllHistory ? 'bg-secondary text-white' : 'border border-border text-fg-soft hover:text-white'
          }`}
        >
          Open only
        </button>
        <button
          type="button"
          onClick={() => setShowAllHistory(true)}
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            showAllHistory ? 'bg-secondary text-white' : 'border border-border text-fg-soft hover:text-white'
          }`}
        >
          Include past
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          to="/contests"
          className={`rounded-full px-4 py-2 text-sm font-medium ${!filterGame ? 'bg-primary text-white' : 'border border-border text-fg-soft hover:text-white'}`}
        >
          All pools
        </Link>
        {GAMES.slice(0, 6).map((g) => (
          <Link
            key={g.id}
            to={`/contests?game=${g.id}`}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              filterGame === g.id ? 'bg-primary text-white' : 'border border-border text-fg-soft hover:text-white'
            }`}
          >
            {g.name}
          </Link>
        ))}
        <Link to="/games" className="rounded-full border border-border px-4 py-2 text-sm text-fg-soft hover:text-white">
          More games
        </Link>
      </div>

      <div className="grid gap-4">
        {list.length === 0 && !loadErr ? (
          <GlassCard className="p-6 text-sm text-fg-soft">No contests match this filter (or the database is empty).</GlassCard>
        ) : null}
        {list.map((c) => {
          const feId = backendGameToFrontendId(c.game)
          const g = getGameById(feId)
          const tier = poolTierLabel(c.pool_tier)
          const fill = c.max_slots > 0 ? Math.round((c.filled_slots / c.max_slots) * 100) : 0
          const canJoin = c.status === 'open'
          return (
            <GlassCard key={c.id} className="p-0">
              <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tierStyle(tier)}`}>
                      {tierHeading(tier)}
                    </span>
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-mono uppercase text-fg-soft">
                      {c.status}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-lg font-semibold text-white">{g?.name ?? c.game}</h3>
                  <p className="mt-1 text-sm text-fg-soft">{g?.stringAgents ?? 'String Agents environment'}</p>
                  <p className="mt-2 text-xs text-fg-soft">Difficulty band: {c.pool_tier}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 lg:flex-col lg:items-end">
                  <ContestCountdown deadlineIso={c.join_deadline} label="Locks in" />
                  <div className="text-right text-sm">
                    <div className="text-fg-soft">Entry</div>
                    <div className="font-mono text-lg font-semibold text-white">{c.entry_fee_cents.toLocaleString()} credits</div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-fg-soft">Prize pool</div>
                    <div className="font-mono text-lg font-semibold text-accent">{c.prize_pool_cents.toLocaleString()} credits</div>
                  </div>
                </div>
              </div>
              <div className="border-t border-border px-5 py-4">
                <div className="mb-2 flex justify-between text-xs text-fg-soft">
                  <span>Slots filled</span>
                  <span className="font-mono text-fg">
                    {c.filled_slots}/{c.max_slots} · {Math.max(0, c.max_slots - c.filled_slots)} left
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-linear-to-r from-primary to-secondary transition-all" style={{ width: `${fill}%` }} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!canJoin || joiningId === c.id}
                    onClick={() => void joinContest(c.id)}
                    className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_-8px_rgba(45,123,255,0.85)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {joiningId === c.id ? 'Joining…' : canJoin ? 'Join pool' : 'Closed'}
                  </button>
                  <Link
                    to={`/games/${feId}`}
                    className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-white hover:bg-white/5"
                  >
                    Game detail
                  </Link>
                  <Link
                    to={`/contests/${c.id}/battle`}
                    className="rounded-xl border border-secondary/40 bg-secondary/20 px-4 py-2.5 text-sm font-semibold text-secondary hover:brightness-110"
                  >
                    Live battleground
                  </Link>
                </div>
              </div>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
