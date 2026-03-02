import type { TimeEntry } from '@/types/database'

interface TodayTimelineProps {
  entries: TimeEntry[]
}

export function TodayTimeline({ entries }: TodayTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-foreground-secondary">
        <ClockIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p>Sin registros hoy</p>
      </div>
    )
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {entries.map((entry) => {
        const checkInTime = new Date(entry.check_in)
        const checkOutTime = entry.check_out ? new Date(entry.check_out) : null
        const duration = checkOutTime
          ? formatDuration(checkOutTime.getTime() - checkInTime.getTime())
          : 'En curso...'

        return (
          <div
            key={entry.id}
            className="flex-shrink-0 bg-surface border border-border rounded-xl p-4 min-w-[200px]"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${checkOutTime ? 'bg-success-500' : 'bg-warning-500 animate-pulse'}`} />
              <span className="text-xs text-foreground-secondary font-medium">
                {duration}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ArrowDownIcon className="w-4 h-4 text-success-500" />
                <span className="text-sm font-medium">
                  {checkInTime.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-xs text-foreground-secondary">Entrada</span>
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpIcon className="w-4 h-4 text-error-500" />
                <span className="text-sm font-medium">
                  {checkOutTime
                    ? checkOutTime.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
                    : '--:--'
                  }
                </span>
                <span className="text-xs text-foreground-secondary">Salida</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  if (hours === 0) return `${minutes}min`
  return `${hours}h ${minutes}min`
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  )
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  )
}
