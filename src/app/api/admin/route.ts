import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [users, totalWords, totalQuizAttempts] = await Promise.all([
    prisma.user.findMany({
      include: {
        _count: { select: { progress: true, quizAttempts: true, bookmarks: true } },
        streak: true,
      },
    }),
    prisma.word.count(),
    prisma.quizAttempt.count(),
  ])

  return NextResponse.json({ users, totalWords, totalQuizAttempts })
}
