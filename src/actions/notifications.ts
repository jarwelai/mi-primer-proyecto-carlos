'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getMyNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { notifications: [], error: 'No autenticado' }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return { notifications: [], error: error.message }

  return { notifications: data || [] }
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('recipient_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function markAllNotificationsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('recipient_id', user.id)
    .eq('read', false)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function checkWeeklyCompliance() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  // Solo hr_manager o admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['hr_manager', 'admin'].includes(profile.role)) {
    return { error: 'Sin permisos' }
  }

  // Calcular semana pasada
  const now = new Date()
  const dayOfWeek = now.getDay()
  const lastMonday = new Date(now)
  lastMonday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) - 7)
  lastMonday.setHours(0, 0, 0, 0)

  const lastSunday = new Date(lastMonday)
  lastSunday.setDate(lastMonday.getDate() + 7)

  // Obtener empleados
  const { data: employees } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'employee')

  if (!employees) return { error: 'Error obteniendo empleados' }

  // Obtener entradas de la semana pasada
  const { data: entries } = await supabase
    .from('time_entries')
    .select('employee_id, check_in, check_out')
    .gte('check_in', lastMonday.toISOString())
    .lt('check_in', lastSunday.toISOString())
    .not('check_out', 'is', null)

  // Calcular horas por empleado
  const hoursMap: Record<string, number> = {}
  for (const entry of entries || []) {
    if (entry.check_out) {
      const hours = (new Date(entry.check_out).getTime() - new Date(entry.check_in).getTime()) / (1000 * 60 * 60)
      hoursMap[entry.employee_id] = (hoursMap[entry.employee_id] || 0) + hours
    }
  }

  // Crear notificaciones para quienes no cumplieron
  const weekLabel = `${lastMonday.toLocaleDateString('es')} - ${new Date(lastSunday.getTime() - 1).toLocaleDateString('es')}`
  let notified = 0

  for (const emp of employees) {
    const hours = hoursMap[emp.id] || 0
    if (hours < 44) {
      // Notificar al empleado
      await supabase.from('notifications').insert({
        recipient_id: emp.id,
        title: 'Horas semanales incompletas',
        message: `Semana ${weekLabel}: registraste ${hours.toFixed(1)}h de las 44h requeridas.`,
        type: 'warning',
      })

      // Notificar a RRHH
      await supabase.from('notifications').insert({
        recipient_id: user.id,
        title: `${emp.full_name || emp.email} - Horas incompletas`,
        message: `${emp.full_name || emp.email} registro ${hours.toFixed(1)}h de 44h en la semana ${weekLabel}.`,
        type: 'alert',
      })

      notified++
    }
  }

  revalidatePath('/hr')
  return { success: true, notified }
}
