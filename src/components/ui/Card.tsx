import { cn } from '@/utils/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  glass?: boolean
}

export function Card({ children, className, glass, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[#2e3245] p-5',
        glass ? 'bg-white/5 backdrop-blur-sm' : 'bg-[#1a1d27]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-white font-semibold text-base', className)}>{children}</h3>
}
