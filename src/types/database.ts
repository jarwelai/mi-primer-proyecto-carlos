// ============================================
// TIPOS DEL DOMINIO - TimeTrack
// ============================================

export type UserRole = 'employee' | 'supervisor' | 'hr_manager' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  name: string
  created_at: string
}

export interface Team {
  id: string
  name: string
  department_id: string
  supervisor_id: string
  created_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  employee_id: string
  joined_at: string
}

export interface TimeEntry {
  id: string
  employee_id: string
  check_in: string
  check_out: string | null
  created_at: string
}

export interface Notification {
  id: string
  recipient_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'alert'
  read: boolean
  created_at: string
}

// ============================================
// Database type para Supabase client
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      departments: {
        Row: Department
        Insert: Omit<Department, 'id' | 'created_at'>
        Update: Partial<Omit<Department, 'id' | 'created_at'>>
      }
      teams: {
        Row: Team
        Insert: Omit<Team, 'id' | 'created_at'>
        Update: Partial<Omit<Team, 'id' | 'created_at'>>
      }
      team_members: {
        Row: TeamMember
        Insert: Omit<TeamMember, 'id' | 'joined_at'>
        Update: Partial<Omit<TeamMember, 'id' | 'joined_at'>>
      }
      time_entries: {
        Row: TimeEntry
        Insert: Omit<TimeEntry, 'id' | 'created_at'>
        Update: Partial<Omit<TimeEntry, 'id' | 'created_at'>>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at' | 'read'>
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>
      }
    }
  }
}
