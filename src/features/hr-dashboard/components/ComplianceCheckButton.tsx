'use client'

import { useState, useTransition } from 'react'
import { checkWeeklyCompliance } from '@/actions/notifications'
import { Button } from '@/components/ui'

export function ComplianceCheckButton() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ notified?: number; error?: string } | null>(null)

  const handleCheck = () => {
    setResult(null)
    startTransition(async () => {
      const res = await checkWeeklyCompliance()
      setResult(res)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleCheck}
        isLoading={isPending}
      >
        Verificar cumplimiento
      </Button>
      {result && !result.error && (
        <span className="text-xs text-foreground-secondary">
          {result.notified === 0
            ? 'Todos cumplen'
            : `${result.notified} notificados`
          }
        </span>
      )}
      {result?.error && (
        <span className="text-xs text-error-500">{result.error}</span>
      )}
    </div>
  )
}
