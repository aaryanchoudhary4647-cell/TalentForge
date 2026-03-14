'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ArrowRight, ArrowLeft, Plus, X, CheckCircle2 } from 'lucide-react'
import { IS_MOCK_MODE } from '@/lib/config'
import { supabase } from '@/lib/supabase'
import { PageWrapper, Card, Input, Button } from '@/components/ui'

// ─── Types ────────────────────────────────────────────────────
interface SkillEntry    { skill_name: string; proficiency_level: string }
interface EduEntry      { institution_name: string; degree: string; field_of_study: string; start_year: string; end_year: string; grade: string }
interface WorkEntry     { company_name: string; job_title: string; job_description: string; start_date: string; end_date: string; is_current: boolean; skills_used: string }

const STEPS = [
  { id: 1, label: 'Basic Info',        icon: '👤' },
  { id: 2, label: 'Online Links',      icon: '🔗' },
  { id: 3, label: 'Skills',            icon: '⚡' },
  { id: 4, label: 'Education',         icon: '🎓' },
  { id: 5, label: 'Work Experience',   icon: '💼' },
]

const PROFICIENCY = ['Beginner', 'Intermediate', 'Advanced', 'Expert']
const QUALIFICATIONS = ['', 'High School', 'Diploma', "Bachelor's", "Master's", 'PhD', 'Other']

export default function ApplicantOnboarding() {
  const router = useRouter()
  const [step, setStep]     = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const [mounted, setMounted] = useState(false)

  // Step 1
  const [basic, setBasic] = useState({ first_name: '', last_name: '', phone: '', location: '', current_job_title: '', experience_years: '', highest_qualification: '', bio: '' })
  // Step 2
  const [links, setLinks] = useState({ linkedin_url: '', github_url: '', portfolio_url: '' })
  // Step 3
  const [skills, setSkills] = useState<SkillEntry[]>([{ skill_name: '', proficiency_level: 'Intermediate' }])
  // Step 4
  const [education, setEducation] = useState<EduEntry[]>([{ institution_name: '', degree: '', field_of_study: '', start_year: '', end_year: '', grade: '' }])
  // Step 5
  const [work, setWork] = useState<WorkEntry[]>([{ company_name: '', job_title: '', job_description: '', start_date: '', end_date: '', is_current: false, skills_used: '' }])

  useEffect(() => { setMounted(true) }, [])

  const next = () => { setError(''); setStep(s => Math.min(s + 1, 5)) }
  const back = () => { setError(''); setStep(s => Math.max(s - 1, 1)) }
  const skip = () => { setError(''); setStep(s => Math.min(s + 1, 5)) }

  // ── Skills helpers
  const addSkill    = () => setSkills(s => [...s, { skill_name: '', proficiency_level: 'Intermediate' }])
  const removeSkill = (i: number) => setSkills(s => s.filter((_, idx) => idx !== i))
  const updateSkill = (i: number, key: keyof SkillEntry, val: string) =>
    setSkills(s => s.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

  // ── Education helpers
  const addEdu    = () => setEducation(e => [...e, { institution_name: '', degree: '', field_of_study: '', start_year: '', end_year: '', grade: '' }])
  const removeEdu = (i: number) => setEducation(e => e.filter((_, idx) => idx !== i))
  const updateEdu = (i: number, key: keyof EduEntry, val: string) =>
    setEducation(e => e.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

  // ── Work helpers
  const addWork    = () => setWork(w => [...w, { company_name: '', job_title: '', job_description: '', start_date: '', end_date: '', is_current: false, skills_used: '' }])
  const removeWork = (i: number) => setWork(w => w.filter((_, idx) => idx !== i))
  const updateWork = (i: number, key: keyof WorkEntry, val: string | boolean) =>
    setWork(w => w.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

  const handleFinish = async () => {
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated. Please log in again.')

      if (IS_MOCK_MODE) {
        // In mock mode, just simulate success
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay
        router.push('/applicant')
        return
      }

      // 0 — Ensure applicant_profiles record exists
      console.log('Checking if applicant profile exists...')
      const { data: existingProfile } = await supabase
        .from('applicant_profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        console.log('Profile does not exist, creating it...')
        const { error: createErr } = await supabase.from('applicant_profiles').insert({
          id: user.id,
          first_name: basic.first_name.trim() || '',
          last_name: basic.last_name.trim() || '',
          phone: basic.phone.trim() || '',
        })
        if (createErr) {
          console.error('Profile creation error:', createErr)
          throw new Error(`Profile creation failed: ${createErr.message}`)
        }
      }

      // 1 — Update applicant_profiles (phone being filled = onboarding done)
      console.log('Updating applicant_profiles...')
      const { error: profileErr } = await supabase
        .from('applicant_profiles')
        .update({
          first_name:            basic.first_name.trim()             || null,
          last_name:             basic.last_name.trim()              || null,
          phone:                 basic.phone.trim()                  || null,
          location:              basic.location.trim()               || null,
          current_job_title:     basic.current_job_title.trim()      || null,
          experience_years:      basic.experience_years ? Number(basic.experience_years) : null,
          highest_qualification: basic.highest_qualification.trim()  || null,
          bio:                   basic.bio.trim()                    || null,
          linkedin_url:          links.linkedin_url.trim()           || null,
          github_url:            links.github_url.trim()             || null,
          portfolio_url:         links.portfolio_url.trim()          || null,
          updated_at:            new Date().toISOString(),
        })
        .eq('id', user.id)
      if (profileErr) {
        console.error('Profile update error:', profileErr)
        throw new Error(`Profile update failed: ${profileErr.message}`)
      }

      // 2 — Insert skills
      const validSkills = skills.filter(s => s.skill_name.trim())
      if (validSkills.length > 0) {
        console.log('Inserting skills...', validSkills)
        const { error: skillErr } = await supabase.from('skills').insert(
          validSkills.map(s => ({ applicant_id: user.id, skill_name: s.skill_name.trim(), proficiency_level: s.proficiency_level }))
        )
        if (skillErr) {
          console.error('Skills insert error:', skillErr)
          throw new Error(`Skills insert failed: ${skillErr.message}`)
        }
      }

      // 3 — Insert education
      const validEdu = education.filter(e => e.institution_name.trim() && e.degree.trim())
      if (validEdu.length > 0) {
        console.log('Inserting education...', validEdu)
        const { error: eduErr } = await supabase.from('education_history').insert(
          validEdu.map(e => ({
            applicant_id:    user.id,
            institution_name: e.institution_name.trim(),
            degree:           e.degree.trim(),
            field_of_study:   e.field_of_study.trim()  || null,
            start_year:       e.start_year ? Number(e.start_year) : null,
            end_year:         e.end_year   ? Number(e.end_year)   : null,
            grade:            e.grade      ? Number(e.grade)      : null,
          }))
        )
        if (eduErr) {
          console.error('Education insert error:', eduErr)
          throw new Error(`Education insert failed: ${eduErr.message}`)
        }
      }

      // 4 — Insert work experience
      const validWork = work.filter(w => w.company_name.trim() && w.job_title.trim() && w.start_date)
      if (validWork.length > 0) {
        console.log('Inserting work experience...', validWork)
        const { error: workErr } = await supabase.from('work_experience').insert(
          validWork.map(w => ({
            applicant_id:    user.id,
            company_name:    w.company_name.trim(),
            job_title:       w.job_title.trim(),
            job_description: w.job_description.trim() || null,
            start_date:      w.start_date,
            end_date:        w.is_current ? null : (w.end_date || null),
            is_current:      w.is_current,
            skills_used:     w.skills_used.trim() || null,
          }))
        )
        if (workErr) {
          console.error('Work experience insert error:', workErr)
          throw new Error(`Work experience insert failed: ${workErr.message}`)
        }
      }

      console.log('All operations successful, redirecting...')
      router.push('/applicant')
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      console.error('Onboarding error details:', err)
      setError(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  if (!mounted) return null

  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <PageWrapper className="relative flex flex-col items-center min-h-screen px-4 py-10 overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[560px] z-10"
      >
        {/* Logo + title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-3 shadow-2xl shadow-primary/20">
            <Brain size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Complete your profile</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Step {step} of {STEPS.length} — {STEPS[step - 1].label}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/40 dark:bg-white/5 rounded-full mb-6 overflow-hidden border border-white/30 dark:border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Step pills */}
        <div className="flex gap-2 mb-6 flex-wrap justify-center">
          {STEPS.map(s => (
            <div key={s.id} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
              step === s.id
                ? 'bg-primary/10 border-primary/30 text-primary'
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

              {/* ── STEP 1: Basic Info ── */}
              {step === 1 && (
                <div className="flex flex-col gap-5">
                  <StepHeader icon="👤" title="Tell us about yourself" subtitle="This shows on your candidate profile seen by recruiters." />
                  <div className="grid grid-cols-2 gap-4">
                    <Input id="first_name" label="First Name *" type="text" placeholder="Rahul"
                      value={basic.first_name} onChange={e => setBasic(p => ({ ...p, first_name: e.target.value }))} required />
                    <Input id="last_name" label="Last Name *" type="text" placeholder="Mehta"
                      value={basic.last_name} onChange={e => setBasic(p => ({ ...p, last_name: e.target.value }))} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input id="phone" label="Phone *" type="tel" placeholder="+91 98765 43210"
                      value={basic.phone} onChange={e => setBasic(p => ({ ...p, phone: e.target.value }))} required />
                    <Input id="location" label="Location" type="text" placeholder="Mumbai, India"
                      value={basic.location} onChange={e => setBasic(p => ({ ...p, location: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input id="current_job_title" label="Current Title" type="text" placeholder="Software Engineer"
                      value={basic.current_job_title} onChange={e => setBasic(p => ({ ...p, current_job_title: e.target.value }))} />
                    <Input id="experience_years" label="Years of Experience" type="number" placeholder="3"
                      value={basic.experience_years} onChange={e => setBasic(p => ({ ...p, experience_years: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 block mb-1.5">Highest Qualification</label>
                    <select value={basic.highest_qualification}
                      onChange={e => setBasic(p => ({ ...p, highest_qualification: e.target.value }))}
                      className="w-full h-11 px-4 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/8 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary/50 transition-all backdrop-blur-sm">
                      {QUALIFICATIONS.map(q => <option key={q} value={q}>{q || 'Select...'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 block mb-1.5">Bio</label>
                    <textarea value={basic.bio} onChange={e => setBasic(p => ({ ...p, bio: e.target.value }))}
                      rows={3} placeholder="Tell recruiters about yourself, your goals, what you're looking for..."
                      className="w-full px-4 py-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/8 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:border-primary/50 transition-all resize-none backdrop-blur-sm" />
                  </div>
                  <p className="text-[11px] text-slate-400">* Required. You can edit all of this later from your profile.</p>
                </div>
              )}

              {/* ── STEP 2: Links ── */}
              {step === 2 && (
                <div className="flex flex-col gap-5">
                  <StepHeader icon="🔗" title="Your online presence" subtitle="Help recruiters find your work. All optional but recommended." />
                  <Input id="linkedin" label="LinkedIn URL" type="url" placeholder="https://linkedin.com/in/yourname"
                    value={links.linkedin_url} onChange={e => setLinks(p => ({ ...p, linkedin_url: e.target.value }))} />
                  <Input id="github" label="GitHub URL" type="url" placeholder="https://github.com/yourname"
                    value={links.github_url} onChange={e => setLinks(p => ({ ...p, github_url: e.target.value }))} />
                  <Input id="portfolio" label="Portfolio / Website" type="url" placeholder="https://yourportfolio.com"
                    value={links.portfolio_url} onChange={e => setLinks(p => ({ ...p, portfolio_url: e.target.value }))} />
                  <p className="text-[11px] text-slate-400">You can skip this step if you don&apos;t have these yet.</p>
                </div>
              )}

              {/* ── STEP 3: Skills ── */}
              {step === 3 && (
                <div className="flex flex-col gap-4">
                  <StepHeader icon="⚡" title="Your skills" subtitle="Add skills relevant to the roles you're targeting." />
                  <div className="flex flex-col gap-3">
                    {skills.map((skill, i) => (
                      <div key={i} className="flex gap-3 items-end">
                        <div className="flex-1">
                          {i === 0 && <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 block mb-1.5">Skill Name</label>}
                          <input type="text" value={skill.skill_name} onChange={e => updateSkill(i, 'skill_name', e.target.value)}
                            placeholder="e.g. React, Python, Figma..."
                            className="w-full h-11 px-4 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/8 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:border-primary/50 transition-all backdrop-blur-sm" />
                        </div>
                        <div className="w-36">
                          {i === 0 && <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 block mb-1.5">Level</label>}
                          <select value={skill.proficiency_level} onChange={e => updateSkill(i, 'proficiency_level', e.target.value)}
                            className="w-full h-11 px-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/8 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary/50 transition-all backdrop-blur-sm">
                            {PROFICIENCY.map(l => <option key={l} value={l}>{l}</option>)}
                          </select>
                        </div>
                        <button onClick={() => removeSkill(i)} disabled={skills.length === 1}
                          className="h-11 w-11 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={addSkill}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-primary/30 text-primary text-sm font-bold hover:bg-primary/5 transition-all">
                    <Plus size={15} /> Add another skill
                  </button>
                  <p className="text-[11px] text-slate-400">Tip: Add 3–5 skills to improve visibility to recruiters.</p>
                </div>
              )}

              {/* ── STEP 4: Education ── */}
              {step === 4 && (
                <div className="flex flex-col gap-4">
                  <StepHeader icon="🎓" title="Education history" subtitle="Add your degrees and certifications." />
                  {education.map((edu, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/30 dark:bg-slate-900/30 border border-white/40 dark:border-white/5 backdrop-blur-sm">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Entry {i + 1}</span>
                        {education.length > 1 && (
                          <button onClick={() => removeEdu(i)} className="text-red-400 hover:text-red-500 text-xs font-bold flex items-center gap-1 transition-colors">
                            <X size={12} /> Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <Input id={`inst_${i}`} label="Institution *" type="text" placeholder="IIT Bombay, Harvard..."
                            value={edu.institution_name} onChange={e => updateEdu(i, 'institution_name', e.target.value)} />
                        </div>
                        <Input id={`deg_${i}`} label="Degree *" type="text" placeholder="B.Tech, MBA..."
                          value={edu.degree} onChange={e => updateEdu(i, 'degree', e.target.value)} />
                        <Input id={`field_${i}`} label="Field of Study" type="text" placeholder="Computer Science"
                          value={edu.field_of_study} onChange={e => updateEdu(i, 'field_of_study', e.target.value)} />
                        <Input id={`sy_${i}`} label="Start Year" type="number" placeholder="2018"
                          value={edu.start_year} onChange={e => updateEdu(i, 'start_year', e.target.value)} />
                        <Input id={`ey_${i}`} label="End Year" type="number" placeholder="2022"
                          value={edu.end_year} onChange={e => updateEdu(i, 'end_year', e.target.value)} />
                        <Input id={`grade_${i}`} label="Grade / GPA" type="text" placeholder="8.5 / 90%"
                          value={edu.grade} onChange={e => updateEdu(i, 'grade', e.target.value)} />
                      </div>
                    </div>
                  ))}
                  <button onClick={addEdu}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-primary/30 text-primary text-sm font-bold hover:bg-primary/5 transition-all">
                    <Plus size={15} /> Add another degree
                  </button>
                </div>
              )}

              {/* ── STEP 5: Work Experience ── */}
              {step === 5 && (
                <div className="flex flex-col gap-4">
                  <StepHeader icon="💼" title="Work experience" subtitle="Add your past and current roles. Fresh graduates can skip." />
                  {work.map((w, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/30 dark:bg-slate-900/30 border border-white/40 dark:border-white/5 backdrop-blur-sm">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Role {i + 1}</span>
                        {work.length > 1 && (
                          <button onClick={() => removeWork(i)} className="text-red-400 hover:text-red-500 text-xs font-bold flex items-center gap-1 transition-colors">
                            <X size={12} /> Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input id={`co_${i}`} label="Company *" type="text" placeholder="Google, Startup XYZ..."
                          value={w.company_name} onChange={e => updateWork(i, 'company_name', e.target.value)} />
                        <Input id={`jt_${i}`} label="Job Title *" type="text" placeholder="Software Engineer"
                          value={w.job_title} onChange={e => updateWork(i, 'job_title', e.target.value)} />
                        <Input id={`sd_${i}`} label="Start Date" type="date"
                          value={w.start_date} onChange={e => updateWork(i, 'start_date', e.target.value)} />
                        <div>
                          <Input id={`ed_${i}`} label="End Date" type="date"
                            value={w.end_date} onChange={e => updateWork(i, 'end_date', e.target.value)}
                            disabled={w.is_current} />
                          <label className="flex items-center gap-2 mt-2 cursor-pointer">
                            <input type="checkbox" checked={w.is_current}
                              onChange={e => updateWork(i, 'is_current', e.target.checked)}
                              className="rounded border-slate-300 text-primary" />
                            <span className="text-xs text-slate-500 font-medium">Currently working here</span>
                          </label>
                        </div>
                        <div className="col-span-2">
                          <Input id={`su_${i}`} label="Skills Used" type="text" placeholder="React, Node.js, PostgreSQL..."
                            value={w.skills_used} onChange={e => updateWork(i, 'skills_used', e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 block mb-1.5">Description</label>
                          <textarea value={w.job_description} onChange={e => updateWork(i, 'job_description', e.target.value)}
                            rows={2} placeholder="Key responsibilities and achievements..."
                            className="w-full px-4 py-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-white/8 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:border-primary/50 transition-all resize-none backdrop-blur-sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addWork}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-primary/30 text-primary text-sm font-bold hover:bg-primary/5 transition-all">
                    <Plus size={15} /> Add another role
                  </button>
                  <p className="text-[11px] text-slate-400">Fresh graduates or career changers can skip this step.</p>
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
                  {step < 5 && (
                    <button onClick={skip} className="text-slate-400 text-sm font-bold hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                      Skip
                    </button>
                  )}
                  {step < 5 ? (
                    <Button onClick={next} className="gap-2">
                      Continue <ArrowRight size={15} />
                    </Button>
                  ) : (
                    <Button onClick={handleFinish} loading={saving} className="gap-2">
                      🚀 Complete Setup
                    </Button>
                  )}
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </Card>

        <p className="text-center text-slate-400 text-xs mt-6 font-medium">
          All fields except Name and Phone can be updated later from your profile.
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
