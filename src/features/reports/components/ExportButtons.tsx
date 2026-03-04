'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es')
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

interface EmployeeReport {
  name: string
  email: string
  weeklyHours: number
  dailyEntries: { date: string; checkIn: string; checkOut: string; hours: number }[]
}

interface ExportButtonsProps {
  employees: EmployeeReport[]
  period: string
}

export function ExportButtons({ employees, period }: ExportButtonsProps) {
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null)

  const handleExportPDF = async () => {
    setExporting('pdf')
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: autoTable } = await import('jspdf-autotable')

      const doc = new jsPDF()

      doc.setFontSize(18)
      doc.text('TimeTrack - Reporte de Asistencia', 14, 22)
      doc.setFontSize(11)
      doc.text(`Periodo: ${period}`, 14, 32)
      doc.text(`Generado: ${new Date().toLocaleDateString('es')}`, 14, 38)

      const tableData = employees.map(emp => [
        emp.name,
        emp.email,
        `${emp.weeklyHours.toFixed(1)}h`,
        emp.weeklyHours >= 44 ? 'Cumple' : 'Pendiente',
      ])

      autoTable(doc, {
        startY: 45,
        head: [['Nombre', 'Email', 'Horas Semana', 'Estado']],
        body: tableData,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [30, 58, 95] },
      })

      doc.save(`timetrack-reporte-${period}.pdf`)
    } catch (err) {
      console.error('Error exportando PDF:', err)
    }
    setExporting(null)
  }

  const handleExportExcel = async () => {
    setExporting('excel')
    try {
      const XLSX = await import('xlsx')

      // Hoja resumen
      const summaryData = employees.map(emp => ({
        Nombre: emp.name,
        Email: emp.email,
        'Horas Semana': Number(emp.weeklyHours.toFixed(1)),
        Estado: emp.weeklyHours >= 44 ? 'Cumple' : 'Pendiente',
      }))

      // Hoja detalle
      const detailData = employees.flatMap(emp =>
        emp.dailyEntries.map(entry => ({
          Nombre: emp.name,
          Fecha: formatDate(entry.date),
          Entrada: formatTime(entry.checkIn),
          Salida: formatTime(entry.checkOut),
          Horas: Number(entry.hours.toFixed(2)),
        }))
      )

      const wb = XLSX.utils.book_new()
      const summarySheet = XLSX.utils.json_to_sheet(summaryData)
      const detailSheet = XLSX.utils.json_to_sheet(detailData)

      XLSX.utils.book_append_sheet(wb, summarySheet, 'Resumen')
      XLSX.utils.book_append_sheet(wb, detailSheet, 'Detalle')

      XLSX.writeFile(wb, `timetrack-reporte-${period}.xlsx`)
    } catch (err) {
      console.error('Error exportando Excel:', err)
    }
    setExporting(null)
  }

  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        isLoading={exporting === 'pdf'}
        leftIcon={<PDFIcon className="w-4 h-4" />}
      >
        Exportar PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportExcel}
        isLoading={exporting === 'excel'}
        leftIcon={<ExcelIcon className="w-4 h-4" />}
      >
        Exportar Excel
      </Button>
    </div>
  )
}

function PDFIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )
}

function ExcelIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}
