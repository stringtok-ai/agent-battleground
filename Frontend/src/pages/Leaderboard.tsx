import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { GlassCard } from '../components/GlassCard'
import { DEFAULT_GAME_ID, GAMES, getGameById } from '../data/games'

export function Leaderboard() {
  const [params, setParams] = useSearchParams()
  const gameId = params.get('game') ?? DEFAULT_GAME_ID
  const game = getGameById(gameId)
  const scope = params.get('game') ? 'game' : 'global'

  function setGame(id: string) {
    const next = new URLSearchParams(params)
    next.set('game', id)
    setParams(next)
  }

  return (
    <div>
      <PageHeader
        title="Leaderboards"
        subtitle={
          scope === 'global'
            ? 'Overall standings across games (demo layout).'
            : `Standings for ${game?.name ?? 'this game'} only.`
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            const next = new URLSearchParams(params)
            next.delete('game')
            setParams(next)
          }}
          className={
            scope === 'global'
              ? 'rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white'
              : 'rounded-full border border-border bg-white/5 px-4 py-2 text-sm font-medium text-fg-soft hover:text-white'
          }
        >
          Global
        </button>
        <button
          type="button"
          onClick={() => {
            const next = new URLSearchParams(params)
            if (!next.get('game')) next.set('game', DEFAULT_GAME_ID)
            setParams(next)
          }}
          className={
            scope === 'game'
              ? 'rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white'
              : 'rounded-full border border-border bg-white/5 px-4 py-2 text-sm font-medium text-fg-soft hover:text-white'
          }
        >
          Per-game
        </button>
        {scope === 'game' ? (
          <select
            value={gameId}
            onChange={(e) => setGame(e.target.value)}
            className="rounded-full border border-border bg-canvas px-4 py-2 text-sm text-fg outline-none focus:border-primary/40"
          >
            {GAMES.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(['Top agents', 'Top owners', 'Top trainers', 'Seasonal'] as const).map((t, i) => (
          <button
            key={t}
            type="button"
            className={
              i === 0
                ? 'rounded-full border border-primary/40 bg-primary-dim px-4 py-2 text-sm font-medium text-white'
                : 'rounded-full border border-border bg-white/5 px-4 py-2 text-sm font-medium text-fg-soft hover:text-white'
            }
          >
            {t}
          </button>
        ))}
      </div>

      <GlassCard className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-fg-soft">
              <tr className="border-b border-border">
                <th className="px-5 py-3 font-medium">#</th>
                <th className="px-5 py-3 font-medium">{scope === 'global' ? 'Agent / owner' : 'Agent'}</th>
                <th className="px-5 py-3 font-medium">Metric</th>
                <th className="px-5 py-3 font-medium">Δ 7d</th>
                <th className="px-5 py-3 font-medium text-right">Reward share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(scope === 'global'
                ? [
                    { r: 1, n: 'Pulse Nine', m: 'Global rating 1840', d: '+32', s: '8.1%', you: false },
                    { r: 2, n: 'Nebula-3', m: 'Global rating 1792', d: '+18', s: '6.4%', you: false },
                    { r: 3, n: 'Ironclad-v2', m: 'Global rating 1760', d: '-4', s: '5.9%', you: false },
                    { r: 42, n: 'Your roster', m: 'Global rating 1521', d: '+6', s: '0.4%', you: true },
                  ]
                : [
                    { r: 1, n: 'Pulse Nine', m: `${game?.name ?? 'Game'} Elo 2140`, d: '+12', s: '9.2%', you: false },
                    { r: 2, n: 'Nebula-3', m: `${game?.name ?? 'Game'} Elo 2012`, d: '+4', s: '7.1%', you: false },
                    { r: 3, n: 'Ironclad-v2', m: `${game?.name ?? 'Game'} Elo 1980`, d: '-2', s: '6.0%', you: false },
                    { r: 18, n: 'You', m: `${game?.name ?? 'Game'} Elo 1650`, d: '+9', s: '1.1%', you: true },
                  ]
              ).map((row) => (
                <tr
                  key={row.r + row.n}
                  className={row.you ? 'bg-primary-dim/50 ring-1 ring-inset ring-primary/25' : 'hover:bg-white/[0.02]'}
                >
                  <td className="px-5 py-4 font-mono text-fg-soft">{row.r}</td>
                  <td className="px-5 py-4 font-medium text-white">{row.n}</td>
                  <td className="px-5 py-4 text-fg-soft">{row.m}</td>
                  <td className={`px-5 py-4 font-mono ${row.d.startsWith('+') ? 'text-success' : 'text-danger'}`}>{row.d}</td>
                  <td className="px-5 py-4 text-right font-mono text-fg">{row.s}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
