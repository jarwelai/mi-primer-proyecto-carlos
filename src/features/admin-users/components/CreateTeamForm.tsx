'use client'

import { useState, useTransition } from 'react'
import { createTeam } from '@/actions/admin'
import { Button } from '@/components/ui'

interface Department {
  id: string
  name: string
}

interface Supervisor {
  id: string
  name: string
}

interface CreateTeamFormProps {
  departments: Department[]
  supervisors: Supervisor[]
}

export function CreateTeamForm({ departments, supervisors }: CreateTeamFormProps) {
  const [name, setName] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [supervisorId, setSupervisorId] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !departmentId || !supervisorId) return

    setError(null)
    startTransition(async () => {
      const res = await createTeam(name.trim(), departmentId, supervisorId)
      if (res.error) {
        setError(res.error)
      } else {
        setName('')
        setDepartmentId('')
        setSupervisorId('')
      }
    })
  }

  if (departments.length === 0) {
    return (
      <p className="text-foreground-secondary text-sm">
        Primero crea un departamento para poder crear equipos
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del equipo"
          className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Departamento</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select
          value={supervisorId}
          onChange={(e) => setSupervisorId(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Supervisor</option>
          {supervisors.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" isLoading={isPending} disabled={!name.trim() || !departmentId || !supervisorId}>
          Crear equipo
        </Button>
        {error && <span className="text-xs text-error-500">{error}</span>}
      </div>
    </form>
  )
}
