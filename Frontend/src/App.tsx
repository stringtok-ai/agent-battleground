import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { Home } from './pages/Home'
import { BuyAgent } from './pages/BuyAgent'
import { GamesHub } from './pages/GamesHub'
import { GameDetail } from './pages/GameDetail'
import { Contests } from './pages/Contests'
const ContestBattle = lazy(() => import('./pages/ContestBattle').then((m) => ({ default: m.ContestBattle })))
import { Marketplace } from './pages/Marketplace'
import { MyAgents } from './pages/MyAgents'
import { Arena } from './pages/Arena'
import { TrainingLab } from './pages/TrainingLab'
import { VPS } from './pages/VPS'
import { Wallet } from './pages/Wallet'
import { Leaderboard } from './pages/Leaderboard'
import { Settings } from './pages/Settings'
import { Login } from './pages/Login'
import { Register } from './pages/Register'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<GamesHub />} />
        <Route path="/games/:gameId" element={<GameDetail />} />
        <Route
          path="/contests/:contestId/battle"
          element={
            <Suspense fallback={<div className="p-8 text-sm text-fg-soft">Loading battleground…</div>}>
              <ContestBattle />
            </Suspense>
          }
        />
        <Route path="/contests" element={<Contests />} />
        <Route path="/buy" element={<BuyAgent />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/agents" element={<MyAgents />} />
        <Route path="/arena" element={<Arena />} />
        <Route path="/train" element={<TrainingLab />} />
        <Route path="/vps" element={<VPS />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
