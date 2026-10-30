import { cn } from '@/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
}

export function Input({ label, error, leftIcon, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full bg-[#242736] border border-[#2e3245] rounded-xl px-4 py-2.5 text-sm text-white',
            'placeholder:text-slate-500 outline-none',
            'focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all',
            leftIcon && 'pl-10',
            error && 'border-red-500/50 focus:border-red-500',
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full bg-[#242736] border border-[#2e3245] rounded-xl px-4 py-2.5 text-sm text-white',
          'outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all',
          error && 'border-red-500/50',
          className,
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#1a1d27]">
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
