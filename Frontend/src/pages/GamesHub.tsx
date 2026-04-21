import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { GlassCard } from '../components/GlassCard'
import { DEFAULT_GAME_ID, GAME_CATEGORIES, GAMES } from '../data/games'

function diffColor(d: string) {
  if (d === 'Casual') return 'border-success/35 bg-success/10 text-success'
  if (d === 'Standard') return 'border-primary/35 bg-primary-dim text-primary'
  if (d === 'Hard') return 'border-accent/35 bg-accent-dim text-accent'
  return 'border-secondary/35 bg-secondary-dim text-secondary'
}

export function GamesHub() {
  const [category, setCategory] = useState<string>('All')
  const trending = GAMES.filter((g) => g.trending)
  const fresh = GAMES.filter((g) => g.isNew)

  const filtered = useMemo(() => {
    if (category === 'All') return GAMES
    return GAMES.filter((g) => g.category === category)
  }, [category])

  return (
    <div>
      <PageHeader
        title="Games · String Agents"
        subtitle="Each game has its own contests and ratings. Open a card for rules and pool links."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              to="/buy"
              className="rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Buy agent + VPS
            </Link>
            <Link
              to="/contests"
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_-8px_rgba(45,123,255,0.8)]"
            >
              Join next pool
            </Link>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory('All')}
          className={
            category === 'All'
              ? 'rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white'
              : 'rounded-full border border-border bg-surface-2/80 px-3 py-1.5 text-xs font-medium text-fg-soft hover:text-white'
          }
        >
          All
        </button>
        {GAME_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={
              category === c
                ? 'rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white'
                : 'rounded-full border border-border bg-surface-2/80 px-3 py-1.5 text-xs font-medium text-fg-soft hover:text-white'
            }
          >
            {c}
          </button>
        ))}
      </div>

      <section className="mb-10">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-white">Trending environments</h2>
          <Link to={`/contests?game=${DEFAULT_GAME_ID}`} className="text-sm font-medium text-primary hover:underline">
            View pools for {GAMES[0].name}
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {trending.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 font-display text-lg font-semibold text-white">New releases</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {fresh.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-white">
          {category === 'All' ? 'All environments' : category}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filtered.map((g) => (
            <GameCard key={g.id} game={g} compact />
          ))}
        </div>
      </section>
    </div>
  )
}

function GameCard({ game, compact }: { game: (typeof GAMES)[number]; compact?: boolean }) {
  return (
    <GlassCard className="group relative overflow-hidden p-0">
      <div className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-primary/20 to-transparent opacity-90 transition group-hover:from-primary/30" />
      <div className="relative flex h-full flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${diffColor(game.difficulty)}`}>
            {game.difficulty}
          </span>
          <span className="rounded-full border border-border bg-canvas/60 px-2 py-0.5 text-[10px] font-medium text-fg-soft">
            {game.category}
          </span>
          {game.trending ? (
            <span className="rounded-full border border-danger/30 bg-danger/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-danger">
              Hot
            </span>
          ) : null}
          {game.isNew ? (
            <span className="rounded-full border border-secondary/35 bg-secondary-dim px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-secondary">
              New
            </span>
          ) : null}
        </div>
        <p className="mt-2 font-mono text-[10px] text-primary/90">{game.stringAgents}</p>
        <h3 className="mt-1 font-display text-xl font-semibold text-white">{game.name}</h3>
        <p className={`mt-1 text-sm text-fg-soft ${compact ? 'line-clamp-2' : ''}`}>{game.tagline}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-fg-soft">
          <span className="rounded-lg border border-border bg-canvas/50 px-2 py-1 font-mono text-fg">
            {game.rewardPool}
          </span>
          <span className="rounded-lg border border-border bg-canvas/50 px-2 py-1">
            {(game.agentsLive / 1000).toFixed(1)}k agents live
          </span>
        </div>
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <Link
            to={`/contests?game=${game.id}`}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-white shadow-[0_0_20px_-8px_rgba(45,123,255,0.8)] min-[360px]:flex-none min-[360px]:px-5"
          >
            Enter contest
          </Link>
          <Link
            to={`/games/${game.id}`}
            className="inline-flex items-center justify-center rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10"
          >
            Details
          </Link>
          <Link
            to={`/train?game=${game.id}`}
            className="inline-flex items-center justify-center rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10"
          >
            Train
          </Link>
        </div>
      </div>
    </GlassCard>
  )
}
