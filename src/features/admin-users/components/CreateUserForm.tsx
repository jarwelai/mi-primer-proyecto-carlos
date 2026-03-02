'use client'

import { useState, useTransition } from 'react'
import { createUser } from '@/actions/admin'
import { Button } from '@/components/ui'
import type { UserRole } from '@/types/database'

const ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: 'employee', label: 'Empleado' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'hr_manager', label: 'Gerente RRHH' },
  { value: 'admin', label: 'Admin' },
]

export function CreateUserForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<string>('employee')
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return

    setResult(null)
    startTransition(async () => {
      const res = await createUser(email.trim(), password, fullName.trim(), role)
      setResult(res)
      if (res.success) {
        setEmail('')
        setPassword('')
        setFullName('')
        setRole('employee')
      }
    })
  }

  const isValid = email.trim() && password.length >= 6

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nombre completo"
          className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email *"
          required
          className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6 caracteres) *"
          minLength={6}
          required
          className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" isLoading={isPending} disabled={!isValid}>
          Crear usuario
        </Button>
        {result?.success && (
          <span className="text-xs text-success-600">Usuario creado exitosamente</span>
        )}
        {result?.error && (
          <span className="text-xs text-error-500">{result.error}</span>
        )}
      </div>
    </form>
  )
}
