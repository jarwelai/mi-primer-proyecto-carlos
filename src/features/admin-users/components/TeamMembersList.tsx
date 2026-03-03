'use client'

import { useTransition } from 'react'
import { removeTeamMember } from '@/actions/admin'

const ROLE_LABELS: Record<string, string> = {
  employee: 'Empleado',
  supervisor: 'Supervisor',
  hr_manager: 'Gerente RRHH',
  admin: 'Admin',
}

interface TeamMember {
  id: string
  teamName: string
  departmentName: string
  employeeName: string
  employeeEmail: string
  role: string
}

interface TeamMembersListProps {
  members: TeamMember[]
}

export function TeamMembersList({ members }: TeamMembersListProps) {
  const [isPending, startTransition] = useTransition()

  if (members.length === 0) {
    return (
      <p className="text-foreground-secondary text-sm">
        No hay empleados asignados a equipos
      </p>
    )
  }

  // Group by team
  const grouped: Record<string, { department: string; members: TeamMember[] }> = {}
  for (const m of members) {
    if (!grouped[m.teamName]) {
      grouped[m.teamName] = { department: m.departmentName, members: [] }
    }
    grouped[m.teamName].members.push(m)
  }

  const handleRemove = (memberId: string, name: string) => {
    if (!confirm(`¿Remover a ${name} del equipo?`)) return
    startTransition(async () => {
      await removeTeamMember(memberId)
    })
  }

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([teamName, group]) => (
        <div key={teamName} className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm">{teamName}</span>
            <span className="text-xs text-foreground-secondary">{group.department}</span>
          </div>
          <div className="space-y-1 ml-2">
            {group.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground flex items-center gap-2">
                  {m.employeeName}
                  <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-200 text-gray-600">
                    {ROLE_LABELS[m.role] || m.role}
                  </span>
                  <span className="text-foreground-secondary text-xs">{m.employeeEmail}</span>
                </span>
                <button
                  onClick={() => handleRemove(m.id, m.employeeName)}
                  disabled={isPending}
                  className="text-xs text-error-500 hover:text-error-700 hover:underline disabled:opacity-50"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
