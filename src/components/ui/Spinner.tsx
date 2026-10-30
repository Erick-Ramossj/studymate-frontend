import { cn } from '@/utils/cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin',
        className,
      )}
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner className="w-10 h-10" />
    </div>
  )
}
