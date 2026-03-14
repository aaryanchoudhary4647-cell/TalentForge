'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { IS_MOCK_MODE } from '@/lib/config'

const TOTAL_STEPS = 3

interface JobDraft { job_title: string; job_description: string; requirements: string; location: string; job_type: string; department: string; experience_required: string; salary_min: string; salary_max: string; closing_date: string }

export default function HROnboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [skipJob, setSkipJob] = useState(false)

  // Step 1 — Company / HR Profile
  const [company, setCompany] = useState({
    company_name: '',
    department: '',
    phone: '',
    office_location: '',
  })

  // Step 2 — About Company
  const [about, setAbout] = useState({
    industry: '',
    company_size: '',
    website: '',
    description: '',
  })

  // Step 3 — First Job Posting (optional)
  const [job, setJob] = useState<JobDraft>({
    job_title: '', job_description: '', requirements: '', location: '',
    job_type: 'Full-time', department: '', experience_required: '',
    salary_min: '', salary_max: '', closing_date: '',
  })

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
        router.push('/hr')
        return
      }

      // 1. Update hr_profiles
      const { error: profileErr } = await supabase.from('hr_profiles').update({
        company_name: company.company_name.trim(),
        department: company.department.trim() || null,
        phone: company.phone.trim(),
        office_location: company.office_location.trim() || null,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id)
      if (profileErr) throw profileErr

      // 2. Create first job posting if not skipped
      if (!skipJob && job.job_title.trim() && job.job_description.trim() && job.location.trim()) {
        const { error: jobErr } = await supabase.from('job_postings').insert({
          hr_id: user.id,
          job_title: job.job_title.trim(),
          job_description: job.job_description.trim(),
          requirements: job.requirements.trim() || null,
          location: job.location.trim(),
          job_type: job.job_type as 'Full-time' | 'Part-time' | 'Contract' | 'Internship',
          department: job.department.trim() || company.department.trim() || null,
          experience_required: job.experience_required.trim() || null,
          salary_min: job.salary_min ? Number(job.salary_min) : null,
          salary_max: job.salary_max ? Number(job.salary_max) : null,
          closing_date: job.closing_date || null,
          status: 'Open',
        })
        if (jobErr) throw jobErr
      }

      router.push('/hr')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const stepTitles = ['Company Profile', 'Company Details', 'First Job Post']
  const stepIcons = ['🏢', '📋', '📝']

  return (
    <div style={{ minHeight: '100vh', background: '#080812', fontFamily: "'DM Sans', system-ui, sans-serif", color: 'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea, select { outline: none; transition: border-color 0.2s; color: white; font-family: inherit; }
        input:focus, textarea:focus, select:focus { border-color: #f59e0b !important; }
        select option { background: #1a1a2e; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .step-content { animation: fadeUp 0.3s ease; }
      `}</style>

      {/* Top bar — amber accent for HR */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>⚡</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '16px' }}>TalentForge</span>
        </div>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>RECRUITER SETUP • STEP {step} OF {TOTAL_STEPS}</span>
      </div>

      {/* Progress */}
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)' }}>
        <div style={{ height: '100%', width: `${(step / TOTAL_STEPS) * 100}%`, background: 'linear-gradient(90deg, #f59e0b, #f97316)', transition: 'width 0.4s ease' }} />
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Step pills */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
          {stepTitles.map((title, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '6px 14px', borderRadius: '20px', background: step === i + 1 ? 'rgba(245,158,11,0.15)' : step > i + 1 ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${step === i + 1 ? 'rgba(245,158,11,0.35)' : step > i + 1 ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.07)'}` }}>
              <span style={{ fontSize: '13px' }}>{step > i + 1 ? '✓' : stepIcons[i]}</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: step === i + 1 ? '#fcd34d' : step > i + 1 ? '#6ee7b7' : 'rgba(255,255,255,0.3)' }}>{title}</span>
            </div>
          ))}
        </div>

        <div className="step-content" key={step}>

          {/* ── STEP 1: Company Profile ──────────────────────────────── */}
          {step === 1 && (
            <div>
              <StepHeader icon="🏢" title="Set up your recruiter profile" subtitle="This information will be shown to candidates who apply to your jobs." accent="#f59e0b" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <Field label="Company Name *" value={company.company_name} onChange={v => setCompany(p => ({ ...p, company_name: v }))} placeholder="Acme Technologies, Google..." accent="#f59e0b" />
                </div>
                <Field label="Your Department" value={company.department} onChange={v => setCompany(p => ({ ...p, department: v }))} placeholder="Engineering, HR, Product..." accent="#f59e0b" />
                <Field label="Your Phone Number *" value={company.phone} onChange={v => setCompany(p => ({ ...p, phone: v }))} placeholder="+91 98765 43210" accent="#f59e0b" />
                <div style={{ gridColumn: 'span 2' }}>
                  <Field label="Office Location" value={company.office_location} onChange={v => setCompany(p => ({ ...p, office_location: v }))} placeholder="Bangalore, India / Remote / Hybrid" accent="#f59e0b" />
                </div>
              </div>
              <StepNote>* Required. Your phone and company name are shown on job postings.</StepNote>
            </div>
          )}

          {/* ── STEP 2: About Company ────────────────────────────────── */}
          {step === 2 && (
            <div>
              <StepHeader icon="📋" title="Tell candidates about your company" subtitle="This helps attract the right talent. All fields are optional." accent="#f59e0b" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <SelectField label="Industry" value={about.industry} onChange={v => setAbout(p => ({ ...p, industry: v }))} options={['', 'Technology', 'Finance', 'Healthcare', 'Education', 'E-Commerce', 'Manufacturing', 'Media', 'Consulting', 'Government', 'Other']} accent="#f59e0b" />
                  <SelectField label="Company Size" value={about.company_size} onChange={v => setAbout(p => ({ ...p, company_size: v }))} options={['', '1–10', '11–50', '51–200', '201–500', '500–1000', '1000+']} accent="#f59e0b" />
                </div>
                <Field label="Company Website" value={about.website} onChange={v => setAbout(p => ({ ...p, website: v }))} placeholder="https://yourcompany.com" accent="#f59e0b" />
                <div>
                  <label style={labelStyle}>Company Description</label>
                  <textarea value={about.description} onChange={e => setAbout(p => ({ ...p, description: e.target.value }))} rows={5}
                    placeholder="Tell candidates what your company does, your culture, mission, and why they should join..."
                    style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              </div>
              <StepNote>You can skip this step and fill it in later from your dashboard settings.</StepNote>
            </div>
          )}

          {/* ── STEP 3: First Job Post ───────────────────────────────── */}
          {step === 3 && (
            <div>
              <StepHeader icon="📝" title="Post your first job" subtitle="Get started right away. You can always add more from your dashboard." accent="#f59e0b" />

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', cursor: 'pointer', padding: '12px 16px', borderRadius: '10px', background: skipJob ? 'rgba(255,255,255,0.04)' : 'rgba(245,158,11,0.06)', border: `1px solid ${skipJob ? 'rgba(255,255,255,0.08)' : 'rgba(245,158,11,0.2)'}` }}>
                <input type="checkbox" checked={!skipJob} onChange={e => setSkipJob(!e.target.checked)} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: skipJob ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)' }}>
                  Yes, I want to post a job right now
                </span>
              </label>

              {!skipJob && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <Field label="Job Title *" value={job.job_title} onChange={v => setJob(p => ({ ...p, job_title: v }))} placeholder="Senior React Developer, Product Manager..." accent="#f59e0b" />
                  </div>
                  <Field label="Location *" value={job.location} onChange={v => setJob(p => ({ ...p, location: v }))} placeholder="Remote / Mumbai / Hybrid" accent="#f59e0b" />
                  <SelectField label="Job Type" value={job.job_type} onChange={v => setJob(p => ({ ...p, job_type: v }))} options={['Full-time', 'Part-time', 'Contract', 'Internship']} accent="#f59e0b" />
                  <Field label="Department" value={job.department} onChange={v => setJob(p => ({ ...p, department: v }))} placeholder="Engineering, Design..." accent="#f59e0b" />
                  <Field label="Experience Required" value={job.experience_required} onChange={v => setJob(p => ({ ...p, experience_required: v }))} placeholder="3-5 years / Fresher" accent="#f59e0b" />
                  <Field label="Min Salary (₹/year)" value={job.salary_min} onChange={v => setJob(p => ({ ...p, salary_min: v }))} placeholder="600000" type="number" accent="#f59e0b" />
                  <Field label="Max Salary (₹/year)" value={job.salary_max} onChange={v => setJob(p => ({ ...p, salary_max: v }))} placeholder="1200000" type="number" accent="#f59e0b" />
                  <div style={{ gridColumn: 'span 2' }}>
                    <Field label="Application Closing Date" value={job.closing_date} onChange={v => setJob(p => ({ ...p, closing_date: v }))} type="date" accent="#f59e0b" />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Job Description *</label>
                    <textarea value={job.job_description} onChange={e => setJob(p => ({ ...p, job_description: e.target.value }))} rows={5}
                      placeholder="Describe the role, what you'll be working on, your team, responsibilities..."
                      style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Requirements</label>
                    <textarea value={job.requirements} onChange={e => setJob(p => ({ ...p, requirements: e.target.value }))} rows={3}
                      placeholder="Required skills, qualifications, certifications..."
                      style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                </div>
              )}

              {skipJob && (
                <div style={{ padding: '24px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '14px', lineHeight: '1.6' }}>
                  No problem! You can post jobs anytime from<br />your dashboard using the <strong style={{ color: 'rgba(255,255,255,0.5)' }}>+ New Job</strong> button.
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', fontSize: '13px' }}>{error}</div>}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px' }}>
            <button onClick={back} disabled={step === 1} style={{ padding: '11px 24px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 700, cursor: step === 1 ? 'not-allowed' : 'pointer', opacity: step === 1 ? 0.4 : 1 }}>← Back</button>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {step < TOTAL_STEPS && (
                <button onClick={next} style={{ padding: '11px 20px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>Skip</button>
              )}
              {step < TOTAL_STEPS ? (
                <button onClick={next} style={{ padding: '11px 28px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}>Continue →</button>
              ) : (
                <button onClick={handleFinish} disabled={saving} style={{ padding: '11px 28px', background: saving ? 'rgba(245,158,11,0.4)' : 'linear-gradient(135deg, #f59e0b, #f97316)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '13px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}>
                  {saving ? 'Setting up...' : '🚀 Go to Dashboard'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Shared components ────────────────────────────────────────────────────────
function StepHeader({ icon, title, subtitle, accent }: { icon: string; title: string; subtitle: string; accent: string }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ fontSize: '32px', marginBottom: '10px' }}>{icon}</div>
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: 800, marginBottom: '6px', color: 'white' }}>{title}</h2>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5' }}>{subtitle}</p>
      <div style={{ height: '2px', width: '48px', background: accent, borderRadius: '2px', marginTop: '14px' }} />
    </div>
  )
}

function StepNote({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', marginTop: '16px', lineHeight: '1.5' }}>{children}</p>
}

function Field({ label, value, onChange, placeholder, type = 'text', disabled = false, accent = '#7c6af7' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean; accent?: string }) {
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        style={{ ...inputStyle, opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'text' }}
        onFocus={e => { e.target.style.borderColor = accent; e.target.style.boxShadow = `0 0 0 3px ${accent}22` }}
        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options, accent = '#7c6af7' }: { label: string; value: string; onChange: (v: string) => void; options: string[]; accent?: string }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}
        onFocus={e => { (e.target as HTMLSelectElement).style.borderColor = accent }}
        onBlur={e => { (e.target as HTMLSelectElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
      >
        {options.map(o => <option key={o} value={o}>{o || 'Select...'}</option>)}
      </select>
    </div>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '7px' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 13px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '13px', fontFamily: 'inherit', transition: 'border-color 0.2s, box-shadow 0.2s' }
