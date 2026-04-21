import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWalletBalance } from '../hooks/useWalletBalance'
import { ContestCountdown } from '../components/ContestCountdown'
import { GlassCard } from '../components/GlassCard'
import { ProgressBar } from '../components/ProgressBar'
import { TermTip } from '../components/TermTip'
import { DEFAULT_GAME_ID, GAMES } from '../data/games'

const quick = [
  { to: '/contests', label: 'Join next pool', desc: 'Timed contest pools', tone: 'from-secondary to-fuchsia-400' },
  { to: '/games', label: 'String Agents', desc: 'GridWorld, Walker, Soccer…', tone: 'from-primary to-cyan-400' },
  { to: `/train?game=${DEFAULT_GAME_ID}`, label: 'Train agent', desc: 'PPO / SAC on your VPS', tone: 'from-emerald-400 to-cyan-300' },
  { to: '/buy', label: 'Buy agent + VPS', desc: 'Contest access included', tone: 'from-accent to-amber-200' },
] as const

const recommended = GAMES.filter((g) => g.trending).slice(0, 3)

export function Home() {
  const { user, loading: authLoading } = useAuth()
  const { balance, loading: balLoading } = useWalletBalance()
  const liveBalance =
    authLoading || !user ? null : balLoading ? null : balance !== null ? balance.toLocaleString() : null

  return (
    <div>
      <section className="mb-8">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">Games · String Agents</h2>
            <p className="text-sm text-fg-soft">
              {GAMES.length} environments with timed contest pools — entry and prize split are shown before you join.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/games"
              className="rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10"
            >
              Open Games hub
            </Link>
            <Link
              to="/contests"
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_-8px_rgba(45,123,255,0.85)]"
            >
              Quick join pool
            </Link>
          </div>
        </div>
        <div className="-mx-1 flex gap-3 overflow-x-auto pb-2 pt-1 [scrollbar-width:thin]">
          {GAMES.map((g) => (
            <div
              key={g.id}
              className="min-w-[200px] max-w-[240px] shrink-0 rounded-2xl border border-border bg-surface-2/80 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-sm font-semibold text-white">{g.name}</span>
                {g.trending ? (
                  <span className="rounded bg-danger/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-danger">Hot</span>
                ) : null}
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-fg-soft">{g.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to={`/contests?game=${g.id}`}
                  className="rounded-lg bg-primary px-2.5 py-1 text-[11px] font-semibold text-white"
                >
                  Join pool
                </Link>
                <Link to={`/games/${g.id}`} className="rounded-lg border border-border px-2.5 py-1 text-[11px] text-fg-soft hover:text-white">
                  Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <GlassCard className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">Next contest window</h2>
            <p className="mt-1 text-sm text-fg-soft">
              Pools run on a schedule — lock in your agent before the countdown ends.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ContestCountdown initialSeconds={247} label="Locks in" />
            <Link
              to="/contests"
              className="rounded-xl bg-accent/90 px-5 py-2.5 text-sm font-semibold text-neutral-950 shadow-[0_0_20px_-8px_rgba(232,184,74,0.5)]"
            >
              Quick join
            </Link>
          </div>
        </GlassCard>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-display text-lg font-semibold text-white">Recommended contests</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {recommended.map((g) => (
            <GlassCard key={g.id} className="p-4" hover>
              <div className="text-xs font-medium uppercase tracking-wide text-primary">Popular</div>
              <div className="mt-1 font-display text-lg font-semibold text-white">{g.name}</div>
              <p className="mt-1 text-sm text-fg-soft">{g.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to={`/contests?game=${g.id}`} className="text-sm font-medium text-primary hover:underline">
                  View pools
                </Link>
                <span className="text-fg-soft">·</span>
                <Link to={`/train?game=${g.id}`} className="text-sm font-medium text-fg-soft hover:text-white">
                  Train
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="mb-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <GlassCard className="relative overflow-hidden p-6 lg:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Home · Command center</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Your battleground is live
            </h1>
            <p className="mt-2 max-w-xl text-fg-soft">
              Train agents, join <strong className="text-fg">timed contest pools</strong>, and use your included training slot. New here? See{' '}
              <TermTip term="Contest pool" tip="A timed window: join, pick your agent before lock, then results and payouts use the published rules." />{' '}
              for how pools work.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-border bg-surface-2/90 px-5 py-4">
                <div className="text-xs text-fg-soft">Wallet balance</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-semibold text-white">{liveBalance ?? '—'}</span>
                  <span className="text-sm font-medium text-accent">credits</span>
                </div>
                <div className="mt-2 text-xs text-fg-soft">{liveBalance ? 'Synced when signed in.' : 'Sign in to load your balance.'}</div>
              </div>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Momentum</h2>
              <span className="text-xs text-fg-soft">Season 04</span>
            </div>
            <p className="mt-1 text-sm text-fg-soft">Streaks reward consistency, not impulse.</p>
            <div className="mt-4 flex items-end gap-2">
              <span className="font-display text-5xl font-semibold text-glow text-white">7</span>
              <span className="pb-2 text-sm text-fg-soft">day streak</span>
            </div>
            <ProgressBar value={72} label="Season pass progress" tone="accent" className="mt-4" />
          </div>
          <Link
            to="/leaderboard"
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-white/5 py-2.5 text-sm font-medium text-white ring-1 ring-border transition hover:bg-white/10"
          >
            View seasonal ranks
          </Link>
        </GlassCard>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-display text-lg font-semibold text-white">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quick.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface-2/60 p-4 transition hover:border-primary/35"
            >
              <div
                className={`pointer-events-none absolute inset-0 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-40 bg-linear-to-br ${q.tone}`}
              />
              <div className="relative">
                <div className={`inline rounded-lg bg-linear-to-r ${q.tone} px-2 py-0.5 text-[11px] font-semibold text-canvas`}>
                  Go
                </div>
                <div className="mt-2 font-medium text-white">{q.label}</div>
                <div className="text-sm text-fg-soft">{q.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <GlassCard className="p-5">
          <h2 className="font-display text-lg font-semibold text-white">Arena & wallet</h2>
          <p className="mt-1 text-sm text-fg-soft">
            Watch matches in the arena, claim demo credits in the wallet, and check contests for live pools.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/arena"
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              Open arena
            </Link>
            <Link
              to="/wallet"
              className="rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10"
            >
              Wallet
            </Link>
            <Link
              to="/contests"
              className="rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10"
            >
              Contests
            </Link>
          </div>
        </GlassCard>
      </section>
    </div>
  )
}
