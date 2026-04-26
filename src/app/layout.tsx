import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'WordSmart - IBA MBA Vocabulary',
  description: 'Premium vocabulary learning platform for IBA MBA preparation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0f] text-slate-200 min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
