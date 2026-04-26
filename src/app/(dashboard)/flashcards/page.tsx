'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Word {
  id: number
  word: string
  pronunciation: string
  partOfSpeech: string
  definition: string
  example: string
}

export default function FlashcardsPage() {
  const [words, setWords] = useState<Word[]>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(Math.floor(Math.random() * 30) + 1)

  useEffect(() => {
    fetch(`/api/words?page=${page}&limit=20`)
      .then((r) => r.json())
      .then((data) => {
        setWords(data.words || [])
        setIndex(0)
        setFlipped(false)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [page])

  const current = words[index]

  const next = () => {
    setFlipped(false)
    setTimeout(() => setIndex((i) => (i + 1) % words.length), 150)
  }

  const prev = () => {
    setFlipped(false)
    setTimeout(() => setIndex((i) => (i - 1 + words.length) % words.length), 150)
  }

  const shuffle = () => {
    setPage(Math.floor(Math.random() * 30) + 1)
    setLoading(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-indigo-400 animate-pulse text-lg">Loading flashcards...</div>
      </div>
    )
  }

  if (!current) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Flashcards</h1>
          <p className="text-slate-400 mt-1">
            Card {index + 1} of {words.length}
          </p>
        </div>
        <button onClick={shuffle} className="btn-secondary text-sm">
          🔀 Shuffle
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[rgba(15,15,26,0.8)] rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${((index + 1) / words.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div
        className="relative h-72 cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => setFlipped((f) => !f)}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            transformStyle: 'preserve-3d',
          }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 card flex flex-col items-center justify-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Click to reveal</p>
            <h2 className="text-4xl font-bold text-white text-center">{current.word}</h2>
            {current.pronunciation && (
              <p className="text-slate-400 mt-3 text-lg italic">/{current.pronunciation}/</p>
            )}
            {current.partOfSpeech && (
              <span className="mt-3 px-3 py-1 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-sm">
                {current.partOfSpeech}
              </span>
            )}
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 card flex flex-col items-center justify-center px-8"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Definition</p>
            <p className="text-slate-200 text-center text-lg leading-relaxed">{current.definition}</p>
            {current.example && (
              <p className="text-slate-500 text-sm mt-4 italic text-center border-t border-[rgba(99,102,241,0.2)] pt-4 w-full">
                &ldquo;{current.example}&rdquo;
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={prev} className="btn-secondary px-6 py-2">
          ← Prev
        </button>
        <button
          onClick={() => setFlipped((f) => !f)}
          className="btn-primary px-6 py-2"
        >
          {flipped ? '🔙 Hide' : '👁 Reveal'}
        </button>
        <button onClick={next} className="btn-secondary px-6 py-2">
          Next →
        </button>
      </div>

      <p className="text-center text-slate-500 text-sm">Click the card or use the Reveal button to flip</p>
    </div>
  )
}
