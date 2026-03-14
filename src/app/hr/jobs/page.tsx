'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Brain, Plus, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { PageWrapper, Button, Input, Card } from '@/components/ui'
import { supabase } from '@/lib/supabase'

type JobFormData = {
  job_title: string
  job_description: string
  requirements: string
  salary_min: number | null
  salary_max: number | null
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship'
}

export default function PostJobPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<JobFormData>({
    job_title: '',
    job_description: '',
    requirements: '',
    salary_min: null,
    salary_max: null,
    job_type: 'full-time',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [dbCheckError, setDbCheckError] = useState('')

  // Check if database is set up on component mount
  React.useEffect(() => {
    const checkDatabase = async () => {
      try {
        // Try to query the job_postings table
        const { error } = await supabase
          .from('job_postings')
          .select('id')
          .limit(1)
        
        if (error?.code === '42P01') {
          setDbCheckError('⚠️ Database table "job_postings" not found. Please run the setup script from SUPABASE_SETUP.md')
        } else if (error?.code === '42501') {
          setDbCheckError('⚠️ Database permissions issue. Please run the setup script from SUPABASE_SETUP.md')
        } else if (error) {
          console.warn('Database check warning:', error)
        }
      } catch (err) {
        console.error('Database check error:', err)
      }
    }

    if (!loading && user) {
      console.log('✅ User loaded for job posting:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      })
      checkDatabase()
    }
  }, [loading, user])

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

  if (!user || user.role !== 'hr') {
    router.push('/auth/login')
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: ['salary_min', 'salary_max'].includes(name) ? (value ? parseInt(value) : null) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setSubmitting(false)
      setError('❌ Request timeout. The database may not be set up. Please:\n1. Run the SUPABASE_SETUP.md script in your Supabase SQL Editor\n2. Refresh the page\n3. Try again')
    }, 10000) // 10 second timeout

    try {
      // Validate user is loaded
      if (!user || !user.id) {
        clearTimeout(timeoutId)
        console.error('❌ User not loaded or missing ID:', user)
        setError('Error: User not loaded. Please log in again and try.')
        setSubmitting(false)
        return
      }

      if (user.role !== 'hr') {
        clearTimeout(timeoutId)
        setError('Only HR users can post jobs. You are logged in as: ' + user.role)
        setSubmitting(false)
        return
      }

      // Validate required fields
      if (!formData.job_title.trim()) {
        clearTimeout(timeoutId)
        setError('Job title is required')
        setSubmitting(false)
        return
      }
      if (!formData.job_description.trim()) {
        clearTimeout(timeoutId)
        setError('Job description is required')
        setSubmitting(false)
        return
      }
      if (!formData.requirements.trim()) {
        clearTimeout(timeoutId)
        setError('Requirements are required')
        setSubmitting(false)
        return
      }
      if (!formData.job_type) {
        clearTimeout(timeoutId)
        setError('Job type is required')
        setSubmitting(false)
        return
      }

      console.log('📤 Posting job with HR user ID:', {
        hr_id: user.id,
        job_title: formData.job_title,
        job_description: formData.job_description,
        requirements: formData.requirements,
        salary_min: formData.salary_min,
        salary_max: formData.salary_max,
        job_type: formData.job_type,
      })

      const { data, error: supabaseError } = await supabase
        .from('job_postings')
        .insert({
          hr_id: user.id,
          job_title: formData.job_title,
          job_description: formData.job_description,
          requirements: formData.requirements,
          salary_min: formData.salary_min,
          salary_max: formData.salary_max,
          job_type: formData.job_type,
        })
        .select()

      // Clear timeout since we got a response
      clearTimeout(timeoutId)

      if (supabaseError) {
        const fullErrorInfo = {
          message: supabaseError.message,
          code: supabaseError.code,
          details: supabaseError.details,
          hint: supabaseError.hint,
        }
        
        console.error('❌ Supabase error details:', fullErrorInfo)
        
        // Build user-friendly error message
        let userErrorMessage = supabaseError.message
        
        if (supabaseError.code === '42P01') {
          userErrorMessage = '❌ Database table "job_postings" not found.\n\n✅ TO FIX:\n1. Open SUPABASE_SETUP.md file\n2. Go to Supabase Dashboard → SQL Editor\n3. Run the ENTIRE SQL script\n4. Refresh this page\n5. Try again'
        } else if (supabaseError.code === '42501') {
          userErrorMessage = '❌ Permission denied (RLS Policy)\n\n✅ TO FIX:\n1. Go to Supabase Dashboard → SQL Editor\n2. Copy ENTIRE script from SUPABASE_SETUP.md\n3. Run it (must include RLS policies)\n4. Refresh this page\n5. Try again'
        } else if (supabaseError.code === '23502') {
          userErrorMessage = `❌ Missing required field. HR ID: ${user.id}\n\nError: ${supabaseError.message}`
        } else if (supabaseError.code === '23505') {
          userErrorMessage = '❌ This job already exists'
        } else if (!userErrorMessage || userErrorMessage === '') {
          userErrorMessage = `❌ Database Error (Code: ${supabaseError.code})\n\nCheck browser console (F12) for details`
        }
        
        throw new Error(userErrorMessage)
      }

      console.log('✅ Job posted successfully!', data)
      setSuccess('Job posted successfully! Redirecting...')
      setFormData({
        job_title: '',
        job_description: '',
        requirements: '',
        salary_min: null,
        salary_max: null,
        job_type: 'full-time',
      })

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/hr')
      }, 2000)
    } catch (err) {
      console.error('❌ Error posting job:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to post job. Please try again. Check browser console (F12) for details.'
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageWrapper className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary font-bold mb-4 hover:underline"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Brain size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Post a New Job</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">Create an opportunity for candidates to apply</p>
        </div>

        {/* Important Setup Reminder */}
        <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">
            ℹ️ <strong>First time?</strong> You must run the Supabase setup script first. See <code className="bg-blue-900/20 px-1.5 py-0.5 rounded text-xs">SUPABASE_SETUP.md</code> in your project root.
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-8 shadow-lg">
          {dbCheckError && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-amber-700 dark:text-amber-300 text-sm font-medium">{dbCheckError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                placeholder="e.g., Senior Backend Engineer"
                required
              />
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="job_description"
                value={formData.job_description}
                onChange={handleChange}
                placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                required
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                Requirements <span className="text-red-500">*</span>
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="List the skills, experience, and qualifications needed (e.g., 5+ years experience, Node.js, PostgreSQL...)"
                required
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                Job Type <span className="text-red-500">*</span>
              </label>
              <select
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Min Salary (optional)
                </label>
                <Input
                  type="number"
                  name="salary_min"
                  value={formData.salary_min || ''}
                  onChange={handleChange}
                  placeholder="e.g., 60000"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Max Salary (optional)
                </label>
                <Input
                  type="number"
                  name="salary_max"
                  value={formData.salary_max || ''}
                  onChange={handleChange}
                  placeholder="e.g., 120000"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-2">{error}</p>
                    {(error.includes('not found') || error.includes('RLS') || error.includes('Permission')) && (
                      <div className="mt-3 space-y-2 text-xs text-red-600 dark:text-red-400">
                        <p className="font-bold">💡 To fix this:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-1">
                          <li>Open <code className="bg-red-950/20 px-2 py-1 rounded">SUPABASE_SETUP.md</code> in your project</li>
                          <li>Go to your Supabase Dashboard → SQL Editor</li>
                          <li>Create a new query and paste the ENTIRE SQL script</li>
                          <li>Wait for it to complete (should see "No errors")</li>
                          <li>Refresh this page and try again</li>
                        </ol>
                        <p className="mt-2">👉 Check browser console (F12) for detailed error information</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" loading={submitting} className="w-full h-12 text-base">
              <span className="flex items-center justify-center gap-2">
                <Plus size={18} /> Post Job
              </span>
            </Button>

            <p className="text-xs text-slate-500 text-center">
              Fields marked with <span className="text-red-500">*</span> are required
            </p>
          </form>
        </Card>
      </div>
    </PageWrapper>
  )
}
