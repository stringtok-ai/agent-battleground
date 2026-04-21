import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { GlassCard } from '../components/GlassCard'
import { ProgressBar } from '../components/ProgressBar'
import { TermTip } from '../components/TermTip'

const chips = ['All games', 'Beginner', 'Under 2k credits', 'Rentable'] as const

const agents = [
  { name: 'Nebula-3', rarity: 'Epic', wr: 62, iq: 118, agg: 34, price: 1840, rent: 120 },
  { name: 'Ironclad-v2', rarity: 'Rare', wr: 54, iq: 102, agg: 71, price: 920, rent: 65 },
  { name: 'Pulse Nine', rarity: 'Legendary', wr: 58, iq: 126, agg: 48, price: 5200, rent: 310 },
  { name: 'Quartz Drone', rarity: 'Common', wr: 49, iq: 94, agg: 22, price: 210, rent: 18 },
] as const

export function Marketplace() {
  return (
    <div>
      <PageHeader
        title="Resale"
        subtitle="Sample peer listings (demo). New bundles with a training slot are on Buy Agent."
        action={
          <Link
            to="/buy"
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_-8px_rgba(45,123,255,0.75)]"
          >
            Buy Agent + VPS
          </Link>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            className="rounded-full border border-border bg-surface-2/80 px-3 py-1.5 text-xs font-medium text-fg-soft transition hover:border-primary/40 hover:text-white"
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {agents.map((a) => (
          <GlassCard key={a.name} className="group relative overflow-hidden p-0">
            <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-primary/25 to-transparent opacity-80 transition group-hover:opacity-100" />
            <div className="relative p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-secondary">{a.rarity}</div>
                  <h3 className="mt-1 font-display text-xl font-semibold text-white">{a.name}</h3>
                </div>
                <div className="rounded-lg border border-accent/30 bg-accent-dim px-2 py-1 text-[11px] font-semibold text-accent">
                  Resale
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-fg-soft">
                    <TermTip term="Win rate" tip="Rolling 30-day live matches; not simulated." />
                  </dt>
                  <dd className="font-mono text-white">{a.wr}% ±4</dd>
                </div>
                <div>
                  <dt className="text-fg-soft">
                    <TermTip term="IQ score" tip="Composite skill rating from benchmarks + arena Elo." />
                  </dt>
                  <dd className="font-mono text-white">{a.iq}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-fg-soft">
                    <TermTip term="Aggression" tip="How often the policy takes high-variance commits." />
                  </dt>
                  <dd className="mt-1">
                    <ProgressBar value={a.agg} tone="secondary" />
                  </dd>
                </div>
              </dl>
              <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                <div>
                  <div className="text-xs text-fg-soft">Buy now</div>
                  <div className="font-mono text-lg font-semibold text-white">{a.price.toLocaleString()} credits</div>
                  <div className="text-xs text-fg-soft">Rent from {a.rent} credits / day</div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-[0_0_24px_-6px_rgba(45,123,255,0.7)] transition hover:brightness-110"
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-border bg-white/5 px-4 py-2 text-sm font-medium text-fg hover:text-white"
                  >
                    Rent
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
