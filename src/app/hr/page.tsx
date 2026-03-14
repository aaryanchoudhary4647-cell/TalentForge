'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Brain, Plus, Users, Briefcase, TrendingUp, LogOut, ChevronRight, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { PageWrapper, Button, Card, Badge } from '@/components/ui'
import { MockBanner } from '@/components/ui/MockBanner'
import { MOCK_JOBS, MOCK_CANDIDATES } from '@/lib/mock-data'
import { getHRSignalStyle, getEmotionStyle, getScoreColor, formatDate } from '@/lib/utils'
import { IS_MOCK_MODE } from '@/lib/config'

export default function HRDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'candidates' | 'jobs'>('overview')

  const jobs = MOCK_JOBS
  const candidates = MOCK_CANDIDATES

  const handleLogout = async () => { await logout(); router.push('/') }

  const stats = [
    { label: 'Active jobs', value: jobs.length, icon: <Briefcase size={16} />, color: 'text-primary' },
    { label: 'Total candidates', value: candidates.length, icon: <Users size={16} />, color: 'text-accent' },
    { label: 'Hire signals', value: candidates.filter(c => c.hr_signal === 'hire').length, icon: <TrendingUp size={16} />, color: 'text-emerald-500' },
    { label: 'Avg score', value: `${Math.round(candidates.reduce((a, c) => a + c.overall_score, 0) / candidates.length)}`, icon: <TrendingUp size={16} />, color: 'text-amber-500' },
  ]

  return (
    <PageWrapper>
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-60 glass-sidebar flex flex-col z-40">
        <div className="p-5 border-b border-white/20 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Brain size={14} className="text-white" />
            </div>
            <span className="text-slate-900 dark:text-white font-extrabold tracking-tight">TalentForge</span>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: <TrendingUp size={15} /> },
            { id: 'candidates', label: 'Candidates', icon: <Users size={15} /> },
            { id: 'jobs', label: 'Job postings', icon: <Briefcase size={15} /> },
          ].map(tab => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
              }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/20 dark:border-white/5">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold ring-2 ring-primary/20">
              {user?.name?.[0] || 'H'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 dark:text-white text-xs font-bold truncate">{user?.name || 'HR Manager'}</p>
              <p className="text-slate-400 text-xs truncate">{user?.email || 'hr@company.com'}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-slate-500" onClick={handleLogout}>
            <LogOut size={13} /> Sign out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-60">
        <div className="p-8 max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {activeTab === 'overview' && 'Dashboard'}
                {activeTab === 'candidates' && 'Candidates'}
                {activeTab === 'jobs' && 'Job postings'}
              </h1>
              <p className="text-slate-400 text-sm mt-0.5 font-medium">
                {IS_MOCK_MODE ? 'Showing demo data — connect Supabase to see real data' : `${user?.org_id || 'Your organisation'}`}
              </p>
            </div>
            <Button size="sm" className="gap-2">
              <Plus size={14} /> New job
            </Button>
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                {stats.map(s => (
                  <Card key={s.label} className="p-5 hover:translate-y-[-4px] transition-all duration-300">
                    <div className={`${s.color} mb-2`}>{s.icon}</div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{s.value}</div>
                    <div className="text-slate-400 text-xs mt-0.5 font-bold uppercase tracking-wider">{s.label}</div>
                  </Card>
                ))}
              </div>

              {/* Recent candidates */}
              <Card className="overflow-hidden">
                <div className="px-5 py-4 border-b border-white/40 dark:border-white/5 flex items-center justify-between bg-white/30 dark:bg-black/20">
                  <h2 className="text-slate-900 dark:text-white font-extrabold text-sm uppercase tracking-wider">Recent candidates</h2>
                  <button onClick={() => setActiveTab('candidates')} className="text-primary text-xs font-black uppercase tracking-widest hover:underline underline-offset-4 flex items-center gap-1">
                    View all <ChevronRight size={12} />
                  </button>
                </div>
                <div className="divide-y divide-white/30 dark:divide-white/4">
                  {candidates.slice(0, 3).map(c => (
                    <Link key={c.id} href={`/report/${c.id}`}
                      className="flex items-center justify-between px-5 py-4 hover:bg-white/20 dark:hover:bg-white/2 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {c.name[0]}
                        </div>
                        <div>
                          <p className="text-slate-900 dark:text-white text-sm font-bold">{c.name}</p>
                          <p className="text-slate-400 text-xs">{c.job_title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${getScoreColor(c.overall_score)}`}>{c.overall_score}</span>
                        <span className={`text-xs px-2.5 py-1 rounded-md font-bold capitalize ${getHRSignalStyle(c.hr_signal)}`}>
                          {c.hr_signal}
                        </span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* CANDIDATES TAB */}
          {activeTab === 'candidates' && (
            <Card className="overflow-hidden">
              <div className="divide-y divide-white/30 dark:divide-white/4">
                {candidates.map(c => (
                  <Link key={c.id} href={`/report/${c.id}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-white/20 dark:hover:bg-white/2 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white font-bold">{c.name}</p>
                        <p className="text-slate-400 text-xs">{c.job_title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className={`font-bold ${getScoreColor(c.overall_score)}`}>{c.overall_score}</div>
                        <div className="text-slate-400 text-xs font-bold uppercase">score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-700 dark:text-slate-300 font-bold">Top {100 - c.percentile_rank}%</div>
                        <div className="text-slate-400 text-xs font-bold uppercase">percentile</div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-md font-bold capitalize ${getEmotionStyle(c.emotion)}`}>
                        {c.emotion}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-md font-bold capitalize ${getHRSignalStyle(c.hr_signal)}`}>
                        {c.hr_signal}
                      </span>
                      <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                        <Clock size={11} />
                        {formatDate(c.completed_at)}
                      </div>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* JOBS TAB */}
          {activeTab === 'jobs' && (
            <div className="grid gap-4">
              {jobs.map(j => (
                <Card key={j.id} className="p-5 hover:translate-y-[-2px] transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-slate-900 dark:text-white font-extrabold">{j.title}</h3>
                        <Badge label={j.level} className="text-primary border-primary/20 bg-primary/10" />
                        <Badge label={j.domain} className="text-slate-500 border-slate-300/50 bg-slate-200/30" />
                      </div>
                      <p className="text-slate-500 text-sm line-clamp-2 mb-3">{j.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1"><Users size={11} /> {j.candidates_count} candidates</span>
                        <span className="flex items-center gap-1"><TrendingUp size={11} /> Avg score: {j.avg_score}</span>
                        <span className="flex items-center gap-1"><Clock size={11} /> {formatDate(j.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" variant="secondary">View candidates</Button>
                      <Button size="sm" variant="ghost" className="text-xs">Copy interview link</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <MockBanner />
    </PageWrapper>
  )
}
