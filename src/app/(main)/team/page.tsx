import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTeamMembers, getEmployeesTodayStatus, getEmployeesWeeklyHours } from '@/actions/team'
import { EmployeeStatusTable } from '@/features/team-dashboard/components/EmployeeStatusTable'
import { Card, CardTitle, LiveDateTime } from '@/components/ui'

export const metadata = {
  title: 'Mi Equipo | TimeTrack',
}

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['supervisor', 'admin'].includes(profile.role)) redirect('/dashboard')

  const { members, teams } = await getTeamMembers()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const employeeIds = members.map((m: any) => m.employee_id as string)

  const [{ statuses }, { weeklyHours }] = await Promise.all([
    getEmployeesTodayStatus(employeeIds),
    getEmployeesWeeklyHours(employeeIds),
  ])

  const statusMap = statuses as Record<string, { checkedIn: boolean; entries: number; hoursToday: number }>
  const hoursMap = weeklyHours as Record<string, number>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const employeeData = members.map((m: any) => {
    const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
    return {
      id: m.employee_id as string,
      name: (p?.full_name || p?.email?.split('@')[0] || 'Sin nombre') as string,
      email: (p?.email || '') as string,
      checkedIn: statusMap[m.employee_id]?.checkedIn || false,
      hoursToday: statusMap[m.employee_id]?.hoursToday || 0,
      weeklyHours: hoursMap[m.employee_id] || 0,
    }
  })

  const inOffice = employeeData.filter(e => e.checkedIn).length

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Equipo</h1>
        <p className="text-foreground-secondary mt-1"><LiveDateTime /></p>
        <p className="text-foreground-secondary mt-1">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {teams?.map((t: any) => t.name).join(', ')}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="elevated" className="text-center">
          <p className="text-3xl font-bold text-foreground">{employeeData.length}</p>
          <p className="text-sm text-foreground-secondary">Total empleados</p>
        </Card>
        <Card variant="elevated" className="text-center">
          <p className="text-3xl font-bold text-success-600">{inOffice}</p>
          <p className="text-sm text-foreground-secondary">En oficina</p>
        </Card>
        <Card variant="elevated" className="text-center">
          <p className="text-3xl font-bold text-foreground-secondary">{employeeData.length - inOffice}</p>
          <p className="text-sm text-foreground-secondary">Fuera</p>
        </Card>
      </div>

      {/* Table */}
      <Card variant="elevated">
        <CardTitle className="mb-4">Estado del equipo</CardTitle>
        <EmployeeStatusTable employees={employeeData} />
      </Card>
    </div>
  )
}
