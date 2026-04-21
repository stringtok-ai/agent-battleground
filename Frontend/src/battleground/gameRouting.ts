import { GAMES } from '../data/games'
import { normalizeGameId } from '../lib/gameIds'

/** Map API contest `game` string to frontend catalog id (for routes and GAMES lookup). */
export function contestGameToFrontendId(backendGame: string): string {
  const g = backendGame.toLowerCase()
  if (g === 'pushblock') return 'push-block'
  if (g === 'soccertwos' || g === 'soccer_twos') return 'soccer-twos'
  if (g === 'foodcollector' || g === 'food_collector') return 'food-collector'
  if (g === 'strikersvsgoalie' || g === 'striker_vs_goalie') return 'strikers-vs-goalie'
  if (g === 'match3') return 'match-3'
  if (g === 'cooperativepushblock' || g === 'coop_push') return 'cooperative-push-block'
  return g
}

/** One Three.js “arena” per catalog game (names mirror Unity ML-Agents examples where applicable). */
export type BattlegroundKind = (typeof GAMES)[number]['id']

export function battlegroundKindForGame(frontendGameId: string): BattlegroundKind {
  const k = normalizeGameId(frontendGameId)
  const hit = GAMES.find((g) => normalizeGameId(g.id) === k)
  return (hit?.id ?? 'gridworld') as BattlegroundKind
}
