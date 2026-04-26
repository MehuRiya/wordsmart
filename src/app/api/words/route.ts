import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where = search
    ? {
        OR: [
          { word: { contains: search } },
          { definition: { contains: search } },
        ],
      }
    : {}

  const [words, total] = await Promise.all([
    prisma.word.findMany({ where, skip, take: limit, orderBy: { word: 'asc' } }),
    prisma.word.count({ where }),
  ])

  return NextResponse.json({ words, total, page, limit })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { word: wordText, definition, pronunciation, partOfSpeech, example, origin, synonyms, antonyms, difficulty, category, bengaliMeaning } = body

  if (!wordText || typeof wordText !== 'string' || !wordText.trim()) {
    return NextResponse.json({ error: 'Word is required' }, { status: 400 })
  }
  if (!definition || typeof definition !== 'string' || !definition.trim()) {
    return NextResponse.json({ error: 'Definition is required' }, { status: 400 })
  }

  const word = await prisma.word.create({
    data: {
      word: String(wordText).trim(),
      definition: String(definition).trim(),
      pronunciation: pronunciation ? String(pronunciation).trim() : null,
      partOfSpeech: partOfSpeech ? String(partOfSpeech).trim() : null,
      example: example ? String(example).trim() : null,
      origin: origin ? String(origin).trim() : null,
      synonyms: synonyms ? String(synonyms).trim() : null,
      antonyms: antonyms ? String(antonyms).trim() : null,
      difficulty: difficulty ? String(difficulty).trim() : 'medium',
      category: category ? String(category).trim() : null,
      bengaliMeaning: bengaliMeaning ? String(bengaliMeaning).trim() : null,
    },
  })
  return NextResponse.json(word)
}
