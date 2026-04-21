import { useEffect, useState } from 'react'
import { apiRequest } from '../api/client'
import type { WalletBalance } from '../api/types'
import { useAuth } from '../context/AuthContext'

export function useWalletBalance() {
  const { user, ready } = useAuth()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!ready) return
    if (!user) {
      setBalance(null)
      setLoading(false)
      return
    }
    let alive = true
    setLoading(true)
    apiRequest<WalletBalance>('/wallet/balance')
      .then((w) => {
        if (alive) setBalance(w.balance_cents)
      })
      .catch(() => {
        if (alive) setBalance(null)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [user, ready])

  return { balance, loading }
}
