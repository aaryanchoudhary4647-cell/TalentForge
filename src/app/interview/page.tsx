'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Brain, ChevronRight, Clock, AlertCircle } from 'lucide-react'
import { PageWrapper, Button, Card } from '@/components/ui'
import { MockBanner } from '@/components/ui/MockBanner'
import { MOCK_QUESTIONS } from '@/lib/mock-data'
import { detectHedging, classifyEmotion, getStressLevel, cn } from '@/lib/utils'

const TIER_LABELS = { intro: 'Introduction', technical: 'Technical', advanced: 'Advanced' }
const TIER_ORDER = ['intro', 'technical', 'advanced'] as const

type Tier = typeof TIER_ORDER[number]

interface AnswerRecord {
  question_id: string
  question_text: string
  answer_text: string
  latency_ms: number
  hedging_count: number
  emotion: string
  stress_level: number
}

export default function InterviewPage() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [liveStress, setLiveStress] = useState(0)
  const [liveEmotion, setLiveEmotion] = useState('neutral')
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())
  const [firstKeystroke, setFirstKeystroke] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const questions = MOCK_QUESTIONS
  const currentQ = questions[currentIndex]
  const currentTier: Tier = currentQ?.tier || 'intro'
  const progress = ((currentIndex) / questions.length) * 100
  const tiersCompleted = TIER_ORDER.slice(0, TIER_ORDER.indexOf(currentTier))

  // Timer
  useEffect(() => {
    setStartTime(Date.now())
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  // Reset on question change
  useEffect(() => {
    setAnswer('')
    setFirstKeystroke(null)
    setQuestionStartTime(Date.now())
    setLiveStress(0)
    setLiveEmotion('neutral')
    textareaRef.current?.focus()
  }, [currentIndex])

  // Live stress analysis as user types
  const analyzeAnswer = useCallback((text: string) => {
    const latency = firstKeystroke ? firstKeystroke - questionStartTime : 0
    const hedging = detectHedging(text)
    const stress = getStressLevel(latency, hedging)
    const emotion = classifyEmotion(latency, hedging, text.length)
    setLiveStress(stress)
    setLiveEmotion(emotion)
  }, [firstKeystroke, questionStartTime])

  const handleKeyDown = () => {
    if (!firstKeystroke) setFirstKeystroke(Date.now())
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value)
    analyzeAnswer(e.target.value)
  }

  const handleNext = async () => {
    if (!answer.trim()) return
    setSubmitting(true)

    const latency = firstKeystroke ? firstKeystroke - questionStartTime : 5000
    const hedging = detectHedging(answer)
    const record: AnswerRecord = {
      question_id: currentQ.id,
      question_text: currentQ.text,
      answer_text: answer,
      latency_ms: latency,
      hedging_count: hedging,
      emotion: classifyEmotion(latency, hedging, answer.length),
      stress_level: getStressLevel(latency, hedging),
    }

    const newAnswers = [...answers, record]
    setAnswers(newAnswers)

    await new Promise(r => setTimeout(r, 500))
    setSubmitting(false)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      router.push('/report/mock-session-1')
    }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const stressColor = liveStress > 65 ? 'bg-red-400' : liveStress > 35 ? 'bg-amber-400' : 'bg-emerald-400'
  const emotionColors: Record<string, string> = {
    confident: 'text-emerald-600 bg-emerald-500/10',
    neutral:   'text-accent bg-accent/10',
    hesitant:  'text-amber-600 bg-amber-500/10',
    stressed:  'text-red-600 bg-red-500/10',
  }

  if (!currentQ) return null

  return (
    <PageWrapper className="min-h-screen flex flex-col">
      {/* Decorative radial blurs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass-header">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Brain size={14} className="text-white" />
          </div>
          <span className="text-slate-900 dark:text-white font-extrabold text-sm">TalentForge Interview</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            Q {currentIndex + 1} of {questions.length}
          </span>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
            <Clock size={12} />
            {formatTime(elapsed)}
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="fixed top-[57px] left-0 right-0 h-1 bg-slate-200/50 dark:bg-white/5 z-50">
        <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-r-full" style={{ width: `${progress}%` }} />
      </div>

      {/* Tier pills */}
      <div className="fixed top-[65px] left-0 right-0 flex justify-center gap-2 py-3 bg-white/40 dark:bg-black/20 backdrop-blur-sm z-40 border-b border-white/40 dark:border-white/4">
        {TIER_ORDER.map(tier => (
          <div key={tier} className={cn(
            'px-3 py-1 rounded-full text-xs font-bold border transition-all uppercase tracking-wider',
            currentTier === tier
              ? 'bg-primary/10 border-primary/30 text-primary'
              : tiersCompleted.includes(tier)
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-white/40 dark:bg-white/3 border-white/60 dark:border-white/8 text-slate-400'
          )}>
            {tier === currentTier && <span className="mr-1.5">●</span>}
            {TIER_LABELS[tier]}
          </div>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-36 pb-10 relative z-10">
        <div className="w-full max-w-2xl">

          {/* Question card */}
          <Card className="p-7 mb-5">
            <div className="flex items-start gap-3 mb-5">
              <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {currentIndex + 1}
              </span>
              <p className="text-slate-900 dark:text-white text-lg leading-relaxed font-bold">{currentQ.text}</p>
            </div>
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer here..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/8 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none leading-relaxed backdrop-blur-sm"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-slate-400 text-xs font-bold">
                {answer.length} chars
                {answer.length < 50 && answer.length > 0 && (
                  <span className="text-amber-500 ml-2">— try to elaborate more</span>
                )}
              </span>
              <Button onClick={handleNext} loading={submitting} disabled={!answer.trim() || answer.length < 10} className="gap-2">
                {currentIndex < questions.length - 1 ? <>Next question <ChevronRight size={15} /></> : <>Finish interview ✓</>}
              </Button>
            </div>
          </Card>

          {/* Live analysis panel */}
          <div className="grid grid-cols-2 gap-4">
            {/* Stress meter */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Stress level</span>
                <span className="text-slate-700 dark:text-slate-300 text-xs font-bold">{liveStress}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200/50 dark:bg-slate-800/50 overflow-hidden">
                <div className={cn('h-full rounded-full transition-all duration-700', stressColor,
                  liveStress > 65 ? 'stress-pulse' : '')}
                  style={{ width: `${liveStress}%` }}
                />
              </div>
              <p className="text-slate-400 text-xs mt-2 font-medium">
                {liveStress > 65 ? 'High stress detected' : liveStress > 35 ? 'Mild hesitation' : 'Relaxed response'}
              </p>
            </Card>

            {/* Emotion */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Detected emotion</span>
              </div>
              <div className={cn('inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold capitalize', emotionColors[liveEmotion])}>
                {liveEmotion}
              </div>
              {detectHedging(answer) > 0 && (
                <div className="flex items-center gap-1.5 mt-2 text-amber-500 text-xs font-medium">
                  <AlertCircle size={11} />
                  {detectHedging(answer)} hedging phrase{detectHedging(answer) > 1 ? 's' : ''} detected
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      <MockBanner />
    </PageWrapper>
  )
}
