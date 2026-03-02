'use client'

import { useState, useTransition } from 'react'
import { updateUserRole, deleteUser } from '@/actions/admin'
import type { UserRole } from '@/types/database'

interface User {
  id: string
  full_name: string | null
  email: string
  role: UserRole
}

interface UserRoleManagerProps {
  users: User[]
  currentUserId: string
}

const ROLE_LABELS: Record<UserRole, string> = {
  employee: 'Empleado',
  supervisor: 'Supervisor',
  hr_manager: 'Gerente RRHH',
  admin: 'Admin',
}

export function UserRoleManager({ users, currentUserId }: UserRoleManagerProps) {
  const [isPending, startTransition] = useTransition()
  const [changingId, setChangingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRoleChange = (userId: string, newRole: string) => {
    setError(null)
    setChangingId(userId)
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole)
      if (result.error) setError(result.error)
      setChangingId(null)
    })
  }

  const handleDelete = (userId: string, userName: string) => {
    if (!confirm(`¿Estas seguro de eliminar a ${userName}? Esta accion no se puede deshacer.`)) return

    setError(null)
    setDeletingId(userId)
    startTransition(async () => {
      const result = await deleteUser(userId)
      if (result.error) setError(result.error)
      setDeletingId(null)
    })
  }

  return (
    <div>
      {error && (
        <p className="text-sm text-error-500 bg-error-50 px-4 py-2 rounded-lg mb-4">{error}</p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-3 font-semibold text-foreground-secondary">Nombre</th>
              <th className="pb-3 font-semibold text-foreground-secondary">Email</th>
              <th className="pb-3 font-semibold text-foreground-secondary">Rol</th>
              <th className="pb-3 font-semibold text-foreground-secondary">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 font-medium text-foreground">
                  {user.full_name || 'Sin nombre'}
                </td>
                <td className="py-3 text-foreground-secondary">{user.email}</td>
                <td className="py-3">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={isPending && changingId === user.id}
                    className="text-sm border border-border rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3">
                  {user.id !== currentUserId && (
                    <button
                      onClick={() => handleDelete(user.id, user.full_name || user.email)}
                      disabled={isPending && deletingId === user.id}
                      className="text-xs text-error-500 hover:text-error-700 hover:underline disabled:opacity-50"
                    >
                      {isPending && deletingId === user.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
