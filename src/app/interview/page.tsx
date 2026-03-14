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

  const questions = MOCK_QUESTIONS  // swap with API call when backend is ready
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

    // TODO: in live mode, call POST /api/session/answer here

    await new Promise(r => setTimeout(r, 500)) // simulate API delay
    setSubmitting(false)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      // Interview complete — go to report
      // In live mode, sessionId would come from the API
      router.push('/report/mock-session-1')
    }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const stressColor = liveStress > 65 ? 'bg-red-400' : liveStress > 35 ? 'bg-amber-400' : 'bg-emerald-400'
  const emotionColors: Record<string, string> = {
    confident: 'text-emerald-400 bg-emerald-400/10',
    neutral:   'text-blue-400 bg-blue-400/10',
    hesitant:  'text-amber-400 bg-amber-400/10',
    stressed:  'text-red-400 bg-red-400/10',
  }

  if (!currentQ) return null

  return (
    <PageWrapper className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0a0a0f]/90 border-b border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-indigo-400" />
          <span className="text-white font-semibold text-sm">TalentForge Interview</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/30 text-xs font-mono">
            Q {currentIndex + 1} of {questions.length}
          </span>
          <div className="flex items-center gap-1.5 text-white/50 text-xs font-mono">
            <Clock size={12} />
            {formatTime(elapsed)}
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="fixed top-[57px] left-0 right-0 h-0.5 bg-white/5 z-50">
        <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Tier pills */}
      <div className="fixed top-[65px] left-0 right-0 flex justify-center gap-2 py-3 bg-[#0a0a0f]/60 backdrop-blur-sm z-40 border-b border-white/4">
        {TIER_ORDER.map(tier => (
          <div key={tier} className={cn(
            'px-3 py-1 rounded-full text-xs font-mono border transition-all',
            currentTier === tier
              ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
              : tiersCompleted.includes(tier)
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400/60'
              : 'bg-white/3 border-white/8 text-white/20'
          )}>
            {tier === currentTier && <span className="mr-1.5">●</span>}
            {TIER_LABELS[tier]}
          </div>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-36 pb-10">
        <div className="w-full max-w-2xl">

          {/* Question card */}
          <Card className="p-7 mb-5">
            <div className="flex items-start gap-3 mb-5">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-mono flex items-center justify-center shrink-0 mt-0.5">
                {currentIndex + 1}
              </span>
              <p className="text-white text-lg leading-relaxed font-medium">{currentQ.text}</p>
            </div>
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer here..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-white/4 border border-white/8 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-all resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-white/20 text-xs font-mono">
                {answer.length} chars
                {answer.length < 50 && answer.length > 0 && (
                  <span className="text-amber-400/60 ml-2">— try to elaborate more</span>
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
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/50 text-xs font-mono uppercase tracking-wide">Stress level</span>
                <span className="text-white/70 text-xs font-mono">{liveStress}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/6 overflow-hidden">
                <div className={cn('h-full rounded-full transition-all duration-700', stressColor,
                  liveStress > 65 ? 'stress-pulse' : '')}
                  style={{ width: `${liveStress}%` }}
                />
              </div>
              <p className="text-white/25 text-xs mt-2">
                {liveStress > 65 ? 'High stress detected' : liveStress > 35 ? 'Mild hesitation' : 'Relaxed response'}
              </p>
            </Card>

            {/* Emotion */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/50 text-xs font-mono uppercase tracking-wide">Detected emotion</span>
              </div>
              <div className={cn('inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium capitalize', emotionColors[liveEmotion])}>
                {liveEmotion}
              </div>
              {detectHedging(answer) > 0 && (
                <div className="flex items-center gap-1.5 mt-2 text-amber-400/60 text-xs">
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
