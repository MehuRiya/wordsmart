'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface AdminData {
  users: Array<{
    id: string
    name: string | null
    email: string
    role: string
    createdAt: string
    _count: { progress: number; quizAttempts: number; bookmarks: number }
    streak: { currentStreak: number; longestStreak: number } | null
  }>
  totalWords: number
  totalQuizAttempts: number
}

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session && session.user.role !== 'admin') {
      router.push('/')
    }
  }, [session, router])

  useEffect(() => {
    fetch('/api/admin')
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-indigo-400 animate-pulse">Loading admin data...</div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">Platform overview and user management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: data.users.length, icon: '👥', color: 'text-indigo-400' },
          { label: 'Total Words', value: data.totalWords, icon: '📚', color: 'text-purple-400' },
          { label: 'Quiz Attempts', value: data.totalQuizAttempts, icon: '🧠', color: 'text-emerald-400' },
          {
            label: 'Active Users',
            value: data.users.filter((u) => u._count.progress > 0).length,
            icon: '⚡',
            color: 'text-amber-400',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="card text-center"
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden p-0">
        <div className="p-6 border-b border-[rgba(99,102,241,0.2)]">
          <h2 className="font-semibold text-slate-200">Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(99,102,241,0.15)]">
                <th className="px-6 py-3 text-left text-slate-400 font-medium">User</th>
                <th className="px-6 py-3 text-left text-slate-400 font-medium">Role</th>
                <th className="px-6 py-3 text-center text-slate-400 font-medium">Progress</th>
                <th className="px-6 py-3 text-center text-slate-400 font-medium">Quizzes</th>
                <th className="px-6 py-3 text-center text-slate-400 font-medium">Bookmarks</th>
                <th className="px-6 py-3 text-center text-slate-400 font-medium">Streak</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[rgba(99,102,241,0.1)] hover:bg-[rgba(99,102,241,0.05)] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-300">
                        {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-200">{user.name || '—'}</div>
                        <div className="text-slate-500 text-xs">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-300">{user._count.progress}</td>
                  <td className="px-6 py-4 text-center text-slate-300">{user._count.quizAttempts}</td>
                  <td className="px-6 py-4 text-center text-slate-300">{user._count.bookmarks}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-orange-400">
                      🔥 {user.streak?.currentStreak || 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
