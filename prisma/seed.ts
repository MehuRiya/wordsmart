import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@wordsmart.com' },
    update: {},
    create: {
      email: 'admin@wordsmart.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'admin',
    },
  })

  // Create demo user
  const demoPassword = await bcrypt.hash('demo123', 10)
  await prisma.user.upsert({
    where: { email: 'demo@wordsmart.com' },
    update: {},
    create: {
      email: 'demo@wordsmart.com',
      name: 'Demo User',
      password: demoPassword,
      role: 'user',
    },
  })

  // Load words from JSON
  const wordsPath = path.join(__dirname, 'words_data.json')
  const wordsData = JSON.parse(fs.readFileSync(wordsPath, 'utf-8'))

  console.log(`Seeding ${wordsData.length} words...`)

  for (const wordData of wordsData) {
    await prisma.word.upsert({
      where: { word: wordData.word },
      update: {
        pronunciation: wordData.pronunciation,
        partOfSpeech: wordData.partOfSpeech,
        definition: wordData.definition,
        example: wordData.example,
      },
      create: {
        word: wordData.word,
        pronunciation: wordData.pronunciation,
        partOfSpeech: wordData.partOfSpeech,
        definition: wordData.definition,
        example: wordData.example,
        difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
      },
    })
  }

  console.log('Seeding complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
