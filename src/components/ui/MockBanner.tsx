'use client'
import { IS_MOCK_MODE } from '@/lib/config'
import { FlaskConical } from 'lucide-react'

export function MockBanner() {
  if (!IS_MOCK_MODE) return null
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-amber-600 dark:text-amber-400 text-xs font-bold shadow-lg border border-amber-500/20">
      <FlaskConical size={13} />
      <span>Mock mode — add API keys to go live</span>
    </div>
  )
}
