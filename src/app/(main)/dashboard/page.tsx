import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTodayEntries, getWeeklyHours, hasOpenCheckIn } from '@/actions/time-entries'
import { CheckInButton } from '@/features/check-in/components/CheckInButton'
import { TodayTimeline } from '@/features/check-in/components/TodayTimeline'
import { WeeklyProgress } from '@/features/check-in/components/WeeklyProgress'
import { Card, CardTitle, LiveDateTime } from '@/components/ui'
import { getEmployeeTeamInfo } from '@/actions/admin'

export const metadata = {
  title: 'Dashboard | TimeTrack',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const userName = profile?.full_name || user.email?.split('@')[0] || 'Usuario'
  const greeting = getGreeting()

  const [{ entries }, { hours }, { isOpen, entry }, { teamInfo }] = await Promise.all([
    getTodayEntries(),
    getWeeklyHours(),
    hasOpenCheckIn(),
    getEmployeeTeamInfo(user.id),
  ])

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {greeting}, {userName}
        </h1>
        <p className="text-foreground-secondary mt-1"><LiveDateTime /></p>
        {teamInfo.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {teamInfo.map((t, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                {t.department} — {t.team}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Check-in/out + Weekly Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Check-in Button */}
        <Card variant="elevated" className="flex flex-col items-center justify-center py-10">
          <CheckInButton
            isCheckedIn={isOpen}
            checkInTime={entry?.check_in}
          />
        </Card>

        {/* Weekly Hours */}
        <Card variant="elevated">
          <CardTitle className="mb-4">Horas de la semana</CardTitle>
          <WeeklyProgress hours={hours} />
        </Card>
      </div>

      {/* Today Timeline */}
      <Card variant="elevated">
        <CardTitle className="mb-4">Registros de hoy</CardTitle>
        <TodayTimeline entries={entries} />
      </Card>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos dias'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
}
