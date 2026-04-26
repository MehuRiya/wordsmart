import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id

  const progress = await prisma.userWordProgress.findMany({
    where: { userId },
    include: { word: true },
  })

  return NextResponse.json(progress)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const { wordId, status } = await req.json()

  let nextReview: Date | null = null
  const now = new Date()
  if (status === 'known') {
    nextReview = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  } else if (status === 'weak') {
    nextReview = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
  } else if (status === 'learning') {
    nextReview = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
  }

  const progress = await prisma.userWordProgress.upsert({
    where: { userId_wordId: { userId, wordId } },
    update: { status, lastSeen: now, nextReview },
    create: { userId, wordId, status, lastSeen: now, nextReview },
  })

  await updateStreak(userId)

  return NextResponse.json(progress)
}

async function updateStreak(userId: string) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const streak = await prisma.streak.findUnique({ where: { userId } })

  if (!streak) {
    await prisma.streak.create({
      data: { userId, currentStreak: 1, longestStreak: 1, lastActivity: now },
    })
    return
  }

  const lastActivity = streak.lastActivity
  if (!lastActivity) {
    await prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: 1,
        longestStreak: Math.max(1, streak.longestStreak),
        lastActivity: now,
      },
    })
    return
  }

  const lastDate = new Date(
    lastActivity.getFullYear(),
    lastActivity.getMonth(),
    lastActivity.getDate()
  )
  const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

  let newStreak = streak.currentStreak
  if (diffDays === 0) return
  if (diffDays === 1) newStreak += 1
  else newStreak = 1

  await prisma.streak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streak.longestStreak),
      lastActivity: now,
    },
  })
}
