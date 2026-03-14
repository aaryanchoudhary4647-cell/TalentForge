import { cn } from '@/lib/utils'

// ── Button ──────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'
  const variants = {
    primary: 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25',
    secondary: 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border border-white/80 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700',
    ghost: 'text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-white/40 dark:hover:bg-slate-800/40',
    danger: 'bg-red-500/15 hover:bg-red-500/25 text-red-600 dark:text-red-400 border border-red-500/20',
  }
  const sizes = { sm: 'px-4 py-2 text-xs', md: 'px-6 py-2.5 text-sm', lg: 'px-8 py-3.5 text-base' }
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
      {label && <label htmlFor={id} className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>}
      <input
        id={id}
        className={cn(
          'w-full px-4 py-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border text-slate-900 dark:text-white text-sm placeholder:text-slate-400',
          'focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-200',
          'backdrop-blur-sm',
          error ? 'border-red-500/40' : 'border-white/40 dark:border-slate-800/40',
          className
        )}
        {...props}
      />
      {error && <p className="text-red-500 dark:text-red-400 text-xs">{error}</p>}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('glass-card rounded-2xl', className)} {...props}>
      {children}
    </div>
  )
}

// ── Badge ──────────────────────────────────────────────
interface BadgeProps { label: string; className?: string }
export function Badge({ label, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wide border', className)}>
      {label}
    </span>
  )
}

// ── ScoreBar ──────────────────────────────────────────
interface ScoreBarProps { label: string; value: number; max?: number }
export function ScoreBar({ label, value, max = 100 }: ScoreBarProps) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
        <span>{label}</span>
        <span className="text-slate-900 dark:text-white">{value}%</span>
      </div>
      <div className="w-full bg-slate-200/50 dark:bg-slate-800/50 h-2.5 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ── Spinner ──────────────────────────────────────────
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <div className="border-2 border-primary border-t-transparent rounded-full animate-spin"
        style={{ width: size, height: size }} />
    </div>
  )
}

// ── PageWrapper ──────────────────────────────────────
export function PageWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased font-display', className)}>
      {children}
    </div>
  )
}
