'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Bookmark {
  id: string
  createdAt: string
  word: {
    id: number
    word: string
    pronunciation: string
    partOfSpeech: string
    definition: string
    example: string
  }
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/bookmarks')
      .then((r) => r.json())
      .then((data) => {
        setBookmarks(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const removeBookmark = async (wordId: number) => {
    await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wordId }),
    })
    setBookmarks((prev) => prev.filter((b) => b.word.id !== wordId))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Bookmarks</h1>
        <p className="text-slate-400 mt-1">{bookmarks.length} saved words</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-32" />
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🔖</div>
          <h2 className="text-xl font-semibold text-white">No bookmarks yet</h2>
          <p className="text-slate-400 mt-2">Bookmark words from the Search page to save them here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bm, i) => (
            <motion.div
              key={bm.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-white">{bm.word.word}</h2>
                    {bm.word.pronunciation && (
                      <span className="text-slate-400 text-sm italic">/{bm.word.pronunciation}/</span>
                    )}
                    {bm.word.partOfSpeech && (
                      <span className="text-xs px-2 py-0.5 rounded border bg-slate-500/20 text-slate-400 border-slate-500/30">
                        {bm.word.partOfSpeech}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 mt-2 leading-relaxed">{bm.word.definition}</p>
                  {bm.word.example && (
                    <p className="text-slate-500 text-sm mt-2 italic border-l-2 border-indigo-500/30 pl-3">
                      &ldquo;{bm.word.example}&rdquo;
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeBookmark(bm.word.id)}
                  className="flex-shrink-0 p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Remove bookmark"
                >
                  🗑️
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
