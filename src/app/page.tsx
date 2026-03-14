'use client'
import Link from 'next/link'
import { ArrowRight, Brain, BarChart3, Zap, TrendingUp, Shield, Users } from 'lucide-react'
import { MockBanner } from '@/components/ui/MockBanner'
import { PageWrapper, Button } from '@/components/ui'

export default function HomePage() {
  return (
    <PageWrapper>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 glass-header">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Brain size={16} className="text-white" />
          </div>
          <span className="text-slate-900 dark:text-white font-extrabold tracking-tight">TalentForge</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 pt-20">
        {/* Decorative radial blurs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-primary text-xs font-bold uppercase tracking-wider mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Hack &amp; Forge 2026 — Problem Statement 2
          </div>
          <h1 className="text-5xl md:text-7xl text-slate-900 dark:text-white font-extrabold leading-[1.05] mb-6 tracking-tight">
            Smarter hiring.<br />
            <span className="text-primary italic font-light">Fairer</span> evaluation.
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            TalentForge is the only AI platform that dynamically interviews, evaluates across
            7 dimensions, and scores both candidate and interviewer quality.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2">
                Start interviewing <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="secondary" size="lg">HR dashboard</Button>
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-8 max-w-sm mx-auto mt-16">
            {[
              { val: '60%', label: 'Faster screening' },
              { val: '100%', label: 'Objective scoring' },
              { val: '∞', label: 'Concurrent sessions' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-extrabold text-primary">{s.val}</div>
                <div className="text-slate-400 text-xs mt-1 font-bold uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-primary font-bold text-sm mb-3 uppercase tracking-[0.2em]">Differentiators</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
            Every team builds the interview.<br />
            <span className="text-slate-400 font-normal">We built the intelligence around it.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: <Zap size={18} />, badge: 'Rare in market', badgeClass: 'text-amber-600 bg-amber-500/10 border-amber-500/20', title: 'Emotion & stress detection', desc: 'Typing rhythm, response latency, and hedging language scored per question. Not just what they say — HOW they say it.' },
            { icon: <BarChart3 size={18} />, badge: 'Unique', badgeClass: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20', title: 'Percentile benchmarking', desc: 'Every candidate ranked against all past candidates for the same role. "Top 12% of 340 backend engineers screened."' },
            { icon: <TrendingUp size={18} />, badge: 'Unique', badgeClass: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20', title: 'AI role-fit prediction', desc: 'Beyond pass/fail — 85% fit with explained reasoning: strengths, gaps, and strategic hiring insights.' },
          ].map((f, i) => (
            <div key={i} className="glass-card rounded-2xl p-7 hover:translate-y-[-4px] transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{f.icon}</div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border ${f.badgeClass}`}>{f.badge}</span>
              </div>
              <h3 className="text-slate-900 dark:text-white font-extrabold mb-2">{f.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 glass-card rounded-2xl border-primary/20 bg-primary/5 p-5 flex items-center gap-4">
          <Shield size={16} className="text-primary shrink-0" />
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            <span className="text-slate-900 dark:text-white font-bold">Dual-sided scoring</span> — TalentForge scores both the <span className="text-primary font-bold">CANDIDATE</span> performance and the <span className="text-primary font-bold">INTERVIEWER</span> question quality. No competitor does this.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/40 dark:border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center"><Brain size={10} className="text-white" /></div>
            <span className="text-slate-900 dark:text-white font-bold text-sm">TalentForge</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
            <Users size={11} />
            <span>Team Code Blooded — Anshul Kumar · Kartikeya Narayan · Aaryan Choudhary</span>
          </div>
          <p className="text-slate-400 text-xs font-bold">Hack &amp; Forge 2026</p>
        </div>
      </footer>

      <MockBanner />
    </PageWrapper>
  )
}
