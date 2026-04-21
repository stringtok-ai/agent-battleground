import { PageHeader } from '../components/PageHeader'
import { GlassCard } from '../components/GlassCard'
import { ProgressBar } from '../components/ProgressBar'

const plans = [
  { name: 'Train-1', cpu: '4 vCPU', gpu: '—', ram: '16 GB', price: 0, tag: 'Included with agent', highlight: false },
  { name: 'Train-2', cpu: '8 vCPU', gpu: 'RTX 4080', ram: '32 GB', price: 39, tag: 'Popular upgrade', highlight: true },
  { name: 'Train-Pro', cpu: '16 vCPU', gpu: 'A100 40GB', ram: '128 GB', price: 149, tag: 'Esports tier', highlight: false },
] as const

export function VPS() {
  return (
    <div>
      <PageHeader
        title="VPS control center"
        subtitle="Compare training tiers and see sample slot usage (demo)."
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {plans.map((p) => (
          <GlassCard key={p.name} className={p.highlight ? 'ring-1 ring-primary/40' : ''} hover>
            {p.highlight ? (
              <div className="mb-2 inline rounded-full bg-primary-dim px-2 py-0.5 text-[11px] font-semibold text-primary">
                {p.tag}
              </div>
            ) : (
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-fg-soft">{p.tag}</div>
            )}
            <h3 className="font-display text-xl font-semibold text-white">{p.name}</h3>
            <ul className="mt-3 space-y-1 text-sm text-fg-soft">
              <li>{p.cpu}</li>
              <li>{p.gpu}</li>
              <li>{p.ram}</li>
            </ul>
            <div className="mt-4 font-mono text-2xl font-semibold text-white">
              {p.price === 0 ? 'Included' : `$${p.price}`}
              {p.price > 0 ? <span className="text-sm font-normal text-fg-soft">/mo add-on</span> : null}
            </div>
            <button
              type="button"
              className={`mt-4 w-full rounded-xl py-2.5 text-sm font-semibold ${
                p.highlight ? 'bg-primary text-white' : 'border border-border bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              {p.price === 0 ? 'Current default' : 'Upgrade slot'}
            </button>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <GlassCard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-white">Sample slot · Nebula-3</h2>
                <p className="text-sm text-fg-soft">Illustrative metrics for the demo.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-white hover:bg-white/5"
                >
                  Restart server
                </button>
                <button type="button" className="rounded-xl bg-secondary/90 px-4 py-2 text-sm font-semibold text-white">
                  Upgrade plan
                </button>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <ProgressBar value={61} label="CPU" tone="primary" />
              <ProgressBar value={88} label="GPU" tone="secondary" />
              <ProgressBar value={54} label="RAM" tone="accent" />
              <ProgressBar value={67} label="Storage" tone="success" />
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Job queue</h3>
              <span className="text-xs text-fg-soft">Next starts in 2m</span>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                { id: 'RL shard 5/7', st: 'Running', prog: 58 },
                { id: 'Eval vs baseline', st: 'Queued', prog: 0 },
                { id: 'Export replay pack', st: 'Queued', prog: 0 },
              ].map((j) => (
                <li key={j.id} className="rounded-xl border border-border bg-canvas/50 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-white">{j.id}</span>
                    <span className="text-xs font-medium text-primary">{j.st}</span>
                  </div>
                  {j.prog > 0 ? <ProgressBar value={j.prog} tone="primary" className="mt-2" /> : null}
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>

        <GlassCard className="flex flex-col">
          <h3 className="text-sm font-semibold text-white">Logs</h3>
          <div className="mt-2 flex-1 overflow-hidden rounded-xl border border-border bg-canvas font-mono text-[11px] leading-relaxed text-fg-soft">
            <div className="h-72 overflow-y-auto p-3">
              <div>[00:12:44] healthcheck ok</div>
              <div>[00:18:02] training job 9182 started</div>
              <div>[00:18:03] cuda graph capture enabled</div>
              <div>[00:24:11] autosave checkpoint</div>
              <div>[00:31:02] queue: eval job promoted</div>
            </div>
          </div>
          <button type="button" className="mt-3 rounded-xl border border-border py-2 text-sm text-fg hover:text-white">
            Export logs
          </button>
        </GlassCard>
      </div>
    </div>
  )
}
