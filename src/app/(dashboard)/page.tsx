'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Stats {
  totalWords: number
  learned: number
  weak: number
  bookmarkCount: number
  streak: number
  longestStreak: number
  accuracy: number
  totalQuizAttempts: number
  recentProgress: Array<{
    id: string
    status: string
    lastSeen: string
    word: { word: string; partOfSpeech: string }
  }>
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const pct = stats ? Math.round((stats.learned / stats.totalWords) * 100) : 0

  const statCards = stats
    ? [
        { label: 'Total Words', value: stats.totalWords, icon: '📚', color: 'text-indigo-400' },
        { label: 'Mastered', value: stats.learned, icon: '✅', color: 'text-emerald-400' },
        { label: 'Weak Words', value: stats.weak, icon: '⚡', color: 'text-amber-400' },
        { label: 'Bookmarks', value: stats.bookmarkCount, icon: '🔖', color: 'text-purple-400' },
        { label: 'Day Streak', value: stats.streak, icon: '🔥', color: 'text-orange-400' },
        { label: 'Quiz Accuracy', value: `${stats.accuracy}%`, icon: '🎯', color: 'text-cyan-400' },
      ]
    : []

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {session?.user?.name || 'Learner'} 👋
        </h1>
        <p className="text-slate-400 mt-1">Keep up the momentum on your IBA MBA prep journey</p>
      </motion.div>

      {/* Progress Overview */}
      {!loading && stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-slate-200">Overall Progress</h2>
              <p className="text-slate-400 text-sm mt-0.5">
                {stats.learned} of {stats.totalWords} words mastered
              </p>
            </div>
            <span className="text-3xl font-bold text-indigo-400">{pct}%</span>
          </div>
          <div className="w-full bg-[rgba(15,15,26,0.8)] rounded-full h-3">
            <motion.div
              className="h-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-8 w-8 bg-slate-700 rounded-lg mb-2" />
                <div className="h-6 w-12 bg-slate-700 rounded mb-1" />
                <div className="h-4 w-16 bg-slate-700 rounded" />
              </div>
            ))
          : statCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 + 0.2 }}
                className="card text-center"
              >
                <div className="text-2xl mb-1">{card.icon}</div>
                <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{card.label}</div>
              </motion.div>
            ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/learn', label: 'Continue Learning', icon: '📖', desc: '10 new words', color: 'bg-indigo-600/20 border-indigo-500/30 hover:bg-indigo-600/30' },
          { href: '/flashcards', label: 'Flashcards', icon: '🃏', desc: 'Review & practice', color: 'bg-purple-600/20 border-purple-500/30 hover:bg-purple-600/30' },
          { href: '/quiz', label: 'Take Quiz', icon: '🧠', desc: 'Test your knowledge', color: 'bg-emerald-600/20 border-emerald-500/30 hover:bg-emerald-600/30' },
          { href: '/exam', label: 'Mock Exam', icon: '📝', desc: '20-min challenge', color: 'bg-amber-600/20 border-amber-500/30 hover:bg-amber-600/30' },
        ].map((action, i) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 + 0.4 }}
          >
            <Link
              href={action.href}
              className={`flex flex-col items-center p-4 rounded-xl border ${action.color} transition-all duration-200 text-center`}
            >
              <span className="text-3xl mb-2">{action.icon}</span>
              <span className="font-semibold text-slate-200 text-sm">{action.label}</span>
              <span className="text-xs text-slate-400 mt-0.5">{action.desc}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      {stats && stats.recentProgress.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h2 className="font-semibold text-slate-200 mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {stats.recentProgress.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-2 border-b border-[rgba(99,102,241,0.1)] last:border-0"
              >
                <div>
                  <span className="font-medium text-slate-200">{p.word.word}</span>
                  <span className="text-slate-500 text-sm ml-2">({p.word.partOfSpeech})</span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    p.status === 'known'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : p.status === 'weak'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
