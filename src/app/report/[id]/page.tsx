'use client'
import Link from 'next/link'
import { ArrowLeft, Brain, TrendingUp, AlertCircle, CheckCircle, Users, BarChart3 } from 'lucide-react'
import { PageWrapper, Card, ScoreBar } from '@/components/ui'
import { MockBanner } from '@/components/ui/MockBanner'
import { MOCK_REPORT } from '@/lib/mock-data'
import { getHRSignalStyle, getScoreColor, getEmotionStyle, cn } from '@/lib/utils'

// In live mode, this page will fetch real data using the session ID from the URL.
// For now it uses MOCK_REPORT which has all the same shape as the real API response.

export default function ReportPage() {
  // TODO: useEffect to fetch real report by params.id when backend is ready
  const report = MOCK_REPORT

  const signalStyle = getHRSignalStyle(report.hr_signal)
  const scoreColor = getScoreColor(report.overall_score)

  const dimensionLabels: Record<string, string> = {
    correctness: 'Correctness',
    relevance:   'Relevance',
    clarity:     'Clarity',
    depth:       'Depth',
    emotion_score: 'Confidence',
  }

  return (
    <PageWrapper>
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-8 py-4 bg-[#0a0a0f]/90 border-b border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link href="/hr" className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm transition-colors">
            <ArrowLeft size={15} /> Dashboard
          </Link>
          <span className="text-white/15">/</span>
          <span className="text-white/60 text-sm">Interview Report</span>
        </div>
        <div className="flex items-center gap-2">
          <Brain size={15} className="text-indigo-400" />
          <span className="text-white text-sm font-semibold">TalentForge</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Hero card */}
        <Card className="p-7">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 text-2xl font-bold">
                {report.candidate_name[0]}
              </div>
              <div>
                <h1 className="text-white text-xl font-bold">{report.candidate_name}</h1>
                <p className="text-white/45 text-sm">{report.job_title}</p>
              </div>
            </div>
            <span className={cn('text-sm px-4 py-1.5 rounded-full font-mono capitalize font-medium', signalStyle)}>
              {report.hr_signal === 'hire' ? '✓ Hire' : report.hr_signal === 'hold' ? '⏸ Hold' : '✕ Reject'}
            </span>
          </div>

          {/* 4 key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/3 rounded-xl p-4 text-center">
              <div className={`text-3xl font-bold ${scoreColor}`}>{report.overall_score}</div>
              <div className="text-white/35 text-xs mt-1">Overall score</div>
            </div>
            <div className="bg-white/3 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-indigo-400">Top {100 - report.percentile_rank}%</div>
              <div className="text-white/35 text-xs mt-1">of {report.total_candidates_in_pool} candidates</div>
            </div>
            <div className="bg-white/3 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-emerald-400">{report.role_fit_percentage}%</div>
              <div className="text-white/35 text-xs mt-1">Role fit score</div>
            </div>
            <div className="bg-white/3 rounded-xl p-4 text-center">
              <div className={`text-lg font-bold capitalize mt-1 ${getEmotionStyle(report.responses[0]?.emotion || 'neutral').split(' ')[0]}`}>
                {report.responses[0]?.emotion || 'neutral'}
              </div>
              <div className="text-white/35 text-xs mt-1">Dominant emotion</div>
            </div>
          </div>
        </Card>

        {/* 2-col grid */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Scores breakdown */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={15} className="text-indigo-400" />
              <h2 className="text-white font-semibold text-sm">Score breakdown</h2>
            </div>
            <div className="space-y-3">
              {Object.entries(dimensionLabels).map(([key, label]) => (
                <ScoreBar key={key} label={label}
                  value={report.scores_breakdown[key as keyof typeof report.scores_breakdown] as number} />
              ))}
            </div>
          </Card>

          {/* Role fit */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={15} className="text-emerald-400" />
              <h2 className="text-white font-semibold text-sm">AI role-fit analysis</h2>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl font-bold text-emerald-400">{report.role_fit_percentage}%</div>
              <div className="text-white/40 text-sm">match for<br />{report.job_title}</div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">{report.role_fit_reasoning}</p>
          </Card>

          {/* Strengths */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={15} className="text-emerald-400" />
              <h2 className="text-white font-semibold text-sm">Strengths identified</h2>
            </div>
            <div className="space-y-2">
              {report.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span className="text-white/65">{s}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Gaps */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={15} className="text-amber-400" />
              <h2 className="text-white font-semibold text-sm">Areas to probe</h2>
            </div>
            <div className="space-y-2">
              {report.gaps.map((g, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span className="text-white/65">{g}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-white/3 border border-white/6">
              <p className="text-white/40 text-xs leading-relaxed">{report.emotion_summary}</p>
            </div>
          </Card>
        </div>

        {/* Per-question breakdown */}
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
            <Users size={15} className="text-indigo-400" />
            <h2 className="text-white font-semibold text-sm">Per-question breakdown</h2>
          </div>
          <div className="divide-y divide-white/4">
            {report.responses.map((r, i) => (
              <div key={r.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-md bg-indigo-500/15 text-indigo-400 text-[10px] font-mono flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-white/70 text-sm">{r.question_text}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-mono capitalize',
                      r.emotion === 'confident' ? 'text-emerald-400 bg-emerald-400/10' :
                      r.emotion === 'hesitant'  ? 'text-amber-400 bg-amber-400/10' :
                      r.emotion === 'stressed'  ? 'text-red-400 bg-red-400/10' :
                      'text-blue-400 bg-blue-400/10')}>
                      {r.emotion}
                    </span>
                    <span className={`text-sm font-bold ${getScoreColor(r.scores?.overall || 0)}`}>
                      {r.scores?.overall || 0}
                    </span>
                  </div>
                </div>
                <p className="text-white/35 text-xs ml-8 line-clamp-2 mb-2">{r.answer_text}</p>
                <div className="flex items-center gap-4 ml-8 text-[10px] font-mono text-white/20">
                  <span>Latency: {(r.response_latency_ms / 1000).toFixed(1)}s</span>
                  <span>Hedging: {r.hedging_count}</span>
                  {r.scores && <>
                    <span>Correctness: {r.scores.correctness}</span>
                    <span>Clarity: {r.scores.clarity}</span>
                    <span>Depth: {r.scores.depth}</span>
                  </>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Percentile callout */}
        <Card className="p-5 border-indigo-500/20 bg-indigo-500/5">
          <div className="flex items-center gap-3">
            <div className="text-4xl font-bold text-indigo-400">Top {100 - report.percentile_rank}%</div>
            <div>
              <p className="text-white font-medium">Percentile rank</p>
              <p className="text-white/40 text-sm">
                {report.candidate_name} scored better than {report.percentile_rank}% of {report.total_candidates_in_pool} candidates
                who interviewed for this role.
              </p>
            </div>
          </div>
        </Card>

      </main>
      <MockBanner />
    </PageWrapper>
  )
}
