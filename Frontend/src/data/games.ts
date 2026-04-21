/** String Agents environments (classic curriculum-style naming). */
export type GameCategory = 'Grid & logic' | 'Locomotion' | 'Team sports' | 'Cooperative' | 'Collection'

export type GameMeta = {
  id: string
  name: string
  tagline: string
  blurb: string
  difficulty: 'Casual' | 'Standard' | 'Hard' | 'Pro'
  rewardPool: string
  /** Approx. agents in live contests + training (popularity proxy). */
  agentsLive: number
  trending: boolean
  isNew: boolean
  modes: readonly string[]
  category: GameCategory
  /** Shown on cards for trust / education. */
  stringAgents: string
}

export const GAMES = [
  {
    id: 'gridworld',
    name: 'GridWorld',
    tagline: 'Sparse rewards · grid navigation',
    blurb: 'Classic discrete grid navigation. Great for curriculum starts and policy debugging before harder locomotion.',
    difficulty: 'Casual',
    rewardPool: 'Contests live',
    agentsLive: 18200,
    trending: true,
    isNew: false,
    modes: ['5m pool', '10m pool', '15m pool'],
    category: 'Grid & logic',
    stringAgents: 'String Agents · GridWorld',
  },
  {
    id: 'push-block',
    name: 'Push Block',
    tagline: 'Push goal blocks into targets',
    blurb: 'Continuous control pushing task. Teaches contact-rich manipulation and shaping-friendly rewards.',
    difficulty: 'Standard',
    rewardPool: 'Contests live',
    agentsLive: 9400,
    trending: true,
    isNew: false,
    modes: ['5m pool', '10m pool', '15m pool'],
    category: 'Grid & logic',
    stringAgents: 'String Agents · Push Block',
  },
  {
    id: 'wall-jump',
    name: 'Wall Jump',
    tagline: 'Timing · platforming skill',
    blurb: 'Requires burst actions and timing. Strong agents show high success on wall clears without jitter.',
    difficulty: 'Hard',
    rewardPool: 'Contests live',
    agentsLive: 6200,
    trending: false,
    isNew: false,
    modes: ['5m pool', '10m pool'],
    category: 'Locomotion',
    stringAgents: 'String Agents · Wall Jump',
  },
  {
    id: 'soccer-twos',
    name: 'Soccer Twos',
    tagline: '2v2 micro-football',
    blurb: 'Team-based sparse rewards with clear roles. Separate per-game Elo and contest ladders.',
    difficulty: 'Standard',
    rewardPool: 'Contests live',
    agentsLive: 15100,
    trending: true,
    isNew: false,
    modes: ['5m pool', '10m pool', '15m pool'],
    category: 'Team sports',
    stringAgents: 'String Agents · Soccer Twos',
  },
  {
    id: 'strikers-vs-goalie',
    name: 'Strikers Vs Goalie',
    tagline: 'Asymmetric roles · shot vs save',
    blurb: 'One striker policy vs goalie reactions. Ideal for role-conditioned training and imitation baselines.',
    difficulty: 'Hard',
    rewardPool: 'Contests live',
    agentsLive: 7800,
    trending: false,
    isNew: false,
    modes: ['5m pool', '10m pool'],
    category: 'Team sports',
    stringAgents: 'String Agents · Strikers vs Goalie',
  },
  {
    id: 'food-collector',
    name: 'Food Collector',
    tagline: 'Forage · avoid hazards',
    blurb: 'Dense shaping possible; good beginner contest ladder with readable win conditions.',
    difficulty: 'Casual',
    rewardPool: 'Contests live',
    agentsLive: 11000,
    trending: false,
    isNew: false,
    modes: ['5m pool', '10m pool', '15m pool'],
    category: 'Collection',
    stringAgents: 'String Agents · Food Collector',
  },
  {
    id: 'match-3',
    name: 'Match 3',
    tagline: 'Combinatorial moves · long chains',
    blurb: 'Large discrete action space. Rewards patience and lookahead — separate contest RNG seed each window.',
    difficulty: 'Pro',
    rewardPool: 'Contests live',
    agentsLive: 5300,
    trending: false,
    isNew: true,
    modes: ['10m pool', '15m pool'],
    category: 'Grid & logic',
    stringAgents: 'String Agents · Match3',
  },
  {
    id: 'walker',
    name: 'Walker',
    tagline: 'Balance · forward locomotion',
    blurb: 'Continuous control biped. High skill ceiling for PPO/SAC style policies on your bundled VPS.',
    difficulty: 'Standard',
    rewardPool: 'Contests live',
    agentsLive: 8900,
    trending: true,
    isNew: false,
    modes: ['5m pool', '10m pool', '15m pool'],
    category: 'Locomotion',
    stringAgents: 'String Agents · Walker',
  },
  {
    id: 'crawler',
    name: 'Crawler',
    tagline: 'Multi-limb coordination',
    blurb: 'Harder locomotion than Walker; rewards smooth gait discovery and energy-efficient strides.',
    difficulty: 'Hard',
    rewardPool: 'Contests live',
    agentsLive: 4100,
    trending: false,
    isNew: false,
    modes: ['10m pool', '15m pool'],
    category: 'Locomotion',
    stringAgents: 'String Agents · Crawler',
  },
  {
    id: 'worm',
    name: 'Worm',
    tagline: 'Serpentine body control',
    blurb: 'Snake-like continuous control. Great showcase for spectators — dramatic recoveries.',
    difficulty: 'Hard',
    rewardPool: 'Contests live',
    agentsLive: 3600,
    trending: false,
    isNew: true,
    modes: ['5m pool', '10m pool'],
    category: 'Locomotion',
    stringAgents: 'String Agents · Worm',
  },
  {
    id: 'pyramids',
    name: 'Pyramids',
    tagline: 'Keys · doors · sparse success',
    blurb: 'Exploration-heavy sparse rewards. Contests use fixed episode caps and published map seeds.',
    difficulty: 'Pro',
    rewardPool: 'Contests live',
    agentsLive: 2900,
    trending: false,
    isNew: false,
    modes: ['15m pool', 'Custom cups'],
    category: 'Grid & logic',
    stringAgents: 'String Agents · Pyramids',
  },
  {
    id: 'sorter',
    name: 'Sorter',
    tagline: 'Sort objects into bins',
    blurb: 'Structured manipulation with clear success metrics — friendly for fantasy-sports style scoring boards.',
    difficulty: 'Casual',
    rewardPool: 'Contests live',
    agentsLive: 6700,
    trending: false,
    isNew: false,
    modes: ['5m pool', '10m pool'],
    category: 'Grid & logic',
    stringAgents: 'String Agents · Sorter',
  },
  {
    id: 'cooperative-push-block',
    name: 'Cooperative Push Block',
    tagline: 'Multi-agent coordination',
    blurb: 'Requires joint behavior. Elite pools often show curated teammate bots with fixed comms limits.',
    difficulty: 'Pro',
    rewardPool: 'Contests live',
    agentsLive: 2200,
    trending: false,
    isNew: false,
    modes: ['10m pool', '15m pool', 'Custom cups'],
    category: 'Cooperative',
    stringAgents: 'String Agents · Cooperative Push Block',
  },
] as const satisfies readonly GameMeta[]

export const DEFAULT_GAME_ID: string = GAMES[0].id

export const GAME_CATEGORIES: readonly GameCategory[] = [
  'Grid & logic',
  'Locomotion',
  'Team sports',
  'Cooperative',
  'Collection',
] as const

export function getGameById(id: string | undefined): GameMeta | undefined {
  return GAMES.find((g) => g.id === id)
}
