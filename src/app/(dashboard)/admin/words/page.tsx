'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Word {
  id: number
  word: string
  pronunciation: string
  partOfSpeech: string
  definition: string
  example: string
  difficulty: string
}

const emptyWord: Omit<Word, 'id'> = {
  word: '',
  pronunciation: '',
  partOfSpeech: '',
  definition: '',
  example: '',
  difficulty: 'medium',
}

export default function AdminWordsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [words, setWords] = useState<Word[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Word | null>(null)
  const [adding, setAdding] = useState(false)
  const [newWord, setNewWord] = useState<Omit<Word, 'id'>>(emptyWord)
  const [saving, setSaving] = useState(false)

  const limit = 20

  useEffect(() => {
    if (session && session.user.role !== 'admin') router.push('/')
  }, [session, router])

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/words?page=${page}&limit=${limit}&search=${search}`)
    const data = await res.json()
    setWords(data.words || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [page, search])

  useEffect(() => {
    load()
  }, [load])

  const save = async () => {
    if (!editing) return
    setSaving(true)
    await fetch(`/api/words/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    })
    setSaving(false)
    setEditing(null)
    load()
  }

  const addWord = async () => {
    if (!newWord.word.trim() || !newWord.definition.trim()) return
    setSaving(true)
    await fetch('/api/words', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWord),
    })
    setSaving(false)
    setAdding(false)
    setNewWord(emptyWord)
    load()
  }

  const deleteWord = async (id: number) => {
    if (!confirm('Delete this word?')) return
    await fetch(`/api/words/${id}`, { method: 'DELETE' })
    load()
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Words</h1>
          <p className="text-slate-400 mt-1">{total} words total</p>
        </div>
        <button onClick={() => { setAdding(true); setNewWord(emptyWord) }} className="btn-primary text-sm px-4 py-2">
          + Add Word
        </button>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search words..."
          className="flex-1 px-4 py-2.5 bg-[rgba(15,15,26,0.8)] border border-[rgba(99,102,241,0.3)] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {adding && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setAdding(false)}>
          <div className="card w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">Add New Word</h2>
            <div className="space-y-3">
              {(['word', 'pronunciation', 'partOfSpeech', 'definition', 'example'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm text-slate-400 mb-1 capitalize">{field}</label>
                  {field === 'definition' || field === 'example' ? (
                    <textarea
                      value={newWord[field] || ''}
                      onChange={(e) => setNewWord({ ...newWord, [field]: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-[rgba(15,15,26,0.8)] border border-[rgba(99,102,241,0.3)] rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={newWord[field] || ''}
                      onChange={(e) => setNewWord({ ...newWord, [field]: e.target.value })}
                      className="w-full px-3 py-2 bg-[rgba(15,15,26,0.8)] border border-[rgba(99,102,241,0.3)] rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={addWord} disabled={saving || !newWord.word.trim() || !newWord.definition.trim()} className="btn-primary px-6 py-2 disabled:opacity-50">
                {saving ? 'Adding...' : 'Add Word'}
              </button>
              <button onClick={() => setAdding(false)} className="btn-secondary px-6 py-2">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="card w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">Edit Word</h2>
            <div className="space-y-3">
              {(['word', 'pronunciation', 'partOfSpeech', 'definition', 'example'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm text-slate-400 mb-1 capitalize">{field}</label>
                  {field === 'definition' || field === 'example' ? (
                    <textarea
                      value={editing[field] || ''}
                      onChange={(e) => setEditing({ ...editing, [field]: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-[rgba(15,15,26,0.8)] border border-[rgba(99,102,241,0.3)] rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={editing[field] || ''}
                      onChange={(e) => setEditing({ ...editing, [field]: e.target.value })}
                      className="w-full px-3 py-2 bg-[rgba(15,15,26,0.8)] border border-[rgba(99,102,241,0.3)] rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={save} disabled={saving} className="btn-primary px-6 py-2">
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditing(null)} className="btn-secondary px-6 py-2">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-16" />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(99,102,241,0.2)]">
                  <th className="px-4 py-3 text-left text-slate-400">Word</th>
                  <th className="px-4 py-3 text-left text-slate-400">POS</th>
                  <th className="px-4 py-3 text-left text-slate-400 max-w-xs">Definition</th>
                  <th className="px-4 py-3 text-center text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {words.map((word) => (
                  <tr key={word.id} className="border-b border-[rgba(99,102,241,0.1)] hover:bg-[rgba(99,102,241,0.05)]">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200">{word.word}</div>
                      <div className="text-slate-500 text-xs italic">{word.pronunciation}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{word.partOfSpeech}</td>
                    <td className="px-4 py-3 text-slate-300 max-w-xs truncate">{word.definition}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditing(word)}
                          className="text-indigo-400 hover:text-indigo-300 p-1"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteWord(word.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-6 py-4 border-t border-[rgba(99,102,241,0.2)]">
            <span className="text-slate-400 text-sm">{total} words</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">‹</button>
              <span className="text-slate-400 text-sm px-2 py-1.5">{page}/{totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">›</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
