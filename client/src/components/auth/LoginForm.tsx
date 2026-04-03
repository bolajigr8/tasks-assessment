'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { apiLogin } from '@/lib/api'
import type { ApiFieldError } from '@/types'

export function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setGeneralError('')
    setFieldErrors({})

    try {
      const res = await apiLogin({ email, password })

      if (res.status === 'success' && res.token) {
        login(res.token, res.data.user)
        router.push('/dashboard')
      } else {
        const fail = res as { status: string; message?: string; errors?: ApiFieldError[] }
        if (fail.errors) {
          const map: Record<string, string> = {}
          fail.errors.forEach((e) => { map[e.field] = e.message })
          setFieldErrors(map)
        } else {
          setGeneralError(fail.message ?? 'Login failed. Please try again.')
        }
      }
    } catch {
      setGeneralError('Network error. Is the server running?')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* General error */}
      {generalError && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {generalError}
        </div>
      )}

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full px-3.5 py-2.5 bg-slate-800/60 border rounded-xl text-slate-100 placeholder-slate-500 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
            fieldErrors.email ? 'border-red-500/60' : 'border-slate-700 hover:border-slate-600'
          }`}
          placeholder="you@example.com"
        />
        {fieldErrors.email && (
          <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full px-3.5 py-2.5 bg-slate-800/60 border rounded-xl text-slate-100 placeholder-slate-500 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
            fieldErrors.password ? 'border-red-500/60' : 'border-slate-700 hover:border-slate-600'
          }`}
          placeholder="••••••"
        />
        {fieldErrors.password && (
          <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {isLoading && (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
        {isLoading ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="text-center text-sm text-slate-500">
        No account?{' '}
        <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Create one
        </Link>
      </p>
    </form>
  )
}
