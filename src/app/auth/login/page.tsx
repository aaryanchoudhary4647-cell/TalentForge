'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PageWrapper, Input, Button } from "@/components/ui";
import { MockBanner } from "@/components/ui/MockBanner";
import { supabase } from "@/lib/supabase";

// ─── Shared SVG Icons ────────────────────────────────────────

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const ApplicantSVG = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const HRSvg = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

// ─── Helper: check onboarding status and redirect ────────────
async function redirectAfterLogin(userId: string, role: 'hr' | 'candidate', router: ReturnType<typeof useRouter>) {
  try {
    if (role === 'hr') {
      const { data, error } = await supabase
        .from('hr_profiles')
        .select('phone')
        .eq('id', userId)
        .single()
      
      if (error?.code === 'PGRST116') {
        // Profile doesn't exist, send to onboarding to create it
        router.push('/onboarding/hr')
        return
      }

      if (error) {
        console.error('HR profile fetch error:', error)
        throw new Error(`Failed to load HR profile: ${error.message}`)
      }

      // If phone is empty/null → onboarding not done
      if (!data?.phone) {
        router.push('/onboarding/hr')
      } else {
        router.push('/hr')
      }
    } else {
      const { data, error } = await supabase
        .from('applicant_profiles')
        .select('phone')
        .eq('id', userId)
        .single()
      
      if (error?.code === 'PGRST116') {
        // Profile doesn't exist, send to onboarding to create it
        router.push('/onboarding/applicants')
        return
      }

      if (error) {
        console.error('Applicant profile fetch error:', error)
        throw new Error(`Failed to load applicant profile: ${error.message}`)
      }

      // If phone is empty/null → onboarding not done
      if (!data?.phone) {
        router.push('/onboarding/applicants')
      } else {
        router.push('/applicant')
      }
    }
  } catch (err) {
    console.error('Redirect error:', err)
    throw err
  }
}

// ─── LoginForm ───────────────────────────────────────────────

interface FormProps {
  title: string;
  subtitle: string;
  role: 'hr' | 'candidate';
  isFlipped: boolean;
}

const LoginForm: React.FC<FormProps> = ({ title, subtitle, role, isFlipped }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();

  // Reset form when flip state changes so users don't see ghost typing
  useEffect(() => {
    setEmail("");
    setPassword("");
    setError("");
  }, [isFlipped]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password, role);

      if (result?.error) {
        setLoading(false);
        setError(result.error);
        return;
      }

      // Give Supabase a moment to update session state
      await new Promise(resolve => setTimeout(resolve, 500));

      // ── Check onboarding status before redirecting ──
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { 
        setLoading(false);
        setError('Authentication failed. Please try again.');
        return;
      }

      // Try to get role from DB
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('id', user.id)
        .single()

      // If we can't find role, use the role from the login form as fallback
      let actualRole: 'hr' | 'candidate' = role;
      if (!roleError && roleData) {
        actualRole = roleData?.role === 'hr' ? 'hr' : 'candidate'
      } else if (roleError?.code !== 'PGRST116') {
        // Only log non-"not found" errors
        console.error('Role fetch error:', roleError);
      }

      // Redirect immediately - let the dashboard handle user context loading
      if (actualRole === 'hr') {
        router.push('/hr');
      } else {
        router.push('/applicant');
      }
      
    } catch (err) {
      setLoading(false);
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Login error:', err);
      setError(errorMsg);
    }
  };

  const handleGoogle = async () => {
    setError("");
    const result = await loginWithGoogle();
    if (result?.error) {
      setError(result.error);
    }
    // Google OAuth will redirect via callback — handle onboarding check in /auth/callback
  };

  return (
    <div className="w-full h-full flex flex-col justify-center px-10">
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-3 shadow-lg shadow-primary/20">
          <Brain size={24} className="text-white" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight text-center">{title}</h2>
        <p className="text-slate-500 text-xs font-semibold mt-1 text-center">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id={`email-${role}`} label="Work email" type="email" placeholder="you@company.com"
          value={email} onChange={e => setEmail(e.target.value)} required
        />
        <Input
          id={`pass-${role}`} label="Password" type="password" placeholder="••••••••"
          value={password} onChange={e => setPassword(e.target.value)} required
        />

        <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <p className="text-red-600 dark:text-red-400 text-xs font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button type="submit" loading={loading} className="w-full h-11 group">
          <span className="flex items-center justify-center gap-2">
            Sign In <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </Button>

        <div className="flex items-center gap-3 my-2 opacity-50">
          <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700" />
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">Or continue with</span>
          <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full h-11 rounded-xl border-2 border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] hover:shadow-sm"
        >
          <GoogleIcon />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Google Account</span>
        </button>

        <div className="flex items-center justify-center gap-2 mt-2">
          <ShieldCheck size={14} className="text-slate-400" />
          <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">Secure Encryption</span>
        </div>
      </form>
    </div>
  );
};

// ─── InviteFace ──────────────────────────────────────────────

interface InviteProps {
  icon: React.ReactNode;
  title: string;
  text: string;
  btnLabel: string;
  faceSide: "front" | "back";
  onFlip: () => void;
}

const InviteFace: React.FC<InviteProps> = ({ icon, title, text, btnLabel, faceSide, onFlip }) => (
  <div
    className={`absolute inset-0 backface-hidden overflow-hidden flex flex-col items-center justify-center px-10 text-center text-white
                ${faceSide === "back" ? "[transform:rotateY(180deg)] bg-gradient-to-br from-accent to-blue-600" : "bg-gradient-to-br from-primary to-purple-800"}`}
  >
    <div className="absolute w-64 h-64 rounded-full bg-white/10 blur-[40px] -top-10 -right-10 pointer-events-none" />
    <div className="absolute w-40 h-40 rounded-full bg-white/10 blur-[30px] -bottom-10 -left-10 pointer-events-none" />

    <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center mb-6 shadow-2xl">
      {icon}
    </div>

    <h3 className="text-3xl font-extrabold tracking-tight mb-3 text-shadow-sm">{title}</h3>
    <p className="text-sm font-medium opacity-90 leading-relaxed mb-8 max-w-[240px] text-shadow-sm">{text}</p>

    <button
      onClick={onFlip}
      className="px-6 py-2.5 rounded-full border-2 border-white/40 bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all backdrop-blur-sm text-sm font-bold tracking-wide shadow-lg"
    >
      {btnLabel}
    </button>
  </div>
);

// ─── Root ─────────────────────────────────────────────────────

export default function FlipLoginPage() {
  const [mounted, setMounted] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const flip = () => setFlipped((p) => !p);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <PageWrapper className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[860px] h-[600px] glass-card shadow-2xl overflow-hidden rounded-3xl"
        style={{ perspective: "2000px" }}
      >
        {/* Static Left: Candidate Login */}
        <div className="absolute top-0 left-0 w-1/2 h-full z-0 flex items-center justify-center">
          <LoginForm
            title="Welcome back"
            subtitle="Sign in to your candidate account"
            role="candidate"
            isFlipped={flipped}
          />
        </div>

        {/* Static Right: HR Login */}
        <div className="absolute top-0 right-0 w-1/2 h-full z-0 flex items-center justify-center bg-slate-50/30 dark:bg-black/20 border-l border-white/20 dark:border-white/5">
          <LoginForm
            title="Hello, Recruiter"
            subtitle="Sign in to your HR dashboard"
            role="hr"
            isFlipped={flipped}
          />
        </div>

        {/* Flipping Page */}
        <div
          className="absolute top-0 left-1/2 w-1/2 h-full z-20 origin-left preserve-3d transition-transform duration-1000 ease-[cubic-bezier(0.4,0.2,0.2,1)] will-change-transform shadow-[-10px_0_30px_rgba(0,0,0,0.15)]"
          style={{ transform: flipped ? "rotateY(-180deg)" : "rotateY(0deg)" }}
        >
          <InviteFace
            faceSide="front"
            icon={<HRSvg />}
            title="Are you hiring?"
            text="Switch to the HR portal to post roles, shortlist talent, and manage your pipeline."
            btnLabel="HR Login →"
            onFlip={flip}
          />
          <InviteFace
            faceSide="back"
            icon={<ApplicantSVG />}
            title="Looking for work?"
            text="Head to the applicant portal to explore open roles and track your apps."
            btnLabel="← Candidate Login"
            onFlip={flip}
          />
        </div>

        {/* Center Spine */}
        <div className="absolute top-0 left-[calc(50%-1px)] w-[2px] h-full z-30 bg-gradient-to-b from-transparent via-slate-300/40 dark:via-black/40 to-transparent pointer-events-none shadow-sm" />
      </motion.div>

      <MockBanner />
    </PageWrapper>
  );
}
