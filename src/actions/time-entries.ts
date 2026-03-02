'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function checkIn() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  // Verificar si ya hay un check-in abierto hoy
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: openEntry } = await supabase
    .from('time_entries')
    .select('id')
    .eq('employee_id', user.id)
    .is('check_out', null)
    .gte('check_in', today.toISOString())
    .maybeSingle()

  if (openEntry) {
    return { error: 'Ya tienes un check-in abierto. Haz check-out primero.' }
  }

  const { error } = await supabase
    .from('time_entries')
    .insert({ employee_id: user.id, check_in: new Date().toISOString() })

  if (error) {
    return { error: 'Error al registrar entrada: ' + error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function checkOut() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  // Buscar el check-in abierto más reciente
  const { data: openEntry } = await supabase
    .from('time_entries')
    .select('id')
    .eq('employee_id', user.id)
    .is('check_out', null)
    .order('check_in', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!openEntry) {
    return { error: 'No tienes un check-in abierto.' }
  }

  const { error } = await supabase
    .from('time_entries')
    .update({ check_out: new Date().toISOString() })
    .eq('id', openEntry.id)

  if (error) {
    return { error: 'Error al registrar salida: ' + error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function getTodayEntries(employeeId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { entries: [], error: 'No autenticado' }

  const targetId = employeeId || user.id
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data: entries, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('employee_id', targetId)
    .gte('check_in', today.toISOString())
    .lt('check_in', tomorrow.toISOString())
    .order('check_in', { ascending: true })

  if (error) return { entries: [], error: error.message }

  return { entries: entries || [] }
}

export async function getWeeklyHours(employeeId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { hours: 0, error: 'No autenticado' }

  const targetId = employeeId || user.id

  // Inicio de la semana (lunes)
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  monday.setHours(0, 0, 0, 0)

  const { data: entries, error } = await supabase
    .from('time_entries')
    .select('check_in, check_out')
    .eq('employee_id', targetId)
    .gte('check_in', monday.toISOString())
    .not('check_out', 'is', null)

  if (error) return { hours: 0, error: error.message }

  let totalMs = 0
  for (const entry of entries || []) {
    if (entry.check_out) {
      totalMs += new Date(entry.check_out).getTime() - new Date(entry.check_in).getTime()
    }
  }

  const hours = Math.round((totalMs / (1000 * 60 * 60)) * 100) / 100
  return { hours }
}

export async function hasOpenCheckIn() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { isOpen: false }

  const { data: openEntry } = await supabase
    .from('time_entries')
    .select('id, check_in')
    .eq('employee_id', user.id)
    .is('check_out', null)
    .order('check_in', { ascending: false })
    .limit(1)
    .maybeSingle()

  return { isOpen: !!openEntry, entry: openEntry }
}
