'use client'

import { useState, useEffect } from 'react'
import type { TimeEntry } from '@/types/database'

interface HistoryTableProps {
  entries: TimeEntry[]
}

export function HistoryTable({ entries }: HistoryTableProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-foreground-secondary">
        <p>No hay registros para este periodo</p>
      </div>
    )
  }

  if (!mounted) return null

  // Agrupar por fecha local
  const grouped = groupByDate(entries)

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([date, dayEntries]) => {
        const totalMs = dayEntries.reduce((acc, entry) => {
          if (entry.check_out) {
            return acc + (new Date(entry.check_out).getTime() - new Date(entry.check_in).getTime())
          }
          return acc
        }, 0)
        const totalHours = totalMs / (1000 * 60 * 60)

        return (
          <div key={date} className="border border-border rounded-xl overflow-hidden">
            {/* Date Header */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground capitalize">
                {new Date(date + 'T12:00:00').toLocaleDateString('es', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
              <span className={`text-sm font-medium ${totalHours >= 8 ? 'text-success-600' : 'text-foreground-secondary'}`}>
                {totalHours.toFixed(1)}h
              </span>
            </div>

            {/* Entries */}
            <div className="divide-y divide-border">
              {dayEntries.map((entry) => {
                const checkIn = new Date(entry.check_in)
                const checkOut = entry.check_out ? new Date(entry.check_out) : null
                const duration = checkOut
                  ? formatDuration(checkOut.getTime() - checkIn.getTime())
                  : 'En curso'

                return (
                  <div key={entry.id} className="px-4 py-3 flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${checkOut ? 'bg-success-500' : 'bg-warning-500 animate-pulse'}`} />

                    <div className="flex-1 flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground-secondary">Entrada:</span>
                        <span className="font-medium">
                          {checkIn.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-foreground-secondary">Salida:</span>
                        <span className="font-medium">
                          {checkOut
                            ? checkOut.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
                            : '--:--'
                          }
                        </span>
                      </div>

                      <span className="text-foreground-secondary ml-auto">{duration}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function groupByDate(entries: TimeEntry[]): Record<string, TimeEntry[]> {
  const groups: Record<string, TimeEntry[]> = {}
  for (const entry of entries) {
    const d = new Date(entry.check_in)
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (!groups[date]) groups[date] = []
    groups[date].push(entry)
  }
  return groups
}

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  if (hours === 0) return `${minutes}min`
  return `${hours}h ${minutes}min`
}
