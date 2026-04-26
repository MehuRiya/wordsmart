import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const sanitizedName = name ? String(name).trim().slice(0, 100) : null
    const sanitizedEmail = String(email).trim().toLowerCase().slice(0, 255)

    const existing = await prisma.user.findUnique({ where: { email: sanitizedEmail } })
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name: sanitizedName, email: sanitizedEmail, password: hashed },
    })

    return NextResponse.json({ id: user.id, email: user.email })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
