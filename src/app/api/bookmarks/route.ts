import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    include: { word: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(bookmarks)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const { wordId } = await req.json()

  const existing = await prisma.bookmark.findUnique({
    where: { userId_wordId: { userId, wordId } },
  })

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } })
    return NextResponse.json({ bookmarked: false })
  }

  await prisma.bookmark.create({ data: { userId, wordId } })
  return NextResponse.json({ bookmarked: true })
}
