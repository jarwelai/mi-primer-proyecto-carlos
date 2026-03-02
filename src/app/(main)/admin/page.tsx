import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAllEmployees } from '@/actions/team'
import { getDepartments, getTeams } from '@/actions/admin'
import { UserRoleManager } from '@/features/admin-users/components/UserRoleManager'
import { CreateUserForm } from '@/features/admin-users/components/CreateUserForm'
import { CreateDepartmentForm } from '@/features/admin-users/components/CreateDepartmentForm'
import { CreateTeamForm } from '@/features/admin-users/components/CreateTeamForm'
import { AddTeamMemberForm } from '@/features/admin-users/components/AddTeamMemberForm'
import { Card, CardTitle } from '@/components/ui'
import type { UserRole } from '@/types/database'

export const metadata = {
  title: 'Administracion | TimeTrack',
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const [{ employees }, { departments }, { teams }] = await Promise.all([
    getAllEmployees(),
    getDepartments(),
    getTeams(),
  ])

  const usersWithRole = employees.map((e: { id: string; full_name: string | null; email: string; role: string }) => ({
    ...e,
    role: e.role as UserRole,
  }))

  const supervisorList = employees
    .filter((e: { role: string }) => ['supervisor', 'admin'].includes(e.role))
    .map((e: { id: string; full_name: string | null; email: string }) => ({
      id: e.id,
      name: e.full_name || e.email.split('@')[0],
    }))

  const employeeList = employees.map((e: { id: string; full_name: string | null; email: string }) => ({
    id: e.id,
    name: e.full_name || e.email.split('@')[0],
  }))

  const teamList = teams.map((t: { id: string; name: string }) => ({
    id: t.id,
    name: t.name,
  }))

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Administracion</h1>
        <p className="text-foreground-secondary mt-1">
          Gestiona usuarios, departamentos y equipos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="elevated" className="text-center">
          <p className="text-3xl font-bold text-foreground">{employees.length}</p>
          <p className="text-sm text-foreground-secondary">Usuarios</p>
        </Card>
        <Card variant="elevated" className="text-center">
          <p className="text-3xl font-bold text-foreground">{departments.length}</p>
          <p className="text-sm text-foreground-secondary">Departamentos</p>
        </Card>
        <Card variant="elevated" className="text-center">
          <p className="text-3xl font-bold text-foreground">{teams.length}</p>
          <p className="text-sm text-foreground-secondary">Equipos</p>
        </Card>
      </div>

      {/* Create User */}
      <Card variant="elevated">
        <CardTitle className="mb-4">Crear Usuario</CardTitle>
        <CreateUserForm />
      </Card>

      {/* User Management */}
      <Card variant="elevated">
        <CardTitle className="mb-4">Gestion de Usuarios</CardTitle>
        <UserRoleManager users={usersWithRole} currentUserId={user.id} />
      </Card>

      {/* Departments */}
      <Card variant="elevated">
        <CardTitle className="mb-4">Departamentos</CardTitle>
        <div className="space-y-4">
          <CreateDepartmentForm />
          {departments.length > 0 && (
            <div className="space-y-2">
              {departments.map((dept: { id: string; name: string }) => (
                <div key={dept.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-sm">{dept.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Teams */}
      <Card variant="elevated">
        <CardTitle className="mb-4">Equipos</CardTitle>
        <div className="space-y-4">
          <CreateTeamForm
            departments={departments.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name }))}
            supervisors={supervisorList}
          />
          {teams.length > 0 && (
            <div className="space-y-2">
              {teams.map((team: { id: string; name: string; departments: { name: string } | null; profiles: { full_name: string | null; email: string } | null }) => (
                <div key={team.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-sm">{team.name}</span>
                    <span className="text-xs text-foreground-secondary ml-2">
                      {team.departments?.name}
                    </span>
                  </div>
                  <span className="text-xs text-foreground-secondary">
                    Supervisor: {team.profiles?.full_name || team.profiles?.email}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Team Members */}
      <Card variant="elevated">
        <CardTitle className="mb-4">Asignar empleados a equipos</CardTitle>
        <AddTeamMemberForm teams={teamList} employees={employeeList} />
      </Card>
    </div>
  )
}
