'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@/types'
import { apiGetMe, apiLogout } from '@/lib/api'

//  Shape

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => Promise<void>
}

//  Context

const AuthContext = createContext<AuthContextValue | null>(null)

//  Provider

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true) // true until we validate the stored token
  const router = useRouter()

  // On mount: read token from localStorage and validate it
  useEffect(() => {
    const stored = localStorage.getItem('tm_token')
    if (!stored) {
      setIsLoading(false)
      return
    }

    // Validate the stored token with the backend
    apiGetMe(stored)
      .then((res) => {
        if (res.status === 'success') {
          setToken(stored)
          setUser(res.data.user)
        } else {
          // Token is stale / rejected — clear it
          localStorage.removeItem('tm_token')
        }
      })
      .catch(() => {
        localStorage.removeItem('tm_token')
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('tm_token', newToken)
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(async () => {
    if (token) {
      try {
        await apiLogout(token)
      } catch {
        // Ignore errors — clear client state regardless
      }
    }
    localStorage.removeItem('tm_token')
    setToken(null)
    setUser(null)
    router.push('/login')
  }, [token, router])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

//  Hook

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
