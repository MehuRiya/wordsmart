import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id

  const [totalWords, learned, weak, bookmarkCount, streak, quizAttempts, recentProgress] =
    await Promise.all([
      prisma.word.count(),
      prisma.userWordProgress.count({ where: { userId, status: 'known' } }),
      prisma.userWordProgress.count({ where: { userId, status: 'weak' } }),
      prisma.bookmark.count({ where: { userId } }),
      prisma.streak.findUnique({ where: { userId } }),
      prisma.quizAttempt.findMany({ where: { userId } }),
      prisma.userWordProgress.findMany({
        where: { userId },
        include: { word: true },
        orderBy: { lastSeen: 'desc' },
        take: 5,
      }),
    ])

  const correctQuiz = quizAttempts.filter((a) => a.correct).length
  const accuracy =
    quizAttempts.length > 0 ? Math.round((correctQuiz / quizAttempts.length) * 100) : 0

  return NextResponse.json({
    totalWords,
    learned,
    weak,
    bookmarkCount,
    streak: streak?.currentStreak || 0,
    longestStreak: streak?.longestStreak || 0,
    accuracy,
    totalQuizAttempts: quizAttempts.length,
    recentProgress,
  })
}
