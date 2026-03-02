'use client'

import { useState, useTransition } from 'react'
import { createDepartment } from '@/actions/admin'
import { Button } from '@/components/ui'

export function CreateDepartmentForm() {
  const [name, setName] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setError(null)
    startTransition(async () => {
      const res = await createDepartment(name.trim())
      if (res.error) {
        setError(res.error)
      } else {
        setName('')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre del departamento"
        className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <Button type="submit" size="sm" isLoading={isPending} disabled={!name.trim()}>
        Crear
      </Button>
      {error && <span className="text-xs text-error-500">{error}</span>}
    </form>
  )
}
