'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ProgressEntry {
  id: string
  status: string
  wrongCount: number
  correctCount: number
  lastSeen: string
  word: {
    id: number
    word: string
    pronunciation: string
    partOfSpeech: string
    definition: string
    example: string
  }
}

export default function WeakWordsPage() {
  const [entries, setEntries] = useState<ProgressEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/progress')
      .then((r) => r.json())
      .then((data: ProgressEntry[]) => {
        const weak = data
          .filter((e) => e.status === 'weak' || e.wrongCount > 0)
          .sort((a, b) => b.wrongCount - a.wrongCount)
        setEntries(weak)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const markKnown = async (wordId: number) => {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wordId, status: 'known' }),
    })
    setEntries((prev) => prev.filter((e) => e.word.id !== wordId))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Weak Words</h1>
        <p className="text-slate-400 mt-1">Words you struggle with — focus here!</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-32" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-semibold text-white">No weak words!</h2>
          <p className="text-slate-400 mt-2">Great job! Take a quiz to discover words to practice.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card border-red-500/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-bold text-white">{entry.word.word}</h2>
                    {entry.word.pronunciation && (
                      <span className="text-slate-400 text-sm italic">
                        /{entry.word.pronunciation}/
                      </span>
                    )}
                    {entry.word.partOfSpeech && (
                      <span className="text-xs px-2 py-0.5 rounded border bg-slate-500/20 text-slate-400 border-slate-500/30">
                        {entry.word.partOfSpeech}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 mt-2 leading-relaxed">{entry.word.definition}</p>
                  {entry.word.example && (
                    <p className="text-slate-500 text-sm mt-2 italic">
                      &ldquo;{entry.word.example}&rdquo;
                    </p>
                  )}
                  <div className="flex gap-4 mt-3 text-xs">
                    <span className="text-red-400">
                      ✗ {entry.wrongCount} wrong
                    </span>
                    <span className="text-emerald-400">
                      ✓ {entry.correctCount} correct
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => markKnown(entry.word.id)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
                >
                  Mark Known
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
