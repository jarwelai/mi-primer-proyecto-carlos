'use server'

import { createClient } from '@/lib/supabase/server'

export async function getHistory(employeeId?: string, page = 1, perPage = 20) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { entries: [], total: 0, error: 'No autenticado' }

  const targetId = employeeId || user.id
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  const { data: entries, error, count } = await supabase
    .from('time_entries')
    .select('*', { count: 'exact' })
    .eq('employee_id', targetId)
    .order('check_in', { ascending: false })
    .range(from, to)

  if (error) return { entries: [], total: 0, error: error.message }

  return { entries: entries || [], total: count || 0 }
}

export async function getMonthlyHistory(employeeId?: string, year?: number, month?: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { entries: [], error: 'No autenticado' }

  const targetId = employeeId || user.id
  const now = new Date()
  const targetYear = year || now.getFullYear()
  const targetMonth = month || now.getMonth() + 1

  const startDate = new Date(targetYear, targetMonth - 1, 1)
  const endDate = new Date(targetYear, targetMonth, 1)

  const { data: entries, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('employee_id', targetId)
    .gte('check_in', startDate.toISOString())
    .lt('check_in', endDate.toISOString())
    .order('check_in', { ascending: false })

  if (error) return { entries: [], error: error.message }

  return { entries: entries || [] }
}
