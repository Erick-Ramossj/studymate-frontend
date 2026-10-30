import { cn } from '@/utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: React.ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-indigo-500 hover:bg-indigo-600 text-white border-transparent',
  secondary: 'bg-[#242736] hover:bg-[#2e3245] text-white border-[#2e3245]',
  ghost: 'bg-transparent hover:bg-[#242736] text-slate-400 hover:text-white border-transparent',
  danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30',
  outline: 'bg-transparent hover:bg-indigo-500/10 text-indigo-400 border-indigo-500/40',
}

const sizes: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-lg',
  md: 'text-sm px-4 py-2 rounded-xl',
  lg: 'text-base px-6 py-3 rounded-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium border transition-all',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
