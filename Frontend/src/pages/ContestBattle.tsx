import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApiError, apiRequest } from '../api/client'
import type { ContestDto } from '../api/types'
import { PageHeader } from '../components/PageHeader'
import { GlassCard } from '../components/GlassCard'
import { getGameById } from '../data/games'
import { BattlegroundCanvas } from '../battleground/BattlegroundCanvas'
import { HowToPlayPanel } from '../battleground/HowToPlayPanel'
import { MatchScoreboard } from '../battleground/MatchScoreboard'
import { battlegroundKindForGame, contestGameToFrontendId } from '../battleground/gameRouting'
import { useMatchSimulation } from '../battleground/useMatchSimulation'

export function ContestBattle() {
  const { contestId } = useParams()
  const id = Number(contestId || 0)
  const [row, setRow] = useState<ContestDto | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) {
      setErr('Invalid contest link.')
      return
    }
    setErr(null)
    apiRequest<ContestDto>(`/contests/${id}`)
      .then(setRow)
      .catch((e) => setErr(e instanceof ApiError ? e.message : 'Could not load contest'))
  }, [id])

  const feGame = row ? contestGameToFrontendId(row.game) : ''
  const meta = getGameById(feGame)
  const kind = battlegroundKindForGame(feGame)
  const agents = row ? Math.max(2, Math.min(8, row.filled_slots || 2)) : 2
  const sim = useMatchSimulation(agents, 2000)

  return (
    <div>
      <PageHeader
        title="Live battleground"
        subtitle={
          row
            ? `${meta?.name ?? row.game} · pool ${row.pool_tier} · simulated agent feed for this contest`
            : 'Loading contest…'
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              to="/contests"
              className="rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10"
            >
              Back to contests
            </Link>
            {row ? (
              <Link
                to={`/arena?contestId=${row.id}&game=${encodeURIComponent(feGame)}`}
                className="rounded-xl bg-secondary/90 px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
              >
                Same game · Arena feed
              </Link>
            ) : null}
          </div>
        }
      />

      {err ? (
        <div className="mb-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{err}</div>
      ) : null}

      {row && !err ? (
        <>
          <GlassCard className="mb-4 p-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <div className="text-xs text-fg-soft">Contest</div>
                <div className="font-mono text-white">#{row.id}</div>
              </div>
              <div>
                <div className="text-xs text-fg-soft">Status</div>
                <div className="text-fg">{row.status}</div>
              </div>
              <div>
                <div className="text-xs text-fg-soft">Agents in pool</div>
                <div className="text-fg">
                  {row.filled_slots}/{row.max_slots} joined
                </div>
              </div>
              <div>
                <div className="text-xs text-fg-soft">Environment</div>
                <div className="text-fg">{kind.replace(/-/g, ' ')} (Three.js)</div>
              </div>
            </div>
            <p className="mt-3 text-xs text-fg-soft">
              Visualization only — policies are not streamed from the server in this POC. Agent count follows slots
              filled.
            </p>
          </GlassCard>

          <BattlegroundCanvas kind={kind} agentCount={agents} />

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <GlassCard>
              <HowToPlayPanel gameLabel={meta?.name ?? row.game} kind={kind} />
            </GlassCard>
            <GlassCard>
              <MatchScoreboard ranked={sim.ranked} title="Contest pool · live scores (demo)" />
            </GlassCard>
          </div>

          <p className="mt-3 text-center text-xs text-fg-soft">
            Scores and W/L update on a timer for this POC; real contests would stream results from the API.
          </p>
        </>
      ) : null}
    </div>
  )
}
