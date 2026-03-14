'use client'
import Link from 'next/link'
import { ArrowLeft, Brain, TrendingUp, AlertCircle, CheckCircle, Users, BarChart3 } from 'lucide-react'
import { PageWrapper, Card, ScoreBar } from '@/components/ui'
import { MockBanner } from '@/components/ui/MockBanner'
import { MOCK_REPORT } from '@/lib/mock-data'
import { getHRSignalStyle, getScoreColor, getEmotionStyle, cn } from '@/lib/utils'

export default function ReportPage() {
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
      {/* Decorative radial blurs */}
      <div className="fixed top-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-8 py-4 glass-header">
        <div className="flex items-center gap-3">
          <Link href="/hr" className="flex items-center gap-1.5 text-slate-400 hover:text-primary text-sm font-bold transition-colors">
            <ArrowLeft size={15} /> Dashboard
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Interview Report</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Brain size={14} className="text-white" />
          </div>
          <span className="text-slate-900 dark:text-white text-sm font-extrabold">TalentForge</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6 relative z-10">

        {/* Hero card */}
        <Card className="p-7 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-60 h-60 bg-primary/10 rounded-full -mr-30 -mt-30 blur-[60px]"></div>
          <div className="flex items-start justify-between flex-wrap gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-extrabold shadow-lg">
                {report.candidate_name[0]}
              </div>
              <div>
                <h1 className="text-slate-900 dark:text-white text-xl font-extrabold tracking-tight">{report.candidate_name}</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">{report.job_title}</p>
              </div>
            </div>
            <span className={cn('text-sm px-4 py-1.5 rounded-md font-bold capitalize', signalStyle)}>
              {report.hr_signal === 'hire' ? '✓ Hire' : report.hr_signal === 'hold' ? '⏸ Hold' : '✕ Reject'}
            </span>
          </div>

          {/* 4 key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 relative z-10">
            <div className="bg-white/30 dark:bg-slate-900/30 rounded-xl p-4 text-center backdrop-blur-sm border border-white/40 dark:border-white/5">
              <div className={`text-3xl font-extrabold ${scoreColor}`}>{report.overall_score}</div>
              <div className="text-slate-400 text-xs mt-1 font-bold uppercase tracking-wider">Overall score</div>
            </div>
            <div className="bg-white/30 dark:bg-slate-900/30 rounded-xl p-4 text-center backdrop-blur-sm border border-white/40 dark:border-white/5">
              <div className="text-3xl font-extrabold text-primary">Top {100 - report.percentile_rank}%</div>
              <div className="text-slate-400 text-xs mt-1 font-bold uppercase tracking-wider">of {report.total_candidates_in_pool} candidates</div>
            </div>
            <div className="bg-white/30 dark:bg-slate-900/30 rounded-xl p-4 text-center backdrop-blur-sm border border-white/40 dark:border-white/5">
              <div className="text-3xl font-extrabold text-emerald-500">{report.role_fit_percentage}%</div>
              <div className="text-slate-400 text-xs mt-1 font-bold uppercase tracking-wider">Role fit score</div>
            </div>
            <div className="bg-white/30 dark:bg-slate-900/30 rounded-xl p-4 text-center backdrop-blur-sm border border-white/40 dark:border-white/5">
              <div className={`text-lg font-extrabold capitalize mt-1 ${getEmotionStyle(report.responses[0]?.emotion || 'neutral').split(' ')[0]}`}>
                {report.responses[0]?.emotion || 'neutral'}
              </div>
              <div className="text-slate-400 text-xs mt-1 font-bold uppercase tracking-wider">Dominant emotion</div>
            </div>
          </div>
        </Card>

        {/* 2-col grid */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Scores breakdown */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <BarChart3 size={16} className="text-primary" />
              </div>
              <h2 className="text-slate-900 dark:text-white font-extrabold text-sm uppercase tracking-wider">Score breakdown</h2>
            </div>
            <div className="space-y-5">
              {Object.entries(dimensionLabels).map(([key, label]) => (
                <ScoreBar key={key} label={label}
                  value={report.scores_breakdown[key as keyof typeof report.scores_breakdown] as number} />
              ))}
            </div>
          </Card>

          {/* Role fit */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="size-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-emerald-500" />
              </div>
              <h2 className="text-slate-900 dark:text-white font-extrabold text-sm uppercase tracking-wider">AI role-fit analysis</h2>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-5xl font-extrabold text-emerald-500">{report.role_fit_percentage}%</div>
              <div className="text-slate-500 text-sm font-medium">match for<br />{report.job_title}</div>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">{report.role_fit_reasoning}</p>
          </Card>

          {/* Strengths */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="size-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle size={16} className="text-emerald-500" />
              </div>
              <h2 className="text-slate-900 dark:text-white font-extrabold text-sm uppercase tracking-wider">Strengths identified</h2>
            </div>
            <div className="space-y-3">
              {report.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-3 text-sm bg-white/30 dark:bg-slate-900/30 p-3 rounded-xl border border-white/40 dark:border-white/5 backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{s}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Gaps */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="size-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <AlertCircle size={16} className="text-amber-500" />
              </div>
              <h2 className="text-slate-900 dark:text-white font-extrabold text-sm uppercase tracking-wider">Areas to probe</h2>
            </div>
            <div className="space-y-3">
              {report.gaps.map((g, i) => (
                <div key={i} className="flex items-start gap-3 text-sm bg-white/30 dark:bg-slate-900/30 p-3 rounded-xl border border-white/40 dark:border-white/5 backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{g}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-white/20 dark:bg-slate-900/20 border border-white/30 dark:border-white/5 backdrop-blur-sm">
              <p className="text-slate-500 text-xs leading-relaxed">{report.emotion_summary}</p>
            </div>
          </Card>
        </div>

        {/* Per-question breakdown */}
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-white/40 dark:border-white/5 flex items-center gap-2 bg-white/30 dark:bg-black/20">
            <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-primary" />
            </div>
            <h2 className="text-slate-900 dark:text-white font-extrabold text-sm uppercase tracking-wider">Per-question breakdown</h2>
          </div>
          <div className="divide-y divide-white/30 dark:divide-white/4">
            {report.responses.map((r, i) => (
              <div key={r.id} className="px-5 py-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">{r.question_text}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('text-xs px-2.5 py-1 rounded-md font-bold capitalize',
                      ({ confident: 'text-emerald-600 bg-emerald-500/10', hesitant: 'text-amber-600 bg-amber-500/10', stressed: 'text-red-600 bg-red-500/10' } as Record<string, string>)[r.emotion] || 'text-accent bg-accent/10')}>
                      {r.emotion}
                    </span>
                    <span className={`text-sm font-bold ${getScoreColor(r.scores?.overall || 0)}`}>
                      {r.scores?.overall || 0}
                    </span>
                  </div>
                </div>
                <p className="text-slate-400 text-xs ml-10 line-clamp-2 mb-2 font-medium">{r.answer_text}</p>
                <div className="flex items-center gap-4 ml-10 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
        <Card className="p-6 border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -mr-20 -mt-20 blur-[40px]"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="text-5xl font-extrabold text-primary">{100 - report.percentile_rank}%</div>
            <div>
              <p className="text-slate-900 dark:text-white font-extrabold">Percentile rank</p>
              <p className="text-slate-500 text-sm font-medium">
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
