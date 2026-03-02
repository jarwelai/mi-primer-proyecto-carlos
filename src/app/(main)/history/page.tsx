import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getMonthlyHistory, getHistory } from '@/actions/history'
import { getWeeklyHours } from '@/actions/time-entries'
import { HistoryTable } from '@/features/history/components/HistoryTable'
import { WeeklyProgress } from '@/features/check-in/components/WeeklyProgress'
import { Card, CardTitle } from '@/components/ui'

export const metadata = {
  title: 'Mi Historial | TimeTrack',
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [{ entries }, { hours }] = await Promise.all([
    getHistory(),
    getWeeklyHours(),
  ])

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Historial</h1>
        <p className="text-foreground-secondary mt-1">
          Revisa tu registro de asistencia
        </p>
      </div>

      {/* Weekly summary */}
      <Card variant="elevated">
        <CardTitle className="mb-4">Resumen semanal</CardTitle>
        <WeeklyProgress hours={hours} />
      </Card>

      {/* History table */}
      <Card variant="elevated">
        <CardTitle className="mb-4">Registros recientes</CardTitle>
        <HistoryTable entries={entries} />
      </Card>
    </div>
  )
}
