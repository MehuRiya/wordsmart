'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError('Invalid email or password')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 mb-4">
            <span className="text-3xl">📚</span>
          </div>
          <h1 className="text-3xl font-bold text-white">WordSmart</h1>
          <p className="text-slate-400 mt-1">IBA MBA Vocabulary Platform</p>
        </div>
        <div className="glass rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <h2 className="text-xl font-semibold text-slate-200 mb-6">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[rgba(15,15,26,0.8)] border border-[rgba(99,102,241,0.3)] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[rgba(15,15,26,0.8)] border border-[rgba(99,102,241,0.3)] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 text-center text-slate-400 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Register
            </Link>
          </div>
          <div className="mt-4 pt-4 border-t border-[rgba(99,102,241,0.15)]">
            <p className="text-xs text-slate-500 text-center mb-2">Demo credentials</p>
            <div className="flex gap-2 text-xs text-slate-400">
              <div className="flex-1 bg-[rgba(15,15,26,0.6)] rounded p-2 text-center">
                <div className="font-medium text-slate-300">Admin</div>
                <div>admin@wordsmart.com</div>
                <div>admin123</div>
              </div>
              <div className="flex-1 bg-[rgba(15,15,26,0.6)] rounded p-2 text-center">
                <div className="font-medium text-slate-300">Demo User</div>
                <div>demo@wordsmart.com</div>
                <div>demo123</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
