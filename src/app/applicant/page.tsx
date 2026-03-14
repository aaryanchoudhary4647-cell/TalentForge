'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Brain, User, FileText, TrendingUp, LogOut, ChevronRight, Clock, MapPin, Mail, Phone, Briefcase } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { PageWrapper, Button, Card, Badge } from '@/components/ui'
import { MockBanner } from '@/components/ui/MockBanner'
import { MOCK_CANDIDATES } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'
import { IS_MOCK_MODE } from '@/lib/config'

export default function ApplicantDashboard() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'profile'>('overview')
  const [loadTimeout, setLoadTimeout] = useState(false)

  // Timeout safeguard: if loading takes too long, redirect to login
  React.useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoadTimeout(true)
        router.push('/auth/login')
      }, 5000) // 5 second timeout
      return () => clearTimeout(timer)
    }
  }, [loading, router])

  // Mock data for applicant's applications - safely access with fallback
  const applications = MOCK_CANDIDATES?.[0]?.applications || []

  const handleLogout = async () => { await logout(); router.push('/') }

  if (loading) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
          {loadTimeout && <p className="text-red-500 text-xs mt-2">Taking longer than expected...</p>}
        </div>
      </PageWrapper>
    )
  }

  // Even if user is null but not loading, proceed with what we have
  // The auth context should have loaded by now
  if (!user && !loadTimeout) {
    // Add a small delay before redirecting to ensure session is checked
    setTimeout(() => router.push('/auth/login'), 100)
    return (
      <PageWrapper className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Redirecting to login...</p>
        </div>
      </PageWrapper>
    )
  }

  const stats = [
    { label: 'Applications sent', value: applications.length, icon: <FileText size={16} />, color: 'text-primary' },
    { label: 'Profile views', value: 24, icon: <TrendingUp size={16} />, color: 'text-accent' },
    { label: 'Interview requests', value: 2, icon: <Clock size={16} />, color: 'text-emerald-500' },
    { label: 'Profile score', value: '85%', icon: <TrendingUp size={16} />, color: 'text-amber-500' },
  ]

  return (
    <PageWrapper>
      {/* Sidebar */}
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
            { id: 'overview', label: 'Overview', icon: <TrendingUp size={15} /> },
            { id: 'applications', label: 'My Applications', icon: <FileText size={15} /> },
            { id: 'profile', label: 'My Profile', icon: <User size={15} /> },
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
            </button>
          ))}
          <button
            onClick={() => router.push('/applicant/jobs')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5 mt-4 border-t border-white/20 dark:border-white/5 pt-4"
          >
            <TrendingUp size={15} /> Browse Jobs
          </button>
        </nav>

        <div className="p-4 border-t border-white/20 dark:border-white/5">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold ring-2 ring-accent/20">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 dark:text-white text-xs font-bold truncate">{user?.name || 'Applicant'}</p>
              <p className="text-slate-400 text-xs truncate">{user?.email || 'applicant@example.com'}</p>
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
                {activeTab === 'applications' && 'My Applications'}
                {activeTab === 'profile' && 'My Profile'}
              </h1>
              <p className="text-slate-400 text-sm mt-0.5 font-medium">
                {IS_MOCK_MODE ? 'Showing demo data — connect Supabase to see real data' : 'Manage your job search'}
              </p>
            </div>
            <Button size="sm" className="gap-2" onClick={() => router.push('/onboarding/applicants')}>
              <User size={14} /> Edit Profile
            </Button>
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Browse Jobs CTA */}
              <Card className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Ready to explore opportunities?</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Browse and apply for jobs posted by HR managers</p>
                  </div>
                  <Button size="sm" onClick={() => router.push('/applicant/jobs')}>Browse Jobs</Button>
                </div>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                  <Card key={i} className="p-4 text-center">
                    <div className={`w-10 h-10 rounded-xl bg-white/40 dark:bg-white/5 flex items-center justify-center mx-auto mb-2 ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{stat.value}</div>
                    <div className="text-slate-500 text-xs font-medium">{stat.label}</div>
                  </Card>
                ))}
              </div>

              {/* Recent Applications */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Applications</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('applications')}>
                    View all <ChevronRight size={14} />
                  </Button>
                </div>
                <div className="space-y-3">
                  {Array.isArray(applications) && applications.slice(0, 3).map((app, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <FileText size={16} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-slate-900 dark:text-white font-bold text-sm">{app?.job_title || 'Job'}</p>
                          <p className="text-slate-500 text-xs">{app?.company || 'Company'}</p>
                        </div>
                      </div>
                      <Badge variant={app?.status === 'Interview' ? 'success' : 'default'} className="text-xs">
                        {app?.status || 'Applied'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* APPLICATIONS TAB */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              {Array.isArray(applications) && applications.map((app, i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileText size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{app?.job_title || 'Job Title'}</h3>
                        <p className="text-slate-500 text-sm">{app?.company || 'Company'} • {app?.location || 'Location'}</p>
                        <p className="text-slate-400 text-xs">Applied {formatDate(app?.applied_date || new Date().toISOString())}</p>
                      </div>
                    </div>
                    <Badge variant={app?.status === 'Interview' ? 'success' : app?.status === 'Rejected' ? 'secondary' : 'default'}>
                      {app?.status || 'Applied'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <User size={16} className="text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300">{user?.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300">Location not set</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300">Phone not set</span>
                </div>
              </div>
              <Button className="mt-6" onClick={() => router.push('/onboarding/applicants')}>
                Update Profile
              </Button>
            </Card>
          )}
        </div>
      </div>

      <MockBanner />
    </PageWrapper>
  )
}