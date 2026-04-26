-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Word" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "word" TEXT NOT NULL,
    "pronunciation" TEXT,
    "partOfSpeech" TEXT,
    "definition" TEXT NOT NULL,
    "bengaliMeaning" TEXT,
    "synonyms" TEXT,
    "antonyms" TEXT,
    "example" TEXT,
    "origin" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserWordProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "wordId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "lastSeen" DATETIME,
    "nextReview" DATETIME,
    CONSTRAINT "UserWordProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserWordProgress_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "wordId" INTEGER NOT NULL,
    "quizType" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "wordId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bookmark_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Streak" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivity" DATETIME,
    CONSTRAINT "Streak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Word_word_key" ON "Word"("word");

-- CreateIndex
CREATE UNIQUE INDEX "UserWordProgress_userId_wordId_key" ON "UserWordProgress"("userId", "wordId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_wordId_key" ON "Bookmark"("userId", "wordId");

-- CreateIndex
CREATE UNIQUE INDEX "Streak_userId_key" ON "Streak"("userId");
