'use client'

import { useState, useTransition } from 'react'
import { checkIn, checkOut } from '@/actions/time-entries'
import { Button } from '@/components/ui'

interface CheckInButtonProps {
  isCheckedIn: boolean
  checkInTime?: string | null
}

export function CheckInButton({ isCheckedIn, checkInTime }: CheckInButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleAction = () => {
    setError(null)
    startTransition(async () => {
      const result = isCheckedIn ? await checkOut() : await checkIn()
      if (result.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleAction}
        disabled={isPending}
        className={`
          w-40 h-40 rounded-full flex flex-col items-center justify-center
          transition-all duration-300 shadow-lg
          focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isCheckedIn
            ? 'bg-error-500 hover:bg-error-600 focus-visible:ring-error-300 text-white'
            : 'bg-success-500 hover:bg-success-600 focus-visible:ring-success-300 text-white'
          }
          ${isPending ? 'animate-pulse' : 'hover:scale-105 active:scale-95'}
        `}
      >
        {isPending ? (
          <svg className="animate-spin w-10 h-10" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <>
            {isCheckedIn ? (
              <LogOutIcon className="w-10 h-10 mb-1" />
            ) : (
              <LogInIcon className="w-10 h-10 mb-1" />
            )}
            <span className="text-lg font-bold">
              {isCheckedIn ? 'Check-out' : 'Check-in'}
            </span>
          </>
        )}
      </button>

      {isCheckedIn && checkInTime && (
        <p className="text-sm text-foreground-secondary">
          Entrada: {new Date(checkInTime).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}

      {error && (
        <p className="text-sm text-error-500 bg-error-50 px-4 py-2 rounded-lg">{error}</p>
      )}
    </div>
  )
}

function LogInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  )
}

function LogOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}
