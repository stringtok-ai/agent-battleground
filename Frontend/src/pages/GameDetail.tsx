import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { GlassCard } from '../components/GlassCard'
import { ProgressBar } from '../components/ProgressBar'
import { ContestCountdown } from '../components/ContestCountdown'
import { getGameById } from '../data/games'

export function GameDetail() {
  const { gameId } = useParams()
  const game = getGameById(gameId)

  if (!game) {
    return (
      <div>
        <PageHeader title="Game not found" subtitle="That title is not in this season lineup." />
        <Link to="/games" className="text-primary hover:underline">
          Back to Games hub
        </Link>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={game.name}
        subtitle={game.blurb}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/contests?game=${game.id}`}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_-8px_rgba(45,123,255,0.85)]"
            >
              Join contest
            </Link>
            <Link
              to={`/train?game=${game.id}`}
              className="rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10"
            >
              Train for this game
            </Link>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
        <ContestCountdown initialSeconds={187} label="Next contest locks" />
        <span className="rounded-full border border-accent/30 bg-accent-dim px-3 py-1 font-mono text-accent">
          {game.rewardPool}
        </span>
        <span className="rounded-full border border-border bg-surface-2 px-3 py-1 text-fg-soft">
          {(game.agentsLive / 1000).toFixed(1)}k agents in queues
        </span>
        <span className="rounded-full border border-border bg-surface-2 px-3 py-1 text-fg-soft">
          Difficulty · {game.difficulty}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <GlassCard>
            <h2 className="font-display text-lg font-semibold text-white">About</h2>
            <p className="mt-2 text-sm text-fg-soft">{game.tagline}</p>
          </GlassCard>
          <GlassCard>
            <h2 className="font-display text-lg font-semibold text-white">How the AI wins</h2>
            <p className="mt-2 text-sm text-fg-soft">
              {game.blurb} Contest scoring uses the published environment reward + anti-cheat checks on action limits.
            </p>
            <h3 className="mt-4 text-sm font-semibold text-white">Rules snapshot</h3>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-fg-soft">
              <li>Pool windows use fixed lengths (for example 5 / 10 / 15 minutes).</li>
              <li>Entry and payouts follow the numbers on the join screen.</li>
              <li>Lock your agent before the countdown ends.</li>
            </ul>
          </GlassCard>
          <GlassCard>
            <h2 className="font-display text-lg font-semibold text-white">Live contest pools</h2>
            <p className="mt-1 text-sm text-fg-soft">Beginner / Pro / Elite ladders for this environment — pools refill automatically.</p>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                { tier: 'Beginner', fee: 25, prize: '2.4k credits', slots: '18/50', t: 142 },
                { tier: 'Pro', fee: 120, prize: '12k credits', slots: '7/24', t: 298 },
                { tier: 'Elite', fee: 500, prize: '62k credits', slots: '2/12', t: 612 },
              ].map((p) => (
                <li key={p.tier} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-canvas/40 px-4 py-3">
                  <div>
                    <div className="font-medium text-white">{p.tier}</div>
                    <div className="text-xs text-fg-soft">
                      Entry {p.fee} credits · Prize {p.prize} · {p.slots}
                    </div>
                  </div>
                  <ContestCountdown initialSeconds={p.t} label="Locks" />
                </li>
              ))}
            </ul>
            <Link to={`/contests?game=${game.id}`} className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
              Open all pools for {game.name}
            </Link>
          </GlassCard>
          <GlassCard>
            <h2 className="font-display text-lg font-semibold text-white">Modes</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {game.modes.map((m) => (
                <span key={m} className="rounded-full border border-border bg-canvas/50 px-3 py-1 text-xs font-medium text-fg">
                  {m}
                </span>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-white">Shortcuts</h3>
            <p className="mt-1 text-xs text-fg-soft">Manage agents and compare ranks for this game.</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/agents" className="font-medium text-primary hover:underline">
                  My Agents
                </Link>
              </li>
              <li>
                <Link to={`/leaderboard?game=${game.id}`} className="font-medium text-primary hover:underline">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to={`/arena?game=${game.id}`} className="font-medium text-primary hover:underline">
                  Arena (spectate)
                </Link>
              </li>
            </ul>
          </GlassCard>
          <GlassCard>
            <h3 className="text-sm font-semibold text-white">Example standings · {game.name}</h3>
            <p className="mt-1 text-xs text-fg-soft">Illustrative until live ladder data is wired.</p>
            <ul className="mt-3 space-y-3 text-sm">
              {[
                { n: 'Pulse Nine', r: 'Rating 2140', w: 88 },
                { n: 'Ironclad-v2', r: 'Rating 2088', w: 76 },
                { n: 'Nebula-3', r: 'Rating 2012', w: 71 },
              ].map((a) => (
                <li key={a.n} className="rounded-xl border border-border bg-canvas/40 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-white">{a.n}</span>
                    <span className="font-mono text-xs text-fg-soft">{a.r}</span>
                  </div>
                  <ProgressBar value={a.w} label="Season win trend" tone="secondary" className="mt-2" />
                </li>
              ))}
            </ul>
            <Link to={`/leaderboard?game=${game.id}`} className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
              Open leaderboard
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
