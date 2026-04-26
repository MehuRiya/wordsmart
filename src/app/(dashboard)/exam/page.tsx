'use client'
import { useEffect, useState, useCallback } from 'react'
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

type ExamState = 'idle' | 'active' | 'done'

const EXAM_QUESTIONS = 20
const EXAM_MINUTES = 20

export default function ExamPage() {
  const [state, setState] = useState<ExamState>('idle')
  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [timeLeft, setTimeLeft] = useState(EXAM_MINUTES * 60)
  const [loading, setLoading] = useState(false)

  const finishExam = useCallback(() => {
    setState('done')
  }, [])

  useEffect(() => {
    if (state !== 'active') return
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer)
          finishExam()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [state, finishExam])

  const startExam = async () => {
    setLoading(true)
    const res = await fetch(`/api/quiz?count=${EXAM_QUESTIONS}`)
    const data = await res.json()
    setQuestions(data)
    setCurrent(0)
    setAnswers({})
    setTimeLeft(EXAM_MINUTES * 60)
    setState('active')
    setLoading(false)
  }

  const handleAnswer = (questionIndex: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionId }))
  }

  const submitExam = () => {
    finishExam()
  }

  const mm = Math.floor(timeLeft / 60).toString().padStart(2, '0')
  const ss = (timeLeft % 60).toString().padStart(2, '0')
  const timeWarning = timeLeft < 120

  if (state === 'idle') {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Mock Exam</h1>
          <p className="text-slate-400 mt-1">Simulate a real IBA MBA vocabulary test</p>
        </div>
        <div className="card space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Questions', value: EXAM_QUESTIONS, icon: '📝' },
              { label: 'Time Limit', value: `${EXAM_MINUTES} min`, icon: '⏱️' },
              { label: 'Question Type', value: 'MCQ', icon: '🎯' },
              { label: 'Passing Score', value: '70%', icon: '✅' },
            ].map((item) => (
              <div key={item.label} className="bg-[rgba(15,15,26,0.6)] rounded-lg p-3 flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="text-slate-300 font-semibold">{item.value}</div>
                  <div className="text-slate-500 text-xs">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-amber-300 text-sm">
            ⚠️ Once started, the timer cannot be paused. Answer all questions before time runs out.
          </div>
          <button
            onClick={startExam}
            disabled={loading}
            className="w-full btn-primary py-3 text-base font-semibold"
          >
            {loading ? 'Preparing exam...' : '🚀 Start Exam'}
          </button>
        </div>
      </div>
    )
  }

  if (state === 'done') {
    const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctId ? 1 : 0), 0)
    const pct = Math.round((score / questions.length) * 100)
    const grade =
      pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F'
    const passed = pct >= 70

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        <div className="card text-center space-y-4">
          <div className="text-6xl">{passed ? '🎓' : '📖'}</div>
          <h2 className="text-2xl font-bold text-white">
            {passed ? 'Exam Passed!' : 'Keep Studying!'}
          </h2>
          <div className="flex items-center justify-center gap-8">
            <div>
              <div className="text-4xl font-bold text-indigo-400">{score}/{questions.length}</div>
              <div className="text-slate-500 text-sm">Score</div>
            </div>
            <div>
              <div className={`text-4xl font-bold ${passed ? 'text-emerald-400' : 'text-red-400'}`}>{pct}%</div>
              <div className="text-slate-500 text-sm">Accuracy</div>
            </div>
            <div>
              <div className={`text-4xl font-bold ${passed ? 'text-emerald-400' : 'text-amber-400'}`}>{grade}</div>
              <div className="text-slate-500 text-sm">Grade</div>
            </div>
          </div>
        </div>

        <div className="card space-y-3">
          <h3 className="font-semibold text-slate-200">Answer Review</h3>
          {questions.map((q, i) => {
            const userAnswer = answers[i]
            const correct = userAnswer === q.correctId
            return (
              <div
                key={q.wordId}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  correct
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div>
                  <span className="font-medium text-slate-200">{q.word}</span>
                  {!correct && userAnswer != null && (
                    <span className="text-slate-500 text-sm ml-2">
                      (your: {q.options.find((o) => o.id === userAnswer)?.word || 'skipped'})
                    </span>
                  )}
                </div>
                <span className={correct ? 'text-emerald-400' : 'text-red-400'}>
                  {correct ? '✓' : '✗'}
                </span>
              </div>
            )
          })}
        </div>

        <button onClick={startExam} className="w-full btn-primary py-3">
          🔄 Retake Exam
        </button>
      </motion.div>
    )
  }

  const q = questions[current]
  const answered = Object.keys(answers).length
  const progressPct = ((current + 1) / questions.length) * 100

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Mock Exam</h1>
          <p className="text-slate-400 text-sm">Question {current + 1} of {questions.length}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg ${
          timeWarning
            ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
            : 'bg-[rgba(15,15,26,0.8)] text-slate-200 border border-[rgba(99,102,241,0.3)]'
        }`}>
          ⏱️ {mm}:{ss}
        </div>
      </div>

      <div className="w-full bg-[rgba(15,15,26,0.8)] rounded-full h-2">
        <div
          className="h-2 rounded-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="text-xs text-slate-500 text-right">{answered} of {questions.length} answered</div>

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
              Q{current + 1}. Which word matches this definition?
            </p>
            <p className="text-lg text-slate-200 leading-relaxed">{q.definition}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt) => {
              const selected = answers[current] === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => handleAnswer(current, opt.id)}
                  className={`p-4 rounded-xl border text-left font-semibold text-sm transition-all duration-200 ${
                    selected
                      ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-200'
                      : 'bg-[rgba(26,26,46,0.8)] border-[rgba(99,102,241,0.2)] text-slate-300 hover:border-indigo-500/50 hover:bg-[rgba(99,102,241,0.1)]'
                  }`}
                >
                  {opt.word}
                </button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
        >
          ← Prev
        </button>
        {current < questions.length - 1 ? (
          <button
            onClick={() => setCurrent((c) => c + 1)}
            className="flex-1 btn-secondary py-2 text-sm"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={submitExam}
            className="flex-1 btn-primary py-2 text-sm font-semibold"
          >
            ✅ Submit Exam
          </button>
        )}
      </div>
    </div>
  )
}
