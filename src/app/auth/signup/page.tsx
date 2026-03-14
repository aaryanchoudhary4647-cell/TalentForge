'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { PageWrapper, Button, Input, Card } from '@/components/ui'
import { MockBanner } from '@/components/ui/MockBanner'

export default function SignupPage() {
  const [mounted, setMounted] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'hr' | 'candidate'>('hr')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const result = await signup(name, email, password, role)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    router.push(role === 'hr' ? '/hr' : '/interview')
  }

  if (!mounted) return null

  return (
    <PageWrapper className="relative flex items-center justify-center min-h-screen px-4 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-4 shadow-2xl shadow-primary/20"
          >
            <Brain size={28} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Join TalentForge</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">The next generation of AI-driven hiring</p>
        </div>

        <Card className="p-0 overflow-hidden shadow-2xl">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="space-y-4">
                <Input 
                  id="name" label="Full name" type="text" placeholder="Rahul Mehta"
                  value={name} onChange={e => setName(e.target.value)} required 
                />
                <Input 
                  id="email" label="Work email" type="email" placeholder="rahul@company.com"
                  value={email} onChange={e => setEmail(e.target.value)} required 
                />
                <Input 
                  id="password" label="Password" type="password" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Account Type</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-white/30 dark:bg-black/40 rounded-xl border border-white/40 dark:border-white/5 backdrop-blur-sm">
                  {(['hr', 'candidate'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`relative py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                        role === r ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                    >
                      {role === r && (
                        <motion.div
                          layoutId="active-pill"
                          className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg"
                          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {r === 'hr' ? 'HR Manager' : 'Candidate'}
                        {role === r && <CheckCircle2 size={14} className="text-primary" />}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <p className="text-red-600 dark:text-red-400 text-xs font-medium">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button 
                type="submit" 
                loading={loading} 
                className="w-full h-12 rounded-xl group"
              >
                <span className="flex items-center justify-center gap-2">
                  Create account 
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>

              <div className="flex items-center justify-center gap-2 mt-2">
                <ShieldCheck size={14} className="text-slate-400" />
                <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">Secure Enterprise Encryption</span>
              </div>
            </form>
          </div>
        </Card>

        <p className="text-center text-slate-500 text-sm mt-8 font-medium">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:text-primary/80 font-bold transition-colors underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
      
      <MockBanner />
    </PageWrapper>
  )
}