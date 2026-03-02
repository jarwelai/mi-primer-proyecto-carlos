'use client'

import { useState, useTransition } from 'react'
import { addTeamMember } from '@/actions/admin'
import { Button } from '@/components/ui'

interface Team {
  id: string
  name: string
}

interface Employee {
  id: string
  name: string
}

interface AddTeamMemberFormProps {
  teams: Team[]
  employees: Employee[]
}

export function AddTeamMemberForm({ teams, employees }: AddTeamMemberFormProps) {
  const [teamId, setTeamId] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamId || !employeeId) return

    setResult(null)
    startTransition(async () => {
      const res = await addTeamMember(teamId, employeeId)
      setResult(res)
      if (res.success) {
        setEmployeeId('')
      }
    })
  }

  if (teams.length === 0) {
    return (
      <p className="text-foreground-secondary text-sm">
        Primero crea un equipo para poder asignar miembros
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-wrap">
      <select
        value={teamId}
        onChange={(e) => setTeamId(e.target.value)}
        className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">Equipo</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
      <select
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
        className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">Empleado</option>
        {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>{emp.name}</option>
        ))}
      </select>
      <Button type="submit" size="sm" isLoading={isPending} disabled={!teamId || !employeeId}>
        Asignar
      </Button>
      {result?.success && <span className="text-xs text-success-600">Asignado</span>}
      {result?.error && <span className="text-xs text-error-500">{result.error}</span>}
    </form>
  )
}
