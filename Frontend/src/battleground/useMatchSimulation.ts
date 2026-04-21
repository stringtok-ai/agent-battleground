import { useCallback, useEffect, useMemo, useState } from 'react'
import type { BattlegroundKind } from './gameRouting'

export type SimAgent = {
  id: number
  name: string
  score: number
  wins: number
  losses: number
  /** Outcome of the latest scored round for this agent. */
  lastResult: 'win' | 'loss' | null
  momentum: number
}

const POOL_NAMES = [
  'Nebula-3',
  'Ironclad-v2',
  'Pulse Nine',
  'Quartz Drone',
  'Vector Fox',
  'Aurora-7',
  'Cobalt-X',
  'Sparkline',
] as const

function randInt(max: number) {
  return Math.floor(Math.random() * max)
}

function initAgents(n: number): SimAgent[] {
  const c = Math.max(2, Math.min(8, n))
  return Array.from({ length: c }, (_, i) => ({
    id: i,
    name: POOL_NAMES[i % POOL_NAMES.length],
    score: 40 + randInt(25),
    wins: randInt(4),
    losses: randInt(4),
    lastResult: null,
    momentum: 55 + randInt(35),
  }))
}

function tickAgents(prev: SimAgent[]): SimAgent[] {
  const next = prev.map((a) => ({
    ...a,
    lastResult: null as SimAgent['lastResult'],
  }))
  if (next.length < 2) return next
  let w = randInt(next.length)
  let l = randInt(next.length - 1)
  if (l >= w) l += 1
  const gain = 6 + randInt(14)
  next[w].wins += 1
  next[w].score += gain
  next[w].lastResult = 'win'
  next[l].losses += 1
  next[l].lastResult = 'loss'
  const sorted = [...next].sort((a, b) => b.score - a.score)
  sorted.forEach((row, rank) => {
    const a = next.find((x) => x.id === row.id)!
    a.momentum = Math.max(32, Math.min(98, 88 - rank * 9 + randInt(6)))
  })
  return next
}

export function useMatchSimulation(agentCount: number, tickMs = 2000) {
  const [agents, setAgents] = useState<SimAgent[]>(() => initAgents(agentCount))

  const reset = useCallback(() => {
    setAgents(initAgents(agentCount))
  }, [agentCount])

  useEffect(() => {
    setAgents(initAgents(agentCount))
  }, [agentCount])

  useEffect(() => {
    const id = window.setInterval(() => {
      setAgents((a) => tickAgents(a))
    }, tickMs)
    return () => window.clearInterval(id)
  }, [agentCount, tickMs])

  const ranked = useMemo(() => [...agents].sort((a, b) => b.score - a.score), [agents])
  const leader = ranked[0]
  const runnerUp = ranked[1]

  return { agents, ranked, leader, runnerUp, reset }
}

export function howToPlayLines(kind: BattlegroundKind, gameLabel: string): string[] {
  const g = gameLabel
  const common = [
    `You are watching **${g}** (spectator). This demo does not accept keyboard moves — agents are scripted.`,
    'Every ~2s a random **pair** is resolved: one **win** (+score), one **loss**. The table shows **W / L**, **total score**, and **last round**.',
    '**Momentum** is derived from rank so you can see who is pressing harder in the sim.',
    '3D layout is inspired by **Unity ML-Agents** example environments (same names / roles as the docs).',
  ]
  const by = {
    gridworld: [
      '**GridWorld**: checkerboard **cells**, **perimeter walls**, **green / red goal cubes**, and cube agents on a discrete grid (Unity-style top-down framing).',
    ],
    'push-block': [
      '**Push Block**: walled arena, **large brown block** (scaled like Unity’s `block_scale`), **green goal** zone — agents orbit the crate.',
    ],
    'wall-jump': [
      '**Wall Jump**: tall **gray wall**, stacked **platforms**, **green goal ledge** with marker — climb / jump metaphor.',
    ],
    'soccer-twos': [
      '**Soccer Twos**: **green pitch**, white **touchlines**, **halfway line**, **center circle**, **post goals**, patched **ball**, **blue vs red** teams.',
    ],
    'strikers-vs-goalie': [
      '**Strikers Vs Goalie**: **post goal** at one end, **blue striker cubes** vs a **larger gray goalie**, ball in the attacking half.',
    ],
    'food-collector': [
      '**Food Collector**: gray arena, many **green** and **red** spheres, **capsule agents**, and a forward **laser beam** (discrete shoot action in Unity).',
    ],
    'match-3': [
      '**Match 3**: **wood board** with an **8×8 sphere “gem”** grid (visual match to the puzzle board example).',
    ],
    walker: [
      '**Walker**: ramp + balance-style motion on the board — stands in for biped locomotion curricula.',
    ],
    crawler: [
      '**Crawler**: low, wide agents snake on the ground — multi-segment locomotion vibe from the docs.',
    ],
    worm: [
      '**Worm**: linked-segment style bodies following a path — simplified from the Unity worm chain idea.',
    ],
    pyramids: [
      '**Pyramids**: **sand floor**, **cyan switch**, **golden reward brick**, and **stacked brown brick pyramids** (ray-cast targets from the Unity scene).',
    ],
    sorter: [
      '**Sorter**: **conveyor strip** and three **rimmed sort bins** (blue / red / green) like the sorter conveyor metaphor.',
    ],
    'cooperative-push-block': [
      '**Cooperative Push Block**: **three block sizes** (group +1/+2/+3 reward hint) and one **shared green goal** with perimeter walls.',
    ],
  } satisfies Record<BattlegroundKind, string[]>
  return [...common, ...by[kind]]
}
