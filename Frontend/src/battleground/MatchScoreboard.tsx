import type { SimAgent } from './useMatchSimulation'

type Props = {
  ranked: SimAgent[]
  title?: string
}

export function MatchScoreboard({ ranked, title = 'Live scores (demo sim)' }: Props) {
  return (
    <div>
      <h3 className="font-display text-base font-semibold text-white">{title}</h3>
      <p className="mt-1 text-xs text-fg-soft">
        Sorted by score. <span className="text-fg">W</span> = rounds won, <span className="text-fg">L</span> = rounds lost.
      </p>
      <div className="mt-3 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-border bg-surface-2/80 text-xs uppercase tracking-wide text-fg-soft">
            <tr>
              <th className="px-3 py-2 font-medium">#</th>
              <th className="px-3 py-2 font-medium">Agent</th>
              <th className="px-3 py-2 font-medium text-right">Score</th>
              <th className="px-3 py-2 font-medium text-right">W</th>
              <th className="px-3 py-2 font-medium text-right">L</th>
              <th className="px-3 py-2 font-medium">Last round</th>
              <th className="px-3 py-2 font-medium">Momentum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ranked.map((a, i) => (
              <tr key={a.id} className={i === 0 ? 'bg-primary-dim/30' : 'bg-canvas/30'}>
                <td className="px-3 py-2.5 font-mono text-fg-soft">{i + 1}</td>
                <td className="px-3 py-2.5 font-medium text-white">
                  {a.name}
                  {i === 0 ? (
                    <span className="ml-2 rounded bg-accent/25 px-1.5 py-0.5 text-[10px] font-bold uppercase text-accent">
                      Leader
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-accent">{a.score}</td>
                <td className="px-3 py-2.5 text-right font-mono text-success">{a.wins}</td>
                <td className="px-3 py-2.5 text-right font-mono text-danger">{a.losses}</td>
                <td className="px-3 py-2.5">
                  {a.lastResult === 'win' ? (
                    <span className="text-success">Win</span>
                  ) : a.lastResult === 'loss' ? (
                    <span className="text-danger">Loss</span>
                  ) : (
                    <span className="text-fg-soft">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <div className="h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-primary to-cyan-400"
                      style={{ width: `${a.momentum}%` }}
                    />
                  </div>
                  <span className="mt-0.5 block font-mono text-[10px] text-fg-soft">{a.momentum}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
