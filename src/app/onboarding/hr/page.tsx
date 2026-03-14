'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { IS_MOCK_MODE } from '@/lib/config'
import { PageWrapper, Card, Input, Button } from '@/components/ui'
import { supabase } from '@/lib/supabase'

const STEPS = [
  { id: 1, label: 'Company Profile', icon: '🏢' },
  { id: 2, label: 'Company Details', icon: '📋' },
  { id: 3, label: 'First Job Post',  icon: '📝' },
]

const INDUSTRIES   = ['', 'Technology', 'Finance', 'Healthcare', 'Education', 'E-Commerce', 'Manufacturing', 'Media', 'Consulting', 'Government', 'Other']
const COMPANY_SIZES = ['', '1–10', '11–50', '51–200', '201–500', '500–1000', '1000+']
const JOB_TYPES    = ['Full-time', 'Part-time', 'Contract', 'Internship']

export default function HROnboarding() {
  const router = useRouter()
  const [step, setStep]     = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const [mounted, setMounted] = useState(false)
  const [skipJob, setSkipJob] = useState(false)

  // Step 1 — HR / Company profile
  const [company, setCompany] = useState({ company_name: '', department: '', phone: '', office_location: '' })

  // Step 2 — About company
  const [about, setAbout] = useState({ industry: '', company_size: '', website: '', description: '' })

  // Step 3 — First job posting
  const [job, setJob] = useState({
    job_title: '', job_description: '', requirements: '', location: '',
    job_type: 'Full-time', department: '', experience_required: '',
    salary_min: '', salary_max: '', closing_date: '',
  })

  useEffect(() => { setMounted(true) }, [])

  const next = () => { setError(''); setStep(s => Math.min(s + 1, 3)) }
  const back = () => { setError(''); setStep(s => Math.max(s - 1, 1)) }
  const skip = () => { setError(''); setStep(s => Math.min(s + 1, 3)) }

  const handleFinish = async () => {
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated. Please log in again.')

      if (IS_MOCK_MODE) {
        // In mock mode, just simulate success
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay
        router.push('/hr')
        return
      }

      // 1 — Update hr_profiles (phone filled = onboarding done)
      const { error: profileErr } = await supabase
        .from('hr_profiles')
        .update({
          company_name:    company.company_name.trim() || null,
          department:      company.department.trim()   || null,
          phone:           company.phone.trim()        || null,
          office_location: company.office_location.trim() || null,
          updated_at:      new Date().toISOString(),
        })
        .eq('id', user.id)
      if (profileErr) throw profileErr

      // 2 — Create first job posting if not skipped
      if (!skipJob && job.job_title.trim() && job.job_description.trim() && job.location.trim()) {
        const { error: jobErr } = await supabase.from('job_postings').insert({
          hr_id:               user.id,
          job_title:           job.job_title.trim(),
          job_description:     job.job_description.trim(),
          requirements:        job.requirements.trim()        || null,
          location:            job.location.trim(),
          job_type:            job.job_type,
          department:          job.department.trim()          || company.department.trim() || null,
          experience_required: job.experience_required.trim() || null,
          salary_min:          job.salary_min ? Number(job.salary_min) : null,
          salary_max:          job.salary_max ? Number(job.salary_max) : null,
          closing_date:        job.closing_date || null,
          status:              'Open',
        })
        if (jobErr) throw jobErr
      }

      router.push('/hr')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!mounted) return null

  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <PageWrapper className="relative flex flex-col items-center min-h-screen px-4 py-10 overflow-hidden">
      {/* Decorative blurs — amber theme for HR */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[560px] z-10"
      >
        {/* Logo + title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3 shadow-2xl shadow-amber-500/20">
            <Brain size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Set up your recruiter account</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Step {step} of {STEPS.length} — {STEPS[step - 1].label}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/40 dark:bg-white/5 rounded-full mb-6 overflow-hidden border border-white/30 dark:border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Step pills */}
        <div className="flex gap-2 mb-6 flex-wrap justify-center">
          {STEPS.map(s => (
            <div key={s.id} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
              step === s.id
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                : step > s.id
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-white/40 dark:bg-white/3 border-white/60 dark:border-white/8 text-slate-400'
            }`}>
              {step > s.id ? <CheckCircle2 size={11} /> : <span>{s.icon}</span>}
              {s.label}
            </div>
          ))}
        </div>

        {/* Step content */}
        <Card className="p-0 overflow-hidden shadow-2xl glass-card">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="p-8"
            >

              {/* ── STEP 1: Company Profile ── */}
              {step === 1 && (
                <div className="flex flex-col gap-5">
                  <StepHeader icon="🏢" title="Your company profile" subtitle="This is shown to candidates who apply to your jobs." />
                  <Input id="company_name" label="Company Name *" type="text" placeholder="Acme Technologies, Google..."
                    value={company.company_name} onChange={e => setCompany(p => ({ ...p, company_name: e.target.value }))} required />
                  <div className="grid grid-cols-2 gap-4">
                    <Input id="department" label="Your Department" type="text" placeholder="Engineering, HR, Product..."
                      value={company.department} onChange={e => setCompany(p => ({ ...p, department: e.target.value }))} />
                    <Input id="phone" label="Your Phone *" type="tel" placeholder="+91 98765 43210"
                      value={company.phone} onChange={e => setCompany(p => ({ ...p, phone: e.target.value }))} required />
                  </div>
                  <Input id="office_location" label="Office Location" type="text" placeholder="Bangalore / Remote / Hybrid"
                    value={company.office_location} onChange={e => setCompany(p => ({ ...p, office_location: e.target.value }))} />
                  <p className="text-[11px] text-slate-400">* Required. Your phone and company name appear on job postings.</p>
                </div>
              )}

              {/* ── STEP 2: About Company ── */}
              {step === 2 && (
                <div className="flex flex-col gap-5">
                  <StepHeader icon="📋" title="About your company" subtitle="Helps attract the right talent. All optional." />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 block mb-1.5">Industry</label>
                      <select value={about.industry} onChange={e => setAbout(p => ({ ...p, industry: e.target.value }))}
                        className="w-full h-11 px-4 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/8 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all backdrop-blur-sm">
                        {INDUSTRIES.map(o => <option key={o} value={o}>{o || 'Select...'}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 block mb-1.5">Company Size</label>
                      <select value={about.company_size} onChange={e => setAbout(p => ({ ...p, company_size: e.target.value }))}
                        className="w-full h-11 px-4 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/8 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all backdrop-blur-sm">
                        {COMPANY_SIZES.map(o => <option key={o} value={o}>{o || 'Select...'}</option>)}
                      </select>
                    </div>
                  </div>
                  <Input id="website" label="Company Website" type="url" placeholder="https://yourcompany.com"
                    value={about.website} onChange={e => setAbout(p => ({ ...p, website: e.target.value }))} />
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 block mb-1.5">Company Description</label>
                    <textarea value={about.description} onChange={e => setAbout(p => ({ ...p, description: e.target.value }))}
                      rows={4} placeholder="Tell candidates what your company does, your culture, mission, and why they should join..."
                      className="w-full px-4 py-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/8 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-500/50 transition-all resize-none backdrop-blur-sm" />
                  </div>
                  <p className="text-[11px] text-slate-400">You can skip this and fill it in later from your dashboard.</p>
                </div>
              )}

              {/* ── STEP 3: First Job Post ── */}
              {step === 3 && (
                <div className="flex flex-col gap-4">
                  <StepHeader icon="📝" title="Post your first job" subtitle="Get candidates applying right away. You can add more from the dashboard." />

                  {/* Toggle */}
                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    !skipJob ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/30 dark:bg-slate-900/20 border-white/40 dark:border-white/5'
                  }`}>
                    <input type="checkbox" checked={!skipJob} onChange={e => setSkipJob(!e.target.checked)}
                      className="rounded border-slate-300 text-amber-500" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Yes, post a job now</span>
                  </label>

                  {!skipJob && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <Input id="job_title" label="Job Title *" type="text" placeholder="Senior React Developer, Product Manager..."
                            value={job.job_title} onChange={e => setJob(p => ({ ...p, job_title: e.target.value }))} />
                        </div>
                        <Input id="location" label="Location *" type="text" placeholder="Remote / Mumbai / Hybrid"
                          value={job.location} onChange={e => setJob(p => ({ ...p, location: e.target.value }))} />
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 block mb-1.5">Job Type</label>
                          <select value={job.job_type} onChange={e => setJob(p => ({ ...p, job_type: e.target.value }))}
                            className="w-full h-11 px-4 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/8 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all backdrop-blur-sm">
                            {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <Input id="exp" label="Experience Required" type="text" placeholder="3-5 years / Fresher"
                          value={job.experience_required} onChange={e => setJob(p => ({ ...p, experience_required: e.target.value }))} />
                        <Input id="dept" label="Department" type="text" placeholder="Engineering, Design..."
                          value={job.department} onChange={e => setJob(p => ({ ...p, department: e.target.value }))} />
                        <Input id="sal_min" label="Min Salary (₹)" type="number" placeholder="600000"
                          value={job.salary_min} onChange={e => setJob(p => ({ ...p, salary_min: e.target.value }))} />
                        <Input id="sal_max" label="Max Salary (₹)" type="number" placeholder="1200000"
                          value={job.salary_max} onChange={e => setJob(p => ({ ...p, salary_max: e.target.value }))} />
                        <div className="col-span-2">
                          <Input id="closing" label="Closing Date" type="date"
                            value={job.closing_date} onChange={e => setJob(p => ({ ...p, closing_date: e.target.value }))} />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 block mb-1.5">Job Description *</label>
                          <textarea value={job.job_description} onChange={e => setJob(p => ({ ...p, job_description: e.target.value }))}
                            rows={4} placeholder="Describe the role, responsibilities, team, and what you're looking for..."
                            className="w-full px-4 py-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/8 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-500/50 transition-all resize-none backdrop-blur-sm" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 block mb-1.5">Requirements</label>
                          <textarea value={job.requirements} onChange={e => setJob(p => ({ ...p, requirements: e.target.value }))}
                            rows={3} placeholder="Required skills, qualifications, certifications..."
                            className="w-full px-4 py-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/8 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-500/50 transition-all resize-none backdrop-blur-sm" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {skipJob && (
                    <div className="p-5 rounded-xl bg-white/30 dark:bg-slate-900/20 border border-white/40 dark:border-white/5 text-center text-slate-400 text-sm">
                      No problem — post jobs anytime using the <strong className="text-slate-600 dark:text-slate-300">+ New Job</strong> button in your dashboard.
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      <p className="text-red-600 dark:text-red-400 text-xs font-medium">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Nav buttons */}
              <div className="flex items-center justify-between mt-7">
                <Button variant="ghost" onClick={back} disabled={step === 1} className="gap-2">
                  <ArrowLeft size={15} /> Back
                </Button>
                <div className="flex items-center gap-3">
                  {step < 3 && (
                    <button onClick={skip} className="text-slate-400 text-sm font-bold hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                      Skip
                    </button>
                  )}
                  {step < 3 ? (
                    <Button onClick={next} className="gap-2">
                      Continue <ArrowRight size={15} />
                    </Button>
                  ) : (
                    <Button onClick={handleFinish} loading={saving} className="gap-2">
                      🚀 Go to Dashboard
                    </Button>
                  )}
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </Card>

        <p className="text-center text-slate-400 text-xs mt-6 font-medium">
          Everything can be updated later from your HR dashboard.
        </p>
      </motion.div>
    </PageWrapper>
  )
}

function StepHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="mb-2">
      <p className="text-2xl mb-1">{icon}</p>
      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{subtitle}</p>
    </div>
  )
}
