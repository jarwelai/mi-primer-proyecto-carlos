'use server'

import { createClient } from '@/lib/supabase/server'

export async function getTeamMembers() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { members: [], error: 'No autenticado' }

  // Buscar equipos donde el usuario es supervisor
  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, departments (name)')
    .eq('supervisor_id', user.id)

  if (!teams || teams.length === 0) return { members: [] }

  const teamIds = teams.map(t => t.id)

  const { data: teamMembers, error } = await supabase
    .from('team_members')
    .select(`
      employee_id,
      profiles!team_members_employee_id_fkey (id, full_name, email)
    `)
    .in('team_id', teamIds)

  if (error) return { members: [], error: error.message }

  return { members: teamMembers || [], teams }
}

export async function getAllEmployees() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { employees: [], error: 'No autenticado' }

  // Verificar que sea hr_manager o admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['hr_manager', 'admin'].includes(profile.role)) {
    return { employees: [], error: 'Sin permisos' }
  }

  const { data: employees, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .order('full_name', { ascending: true })

  if (error) return { employees: [], error: error.message }

  return { employees: employees || [] }
}

export async function getEmployeesTodayStatus(employeeIds: string[]) {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data: entries, error } = await supabase
    .from('time_entries')
    .select('employee_id, check_in, check_out')
    .in('employee_id', employeeIds)
    .gte('check_in', today.toISOString())
    .lt('check_in', tomorrow.toISOString())
    .order('check_in', { ascending: true })

  if (error) return { statuses: {}, error: error.message }

  // Agrupar por empleado
  const statuses: Record<string, { checkedIn: boolean; entries: number; hoursToday: number }> = {}

  for (const id of employeeIds) {
    statuses[id] = { checkedIn: false, entries: 0, hoursToday: 0 }
  }

  for (const entry of entries || []) {
    const s = statuses[entry.employee_id]
    if (!s) continue
    s.entries++
    if (!entry.check_out) {
      s.checkedIn = true
    } else {
      s.hoursToday += (new Date(entry.check_out).getTime() - new Date(entry.check_in).getTime()) / (1000 * 60 * 60)
    }
  }

  return { statuses }
}

export async function getEmployeesWeeklyHours(employeeIds: string[]) {
  const supabase = await createClient()

  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  monday.setHours(0, 0, 0, 0)

  const { data: entries, error } = await supabase
    .from('time_entries')
    .select('employee_id, check_in, check_out')
    .in('employee_id', employeeIds)
    .gte('check_in', monday.toISOString())
    .not('check_out', 'is', null)

  if (error) return { weeklyHours: {}, error: error.message }

  const weeklyHours: Record<string, number> = {}
  for (const id of employeeIds) {
    weeklyHours[id] = 0
  }

  for (const entry of entries || []) {
    if (entry.check_out) {
      weeklyHours[entry.employee_id] =
        (weeklyHours[entry.employee_id] || 0) +
        (new Date(entry.check_out).getTime() - new Date(entry.check_in).getTime()) / (1000 * 60 * 60)
    }
  }

  return { weeklyHours }
}
