# 📋 BUSINESS_LOGIC.md - TimeTrack (Reloj Checador Digital)

> Generado por SaaS Factory | Fecha: 2026-02-27

## 1. Problema de Negocio
**Dolor:** 50 empleados registran entrada/salida en papel. No hay forma de saber quién llegó, quién no, ni si cumplen sus horas semanales. El control de asistencia es manual, propenso a errores y no verificable.
**Costo actual:** Imposible verificar cumplimiento de 44 horas semanales. Cálculo manual consume tiempo de RRHH. Sin trazabilidad ni evidencia digital.

## 2. Solución
**Propuesta de valor:** Un reloj checador digital donde los empleados registran entrada/salida desde su navegador y la administración ve la asistencia en tiempo real.

**Flujo principal (Happy Path):**

### Empleado:
1. Llega a la oficina → abre la web → hace login
2. Ve un botón limpio de Check-in → lo presiona (se registra fecha y hora automáticamente)
3. Al salir → presiona Check-out (se registra fecha y hora)
4. Ve una lista horizontal con sus registros del día (entrada/salida)
5. Puede ver su historial completo y horas acumuladas de la semana en su perfil

### Supervisor:
1. Hace login → ve dashboard de su equipo asignado
2. Ve quién ya marcó entrada, quién no, horas acumuladas
3. Puede ver historial de cualquier empleado de su equipo

### Gerente RRHH:
1. Hace login → ve dashboard global de todos los empleados
2. Verifica cumplimiento de 44 horas semanales
3. Exporta reportes (PDF/Excel)
4. Recibe notificaciones de empleados que no cumplen las 44 horas

### Administrador:
1. Control total del sistema
2. Gestión de usuarios, roles, asignación de equipos
3. Configuración general

## 3. Usuario Objetivo
**Roles:**
- **Empleado (employee):** Hace check-in/check-out diario, ve su historial y horas acumuladas
- **Supervisor (supervisor):** Ve el dashboard y historial de su equipo asignado
- **Gerente RRHH (hr_manager):** Ve todos los empleados, reportes, notificaciones de incumplimiento
- **Administrador (admin):** Control total, gestión de usuarios y configuración

**Contexto:** Oficina con 50 empleados, horario flexible pero con obligación de cumplir 44 horas semanales.

## 4. Arquitectura de Datos
**Input:**
- Registro de empleado (nombre, email, departamento)
- Check-in / Check-out (botón + timestamp automático)
- Asignación de empleados a supervisores/equipos

**Output:**
- Dashboard en tiempo real (quién está en oficina ahora)
- Lista horizontal de registros del día (entrada/salida por empleado)
- Historial de asistencia por empleado
- Acumulado de horas semanales (meta: 44h)
- Reportes exportables (PDF y Excel)
- Notificaciones cuando un empleado no cumple las 44 horas semanales

**Storage (Supabase tables):**
- `profiles`: Usuarios con rol (employee, supervisor, hr_manager, admin)
- `departments`: Departamentos de la empresa
- `teams`: Equipos con supervisor asignado
- `team_members`: Relación empleado-equipo
- `time_entries`: Registros de check-in/check-out (empleado, tipo, timestamp)
- `notifications`: Notificaciones de incumplimiento de horas

## 5. KPI de Exito
**Metrica principal:** Que los 50 empleados registren entrada/salida diaria desde el navegador y que RRHH pueda verificar el cumplimiento de las 44 horas semanales sin papel.

## 6. Especificacion Tecnica (Para el Agente)

### Features a Implementar (Feature-First)
```
src/features/
├── auth/              # Autenticacion Email/Password (Supabase) - YA EXISTE
├── check-in/          # Boton check-in/check-out, lista del dia
├── history/           # Historial de asistencia del empleado
├── weekly-hours/      # Calculo y visualizacion de horas semanales (meta 44h)
├── team-dashboard/    # Dashboard del supervisor (su equipo)
├── hr-dashboard/      # Dashboard RRHH (todos los empleados)
├── admin-users/       # Gestion de usuarios, roles, equipos
├── reports/           # Exportacion PDF y Excel
└── notifications/     # Alertas de incumplimiento de horas
```

### Stack Confirmado
- **Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind 3.4
- **Backend:** Supabase (Auth + Database + Storage)
- **Validacion:** Zod
- **State:** Zustand (si necesario)
- **MCPs:** Next.js DevTools + Playwright + Supabase

### Proximos Pasos
1. [x] Setup proyecto base
2. [x] Configurar Supabase (tabla profiles creada)
3. [x] Implementar Auth (login/signup existe)
4. [ ] Migrar DB: tablas departments, teams, team_members, time_entries, notifications
5. [ ] Feature: check-in/check-out (boton + lista del dia)
6. [ ] Feature: historial de asistencia
7. [ ] Feature: horas semanales (calculo 44h)
8. [ ] Feature: dashboard supervisor (su equipo)
9. [ ] Feature: dashboard RRHH (todos + notificaciones)
10. [ ] Feature: gestion de usuarios y roles (admin)
11. [ ] Feature: exportar reportes (PDF/Excel)
12. [ ] Feature: notificaciones de incumplimiento
13. [ ] Testing E2E
14. [ ] Deploy Vercel
