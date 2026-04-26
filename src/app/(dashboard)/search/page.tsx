'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Word {
  id: number
  word: string
  pronunciation: string
  partOfSpeech: string
  definition: string
  example: string
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [words, setWords] = useState<Word[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [bookmarked, setBookmarked] = useState<Record<number, boolean>>({})

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setWords([])
      setTotal(0)
      return
    }
    setLoading(true)
    const res = await fetch(`/api/words?search=${encodeURIComponent(q)}&limit=20`)
    const data = await res.json()
    setWords(data.words || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const toggleBookmark = async (wordId: number) => {
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wordId }),
    })
    const data = await res.json()
    setBookmarked((prev) => ({ ...prev, [wordId]: data.bookmarked }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Search Words</h1>
        <p className="text-slate-400 mt-1">Search through 739 Word Smart vocabulary words</p>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">🔍</div>
        <input
          type="text"
          value={query}
          onChange={handleInput}
          placeholder="Search by word or definition..."
          className="w-full pl-12 pr-4 py-4 bg-[rgba(15,15,26,0.8)] border border-[rgba(99,102,241,0.3)] rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-lg"
          autoFocus
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 animate-spin">
            ↻
          </div>
        )}
      </div>

      {query && (
        <p className="text-slate-400 text-sm">
          {loading ? 'Searching...' : `${total} result${total !== 1 ? 's' : ''} for "${query}"`}
        </p>
      )}

      <AnimatePresence>
        <div className="space-y-3">
          {words.map((word, i) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.03 }}
              className="card"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-white">{word.word}</h2>
                    {word.pronunciation && (
                      <span className="text-slate-400 text-sm italic">/{word.pronunciation}/</span>
                    )}
                    {word.partOfSpeech && (
                      <span className="text-xs px-2 py-0.5 rounded border bg-slate-500/20 text-slate-400 border-slate-500/30">
                        {word.partOfSpeech}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 mt-2 leading-relaxed">{word.definition}</p>
                  {word.example && (
                    <p className="text-slate-500 text-sm mt-2 italic border-l-2 border-indigo-500/30 pl-3">
                      &ldquo;{word.example}&rdquo;
                    </p>
                  )}
                </div>
                <button
                  onClick={() => toggleBookmark(word.id)}
                  className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                    bookmarked[word.id]
                      ? 'text-amber-400 bg-amber-500/10'
                      : 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10'
                  }`}
                  title={bookmarked[word.id] ? 'Remove bookmark' : 'Bookmark'}
                >
                  🔖
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {!query && (
        <div className="card text-center py-16 text-slate-400">
          <div className="text-5xl mb-4">🔍</div>
          <p>Start typing to search through words</p>
        </div>
      )}
    </div>
  )
}
