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

  // In live mode this would fetch from Supabase — for now uses mock data
  const jobs = MOCK_JOBS
  const candidates = MOCK_CANDIDATES

  const handleLogout = async () => { await logout(); router.push('/') }

  const stats = [
    { label: 'Active jobs', value: jobs.length, icon: <Briefcase size={16} />, color: 'text-indigo-400' },
    { label: 'Total candidates', value: candidates.length, icon: <Users size={16} />, color: 'text-blue-400' },
    { label: 'Hire signals', value: candidates.filter(c => c.hr_signal === 'hire').length, icon: <TrendingUp size={16} />, color: 'text-emerald-400' },
    { label: 'Avg score', value: `${Math.round(candidates.reduce((a, c) => a + c.overall_score, 0) / candidates.length)}`, icon: <TrendingUp size={16} />, color: 'text-amber-400' },
  ]

  return (
    <PageWrapper>
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-60 bg-[#0d0d14] border-r border-white/5 flex flex-col z-40">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Brain size={14} className="text-white" />
            </div>
            <span className="text-white font-semibold tracking-tight">TalentForge</span>
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
                activeTab === tab.id
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/4'
              }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
              {user?.name?.[0] || 'H'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.name || 'HR Manager'}</p>
              <p className="text-white/30 text-xs truncate">{user?.email || 'hr@company.com'}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-white/40" onClick={handleLogout}>
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
              <h1 className="text-2xl font-bold text-white">
                {activeTab === 'overview' && 'Dashboard'}
                {activeTab === 'candidates' && 'Candidates'}
                {activeTab === 'jobs' && 'Job postings'}
              </h1>
              <p className="text-white/35 text-sm mt-0.5">
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
                  <Card key={s.label} className="p-5">
                    <div className={`${s.color} mb-2`}>{s.icon}</div>
                    <div className="text-2xl font-bold text-white">{s.value}</div>
                    <div className="text-white/35 text-xs mt-0.5">{s.label}</div>
                  </Card>
                ))}
              </div>

              {/* Recent candidates */}
              <Card className="overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-white font-medium text-sm">Recent candidates</h2>
                  <button onClick={() => setActiveTab('candidates')} className="text-indigo-400 text-xs hover:text-indigo-300 flex items-center gap-1">
                    View all <ChevronRight size={12} />
                  </button>
                </div>
                <div className="divide-y divide-white/4">
                  {candidates.slice(0, 3).map(c => (
                    <Link key={c.id} href={`/report/${c.id}`}
                      className="flex items-center justify-between px-5 py-4 hover:bg-white/2 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/15 flex items-center justify-center text-indigo-400 text-xs font-bold">
                          {c.name[0]}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{c.name}</p>
                          <p className="text-white/35 text-xs">{c.job_title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${getScoreColor(c.overall_score)}`}>{c.overall_score}</span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-mono capitalize ${getHRSignalStyle(c.hr_signal)}`}>
                          {c.hr_signal}
                        </span>
                        <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
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
              <div className="divide-y divide-white/4">
                {candidates.map(c => (
                  <Link key={c.id} href={`/report/${c.id}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-white/2 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-indigo-500/15 flex items-center justify-center text-indigo-400 font-bold">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="text-white font-medium">{c.name}</p>
                        <p className="text-white/35 text-xs">{c.job_title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className={`font-bold ${getScoreColor(c.overall_score)}`}>{c.overall_score}</div>
                        <div className="text-white/25 text-xs">score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white/70 font-medium">Top {100 - c.percentile_rank}%</div>
                        <div className="text-white/25 text-xs">percentile</div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-mono capitalize ${getEmotionStyle(c.emotion)}`}>
                        {c.emotion}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-mono capitalize ${getHRSignalStyle(c.hr_signal)}`}>
                        {c.hr_signal}
                      </span>
                      <div className="flex items-center gap-1 text-white/25 text-xs">
                        <Clock size={11} />
                        {formatDate(c.completed_at)}
                      </div>
                      <ChevronRight size={14} className="text-white/20 group-hover:text-indigo-400 transition-colors" />
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
                <Card key={j.id} className="p-5 hover:border-indigo-500/15 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{j.title}</h3>
                        <Badge label={j.level} className="text-indigo-400 border-indigo-400/20 bg-indigo-400/10" />
                        <Badge label={j.domain} className="text-white/40 border-white/10 bg-white/5" />
                      </div>
                      <p className="text-white/40 text-sm line-clamp-2 mb-3">{j.description}</p>
                      <div className="flex items-center gap-4 text-xs text-white/30">
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
