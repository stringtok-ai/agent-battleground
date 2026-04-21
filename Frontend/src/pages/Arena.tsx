import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiError, apiRequest } from '../api/client'
import type { ContestDto } from '../api/types'
import { PageHeader } from '../components/PageHeader'
import { GlassCard } from '../components/GlassCard'
import { TermTip } from '../components/TermTip'
import { BattlegroundCanvas } from '../battleground/BattlegroundCanvas'
import { HowToPlayPanel } from '../battleground/HowToPlayPanel'
import { MatchScoreboard } from '../battleground/MatchScoreboard'
import { battlegroundKindForGame, contestGameToFrontendId } from '../battleground/gameRouting'
import { useMatchSimulation, type SimAgent } from '../battleground/useMatchSimulation'
import { DEFAULT_GAME_ID, GAMES, getGameById } from '../data/games'

const ARENA_SIM_AGENTS = 6

export function Arena() {
  const [params, setParams] = useSearchParams()
  const [contestRow, setContestRow] = useState<ContestDto | null>(null)
  const [contestErr, setContestErr] = useState<string | null>(null)
  const contestIdRaw = Number(params.get('contestId') || 0)
  const contestId = Number.isFinite(contestIdRaw) && contestIdRaw > 0 ? contestIdRaw : null

  useEffect(() => {
    if (!contestId) {
      setContestRow(null)
      setContestErr(null)
      return
    }
    setContestErr(null)
    apiRequest<ContestDto>(`/contests/${contestId}`)
      .then(setContestRow)
      .catch((e) => setContestErr(e instanceof ApiError ? e.message : 'Could not load contest feed'))
  }, [contestId])

  const fallbackGameId = params.get('game') ?? DEFAULT_GAME_ID
  const gameId = contestRow ? contestGameToFrontendId(contestRow.game) : fallbackGameId
  const mode = contestRow ? poolTierToMode(contestRow.pool_tier) : params.get('mode') ?? 'Ranked'
  const game = getGameById(gameId)
  const modes = game?.modes ?? ['Ranked', 'Skirmish']
  const feedKind = useMemo(() => battlegroundKindForGame(gameId), [gameId])
  const arenaAgents = contestRow ? Math.max(2, Math.min(8, contestRow.filled_slots || 2)) : ARENA_SIM_AGENTS
  const sim = useMatchSimulation(arenaAgents, 2000)

  const chatter = useMemo(() => {
    const L = sim.leader
    const R = sim.runnerUp
    const mid = sim.ranked[Math.min(2, sim.ranked.length - 1)]
    return [
      `${L.name} leads at ${L.score} pts (${L.wins}W · ${L.losses}L)${L.lastResult === 'win' ? ' — last round win.' : L.lastResult === 'loss' ? ' — last round loss.' : '.'}`,
      `${R?.name ?? 'Runner-up'} sits #2 at ${R?.score ?? 0} pts; last mark ${R?.lastResult ?? 'idle'}.`,
      `${mid?.name ?? 'Pack'} holds mid-table at ${mid?.momentum ?? 0}% momentum as rotations continue.`,
    ]
  }, [sim.leader, sim.runnerUp, sim.ranked])

  function setGame(id: string) {
    if (contestRow) return
    const next = new URLSearchParams(params)
    next.set('game', id)
    const g = getGameById(id)
    if (g?.modes[0]) next.set('mode', g.modes[0])
    setParams(next)
  }

  function setMode(m: string) {
    if (contestRow) return
    const next = new URLSearchParams(params)
    next.set('mode', m)
    setParams(next)
  }

  return (
    <div>
      <PageHeader
        title="Live battleground"
        subtitle={
          contestRow
            ? `${game?.name ?? contestRow.game} · pool ${contestRow.pool_tier} · contest-linked Arena feed`
            : 'Pick a game — the main panel is a Three.js sim feed (demo). Matchmaking stays a stub.'
        }
        action={
          <div className="flex flex-wrap gap-2">
            {contestId ? (
              <Link
                to={`/contests/${contestId}/battle`}
                className="rounded-xl border border-border bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
              >
                Back to contest
              </Link>
            ) : null}
            <Link
              to="/contests"
              className="rounded-xl border border-border bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              Contests
            </Link>
            <button type="button" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
              Queue match
            </button>
          </div>
        }
      />

      {contestErr ? (
        <div className="mb-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{contestErr}</div>
      ) : null}

      <GlassCard className="mb-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-soft">
            Game
            <select
              value={gameId}
              onChange={(e) => setGame(e.target.value)}
              disabled={Boolean(contestRow)}
              className="mt-1.5 w-full rounded-xl border border-border bg-canvas px-3 py-2.5 text-sm text-fg outline-none focus:border-primary/40"
            >
              {GAMES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium uppercase tracking-wide text-fg-soft">
            Game mode
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              disabled={Boolean(contestRow)}
              className="mt-1.5 w-full rounded-xl border border-border bg-canvas px-3 py-2.5 text-sm text-fg outline-none focus:border-primary/40"
            >
              {modes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-3 text-xs text-fg-soft">
          Pool for <strong className="text-fg">{game?.name ?? 'this title'}</strong>:{' '}
          <span className="font-mono text-accent">{game?.rewardPool ?? '—'}</span>
          <span className="mx-2 text-border">·</span>
          <span className="text-fg-soft">
            Feed arena: <span className="text-secondary">{feedKind.replace(/-/g, ' ')}</span>
          </span>
        </p>
        {contestRow ? (
          <p className="mt-2 text-xs text-fg-soft">
            Contest #{contestRow.id} linked. Arena follows this pool game and uses {arenaAgents} simulated agents from
            joined slots.
          </p>
        ) : null}
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_380px]">
        {/* No `glass` / backdrop-blur here — WebGL often composites as black behind backdrop-filter (Chrome). */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-[#07090f] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
          <div className="pointer-events-none absolute inset-0 z-0 bg-linear-to-br from-primary/8 via-transparent to-secondary/8" />
          <div className="relative z-10 w-full bg-black">
            <div className="relative w-full overflow-hidden pt-[56.25%]">
              <BattlegroundCanvas
                key={`${gameId}-${feedKind}`}
                kind={feedKind}
                agentCount={arenaAgents}
                className="absolute inset-0 z-10 h-full w-full overflow-hidden border-0 bg-black"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-32 bg-linear-to-t from-canvas/55 to-transparent" />
              <div className="pointer-events-none absolute left-3 top-3 z-30 rounded-full bg-danger/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">
                Sim live
              </div>
              <div className="absolute bottom-0 left-0 right-0 z-30 p-3">
                <FeedAgentStrip ranked={sim.ranked} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-border bg-[#07090f] px-4 py-3">
            <button type="button" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-fg hover:text-white">
              Rewind 10s
            </button>
            <button type="button" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-fg hover:text-white">
              1×
            </button>
            <button type="button" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-fg hover:text-white">
              Heatmap
            </button>
            <span className="ml-auto text-xs text-fg-soft">Match ID · 8f3c…21ab</span>
          </div>
        </div>

        <div className="space-y-4">
          <GlassCard>
            <h3 className="text-sm font-semibold text-white">Reward mode</h3>
            <p className="mt-1 text-xs text-fg-soft">
              <TermTip term="Multiplier" tip="Boosts token drops for viewers during sponsored windows — caps apply." />{' '}
              shown before you opt in.
            </p>
            <div className="mt-3 rounded-xl border border-accent/25 bg-accent-dim p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-accent">Active window</div>
              <div className="mt-1 font-display text-2xl font-semibold text-white">1.4×</div>
              <div className="text-xs text-fg-soft">Caps at 2k credits / account / day.</div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">AI commentary</h3>
              <label className="flex items-center gap-2 text-xs text-fg-soft">
                <input type="checkbox" defaultChecked className="accent-primary" /> On
              </label>
            </div>
            <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm text-fg-soft">
              {chatter.map((line, i) => (
                <li key={i} className="rounded-lg bg-surface-2/70 px-3 py-2">
                  {line}
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <HowToPlayPanel gameLabel={game?.name ?? 'Game'} kind={feedKind} />
        </GlassCard>
        <GlassCard>
          <MatchScoreboard ranked={sim.ranked} />
        </GlassCard>
      </div>
    </div>
  )
}

function poolTierToMode(poolTier: string): string {
  const t = poolTier.toLowerCase()
  if (t === 'micro') return '5m pool'
  if (t === 'standard') return '10m pool'
  if (t === 'high') return '15m pool'
  return `${poolTier} pool`
}

function FeedAgentStrip({ ranked }: { ranked: SimAgent[] }) {
  const top = ranked.slice(0, 4)
  return (
    <div className="flex flex-wrap items-stretch justify-center gap-2 sm:justify-between">
      {top.map((a) => (
        <div
          key={a.id}
          className="min-w-[108px] max-w-[170px] flex-1 rounded-lg border border-white/10 bg-canvas/95 px-2.5 py-2 shadow-lg"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-[11px] font-semibold text-white">{a.name}</span>
            {a.lastResult === 'win' ? (
              <span className="shrink-0 text-[9px] font-bold uppercase text-success">Win</span>
            ) : a.lastResult === 'loss' ? (
              <span className="shrink-0 text-[9px] font-bold uppercase text-danger">Loss</span>
            ) : (
              <span className="shrink-0 text-[9px] text-fg-soft">—</span>
            )}
          </div>
          <div className="mt-0.5 font-mono text-sm font-semibold text-accent">{a.score}</div>
          <div className="text-[10px] text-fg-soft">
            {a.wins}W · {a.losses}L · rank by score
          </div>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-linear-to-r from-primary to-cyan-400" style={{ width: `${a.momentum}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
