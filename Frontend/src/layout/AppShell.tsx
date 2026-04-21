import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWalletBalance } from '../hooks/useWalletBalance'

const nav = [
  { to: '/', label: 'Home', end: true },
  { to: '/games', label: 'Games' },
  { to: '/contests', label: 'Contests' },
  { to: '/buy', label: 'Buy Agent' },
  { to: '/agents', label: 'My Agents' },
  { to: '/arena', label: 'Battleground' },
  { to: '/train', label: 'Train' },
  { to: '/vps', label: 'VPS Control' },
  { to: '/marketplace', label: 'Resale' },
  { to: '/wallet', label: 'Wallet' },
  { to: '/leaderboard', label: 'Ranks' },
  { to: '/settings', label: 'Settings' },
] as const

const mobileNav = [
  { to: '/', label: 'Home', end: true },
  { to: '/games', label: 'Games' },
  { to: '/contests', label: 'Pools' },
  { to: '/wallet', label: 'Wallet' },
  { to: '/agents', label: 'Agents' },
] as const

function Icon({
  name,
  className = 'h-5 w-5',
}: {
  name: 'home' | 'games' | 'contests' | 'buy' | 'shop' | 'agents' | 'arena' | 'train' | 'vps' | 'wallet' | 'rank' | 'settings' | 'spark'
  className?: string
}) {
  const common = { className, fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      )
    case 'games':
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <path d="M7 9v6M17 9v6" />
          <path d="M9 10h6v4H9zM6 12H4a2 2 0 0 0 2 2h1M18 12h2a2 2 0 0 1-2 2h-1" />
        </svg>
      )
    case 'contests':
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <path d="M8 21h8M12 17v4M7 4h10l-1 8H8L7 4Z" />
          <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1v1" />
        </svg>
      )
    case 'buy':
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          <path d="M5 9h14l-1 11H6L5 9Z" />
          <path d="M12 12v4M10 14h4" />
        </svg>
      )
    case 'shop':
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <path d="M3 9h18l-1.2 9.1A2 2 0 0 1 17.8 20H6.2a2 2 0 0 1-1.98-1.9L3 9Z" />
          <path d="M8 9V7a4 4 0 0 1 8 0v2" />
        </svg>
      )
    case 'agents':
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <rect x="5" y="4" width="6" height="10" rx="2" />
          <rect x="13" y="8" width="6" height="10" rx="2" />
          <path d="M8 20h12" />
        </svg>
      )
    case 'arena':
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      )
    case 'train':
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <path d="M6 20V10l6-4 6 4v10" />
          <path d="M10 20v-6h4v6" />
        </svg>
      )
    case 'vps':
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <rect x="4" y="4" width="16" height="6" rx="1" />
          <rect x="4" y="14" width="16" height="6" rx="1" />
          <path d="M8 7h2M8 17h2" />
        </svg>
      )
    case 'wallet':
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18" />
          <circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'rank':
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <path d="M8 21V10l-4 2v9M16 21V5l-4 2v14M12 21V3l4 2v16" />
        </svg>
      )
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )
    case 'spark':
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...common}>
          <path d="M12 3v4M12 17v4M4.5 7.5l3 1.8M16.5 14.7l3 1.8M3 12h4M17 12h4M7.5 16.5l1.8-3M14.7 7.5l1.8-3" />
        </svg>
      )
    default:
      return null
  }
}

function navIcon(to: string) {
  if (to === '/') return 'home'
  if (to === '/games') return 'games'
  if (to === '/contests') return 'contests'
  if (to === '/buy') return 'buy'
  if (to === '/marketplace') return 'shop'
  if (to === '/agents') return 'agents'
  if (to === '/arena') return 'arena'
  if (to === '/train') return 'train'
  if (to === '/vps') return 'vps'
  if (to === '/wallet') return 'wallet'
  if (to === '/leaderboard') return 'rank'
  return 'settings'
}

export function AppShell() {
  const loc = useLocation()
  const { user, loading: authLoading, logout } = useAuth()
  const { balance, loading: balLoading } = useWalletBalance()

  const creditsAmount = authLoading ? '…' : balLoading ? '…' : balance !== null ? balance.toLocaleString() : '—'
  const initials =
    user?.display_name?.slice(0, 2).toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    '—'

  return (
    <div className="flex min-h-dvh">
      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-border bg-surface/40 px-3 py-5 backdrop-blur-xl lg:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-secondary neon-edge">
            <Icon name="spark" className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-display text-lg font-semibold tracking-tight text-white">Agent Battleground</div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-fg-soft">AI Competition</div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5" aria-label="Main">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-dim text-white shadow-[inset_0_0_0_1px_rgba(45,123,255,0.35)]'
                    : 'text-fg-soft hover:bg-white/5 hover:text-fg',
                ].join(' ')
              }
            >
              <Icon name={navIcon(item.to) as Parameters<typeof Icon>[0]['name']} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p className="mt-auto text-xs text-fg-soft/90">Train agents, join pools, track credits in Wallet.</p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-canvas/80 px-4 py-3 backdrop-blur-xl lg:px-8">
          <div className="min-w-0 flex-1">
            <div className="font-display text-lg font-semibold text-white lg:hidden">ABG</div>
            <p className="hidden truncate text-sm text-fg-soft sm:block">String Agents environments · contests · training</p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {authLoading ? (
              <span className="rounded-xl border border-border px-3 py-2 text-xs text-fg-soft">…</span>
            ) : user ? (
              <>
                <NavLink
                  to="/wallet"
                  className="flex items-center gap-2 rounded-xl border border-accent/25 bg-accent-dim px-3 py-1.5"
                >
                  <span className="text-xs font-medium tracking-wide text-accent">credits</span>
                  <span className="font-mono text-sm font-semibold text-white">{creditsAmount}</span>
                </NavLink>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-medium text-fg-soft transition hover:border-danger/40 hover:text-danger"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <NavLink
                  to="/register"
                  className="rounded-xl border border-border bg-white/5 px-2.5 py-2 text-xs font-medium text-fg-soft transition hover:bg-white/10 sm:px-3 sm:text-sm"
                >
                  Register
                </NavLink>
                <NavLink
                  to="/login"
                  className="rounded-xl border border-accent/40 bg-accent/15 px-2.5 py-2 text-xs font-semibold text-accent transition hover:bg-accent/25 sm:px-3 sm:text-sm"
                >
                  Sign in
                </NavLink>
              </div>
            )}
            <NavLink
              to={user ? '/settings' : '/login'}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-sm font-semibold text-white"
              aria-label={user ? 'Account settings' : 'Sign in'}
            >
              {initials}
            </NavLink>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Outlet key={loc.pathname} />
        </main>
      </div>

      {/* Mobile bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-canvas/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl lg:hidden"
        aria-label="Mobile primary"
      >
        {mobileNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={'end' in item ? item.end : false}
            className={({ isActive }) =>
              [
                'flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium',
                isActive ? 'text-primary' : 'text-fg-soft',
              ].join(' ')
            }
          >
            <Icon name={navIcon(item.to) as Parameters<typeof Icon>[0]['name']} className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            [
              'flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium',
              isActive ? 'text-primary' : 'text-fg-soft',
            ].join(' ')
          }
        >
          <Icon name="settings" className="h-5 w-5" />
          More
        </NavLink>
      </nav>

    </div>
  )
}
