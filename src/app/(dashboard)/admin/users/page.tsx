'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
  _count: { progress: number; quizAttempts: number; bookmarks: number }
  streak: { currentStreak: number; longestStreak: number } | null
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session && (session.user as any).role !== 'admin') router.push('/')
  }, [session, router])

  useEffect(() => {
    fetch('/api/admin')
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-slate-400 mt-1">{users.length} registered users</p>
      </div>

      {loading ? (
        <div className="card animate-pulse h-64" />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(99,102,241,0.2)]">
                  <th className="px-6 py-3 text-left text-slate-400">User</th>
                  <th className="px-6 py-3 text-left text-slate-400">Role</th>
                  <th className="px-6 py-3 text-left text-slate-400">Joined</th>
                  <th className="px-6 py-3 text-center text-slate-400">Progress</th>
                  <th className="px-6 py-3 text-center text-slate-400">Quizzes</th>
                  <th className="px-6 py-3 text-center text-slate-400">Streak</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-[rgba(99,102,241,0.1)] hover:bg-[rgba(99,102,241,0.05)]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-300">
                          {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-slate-200">{user.name || '—'}</div>
                          <div className="text-slate-500 text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-300">{user._count.progress}</td>
                    <td className="px-6 py-4 text-center text-slate-300">{user._count.quizAttempts}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-orange-400">🔥 {user.streak?.currentStreak || 0}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
