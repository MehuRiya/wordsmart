'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Question {
  wordId: number
  word: string
  definition: string
  pronunciation: string
  example: string
  options: Array<{ id: number; word: string; definition: string }>
  correctId: number
}

type QuizState = 'idle' | 'active' | 'done'

export default function QuizPage() {
  const [state, setState] = useState<QuizState>('idle')
  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState<boolean[]>([])
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(10)

  const startQuiz = async () => {
    setLoading(true)
    const res = await fetch(`/api/quiz?count=${count}`)
    const data = await res.json()
    setQuestions(data)
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setAnswered([])
    setState('active')
    setLoading(false)
  }

  const handleAnswer = async (optionId: number) => {
    if (selected !== null) return
    setSelected(optionId)
    const q = questions[current]
    const isCorrect = optionId === q.correctId
    if (isCorrect) setScore((s) => s + 1)
    setAnswered((prev) => [...prev, isCorrect])

    await fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wordId: q.wordId, quizType: 'meaning', correct: isCorrect }),
    })

    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setState('done')
      } else {
        setCurrent((c) => c + 1)
        setSelected(null)
      }
    }, 1000)
  }

  const q = questions[current]
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0

  if (state === 'idle') {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Quiz</h1>
          <p className="text-slate-400 mt-1">Test your vocabulary knowledge</p>
        </div>
        <div className="card space-y-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Number of questions</label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    count === n
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[rgba(15,15,26,0.8)] text-slate-400 border border-[rgba(99,102,241,0.3)] hover:border-indigo-500/50'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={startQuiz}
            disabled={loading}
            className="w-full btn-primary py-3 text-base font-semibold"
          >
            {loading ? 'Loading...' : '🚀 Start Quiz'}
          </button>
        </div>
      </div>
    )
  }

  if (state === 'done') {
    const grade =
      pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F'
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto"
      >
        <div className="card text-center space-y-6">
          <div className="text-6xl">{pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
          <div>
            <h2 className="text-2xl font-bold text-white">Quiz Complete!</h2>
            <p className="text-slate-400 mt-1">Here&apos;s how you did</p>
          </div>
          <div className="flex items-center justify-center gap-8">
            <div>
              <div className="text-4xl font-bold text-indigo-400">{score}/{questions.length}</div>
              <div className="text-slate-500 text-sm">Correct</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400">{pct}%</div>
              <div className="text-slate-500 text-sm">Accuracy</div>
            </div>
            <div>
              <div className={`text-4xl font-bold ${pct >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>{grade}</div>
              <div className="text-slate-500 text-sm">Grade</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={startQuiz} className="flex-1 btn-primary py-2.5">
              🔄 Try Again
            </button>
            <button onClick={() => setState('idle')} className="flex-1 btn-secondary py-2.5">
              ⚙️ Settings
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  if (!q) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Quiz</h1>
          <p className="text-slate-400 text-sm mt-1">
            Question {current + 1} of {questions.length}
          </p>
        </div>
        <div className="text-right">
          <div className="text-emerald-400 font-bold">{score} correct</div>
          <div className="text-slate-500 text-sm">{answered.filter(Boolean).length}/{answered.length}</div>
        </div>
      </div>

      <div className="w-full bg-[rgba(15,15,26,0.8)] rounded-full h-2">
        <div
          className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="space-y-4"
        >
          <div className="card">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">
              Which word matches this definition?
            </p>
            <p className="text-lg text-slate-200 leading-relaxed">{q.definition}</p>
            {q.example && (
              <p className="text-slate-500 text-sm mt-3 italic border-l-2 border-indigo-500/30 pl-3">
                &ldquo;{q.example}&rdquo;
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt) => {
              let style = 'bg-[rgba(26,26,46,0.8)] border-[rgba(99,102,241,0.2)] text-slate-300 hover:border-indigo-500/50 hover:bg-[rgba(99,102,241,0.1)]'
              if (selected !== null) {
                if (opt.id === q.correctId) {
                  style = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                } else if (opt.id === selected && opt.id !== q.correctId) {
                  style = 'bg-red-500/20 border-red-500/50 text-red-300'
                } else {
                  style = 'bg-[rgba(26,26,46,0.4)] border-[rgba(99,102,241,0.1)] text-slate-500'
                }
              }
              return (
                <button
                  key={opt.id}
                  onClick={() => handleAnswer(opt.id)}
                  disabled={selected !== null}
                  className={`p-4 rounded-xl border text-left font-semibold text-sm transition-all duration-200 ${style}`}
                >
                  {opt.word}
                </button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
