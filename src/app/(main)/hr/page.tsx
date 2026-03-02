import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAllEmployees, getEmployeesTodayStatus, getEmployeesWeeklyHours } from '@/actions/team'
import { getWeeklyReport } from '@/actions/reports'
import { EmployeeStatusTable } from '@/features/team-dashboard/components/EmployeeStatusTable'
import { ExportButtons } from '@/features/reports/components/ExportButtons'
import { ComplianceCheckButton } from '@/features/hr-dashboard/components/ComplianceCheckButton'
import { Card, CardTitle } from '@/components/ui'

export const metadata = {
  title: 'RRHH | TimeTrack',
}

export default async function HRPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['hr_manager', 'admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const { employees } = await getAllEmployees()
  const employeeIds = employees.map((e: { id: string }) => e.id)

  const [{ statuses }, { weeklyHours }] = await Promise.all([
    getEmployeesTodayStatus(employeeIds),
    getEmployeesWeeklyHours(employeeIds),
  ])

  const statusMap = statuses as Record<string, { checkedIn: boolean; entries: number; hoursToday: number }>
  const hoursMap = weeklyHours as Record<string, number>

  const employeeData = employees.map((e: { id: string; full_name: string | null; email: string }) => ({
    id: e.id,
    name: e.full_name || e.email.split('@')[0],
    email: e.email,
    checkedIn: statusMap[e.id]?.checkedIn || false,
    hoursToday: statusMap[e.id]?.hoursToday || 0,
    weeklyHours: hoursMap[e.id] || 0,
  }))

  const inOffice = employeeData.filter(e => e.checkedIn).length
  const below44 = employeeData.filter(e => e.weeklyHours < 44).length

  const { report, period } = await getWeeklyReport()

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Panel RRHH</h1>
          <p className="text-foreground-secondary mt-1">
            Control de asistencia de todos los empleados
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ComplianceCheckButton />
          <ExportButtons employees={report || []} period={period || ''} />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
        <Card variant="elevated" className="text-center">
          <p className="text-3xl font-bold text-warning-600">{below44}</p>
          <p className="text-sm text-foreground-secondary">Bajo 44h</p>
        </Card>
      </div>

      {/* Table */}
      <Card variant="elevated">
        <CardTitle className="mb-4">Todos los empleados</CardTitle>
        <EmployeeStatusTable employees={employeeData} />
      </Card>
    </div>
  )
}
