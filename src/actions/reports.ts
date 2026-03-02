'use server'

import { createClient } from '@/lib/supabase/server'

export async function getWeeklyReport() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { report: [], error: 'No autenticado' }

  // Verificar permisos
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['hr_manager', 'admin'].includes(profile.role)) {
    return { report: [], error: 'Sin permisos' }
  }

  // Obtener todos los empleados
  const { data: employees } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .order('full_name')

  if (!employees) return { report: [], error: 'Error obteniendo empleados' }

  // Inicio de la semana (lunes)
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 7)

  // Obtener todas las entradas de la semana
  const { data: entries } = await supabase
    .from('time_entries')
    .select('employee_id, check_in, check_out')
    .gte('check_in', monday.toISOString())
    .lt('check_in', sunday.toISOString())
    .order('check_in', { ascending: true })

  // Construir reporte
  const report = employees.map(emp => {
    const empEntries = (entries || []).filter(e => e.employee_id === emp.id)

    let weeklyHours = 0
    const dailyEntries = empEntries
      .filter(e => e.check_out)
      .map(e => {
        const hours = (new Date(e.check_out!).getTime() - new Date(e.check_in).getTime()) / (1000 * 60 * 60)
        weeklyHours += hours
        return {
          date: new Date(e.check_in).toLocaleDateString('es'),
          checkIn: new Date(e.check_in).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
          checkOut: new Date(e.check_out!).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
          hours,
        }
      })

    return {
      name: emp.full_name || emp.email.split('@')[0],
      email: emp.email,
      weeklyHours: Math.round(weeklyHours * 100) / 100,
      dailyEntries,
    }
  })

  const weekLabel = `${monday.toLocaleDateString('es')}-${new Date(sunday.getTime() - 1).toLocaleDateString('es')}`

  return { report, period: weekLabel }
}
