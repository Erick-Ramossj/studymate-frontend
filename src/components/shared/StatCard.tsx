import { cn } from '@/utils/cn'
import { Card } from '@/components/ui/Card'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  iconColor?: string
  trend?: { value: number; label: string }
}

export function StatCard({ title, value, subtitle, icon, iconColor = 'bg-indigo-500/20 text-indigo-400', trend }: StatCardProps) {
  return (
    <Card className="flex items-start gap-4">
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', iconColor)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{title}</p>
        <p className="text-white text-2xl font-bold mt-0.5">{value}</p>
        {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
        {trend && (
          <p className={cn('text-xs mt-1', trend.value >= 0 ? 'text-green-400' : 'text-red-400')}>
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </p>
        )}
      </div>
    </Card>
  )
}
