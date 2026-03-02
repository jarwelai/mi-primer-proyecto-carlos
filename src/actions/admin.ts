'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUserRole(userId: string, role: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autenticado' }

  // Verificar que es admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Sin permisos' }

  const validRoles = ['employee', 'supervisor', 'hr_manager', 'admin']
  if (!validRoles.includes(role)) return { error: 'Rol invalido' }

  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function getDepartments() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name')

  if (error) return { departments: [], error: error.message }
  return { departments: data || [] }
}

export async function createDepartment(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Sin permisos' }

  const { error } = await supabase
    .from('departments')
    .insert({ name })

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function createTeam(name: string, departmentId: string, supervisorId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Sin permisos' }

  const { error } = await supabase
    .from('teams')
    .insert({ name, department_id: departmentId, supervisor_id: supervisorId })

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function addTeamMember(teamId: string, employeeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Sin permisos' }

  const { error } = await supabase
    .from('team_members')
    .insert({ team_id: teamId, employee_id: employeeId })

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function createUser(
  email: string,
  password: string,
  fullName: string,
  role: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Sin permisos' }

  const validRoles = ['employee', 'supervisor', 'hr_manager', 'admin']
  if (!validRoles.includes(role)) return { error: 'Rol invalido' }
  if (!email.trim() || !password || password.length < 6) {
    return { error: 'Email y password (min 6 caracteres) son requeridos' }
  }

  const serviceClient = createServiceClient()
  const { data: newUser, error: createError } = await serviceClient.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
  })

  if (createError) return { error: createError.message }
  if (!newUser.user) return { error: 'Error creando usuario' }

  const { error: updateError } = await serviceClient
    .from('profiles')
    .update({
      role,
      full_name: fullName.trim() || null,
    })
    .eq('id', newUser.user.id)

  if (updateError) {
    return { error: `Usuario creado pero error al asignar rol: ${updateError.message}` }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: 'Sin permisos' }

  if (userId === user.id) return { error: 'No puedes eliminarte a ti mismo' }

  const serviceClient = createServiceClient()
  const { error } = await serviceClient.auth.admin.deleteUser(userId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function getTeams() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      departments (name),
      profiles!teams_supervisor_id_fkey (full_name, email)
    `)
    .order('name')

  if (error) return { teams: [], error: error.message }
  return { teams: data || [] }
}
