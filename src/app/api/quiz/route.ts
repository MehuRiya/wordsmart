import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const count = parseInt(searchParams.get('count') || '10')

  const totalWords = await prisma.word.count()
  const skip = Math.floor(Math.random() * Math.max(0, totalWords - count * 4))
  const words = await prisma.word.findMany({ take: count * 4, skip })

  if (words.length < 4) {
    return NextResponse.json({ error: 'Not enough words' }, { status: 400 })
  }

  const questions = []
  for (let i = 0; i < Math.min(count, words.length - 3); i++) {
    const correct = words[i]
    const distractors = words.slice(i + 1, i + 4)

    const options = [correct, ...distractors]
      .sort(() => Math.random() - 0.5)
      .map((w) => ({ id: w.id, word: w.word, definition: w.definition }))

    questions.push({
      wordId: correct.id,
      word: correct.word,
      definition: correct.definition,
      pronunciation: correct.pronunciation,
      example: correct.example,
      options,
      correctId: correct.id,
    })
  }

  return NextResponse.json(questions)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const { wordId, quizType, correct } = await req.json()

  await prisma.quizAttempt.create({
    data: { userId, wordId, quizType, correct },
  })

  const progress = await prisma.userWordProgress.findUnique({
    where: { userId_wordId: { userId, wordId } },
  })

  if (progress) {
    await prisma.userWordProgress.update({
      where: { userId_wordId: { userId, wordId } },
      data: {
        correctCount: correct ? { increment: 1 } : undefined,
        wrongCount: !correct ? { increment: 1 } : undefined,
        status: !correct ? 'weak' : progress.status,
      },
    })
  } else {
    await prisma.userWordProgress.create({
      data: {
        userId,
        wordId,
        correctCount: correct ? 1 : 0,
        wrongCount: correct ? 0 : 1,
        status: correct ? 'learning' : 'weak',
        lastSeen: new Date(),
      },
    })
  }

  return NextResponse.json({ success: true })
}
