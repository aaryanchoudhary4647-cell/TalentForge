'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Brain, Search, MapPin, DollarSign, Briefcase, ArrowLeft, AlertCircle, CheckCircle2, Send } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { PageWrapper, Button, Card, Input, Badge } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

interface JobPosting {
  id: string
  job_title: string
  job_description: string
  requirements: string
  salary_min: number
  salary_max: number
  job_type: string
  created_at: string
  hr_id: string
}

interface ApplicationStatus {
  [jobId: string]: 'applied' | 'pending' | null
}

export default function JobListingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>({})
  const [coverLetter, setCoverLetter] = useState('')
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch jobs on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('job_postings')
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchError) {
          console.error('Error fetching jobs:', fetchError)
          setError('Failed to load jobs')
        } else {
          setJobs(data || [])
          setFilteredJobs(data || [])
          
          // Check application status for each job
          if (user && data) {
            const statusMap: ApplicationStatus = {}
            for (const job of data) {
              const { data: application } = await supabase
                .from('job_applications')
                .select('id')
                .eq('job_id', job.id)
                .eq('candidate_id', user.id)
                .single()
              
              if (application) {
                statusMap[job.id] = 'applied'
              }
            }
            setApplicationStatus(statusMap)
          }
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Failed to load jobs')
      } finally {
        setJobsLoading(false)
      }
    }

    if (!loading) {
      fetchJobs()
    }
  }, [user, loading])

  // Filter jobs based on search
  useEffect(() => {
    const query = searchQuery.toLowerCase()
    const filtered = jobs.filter(job =>
      job.job_title.toLowerCase().includes(query) ||
      job.job_description.toLowerCase().includes(query) ||
      job.requirements.toLowerCase().includes(query)
    )
    setFilteredJobs(filtered)
  }, [searchQuery, jobs])

  if (loading) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </PageWrapper>
    )
  }

  if (!user || user.role !== 'candidate') {
    router.push('/auth/login')
    return null
  }

  const handleApply = async (jobId: string) => {
    if (!user || !selectedJob) return

    if (!coverLetter.trim()) {
      setError('Please provide a cover letter')
      return
    }

    setApplying(true)
    setError('')
    setSuccess('')

    try {
      const { error: applicationError } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          candidate_id: user.id,
          cover_letter: coverLetter,
          status: 'applied',
        })

      if (applicationError) {
        if (applicationError.code === '23505') {
          // Unique constraint violation - already applied
          setError('You have already applied for this job')
        } else {
          throw applicationError
        }
      } else {
        setSuccess('Application submitted successfully!')
        setApplicationStatus(prev => ({ ...prev, [jobId]: 'applied' }))
        setCoverLetter('')
        setTimeout(() => {
          setSelectedJob(null)
          setSuccess('')
        }, 2000)
      }
    } catch (err) {
      console.error('Error applying:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit application')
    } finally {
      setApplying(false)
    }
  }

  return (
    <PageWrapper className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Brain size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">Explore Jobs</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/applicant')}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Modal for job details and application */}
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                {/* Close button */}
                <button
                  onClick={() => setSelectedJob(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>

                {/* Job Details */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{selectedJob.job_title}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge label={selectedJob.job_type} className="text-primary border-primary/20 bg-primary/10" />
                      </div>
                    </div>
                    {applicationStatus[selectedJob.id] === 'applied' && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">Applied</span>
                      </div>
                    )}
                  </div>

                  {/* Salary */}
                  {selectedJob.salary_min && selectedJob.salary_max && (
                    <div className="flex items-center gap-2 text-lg font-bold text-amber-600 dark:text-amber-400 mb-4">
                      <DollarSign size={18} />
                      ${selectedJob.salary_min.toLocaleString()} - ${selectedJob.salary_max.toLocaleString()}
                    </div>
                  )}

                  {/* Description */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Job Description</h3>
                    <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{selectedJob.job_description}</p>
                  </div>

                  {/* Requirements */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Requirements</h3>
                    <div className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap bg-slate-100 dark:bg-slate-900 p-4 rounded-lg">
                      {selectedJob.requirements}
                    </div>
                  </div>

                  {/* Posted date */}
                  <p className="text-xs text-slate-400">Posted on {formatDate(selectedJob.created_at)}</p>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
                    <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-4">
                    <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className="text-emerald-600 dark:text-emerald-400 text-sm">{success}</p>
                  </div>
                )}

                {/* Application Form */}
                {applicationStatus[selectedJob.id] !== 'applied' ? (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Cover Letter</h3>
                    <textarea
                      value={coverLetter}
                      onChange={e => setCoverLetter(e.target.value)}
                      placeholder="Tell us why you're interested in this position and why you're a great fit..."
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mb-4"
                    />
                    <Button
                      onClick={() => handleApply(selectedJob.id)}
                      loading={applying}
                      className="w-full gap-2"
                    >
                      <Send size={16} /> Submit Application
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium">You have already applied for this position. Good luck!</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Search */}
          <div>
            <Card className="p-4 sticky top-24">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Search</h3>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-slate-500 mt-3">{filteredJobs.length} jobs available</p>
            </Card>
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-3">
            {jobsLoading ? (
              <Card className="p-8 text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">Loading jobs...</p>
              </Card>
            ) : filteredJobs.length === 0 ? (
              <Card className="p-8 text-center">
                <Briefcase size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <p className="text-slate-600 dark:text-slate-400">No jobs found</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map(job => (
                  <Card
                    key={job.id}
                    className="p-5 hover:shadow-lg transition-all cursor-pointer hover:translate-y-[-2px]"
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{job.job_title}</h3>
                          {applicationStatus[job.id] === 'applied' && (
                            <CheckCircle2 size={16} className="text-emerald-500" />
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-3">{job.job_description}</p>
                        <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Badge label={job.job_type} className="text-primary border-primary/20 bg-primary/10" />
                          </div>
                          {job.salary_min && job.salary_max && (
                            <div className="flex items-center gap-1">
                              <DollarSign size={12} />
                              ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={applicationStatus[job.id] === 'applied' ? 'secondary' : 'primary'}
                        className="ml-4"
                        onClick={e => {
                          e.stopPropagation()
                          setSelectedJob(job)
                        }}
                      >
                        {applicationStatus[job.id] === 'applied' ? 'Applied' : 'Apply'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
