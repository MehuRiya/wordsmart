'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '🏠' },
  { href: '/learn', label: 'Learn', icon: '📖' },
  { href: '/flashcards', label: 'Flashcards', icon: '🃏' },
  { href: '/quiz', label: 'Quiz', icon: '🧠' },
  { href: '/weak-words', label: 'Weak Words', icon: '⚡' },
  { href: '/bookmarks', label: 'Bookmarks', icon: '🔖' },
  { href: '/search', label: 'Search', icon: '🔍' },
  { href: '/exam', label: 'Mock Exam', icon: '📝' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-indigo-400 text-lg animate-pulse">Loading...</div>
      </div>
    )
  }

  if (!session) return null

  const isAdmin = (session.user as any).role === 'admin'

  const allNavItems = isAdmin
    ? [...navItems, { href: '/admin', label: 'Admin', icon: '⚙️' }]
    : navItems

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-[rgba(99,102,241,0.2)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xl">
            📚
          </div>
          <div>
            <div className="font-bold text-white text-lg leading-tight">WordSmart</div>
            <div className="text-xs text-slate-500">IBA MBA Prep</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {allNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[rgba(99,102,241,0.1)]'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-[rgba(99,102,241,0.2)]">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-300">
            {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-300 truncate">
              {session.user?.name || 'User'}
            </div>
            <div className="text-xs text-slate-500 truncate">{session.user?.email}</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 glass border-r border-[rgba(99,102,241,0.2)] flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden glass border-r border-[rgba(99,102,241,0.2)] flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 border-b border-[rgba(99,102,241,0.2)] glass">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-400 hover:text-slate-200 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-white">WordSmart</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
