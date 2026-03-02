import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TimeTrack - Control de Asistencia',
  description: 'Sistema de control de asistencia digital',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
