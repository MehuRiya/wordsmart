'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Word {
  id: number
  word: string
  pronunciation: string
  partOfSpeech: string
  definition: string
  example: string
  difficulty: string
}

const posColors: Record<string, string> = {
  adj: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  n: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  v: 'bg-green-500/20 text-green-400 border-green-500/30',
  adv: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

export default function LearnPage() {
  const [words, setWords] = useState<Word[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statuses, setStatuses] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState<number | null>(null)

  const limit = 10

  useEffect(() => {
    setLoading(true)
    fetch(`/api/words?page=${page}&limit=${limit}`)
      .then((r) => r.json())
      .then((data) => {
        setWords(data.words || [])
        setTotal(data.total || 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [page])

  const markStatus = async (wordId: number, status: string) => {
    setSaving(wordId)
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wordId, status }),
    })
    setStatuses((prev) => ({ ...prev, [wordId]: status }))
    setSaving(null)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Learn Words</h1>
          <p className="text-slate-400 mt-1">{total} words total · Page {page} of {totalPages}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary px-3 py-2 text-sm disabled:opacity-40"
          >
            ← Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary px-3 py-2 text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-40" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {words.map((word, i) => {
              const status = statuses[word.id]
              return (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`card transition-all ${
                    status === 'known'
                      ? 'border-emerald-500/30'
                      : status === 'weak'
                      ? 'border-red-500/30'
                      : status === 'learning'
                      ? 'border-amber-500/30'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-xl font-bold text-white">{word.word}</h2>
                        {word.pronunciation && (
                          <span className="text-slate-400 text-sm italic">
                            /{word.pronunciation}/
                          </span>
                        )}
                        {word.partOfSpeech && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded border font-medium ${
                              posColors[word.partOfSpeech] ||
                              'bg-slate-500/20 text-slate-400 border-slate-500/30'
                            }`}
                          >
                            {word.partOfSpeech}
                          </span>
                        )}
                        {status && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              status === 'known'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : status === 'weak'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {status}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 mt-3 leading-relaxed">{word.definition}</p>
                      {word.example && (
                        <p className="text-slate-500 text-sm mt-2 italic border-l-2 border-indigo-500/40 pl-3">
                          &ldquo;{word.example}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <button
                      onClick={() => markStatus(word.id, 'known')}
                      disabled={saving === word.id}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        status === 'known'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                      }`}
                    >
                      ✓ Known
                    </button>
                    <button
                      onClick={() => markStatus(word.id, 'learning')}
                      disabled={saving === word.id}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        status === 'learning'
                          ? 'bg-amber-500 text-white'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                      }`}
                    >
                      📌 Reviewing
                    </button>
                    <button
                      onClick={() => markStatus(word.id, 'weak')}
                      disabled={saving === word.id}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        status === 'weak'
                          ? 'bg-red-500 text-white'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                      }`}
                    >
                      ✗ Weak
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      )}

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setPage(1)}
          disabled={page === 1}
          className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
        >
          «
        </button>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
        >
          ‹
        </button>
        <span className="text-slate-400 text-sm px-3">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
        >
          ›
        </button>
        <button
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
          className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
        >
          »
        </button>
      </div>
    </div>
  )
}
