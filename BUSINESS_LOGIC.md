# 📋 BUSINESS_LOGIC.md - ContractGen (Generador de Contratos)

> Generado por SaaS Factory | Fecha: 2026-02-27

## 1. Problema de Negocio
**Dolor:** Las inmobiliarias pierden 4 horas al día copiando datos de Excel a contratos en Word. El proceso es manual, propenso a errores y repetitivo.
**Costo actual:** ~4 horas por operación manual. Errores frecuentes en datos de clientes que generan re-trabajo y retrasos en cierres de venta.

## 2. Solución
**Propuesta de valor:** Un generador automático de contratos legales para inmobiliarias basado en plantillas.

**Flujo principal (Happy Path):**
1. El usuario sube un Excel con datos del cliente
2. El sistema extrae y valida los datos automáticamente
3. El usuario selecciona una plantilla de contrato
4. El sistema genera el PDF y lo envía por email

## 3. Usuario Objetivo
**Rol:** Gerente de Operaciones de inmobiliaria que está harto de errores manuales
**Contexto:** Maneja múltiples operaciones de compra-venta al día, necesita generar contratos rápido y sin errores para cerrar negocios

## 4. Arquitectura de Datos
**Input:**
- Archivos Excel (.xlsx) con datos de clientes (nombre, dirección, monto, etc.)
- Plantillas de contrato editables

**Output:**
- Contratos en PDF generados automáticamente
- Emails de envío al cliente con el contrato adjunto
- Dashboard con historial de contratos generados

**Storage (Supabase tables sugeridas):**
- `users`: Usuarios del sistema (gerentes, operadores)
- `clients`: Datos de clientes extraídos de Excel
- `templates`: Plantillas de contratos (nombre, contenido, variables)
- `contracts`: Contratos generados (cliente, plantilla usada, PDF URL, estado)
- `email_logs`: Registro de emails enviados (contrato, destinatario, fecha, estado)

## 5. KPI de Éxito
**Métrica principal:** Reducir tiempo de creación de contratos de 4 horas a 5 minutos

## 6. Especificación Técnica (Para el Agente)

### Features a Implementar (Feature-First)
```
src/features/
├── auth/              # Autenticación Email/Password (Supabase)
├── clients/           # Carga y gestión de datos de clientes (Excel upload)
├── templates/         # CRUD de plantillas de contrato
├── contracts/         # Generación de contratos PDF desde plantilla + datos
└── dashboard/         # Vista principal con historial y métricas
```

### Stack Confirmado
- **Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind 3.4 + shadcn/ui
- **Backend:** Supabase (Auth + Database + Storage)
- **Validación:** Zod
- **State:** Zustand (si necesario)
- **MCPs:** Next.js DevTools + Playwright + Supabase

### Próximos Pasos
1. [ ] Setup proyecto base
2. [ ] Configurar Supabase (tablas, RLS, storage)
3. [ ] Implementar Auth (email/password)
4. [ ] Feature: clients (upload Excel, extracción de datos)
5. [ ] Feature: templates (CRUD de plantillas)
6. [ ] Feature: contracts (generación de PDF)
7. [ ] Feature: dashboard (historial y métricas)
8. [ ] Testing E2E
9. [ ] Deploy Vercel
