const WEEKLY_TARGET = 44

interface WeeklyProgressProps {
  hours: number
}

export function WeeklyProgress({ hours }: WeeklyProgressProps) {
  const percentage = Math.min((hours / WEEKLY_TARGET) * 100, 100)
  const remaining = Math.max(WEEKLY_TARGET - hours, 0)

  const getColor = () => {
    if (percentage >= 100) return 'bg-success-500'
    if (percentage >= 75) return 'bg-primary-500'
    if (percentage >= 50) return 'bg-warning-500'
    return 'bg-error-500'
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-2xl font-bold text-foreground">
            {hours.toFixed(1)}h
          </p>
          <p className="text-xs text-foreground-secondary">de {WEEKLY_TARGET}h semanales</p>
        </div>
        {remaining > 0 ? (
          <p className="text-sm text-foreground-secondary">
            Faltan <span className="font-semibold text-foreground">{remaining.toFixed(1)}h</span>
          </p>
        ) : (
          <p className="text-sm text-success-600 font-semibold">Meta cumplida</p>
        )}
      </div>

      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-xs text-foreground-secondary mt-1 text-right">
        {percentage.toFixed(0)}%
      </p>
    </div>
  )
}
