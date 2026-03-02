import { Sidebar } from '@/components/layout/sidebar'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64">
        {/* Top bar with notifications */}
        <div className="flex justify-end items-center px-6 py-3 border-b border-border">
          <NotificationBell />
        </div>
        {children}
      </main>
    </div>
  )
}
