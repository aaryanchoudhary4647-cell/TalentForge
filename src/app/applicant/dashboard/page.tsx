'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, LogOut, Search, Briefcase, Clock, CheckCircle2, X, ChevronRight, Bell, FileText, User, Zap } from 'lucide-react'
import { PageWrapper, Button, Card, Input } from '@/components/ui'
import { MockBanner } from '@/components/ui/MockBanner'
import { useAuth } from '@/hooks/useAuth'
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
  rating?: number; hr_notes?: string; interview_date?: string
  result?: string
  job_postings?: Job
}

interface Profile {
  first_name: string; last_name: string; phone: string
  current_job_title?: string; location?: string; profile_image_url?: string
}

const STATUS_META: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  Pending:     { color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',   label: 'Pending Review', icon: '⏳' },
  Shortlisted: { color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-500/10 border-blue-500/20',     label: 'Shortlisted',    icon: '⭐' },
  Interview:   { color: 'text-primary',                          bg: 'bg-primary/10 border-primary/20',       label: 'Interview',      icon: '🎙️' },
  Rejected:    { color: 'text-red-600 dark:text-red-400',       bg: 'bg-red-500/10 border-red-500/20',       label: 'Not Selected',   icon: '✕' },
  Offer:       { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Offer Received', icon: '🎉' },
  Hired:       { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Hired',         icon: '✅' },
}

export default function CandidateDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<'jobs' | 'applications' | 'profile'>('jobs')
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; is_read: boolean; created_at: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showNotif, setShowNotif] = useState(false)
  const [applyModal, setApplyModal] = useState<Job | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

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

  const filteredJobs = jobs.filter(j => {
    const q = search.toLowerCase()
    const matchSearch = !q || j.job_title.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q) ||
      (j.hr_profiles?.company_name || '').toLowerCase().includes(q)
    const matchType = typeFilter === 'all' || j.job_type === typeFilter
    return matchSearch && matchType
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  // Interview ready = status is Interview AND interview_date is set AND not yet taken
  const interviewReady = (app: Application) =>
    app.status === 'Interview' && app.interview_date && !app.result

  const interviewPast = (app: Application) =>
    app.status === 'Interview' && app.interview_date &&
    new Date(app.interview_date) < new Date() && !app.result

  if (!mounted || loading) return <LoadingScreen />

  return (
    <PageWrapper className="flex min-h-screen">
      {/* ── Sidebar ── */}
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
            { id: 'jobs',         label: 'Browse Jobs',      icon: <Search size={15} /> },
            { id: 'applications', label: 'My Applications',  icon: <FileText size={15} /> },
            { id: 'profile',      label: 'My Profile',       icon: <User size={15} /> },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${
                tab === t.id
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
              }`}>
              {t.icon}{t.label}
              {t.id === 'applications' && applications.filter(a => a.status === 'Interview' && !a.result).length > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center">
                  {applications.filter(a => a.status === 'Interview' && !a.result).length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/20 dark:border-white/5">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold ring-2 ring-primary/20">
              {profile?.first_name?.[0] || 'C'}
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

      {/* ── Main ── */}
      <div className="pl-60 flex-1">
        {/* Topbar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 glass-header border-b border-white/20 dark:border-white/5">
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {tab === 'jobs' && 'Browse Jobs'}
            {tab === 'applications' && 'My Applications'}
            {tab === 'profile' && 'My Profile'}
          </h1>
          <div className="relative">
            <button onClick={() => { setShowNotif(!showNotif); markNotifRead() }}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center glass-card hover:scale-105 transition-all">
              <Bell size={16} className="text-slate-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center">
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
                  <div className="max-h-72 overflow-y-auto divide-y divide-white/20 dark:divide-white/4">
                    {notifications.length === 0 && <p className="text-center text-slate-400 text-xs py-8">No notifications</p>}
                    {notifications.map(n => (
                      <div key={n.id} className={`px-4 py-3 ${!n.is_read ? 'bg-primary/5' : ''}`}>
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
        </div>

        <div className="p-8 max-w-5xl">

          {/* ── BROWSE JOBS ── */}
          {tab === 'jobs' && (
            <div className="space-y-5">
              {/* Search + filter */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search job title, company, location..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/8 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:border-primary/50 transition-all backdrop-blur-sm" />
                </div>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                  className="h-11 px-4 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/8 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary/50 transition-all backdrop-blur-sm">
                  <option value="all">All Types</option>
                  {['Full-time', 'Part-time', 'Contract', 'Internship'].map(t => <option key={t} value={t}>{t}</option>)}
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
                          {/* Company + logo */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0">
                              {(job.hr_profiles?.company_name || 'C')[0]}
                            </div>
                            <div>
                              <p className="text-primary text-xs font-bold">{job.hr_profiles?.company_name}</p>
                              <p className="text-slate-400 text-xs">{job.hr_profiles?.office_location}</p>
                            </div>
                          </div>
                          <h3 className="text-slate-900 dark:text-white font-extrabold text-base mb-1">{job.job_title}</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-3 leading-relaxed">
                            {job.job_description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            {job.job_type && (
                              <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 font-bold">{job.job_type}</span>
                            )}
                            <span className="flex items-center gap-1 text-slate-400 font-medium">
                              <Briefcase size={11} /> {job.location}
                            </span>
                            {job.experience_required && (
                              <span className="flex items-center gap-1 text-slate-400 font-medium">
                                <Zap size={11} /> {job.experience_required}
                              </span>
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
                        <div className="flex flex-col gap-2 shrink-0">
                          {applied ? (
                            <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                              <CheckCircle2 size={13} /> Applied
                            </span>
                          ) : (
                            <Button size="sm" className="gap-1.5" onClick={() => setApplyModal(job)}>
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

          {/* ── MY APPLICATIONS ── */}
          {tab === 'applications' && (
            <div className="space-y-4">
              {/* Interview alert banner */}
              {applications.some(a => interviewReady(a)) && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-primary/10 border border-primary/25 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/25">
                    <span className="text-lg">🎙️</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 dark:text-white font-extrabold text-sm">You have interviews scheduled!</p>
                    <p className="text-slate-500 text-xs mt-0.5">Check below and join when it&apos;s time.</p>
                  </div>
                </motion.div>
              )}

              {applications.map(app => {
                const job = app.job_postings as Job | undefined
                const meta = STATUS_META[app.status] || STATUS_META['Pending']
                const canJoin = interviewReady(app)
                const isPast = interviewPast(app)

                return (
                  <Card key={app.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0">
                            {(job?.hr_profiles?.company_name || 'C')[0]}
                          </div>
                          <div>
                            <h3 className="text-slate-900 dark:text-white font-extrabold">{job?.job_title}</h3>
                            <p className="text-slate-400 text-xs">{job?.hr_profiles?.company_name} • {job?.location}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${meta.bg} ${meta.color}`}>
                            {meta.icon} {meta.label}
                          </span>
                          <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
                            <Clock size={11} /> Applied {new Date(app.applied_date).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Interview date */}
                        {app.interview_date && (
                          <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/15">
                            <p className="text-xs font-bold text-primary mb-0.5">🗓️ Interview Scheduled</p>
                            <p className="text-slate-700 dark:text-slate-300 text-sm font-bold">
                              {new Date(app.interview_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              {' at '}
                              {new Date(app.interview_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {isPast && !app.result && (
                              <p className="text-amber-500 text-xs mt-1 font-medium">⚠️ You missed this window — contact HR to reschedule</p>
                            )}
                          </div>
                        )}

                        {/* HR notes */}
                        {app.hr_notes && (
                          <div className="mt-3 p-3 rounded-xl bg-white/40 dark:bg-slate-900/30 border border-white/50 dark:border-white/5">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">HR Note</p>
                            <p className="text-slate-600 dark:text-slate-300 text-sm">{app.hr_notes}</p>
                          </div>
                        )}

                        {/* Interview result */}
                        {app.result && app.result !== 'Pending' && (
                          <div className={`mt-3 p-3 rounded-xl border ${app.result === 'Pass' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                            <p className={`text-sm font-bold ${app.result === 'Pass' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                              {app.result === 'Pass' ? '✅ Interview Passed' : '❌ Interview Not Passed'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action button */}
                      <div className="shrink-0">
                        {canJoin && (
                          <Button onClick={() => router.push(`/interview?applicationId=${app.id}`)}
                            className="gap-2 animate-pulse-once">
                            🎙️ Join Interview
                          </Button>
                        )}
                        {app.result && (
                          <Button variant="secondary" size="sm"
                            onClick={() => router.push(`/report/${app.id}`)}>
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
                  <p className="text-sm mt-2">Browse jobs and hit <strong>Apply Now</strong> to get started</p>
                  <Button className="mt-6" onClick={() => setTab('jobs')}>Browse Jobs</Button>
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE TAB (summary only — edit in onboarding) ── */}
          {tab === 'profile' && profile && (
            <div className="max-w-xl space-y-5">
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-extrabold shadow-lg">
                    {profile.first_name?.[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{profile.first_name} {profile.last_name}</h2>
                    <p className="text-slate-400 text-sm">{(profile as Profile & { current_job_title?: string }).current_job_title || 'Candidate'}</p>
                    <p className="text-slate-400 text-xs">{profile.location}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{profile.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Applications</p>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{applications.length} total</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Interviews</p>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{applications.filter(a => a.status === 'Interview').length} scheduled</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Offers</p>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{applications.filter(a => a.status === 'Offer' || a.status === 'Hired').length} received</p>
                  </div>
                </div>
              </Card>
              <p className="text-slate-400 text-xs text-center">To update your full profile, skills, education and work experience —</p>
              <Button variant="secondary" className="w-full" onClick={() => router.push('/onboarding/applicant')}>
                Edit Full Profile
              </Button>
            </div>
          )}

        </div>
      </div>

      {/* ── Apply Modal ── */}
      <AnimatePresence>
        {applyModal && (
          <ApplyModal job={applyModal} userId={user!.id}
            onClose={() => setApplyModal(null)}
            onApplied={() => { setApplyModal(null); fetchAll(); setTab('applications') }} />
        )}
      </AnimatePresence>

      <MockBanner />
    </PageWrapper>
  )
}

// ─── Apply Modal ──────────────────────────────────────────────
function ApplyModal({ job, userId, onClose, onApplied }: {
  job: Job; userId: string
  onClose: () => void; onApplied: () => void
}) {
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleApply = async () => {
    setLoading(true)
    setError('')
    const { error: err } = await supabase.from('applications').insert({
      job_id: job.id,
      applicant_id: userId,
      hr_id: job.hr_id,
      status: 'Pending',
      cover_letter: coverLetter.trim() || null,
    })
    if (err) { setError(err.message); setLoading(false); return }

    // Notify HR
    await supabase.from('notifications').insert({
      user_id: job.hr_id,
      type: 'application_status',
      title: 'New Application',
      message: `Someone applied for ${job.job_title}`,
      related_job_id: job.id,
    })
    setLoading(false)
    onApplied()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-lg glass-card rounded-3xl p-7 shadow-2xl border border-white/40 dark:border-white/5">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{job.job_title}</h2>
            <p className="text-primary text-sm font-bold">{(job.hr_profiles as { company_name: string } | undefined)?.company_name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Job quick info */}
        <div className="flex flex-wrap gap-2 mb-5 text-xs">
          {job.job_type && <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 font-bold">{job.job_type}</span>}
          <span className="px-2.5 py-1 rounded-md bg-white/40 dark:bg-slate-900/30 border border-white/50 dark:border-white/5 text-slate-500 font-medium">📍 {job.location}</span>
          {job.experience_required && <span className="px-2.5 py-1 rounded-md bg-white/40 dark:bg-slate-900/30 border border-white/50 dark:border-white/5 text-slate-500 font-medium">⚡ {job.experience_required}</span>}
        </div>

        {/* Cover letter */}
        <div className="mb-5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">
            Cover Letter <span className="text-slate-300">(optional)</span>
          </label>
          <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
            rows={5} placeholder="Introduce yourself, why you're a great fit for this role, and what excites you about this opportunity..."
            className="w-full px-4 py-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/8 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:border-primary/50 transition-all resize-none backdrop-blur-sm" />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button loading={loading} onClick={handleApply} className="flex-1 gap-2">
            Submit Application <ChevronRight size={14} />
          </Button>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-4">
          After submitting, HR will review your profile and application. You&apos;ll be notified of any updates.
        </p>
      </motion.div>
    </motion.div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/20 animate-pulse">
          <Brain size={20} className="text-white" />
        </div>
        <p className="text-slate-400 text-sm font-bold">Loading...</p>
      </div>
    </div>
  )
}
