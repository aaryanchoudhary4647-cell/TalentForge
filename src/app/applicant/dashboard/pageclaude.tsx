'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, User, FileText, TrendingUp, LogOut, ChevronRight, Clock, MapPin, Phone, Search, Briefcase, Bell, X, CheckCircle2, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { PageWrapper, Button, Card } from '@/components/ui'
import { MockBanner } from '@/components/ui/MockBanner'
import { supabase } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────
interface Job {
  id: string; hr_id: string; job_title: string; job_description: string
  requirements?: string; salary_min?: number; salary_max?: number
  job_type?: string; location: string; department?: string
  experience_required?: string; status: string; posted_date: string
  closing_date?: string
  hr_profiles?: { company_name: string; office_location?: string }
}

interface Application {
  id: string; job_id: string; applicant_id: string; hr_id: string
  status: string; applied_date: string; cover_letter?: string
  hr_notes?: string; interview_date?: string; result?: string
  job_postings?: Job
}

interface Profile {
  first_name: string; last_name: string; phone?: string
  location?: string; current_job_title?: string; bio?: string
  linkedin_url?: string; github_url?: string; portfolio_url?: string
  experience_years?: number; highest_qualification?: string
}

const STATUS_COLORS: Record<string, string> = {
  Pending:     'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  Shortlisted: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  Interview:   'bg-primary/10 text-primary border-primary/20',
  Rejected:    'bg-red-500/10 text-red-500 border-red-500/20',
  Offer:       'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  Hired:       'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
}

const STATUS_ICONS: Record<string, string> = {
  Pending: '⏳', Shortlisted: '⭐', Interview: '🎙️',
  Rejected: '✕', Offer: '🎉', Hired: '✅',
}

export default function ApplicantDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'applications' | 'profile'>('overview')

  // ── Data state ──
  const [profile, setProfile]           = useState<Profile | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [jobs, setJobs]                 = useState<Job[]>([])
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; is_read: boolean; created_at: string }[]>([])
  const [loading, setLoading]           = useState(true)

  // ── UI state ──
  const [search, setSearch]         = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showNotif, setShowNotif]   = useState(false)
  const [applyModal, setApplyModal] = useState<Job | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [applying, setApplying]     = useState(false)

  // ── Fetch all data ─────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const [profileRes, appsRes, jobsRes, notifRes] = await Promise.all([
      supabase.from('applicant_profiles').select('*').eq('id', user.id).single(),
      supabase.from('applications')
        .select('*, job_postings(*, hr_profiles(company_name, office_location))')
        .eq('applicant_id', user.id)
        .order('applied_date', { ascending: false }),
      supabase.from('job_postings')
        .select('*, hr_profiles(company_name, office_location)')
        .eq('status', 'Open')
        .order('posted_date', { ascending: false }),
      supabase.from('notifications')
        .select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false }).limit(15),
    ])

    if (profileRes.data) setProfile(profileRes.data)
    if (appsRes.data)    setApplications(appsRes.data)
    if (jobsRes.data)    setJobs(jobsRes.data)
    if (notifRes.data)   setNotifications(notifRes.data)

    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    fetchAll()
  }, [user, fetchAll, router])

  const handleLogout = async () => { await logout(); router.push('/') }

  const alreadyApplied = (jobId: string) => applications.some(a => a.job_id === jobId)

  const markNotifRead = async () => {
    const unread = notifications.filter(n => !n.is_read).map(n => n.id)
    if (unread.length > 0) {
      await supabase.from('notifications').update({ is_read: true }).in('id', unread)
      setNotifications(n => n.map(x => ({ ...x, is_read: true })))
    }
  }

  const handleApply = async () => {
    if (!applyModal || !user) return
    setApplying(true)
    const { error } = await supabase.from('applications').insert({
      job_id:       applyModal.id,
      applicant_id: user.id,
      hr_id:        applyModal.hr_id,
      status:       'Pending',
      cover_letter: coverLetter.trim() || null,
    })
    if (!error) {
      await supabase.from('notifications').insert({
        user_id:        applyModal.hr_id,
        type:           'application_status',
        title:          'New Application',
        message:        `Someone applied for ${applyModal.job_title}`,
        related_job_id: applyModal.id,
      })
      setApplyModal(null)
      setCoverLetter('')
      fetchAll()
      setActiveTab('applications')
    }
    setApplying(false)
  }

  // ── Derived ────────────────────────────────────────────────
  const filteredJobs = jobs.filter(j => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      j.job_title.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q) ||
      (j.hr_profiles?.company_name || '').toLowerCase().includes(q)
    const matchType = typeFilter === 'all' || j.job_type === typeFilter
    return matchSearch && matchType
  })

  const pendingInterviews = applications.filter(
    a => a.status === 'Interview' && a.interview_date && !a.result
  )
  const unreadCount = notifications.filter(n => !n.is_read).length

  const stats = [
    { label: 'Applications Sent',  value: applications.length,                                         icon: <FileText size={16} />, color: 'text-primary' },
    { label: 'Open Jobs',          value: jobs.length,                                                  icon: <Briefcase size={16} />, color: 'text-accent' },
    { label: 'Interviews Pending', value: pendingInterviews.length,                                     icon: <Clock size={16} />, color: 'text-emerald-500' },
    { label: 'Offers Received',    value: applications.filter(a => a.status === 'Offer' || a.status === 'Hired').length, icon: <TrendingUp size={16} />, color: 'text-amber-500' },
  ]

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mx-auto mb-3 shadow-lg shadow-accent/20 animate-pulse">
          <Brain size={20} className="text-white" />
        </div>
        <p className="text-slate-400 text-sm font-bold">Loading...</p>
      </div>
    </div>
  )

  return (
    <PageWrapper>
      {/* ── Sidebar ── */}
      <div className="fixed left-0 top-0 bottom-0 w-60 glass-sidebar flex flex-col z-40">
        <div className="p-5 border-b border-white/20 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
              <Brain size={14} className="text-white" />
            </div>
            <span className="text-slate-900 dark:text-white font-extrabold tracking-tight">TalentForge</span>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {[
            { id: 'overview',      label: 'Overview',          icon: <TrendingUp size={15} /> },
            { id: 'jobs',          label: 'Browse Jobs',        icon: <Search size={15} /> },
            { id: 'applications',  label: 'My Applications',    icon: <FileText size={15} /> },
            { id: 'profile',       label: 'My Profile',         icon: <User size={15} /> },
          ].map(tab => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${
                activeTab === tab.id
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
              }`}
            >
              {tab.icon}{tab.label}
              {/* Badge on Applications when interview pending */}
              {tab.id === 'applications' && pendingInterviews.length > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center">
                  {pendingInterviews.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/20 dark:border-white/5">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold ring-2 ring-accent/20">
              {profile?.first_name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 dark:text-white text-xs font-bold truncate">
                {profile?.first_name} {profile?.last_name}
              </p>
              <p className="text-slate-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-slate-500" onClick={handleLogout}>
            <LogOut size={13} /> Sign out
          </Button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="pl-60">
        <div className="p-8 max-w-5xl">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {activeTab === 'overview'     && 'Dashboard'}
                {activeTab === 'jobs'         && 'Browse Jobs'}
                {activeTab === 'applications' && 'My Applications'}
                {activeTab === 'profile'      && 'My Profile'}
              </h1>
              <p className="text-slate-400 text-sm mt-0.5 font-medium">Manage your job search</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Notifications bell */}
              <div className="relative">
                <button onClick={() => { setShowNotif(!showNotif); markNotifRead() }}
                  className="relative w-9 h-9 rounded-xl flex items-center justify-center glass-card hover:scale-105 transition-all border border-white/40 dark:border-white/5">
                  <Bell size={15} className="text-slate-500" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-white text-[9px] font-black flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {showNotif && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-12 w-80 glass-card rounded-2xl shadow-2xl overflow-hidden z-50 border border-white/40 dark:border-white/5">
                      <div className="px-4 py-3 border-b border-white/30 dark:border-white/5 flex justify-between items-center">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Notifications</span>
                        <button onClick={() => setShowNotif(false)}><X size={14} className="text-slate-400" /></button>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-white/20 dark:divide-white/4">
                        {notifications.length === 0 && <p className="text-center text-slate-400 text-xs py-8">No notifications yet</p>}
                        {notifications.map(n => (
                          <div key={n.id} className={`px-4 py-3 ${!n.is_read ? 'bg-accent/5' : ''}`}>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button size="sm" className="gap-2" onClick={() => router.push('/onboarding/applicant')}>
                <User size={14} /> Edit Profile
              </Button>
            </div>
          </div>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                  <Card key={i} className="p-4 text-center hover:translate-y-[-2px] transition-all duration-300">
                    <div className={`w-10 h-10 rounded-xl bg-white/40 dark:bg-white/5 flex items-center justify-center mx-auto mb-2 ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{stat.value}</div>
                    <div className="text-slate-500 text-xs font-medium mt-0.5">{stat.label}</div>
                  </Card>
                ))}
              </div>

              {/* Interview alert */}
              {pendingInterviews.length > 0 && (
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 text-lg shadow-lg shadow-primary/25">🎙️</div>
                  <div className="flex-1">
                    <p className="text-slate-900 dark:text-white font-extrabold text-sm">You have {pendingInterviews.length} interview{pendingInterviews.length > 1 ? 's' : ''} scheduled!</p>
                    <p className="text-slate-500 text-xs mt-0.5">Go to My Applications and join when it&apos;s time.</p>
                  </div>
                  <Button size="sm" onClick={() => setActiveTab('applications')}>View <ChevronRight size={13} /></Button>
                </div>
              )}

              {/* Recent applications */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Applications</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('applications')} className="gap-1">
                    View all <ChevronRight size={14} />
                  </Button>
                </div>
                <div className="space-y-3">
                  {applications.slice(0, 3).map(app => {
                    const job = app.job_postings as Job | undefined
                    return (
                      <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-black text-sm">
                            {(job?.hr_profiles?.company_name || 'C')[0]}
                          </div>
                          <div>
                            <p className="text-slate-900 dark:text-white font-bold text-sm">{job?.job_title}</p>
                            <p className="text-slate-500 text-xs">{job?.hr_profiles?.company_name} • {job?.location}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${STATUS_COLORS[app.status] || STATUS_COLORS['Pending']}`}>
                          {STATUS_ICONS[app.status]} {app.status}
                        </span>
                      </div>
                    )
                  })}
                  {applications.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <FileText size={28} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-medium">No applications yet</p>
                      <Button size="sm" className="mt-3" onClick={() => setActiveTab('jobs')}>Browse Jobs</Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* ── BROWSE JOBS TAB ── */}
          {activeTab === 'jobs' && (
            <div className="space-y-5">
              {/* Search + filter */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search job title, company, location..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/8 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:border-accent/50 transition-all backdrop-blur-sm" />
                </div>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                  className="h-11 px-4 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/8 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-accent/50 transition-all backdrop-blur-sm">
                  <option value="all">All Types</option>
                  {['Full-time', 'Part-time', 'Contract', 'Internship'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <p className="text-slate-400 text-xs font-bold">{filteredJobs.length} open position{filteredJobs.length !== 1 ? 's' : ''}</p>

              <div className="grid gap-4">
                {filteredJobs.map(job => {
                  const applied = alreadyApplied(job.id)
                  return (
                    <Card key={job.id} className="p-6 hover:translate-y-[-2px] transition-all duration-300">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-black text-sm shrink-0">
                              {(job.hr_profiles?.company_name || 'C')[0]}
                            </div>
                            <div>
                              <p className="text-accent text-xs font-bold">{job.hr_profiles?.company_name}</p>
                              <p className="text-slate-400 text-xs">{job.hr_profiles?.office_location}</p>
                            </div>
                          </div>
                          <h3 className="text-slate-900 dark:text-white font-extrabold text-base mb-1">{job.job_title}</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-3 leading-relaxed">{job.job_description}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            {job.job_type && (
                              <span className="px-2.5 py-1 rounded-md bg-accent/10 text-accent border border-accent/20 font-bold">{job.job_type}</span>
                            )}
                            <span className="flex items-center gap-1 text-slate-400 font-medium"><Briefcase size={11} /> {job.location}</span>
                            {job.experience_required && (
                              <span className="flex items-center gap-1 text-slate-400 font-medium"><Zap size={11} /> {job.experience_required}</span>
                            )}
                            {job.salary_min && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                ₹{(job.salary_min / 100000).toFixed(1)}L – ₹{((job.salary_max || 0) / 100000).toFixed(1)}L
                              </span>
                            )}
                            {job.closing_date && (
                              <span className="flex items-center gap-1 text-slate-400 font-medium">
                                <Clock size={11} /> Closes {new Date(job.closing_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0">
                          {applied ? (
                            <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                              <CheckCircle2 size={13} /> Applied
                            </span>
                          ) : (
                            <Button size="sm" className="gap-1.5" onClick={() => { setApplyModal(job); setCoverLetter('') }}>
                              Apply Now <ChevronRight size={13} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
                {filteredJobs.length === 0 && (
                  <div className="text-center py-16 text-slate-400">
                    <Search size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="font-bold">No jobs found</p>
                    <p className="text-sm mt-1">Try a different search or filter</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── APPLICATIONS TAB ── */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              {pendingInterviews.length > 0 && (
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-3">
                  <span className="text-xl">🎙️</span>
                  <p className="text-slate-900 dark:text-white font-extrabold text-sm flex-1">
                    {pendingInterviews.length} interview{pendingInterviews.length > 1 ? 's' : ''} ready — join below when it&apos;s time!
                  </p>
                </div>
              )}

              {applications.map(app => {
                const job = app.job_postings as Job | undefined
                const canJoin = app.status === 'Interview' && app.interview_date && !app.result
                return (
                  <Card key={app.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-black text-base">
                          {(job?.hr_profiles?.company_name || 'C')[0]}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{job?.job_title}</h3>
                          <p className="text-slate-500 text-sm">
                            {job?.hr_profiles?.company_name} • {job?.location}
                          </p>
                          <p className="text-slate-400 text-xs mt-0.5">
                            Applied {new Date(app.applied_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>

                          {/* Interview date */}
                          {app.interview_date && (
                            <p className="text-primary text-xs font-bold mt-1">
                              🗓️ Interview: {new Date(app.interview_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                              {' at '}{new Date(app.interview_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}

                          {/* HR notes */}
                          {app.hr_notes && (
                            <p className="text-slate-500 text-xs mt-1 italic">💬 {app.hr_notes}</p>
                          )}

                          {/* Result */}
                          {app.result && app.result !== 'Pending' && (
                            <p className={`text-xs font-bold mt-1 ${app.result === 'Pass' ? 'text-emerald-500' : 'text-red-500'}`}>
                              {app.result === 'Pass' ? '✅ Passed' : '❌ Not passed'}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${STATUS_COLORS[app.status] || STATUS_COLORS['Pending']}`}>
                          {STATUS_ICONS[app.status]} {app.status}
                        </span>
                        {canJoin && (
                          <Button size="sm" onClick={() => router.push(`/interview?applicationId=${app.id}`)}>
                            🎙️ Join Interview
                          </Button>
                        )}
                        {app.result && app.result !== 'Pending' && (
                          <Button variant="secondary" size="sm" onClick={() => router.push(`/report/${app.id}`)}>
                            View Report
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}

              {applications.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                  <FileText size={40} className="mx-auto mb-4 opacity-25" />
                  <p className="font-extrabold text-lg text-slate-600 dark:text-slate-400">No applications yet</p>
                  <p className="text-sm mt-2">Browse jobs and click <strong>Apply Now</strong> to get started</p>
                  <Button className="mt-6" onClick={() => setActiveTab('jobs')}>Browse Jobs</Button>
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User size={16} className="text-slate-400 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300">
                    {profile?.first_name || '—'} {profile?.last_name}
                    {profile?.current_job_title && <span className="text-slate-400 ml-2">· {profile.current_job_title}</span>}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-slate-400 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300">{profile?.location || 'Location not set'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-slate-400 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300">{profile?.phone || 'Phone not set'}</span>
                </div>
                {profile?.bio && (
                  <div className="pt-2 border-t border-white/30 dark:border-white/5">
                    <p className="text-slate-500 text-sm leading-relaxed">{profile.bio}</p>
                  </div>
                )}
                {(profile?.linkedin_url || profile?.github_url || profile?.portfolio_url) && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-accent text-xs font-bold hover:underline">LinkedIn ↗</a>}
                    {profile.github_url && <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-accent text-xs font-bold hover:underline">GitHub ↗</a>}
                    {profile.portfolio_url && <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-accent text-xs font-bold hover:underline">Portfolio ↗</a>}
                  </div>
                )}
              </div>
              <Button className="mt-6" onClick={() => router.push('/onboarding/applicant')}>
                Update Profile
              </Button>
            </Card>
          )}

        </div>
      </div>

      {/* ── Apply Modal ── */}
      <AnimatePresence>
        {applyModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg glass-card rounded-3xl p-7 shadow-2xl border border-white/40 dark:border-white/5">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{applyModal.job_title}</h2>
                  <p className="text-accent text-sm font-bold">{applyModal.hr_profiles?.company_name}</p>
                </div>
                <button onClick={() => setApplyModal(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-5 text-xs">
                {applyModal.job_type && <span className="px-2.5 py-1 rounded-md bg-accent/10 text-accent border border-accent/20 font-bold">{applyModal.job_type}</span>}
                <span className="px-2.5 py-1 rounded-md bg-white/40 dark:bg-slate-900/30 border border-white/50 dark:border-white/5 text-slate-500 font-medium">📍 {applyModal.location}</span>
                {applyModal.experience_required && <span className="px-2.5 py-1 rounded-md bg-white/40 dark:bg-slate-900/30 border border-white/50 dark:border-white/5 text-slate-500 font-medium">⚡ {applyModal.experience_required}</span>}
              </div>

              <div className="mb-5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">
                  Cover Letter <span className="text-slate-300 normal-case font-medium">(optional)</span>
                </label>
                <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
                  rows={5} placeholder="Introduce yourself and why you're a great fit for this role..."
                  className="w-full px-4 py-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/8 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:border-accent/50 transition-all resize-none backdrop-blur-sm" />
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setApplyModal(null)} className="flex-1">Cancel</Button>
                <Button loading={applying} onClick={handleApply} className="flex-1 gap-2">
                  Submit Application <ChevronRight size={14} />
                </Button>
              </div>

              <p className="text-center text-[11px] text-slate-400 mt-4">
                HR will review your profile and application. You&apos;ll be notified of any updates.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MockBanner />
    </PageWrapper>
  )
}
