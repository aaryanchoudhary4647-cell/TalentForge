'use client'
import Link from 'next/link'
import { ArrowRight, Brain, BarChart3, Zap, TrendingUp, Shield, Users } from 'lucide-react'
import { MockBanner } from '@/components/ui/MockBanner'
import { PageWrapper, Button } from '@/components/ui'

export default function HomePage() {
  return (
    <PageWrapper>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-[#0a0a0f]/80 border-b border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Brain size={14} className="text-white" />
          </div>
          <span className="text-white font-semibold tracking-tight">TalentForge</span>
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/6 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-mono mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Hack &amp; Forge 2026 — Problem Statement 2
          </div>
          <h1 className="text-5xl md:text-7xl text-white font-bold leading-[1.05] mb-6 tracking-tight">
            Smarter hiring.<br />
            <span className="text-indigo-400 italic font-light">Fairer</span> evaluation.
          </h1>
          <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10">
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
                <div className="text-3xl font-bold text-indigo-400">{s.val}</div>
                <div className="text-white/35 text-xs mt-1 font-mono">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-indigo-400 font-mono text-sm mb-3 uppercase tracking-wider">Differentiators</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Every team builds the interview.<br />
            <span className="text-white/35 font-normal">We built the intelligence around it.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: <Zap size={18} />, badge: 'Rare in market', badgeClass: 'text-amber-400 bg-amber-400/10 border-amber-400/20', title: 'Emotion & stress detection', desc: 'Typing rhythm, response latency, and hedging language scored per question. Not just what they say — HOW they say it.' },
            { icon: <BarChart3 size={18} />, badge: 'Unique', badgeClass: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', title: 'Percentile benchmarking', desc: 'Every candidate ranked against all past candidates for the same role. "Top 12% of 340 backend engineers screened."' },
            { icon: <TrendingUp size={18} />, badge: 'Unique', badgeClass: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', title: 'AI role-fit prediction', desc: 'Beyond pass/fail — 85% fit with explained reasoning: strengths, gaps, and strategic hiring insights.' },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl bg-white/3 border border-white/6 p-6 hover:border-indigo-500/20 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">{f.icon}</div>
                <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${f.badgeClass}`}>{f.badge}</span>
              </div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5 flex items-center gap-4">
          <Shield size={16} className="text-indigo-400 shrink-0" />
          <p className="text-white/60 text-sm">
            <span className="text-white font-medium">Dual-sided scoring</span> — TalentForge scores both the <span className="text-indigo-400">CANDIDATE</span> performance and the <span className="text-indigo-400">INTERVIEWER</span> question quality. No competitor does this.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-indigo-500 flex items-center justify-center"><Brain size={10} className="text-white" /></div>
            <span className="text-white font-semibold text-sm">TalentForge</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/25 text-xs font-mono">
            <Users size={11} />
            <span>Team Code Blooded — Anshul Kumar · Kartikeya Narayan · Aaryan Choudhary</span>
          </div>
          <p className="text-white/20 text-xs font-mono">Hack &amp; Forge 2026</p>
        </div>
      </footer>

      <MockBanner />
    </PageWrapper>
  )
}
