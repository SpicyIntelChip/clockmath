/**
 * Reusable component for displaying detailed time duration breakdowns
 * Shows years, months, days, hours, minutes, and seconds
 */

interface DetailedDuration {
  years: number
  months: number
  weeks?: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface DetailedDurationBreakdownProps {
  detailedResult: DetailedDuration
  variant?: 'primary' | 'secondary' | 'muted'
  size?: 'large' | 'small'
}

export function DetailedDurationBreakdown({
  detailedResult,
  variant = 'primary',
  size = 'large'
}: DetailedDurationBreakdownProps) {
  // Color classes based on variant
  const colorClasses = {
    primary: {
      text: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-white/60 dark:bg-slate-800/60',
      border: 'border-emerald-200/50 dark:border-slate-600/50'
    },
    secondary: {
      text: 'text-blue-700 dark:text-blue-300',
      bg: 'bg-white/60 dark:bg-slate-800/60',
      border: 'border-blue-200/50 dark:border-slate-600/50'
    },
    muted: {
      text: 'text-foreground',
      bg: 'bg-muted/40 dark:bg-slate-600/40',
      border: 'border-border/30 dark:border-slate-500/30'
    }
  }

  // Size classes
  const sizeClasses = {
    large: {
      value: 'text-lg',
      label: 'text-xs'
    },
    small: {
      value: 'text-base',
      label: 'text-xs'
    }
  }

  const colors = colorClasses[variant]
  const sizes = sizeClasses[size]

  const timeUnits = [
    { value: detailedResult.years.toFixed(4), label: 'years' },
    { value: detailedResult.months.toFixed(3), label: 'months' },
    ...(detailedResult.weeks !== undefined ? [{ value: detailedResult.weeks.toFixed(2), label: 'weeks' }] : []),
    { value: detailedResult.days.toFixed(2), label: 'days' },
    { value: detailedResult.hours.toFixed(2), label: 'hours' },
    { value: detailedResult.minutes.toFixed(1), label: 'minutes' },
    { value: detailedResult.seconds.toLocaleString(), label: 'seconds' }
  ]

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm ${colors.text}`}>
      {timeUnits.map((unit) => (
        <div
          key={unit.label}
          className={`${colors.bg} rounded-xl p-3 text-center border ${colors.border}`}
        >
          <div className={`font-bold ${sizes.value}`}>{unit.value}</div>
          <div className={`${sizes.label} font-medium opacity-80`}>{unit.label}</div>
        </div>
      ))}
    </div>
  )
}

