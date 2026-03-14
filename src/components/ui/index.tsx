import { cn } from '@/lib/utils'

// ── Button ──────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02]',
    secondary: 'border border-white/10 hover:border-white/20 text-white/70 hover:text-white hover:bg-white/5',
    ghost: 'text-white/50 hover:text-white hover:bg-white/5',
    danger: 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3.5 text-base' }
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
}

// ── Input ──────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-xs font-medium text-white/60 uppercase tracking-wide">{label}</label>}
      <input
        id={id}
        className={cn(
          'w-full px-4 py-3 rounded-xl bg-white/4 border text-white text-sm placeholder:text-white/25',
          'focus:outline-none focus:border-indigo-500/60 focus:bg-white/6 transition-all duration-200',
          error ? 'border-red-500/40' : 'border-white/8',
          className
        )}
        {...props}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-2xl bg-white/3 border border-white/6 backdrop-blur-sm', className)} {...props}>
      {children}
    </div>
  )
}

// ── Badge ──────────────────────────────────────────────
interface BadgeProps { label: string; className?: string }
export function Badge({ label, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wide border', className)}>
      {label}
    </span>
  )
}

// ── ScoreBar ──────────────────────────────────────────
interface ScoreBarProps { label: string; value: number; max?: number }
export function ScoreBar({ label, value, max = 100 }: ScoreBarProps) {
  const pct = Math.round((value / max) * 100)
  const color = pct >= 75 ? 'bg-emerald-400' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/45 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/6">
        <div className={cn('h-full rounded-full transition-all duration-1000', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-white/70 w-8 text-right">{value}</span>
    </div>
  )
}

// ── Spinner ──────────────────────────────────────────
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <div className="border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"
        style={{ width: size, height: size }} />
    </div>
  )
}

// ── PageWrapper ──────────────────────────────────────
export function PageWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('min-h-screen bg-[#0a0a0f]', className)}>
      <div className="fixed inset-0 bg-[image:linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
