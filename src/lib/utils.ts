import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function getScoreColor(score: number) {
  if (score >= 75) return 'text-emerald-400'
  if (score >= 50) return 'text-amber-400'
  return 'text-red-400'
}

export function getScoreBg(score: number) {
  if (score >= 75) return 'bg-emerald-400'
  if (score >= 50) return 'bg-amber-400'
  return 'bg-red-400'
}

export function getHRSignalStyle(signal: string) {
  if (signal === 'hire') return 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/25'
  if (signal === 'hold') return 'text-amber-400 bg-amber-400/10 border border-amber-400/25'
  return 'text-red-400 bg-red-400/10 border border-red-400/25'
}

export function getEmotionStyle(emotion: string) {
  if (emotion === 'confident') return 'text-emerald-400 bg-emerald-400/10'
  if (emotion === 'neutral') return 'text-blue-400 bg-blue-400/10'
  if (emotion === 'hesitant') return 'text-amber-400 bg-amber-400/10'
  return 'text-red-400 bg-red-400/10'
}

export function detectHedging(text: string): number {
  const phrases = ['i think','i believe','maybe','perhaps','probably',
    'not sure','i guess','sort of','kind of','might be','could be',
    'i suppose','not certain','i feel like','possibly']
  const lower = text.toLowerCase()
  return phrases.filter(p => lower.includes(p)).length
}

export function classifyEmotion(latencyMs: number, hedging: number, length: number) {
  if (latencyMs < 3000 && hedging === 0 && length > 80) return 'confident'
  if (latencyMs > 10000 || hedging > 3) return 'stressed'
  if (latencyMs > 6000 || hedging > 1) return 'hesitant'
  return 'neutral'
}

export function getStressLevel(latencyMs: number, hedging: number): number {
  let stress = 0
  if (latencyMs > 3000) stress += Math.min((latencyMs - 3000) / 200, 40)
  stress += hedging * 12
  return Math.min(Math.round(stress), 100)
}
