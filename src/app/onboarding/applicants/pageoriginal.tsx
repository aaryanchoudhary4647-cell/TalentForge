'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { IS_MOCK_MODE } from '@/lib/config'

const TOTAL_STEPS = 5

// ─── Types ───────────────────────────────────────────────────────────────────
interface SkillEntry { skill_name: string; proficiency_level: string }
interface EduEntry { institution_name: string; degree: string; field_of_study: string; start_year: string; end_year: string; grade: string }
interface WorkEntry { company_name: string; job_title: string; job_description: string; start_date: string; end_date: string; is_current: boolean; skills_used: string }

export default function ApplicantOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Step 1 — Basic Info
  const [basic, setBasic] = useState({ first_name: '', last_name: '', phone: '', location: '', current_job_title: '', experience_years: '', highest_qualification: '', bio: '' })

  // Step 2 — Links
  const [links, setLinks] = useState({ linkedin_url: '', github_url: '', portfolio_url: '' })

  // Step 3 — Skills
  const [skills, setSkills] = useState<SkillEntry[]>([{ skill_name: '', proficiency_level: 'Intermediate' }])

  // Step 4 — Education
  const [education, setEducation] = useState<EduEntry[]>([{ institution_name: '', degree: '', field_of_study: '', start_year: '', end_year: '', grade: '' }])

  // Step 5 — Work Experience
  const [work, setWork] = useState<WorkEntry[]>([{ company_name: '', job_title: '', job_description: '', start_date: '', end_date: '', is_current: false, skills_used: '' }])

  const next = () => { setError(''); setStep(s => Math.min(s + 1, TOTAL_STEPS)) }
  const back = () => { setError(''); setStep(s => Math.max(s - 1, 1)) }

  const handleFinish = async () => {
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (IS_MOCK_MODE) {
        // In mock mode, just simulate success
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay
        router.push('/applicant')
        return
      }

      // 1. Update applicant_profiles
      const { error: profileErr } = await supabase.from('applicant_profiles').update({
        first_name: basic.first_name.trim(),
        last_name: basic.last_name.trim(),
        phone: basic.phone.trim(),
        location: basic.location.trim() || null,
        current_job_title: basic.current_job_title.trim() || null,
        experience_years: basic.experience_years ? Number(basic.experience_years) : null,
        highest_qualification: basic.highest_qualification.trim() || null,
        bio: basic.bio.trim() || null,
        linkedin_url: links.linkedin_url.trim() || null,
        github_url: links.github_url.trim() || null,
        portfolio_url: links.portfolio_url.trim() || null,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id)
      if (profileErr) throw profileErr

      // 2. Insert skills (filter empty)
      const validSkills = skills.filter(s => s.skill_name.trim())
      if (validSkills.length > 0) {
        const { error: skillErr } = await supabase.from('skills').insert(
          validSkills.map(s => ({ applicant_id: user.id, skill_name: s.skill_name.trim(), proficiency_level: s.proficiency_level }))
        )
        if (skillErr) throw skillErr
      }

      // 3. Insert education (filter empty)
      const validEdu = education.filter(e => e.institution_name.trim() && e.degree.trim())
      if (validEdu.length > 0) {
        const { error: eduErr } = await supabase.from('education_history').insert(
          validEdu.map(e => ({
            applicant_id: user.id,
            institution_name: e.institution_name.trim(),
            degree: e.degree.trim(),
            field_of_study: e.field_of_study.trim() || null,
            start_year: e.start_year ? Number(e.start_year) : null,
            end_year: e.end_year ? Number(e.end_year) : null,
            grade: e.grade ? Number(e.grade) : null,
          }))
        )
        if (eduErr) throw eduErr
      }

      // 4. Insert work experience (filter empty)
      const validWork = work.filter(w => w.company_name.trim() && w.job_title.trim())
      if (validWork.length > 0) {
        const { error: workErr } = await supabase.from('work_experience').insert(
          validWork.map(w => ({
            applicant_id: user.id,
            company_name: w.company_name.trim(),
            job_title: w.job_title.trim(),
            job_description: w.job_description.trim() || null,
            start_date: w.start_date,
            end_date: w.is_current ? null : (w.end_date || null),
            is_current: w.is_current,
            skills_used: w.skills_used.trim() || null,
          }))
        )
        if (workErr) throw workErr
      }

      router.push('/applicant')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => setSkills(s => [...s, { skill_name: '', proficiency_level: 'Intermediate' }])
  const removeSkill = (i: number) => setSkills(s => s.filter((_, idx) => idx !== i))
  const updateSkill = (i: number, key: keyof SkillEntry, val: string) => setSkills(s => s.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

  const addEdu = () => setEducation(e => [...e, { institution_name: '', degree: '', field_of_study: '', start_year: '', end_year: '', grade: '' }])
  const removeEdu = (i: number) => setEducation(e => e.filter((_, idx) => idx !== i))
  const updateEdu = (i: number, key: keyof EduEntry, val: string) => setEducation(e => e.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

  const addWork = () => setWork(w => [...w, { company_name: '', job_title: '', job_description: '', start_date: '', end_date: '', is_current: false, skills_used: '' }])
  const removeWork = (i: number) => setWork(w => w.filter((_, idx) => idx !== i))
  const updateWork = (i: number, key: keyof WorkEntry, val: string | boolean) => setWork(w => w.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

  const stepTitles = ['Basic Info', 'Online Presence', 'Skills', 'Education', 'Work Experience']
  const stepIcons = ['👤', '🔗', '⚡', '🎓', '💼']

  return (
    <div style={{ minHeight: '100vh', background: '#080812', fontFamily: "'DM Sans', system-ui, sans-serif", color: 'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea, select { outline: none; transition: border-color 0.2s; color: white; font-family: inherit; }
        input:focus, textarea:focus, select:focus { border-color: #7c6af7 !important; }
        select option { background: #1a1a2e; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .step-content { animation: fadeUp 0.3s ease; }
      `}</style>

      {/* Top bar */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c6af7, #5e9ef7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>⚡</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '16px' }}>TalentForge</span>
        </div>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>PROFILE SETUP • STEP {step} OF {TOTAL_STEPS}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)' }}>
        <div style={{ height: '100%', width: `${(step / TOTAL_STEPS) * 100}%`, background: 'linear-gradient(90deg, #7c6af7, #5e9ef7)', transition: 'width 0.4s ease' }} />
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {stepTitles.map((title, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '6px 12px', borderRadius: '20px', background: step === i + 1 ? 'rgba(124,106,247,0.2)' : step > i + 1 ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${step === i + 1 ? 'rgba(124,106,247,0.4)' : step > i + 1 ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.07)'}` }}>
              <span style={{ fontSize: '13px' }}>{step > i + 1 ? '✓' : stepIcons[i]}</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: step === i + 1 ? '#a89cf7' : step > i + 1 ? '#6ee7b7' : 'rgba(255,255,255,0.3)' }}>{title}</span>
            </div>
          ))}
        </div>

        <div className="step-content" key={step}>
          {/* ── STEP 1: Basic Info ──────────────────────────────────────── */}
          {step === 1 && (
            <div>
              <StepHeader icon="👤" title="Let's set up your profile" subtitle="Tell us about yourself so employers know who you are." />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <Field label="First Name *" value={basic.first_name} onChange={v => setBasic(p => ({ ...p, first_name: v }))} placeholder="John" />
                <Field label="Last Name *" value={basic.last_name} onChange={v => setBasic(p => ({ ...p, last_name: v }))} placeholder="Doe" />
                <Field label="Phone Number *" value={basic.phone} onChange={v => setBasic(p => ({ ...p, phone: v }))} placeholder="+91 98765 43210" />
                <Field label="Location" value={basic.location} onChange={v => setBasic(p => ({ ...p, location: v }))} placeholder="Mumbai, India" />
                <Field label="Current Job Title" value={basic.current_job_title} onChange={v => setBasic(p => ({ ...p, current_job_title: v }))} placeholder="Software Engineer" />
                <Field label="Years of Experience" value={basic.experience_years} onChange={v => setBasic(p => ({ ...p, experience_years: v }))} placeholder="3" type="number" />
                <div style={{ gridColumn: 'span 2' }}>
                  <SelectField label="Highest Qualification" value={basic.highest_qualification} onChange={v => setBasic(p => ({ ...p, highest_qualification: v }))} options={['', 'High School', 'Diploma', 'Bachelor\'s', 'Master\'s', 'PhD', 'Other']} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Bio / About You</label>
                  <textarea value={basic.bio} onChange={e => setBasic(p => ({ ...p, bio: e.target.value }))} rows={4}
                    placeholder="Tell employers about yourself, your goals, what you're looking for..."
                    style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              </div>
              <StepNote>* Required fields. You can update everything later from your profile.</StepNote>
            </div>
          )}

          {/* ── STEP 2: Links ──────────────────────────────────────────── */}
          {step === 2 && (
            <div>
              <StepHeader icon="🔗" title="Your online presence" subtitle="Help recruiters find your work. All fields are optional but recommended." />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Field label="LinkedIn URL" value={links.linkedin_url} onChange={v => setLinks(p => ({ ...p, linkedin_url: v }))} placeholder="https://linkedin.com/in/yourname" />
                <Field label="GitHub URL" value={links.github_url} onChange={v => setLinks(p => ({ ...p, github_url: v }))} placeholder="https://github.com/yourname" />
                <Field label="Portfolio / Website URL" value={links.portfolio_url} onChange={v => setLinks(p => ({ ...p, portfolio_url: v }))} placeholder="https://yourportfolio.com" />
              </div>
              <StepNote>You can skip this step if you don&apos;t have these yet.</StepNote>
            </div>
          )}

          {/* ── STEP 3: Skills ─────────────────────────────────────────── */}
          {step === 3 && (
            <div>
              <StepHeader icon="⚡" title="Your skills" subtitle="Add skills relevant to the roles you're targeting." />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {skills.map((skill, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 36px', gap: '10px', alignItems: 'end' }}>
                    <Field label={i === 0 ? 'Skill Name' : ''} value={skill.skill_name} onChange={v => updateSkill(i, 'skill_name', v)} placeholder="e.g. React, Python, Figma..." />
                    <div>
                      {i === 0 && <label style={labelStyle}>Level</label>}
                      <select value={skill.proficiency_level} onChange={e => updateSkill(i, 'proficiency_level', e.target.value)} style={inputStyle}>
                        {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <button onClick={() => removeSkill(i)} disabled={skills.length === 1} style={{ height: '42px', width: '36px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#fca5a5', cursor: skills.length === 1 ? 'not-allowed' : 'pointer', opacity: skills.length === 1 ? 0.4 : 1, fontSize: '16px' }}>×</button>
                  </div>
                ))}
              </div>
              <button onClick={addSkill} style={addRowBtnStyle}>+ Add another skill</button>
              <StepNote>Add at least 3–5 skills to improve your visibility to recruiters.</StepNote>
            </div>
          )}

          {/* ── STEP 4: Education ──────────────────────────────────────── */}
          {step === 4 && (
            <div>
              <StepHeader icon="🎓" title="Education history" subtitle="Add your degrees, certifications, and courses." />
              {education.map((edu, i) => (
                <div key={i} style={{ padding: '18px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>Entry {i + 1}</span>
                    {education.length > 1 && <button onClick={() => removeEdu(i)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>Remove</button>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <Field label="Institution Name *" value={edu.institution_name} onChange={v => updateEdu(i, 'institution_name', v)} placeholder="IIT Bombay, Harvard..." />
                    </div>
                    <Field label="Degree *" value={edu.degree} onChange={v => updateEdu(i, 'degree', v)} placeholder="B.Tech, MBA, BSc..." />
                    <Field label="Field of Study" value={edu.field_of_study} onChange={v => updateEdu(i, 'field_of_study', v)} placeholder="Computer Science..." />
                    <Field label="Start Year" value={edu.start_year} onChange={v => updateEdu(i, 'start_year', v)} placeholder="2018" type="number" />
                    <Field label="End Year (or expected)" value={edu.end_year} onChange={v => updateEdu(i, 'end_year', v)} placeholder="2022" type="number" />
                    <Field label="Grade / GPA / %" value={edu.grade} onChange={v => updateEdu(i, 'grade', v)} placeholder="8.5 / 90%" />
                  </div>
                </div>
              ))}
              <button onClick={addEdu} style={addRowBtnStyle}>+ Add another degree / certification</button>
            </div>
          )}

          {/* ── STEP 5: Work Experience ────────────────────────────────── */}
          {step === 5 && (
            <div>
              <StepHeader icon="💼" title="Work experience" subtitle="Add your past and current roles. Fresh graduates can skip." />
              {work.map((w, i) => (
                <div key={i} style={{ padding: '18px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>Role {i + 1}</span>
                    {work.length > 1 && <button onClick={() => removeWork(i)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>Remove</button>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Field label="Company Name *" value={w.company_name} onChange={v => updateWork(i, 'company_name', v)} placeholder="Google, Startup XYZ..." />
                    <Field label="Job Title *" value={w.job_title} onChange={v => updateWork(i, 'job_title', v)} placeholder="Software Engineer..." />
                    <Field label="Start Date *" value={w.start_date} onChange={v => updateWork(i, 'start_date', v)} placeholder="2021-06-01" type="date" />
                    <div>
                      <Field label="End Date" value={w.end_date} onChange={v => updateWork(i, 'end_date', v)} placeholder="2023-12-31" type="date" disabled={w.is_current} />
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '7px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={w.is_current} onChange={e => updateWork(i, 'is_current', e.target.checked)} />
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Currently working here</span>
                      </label>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <Field label="Skills Used" value={w.skills_used} onChange={v => updateWork(i, 'skills_used', v)} placeholder="React, Node.js, PostgreSQL..." />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={labelStyle}>Job Description</label>
                      <textarea value={w.job_description} onChange={e => updateWork(i, 'job_description', e.target.value)} rows={3}
                        placeholder="Describe your key responsibilities and achievements..."
                        style={{ ...inputStyle, resize: 'vertical' }} />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addWork} style={addRowBtnStyle}>+ Add another role</button>
              <StepNote>Fresh graduates or career changers can skip this step entirely.</StepNote>
            </div>
          )}

          {/* Error */}
          {error && <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', fontSize: '13px' }}>{error}</div>}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px' }}>
            <button onClick={back} disabled={step === 1} style={{ padding: '11px 24px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 700, cursor: step === 1 ? 'not-allowed' : 'pointer', opacity: step === 1 ? 0.4 : 1 }}>← Back</button>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {step < TOTAL_STEPS && (
                <button onClick={() => { setStep(s => s + 1) }} style={{ padding: '11px 20px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>Skip</button>
              )}
              {step < TOTAL_STEPS ? (
                <button onClick={next} style={{ padding: '11px 28px', background: 'linear-gradient(135deg, #7c6af7, #5e9ef7)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,106,247,0.3)' }}>Continue →</button>
              ) : (
                <button onClick={handleFinish} disabled={saving} style={{ padding: '11px 28px', background: saving ? 'rgba(124,106,247,0.4)' : 'linear-gradient(135deg, #7c6af7, #5e9ef7)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(124,106,247,0.3)' }}>
                  {saving ? 'Saving...' : '🚀 Complete Setup'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Shared small components ─────────────────────────────────────────────────
function StepHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ fontSize: '32px', marginBottom: '10px' }}>{icon}</div>
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>{title}</h2>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5' }}>{subtitle}</p>
    </div>
  )
}

function StepNote({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginTop: '16px', lineHeight: '1.5' }}>{children}</p>
}

function Field({ label, value, onChange, placeholder, type = 'text', disabled = false }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean }) {
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        style={{ ...inputStyle, opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'text' }} />
    </div>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
        {options.map(o => <option key={o} value={o}>{o || 'Select...'}</option>)}
      </select>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '7px' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 13px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '13px', fontFamily: 'inherit' }
const addRowBtnStyle: React.CSSProperties = { marginTop: '10px', padding: '9px 18px', background: 'rgba(124,106,247,0.1)', border: '1px dashed rgba(124,106,247,0.35)', borderRadius: '10px', color: '#a89cf7', fontSize: '13px', fontWeight: 700, cursor: 'pointer', width: '100%' }
