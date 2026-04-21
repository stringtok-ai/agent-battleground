import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiRequest, clearTokens, getAccessToken, getRefreshToken, setTokens } from '../api/client'
import type { UserMe } from '../api/types'

type AuthContextValue = {
  user: UserMe | null
  loading: boolean
  ready: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName?: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserMe | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      setUser(null)
      return
    }
    try {
      const me = await apiRequest<UserMe>('/auth/me')
      setUser(me)
    } catch {
      setUser(null)
      clearTokens()
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        await refreshUser()
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await apiRequest<{ access_token: string; refresh_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setTokens(tokens.access_token, tokens.refresh_token)
    await refreshUser()
  }, [refreshUser])

  const register = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const tokens = await apiRequest<{ access_token: string; refresh_token: string; token_type: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, display_name: displayName || null }),
      })
      setTokens(tokens.access_token, tokens.refresh_token)
      await refreshUser()
    },
    [refreshUser],
  )

  const logout = useCallback(async () => {
    const refresh = getRefreshToken()
    if (refresh) {
      try {
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refresh }),
        })
      } catch {
        /* ignore */
      }
    }
    clearTokens()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      ready: !loading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
