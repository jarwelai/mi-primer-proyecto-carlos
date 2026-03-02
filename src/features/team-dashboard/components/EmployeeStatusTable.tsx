interface EmployeeStatus {
  id: string
  name: string
  email: string
  checkedIn: boolean
  hoursToday: number
  weeklyHours: number
}

interface EmployeeStatusTableProps {
  employees: EmployeeStatus[]
}

export function EmployeeStatusTable({ employees }: EmployeeStatusTableProps) {
  if (employees.length === 0) {
    return (
      <div className="text-center py-12 text-foreground-secondary">
        <p>No hay empleados asignados</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-3 font-semibold text-foreground-secondary">Empleado</th>
            <th className="pb-3 font-semibold text-foreground-secondary text-center">Estado</th>
            <th className="pb-3 font-semibold text-foreground-secondary text-right">Hoy</th>
            <th className="pb-3 font-semibold text-foreground-secondary text-right">Semana</th>
            <th className="pb-3 font-semibold text-foreground-secondary text-right">Meta 44h</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {employees.map((emp) => {
            const weeklyPct = Math.min((emp.weeklyHours / 44) * 100, 100)
            return (
              <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3">
                  <p className="font-medium text-foreground">{emp.name}</p>
                  <p className="text-xs text-foreground-secondary">{emp.email}</p>
                </td>
                <td className="py-3 text-center">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    emp.checkedIn
                      ? 'bg-success-100 text-success-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${emp.checkedIn ? 'bg-success-500 animate-pulse' : 'bg-gray-400'}`} />
                    {emp.checkedIn ? 'En oficina' : 'Fuera'}
                  </span>
                </td>
                <td className="py-3 text-right font-medium">
                  {emp.hoursToday.toFixed(1)}h
                </td>
                <td className="py-3 text-right font-medium">
                  {emp.weeklyHours.toFixed(1)}h
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-16 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${weeklyPct >= 100 ? 'bg-success-500' : weeklyPct >= 75 ? 'bg-primary-500' : 'bg-warning-500'}`}
                        style={{ width: `${weeklyPct}%` }}
                      />
                    </div>
                    <span className="text-xs text-foreground-secondary w-8">{weeklyPct.toFixed(0)}%</span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
