import type { Metadata } from 'next'
import { AuthProvider } from '@/hooks/useAuth'
import '../styles/global.css'

export const metadata: Metadata = {
  title: 'TalentForge — Smarter hiring. Fairer evaluation.',
  description: 'AI-powered enterprise interview simulation platform by Code Blooded',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
