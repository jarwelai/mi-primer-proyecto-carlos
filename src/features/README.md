# Features - Arquitectura Feature-First

Cada feature es **autocontenida** y contiene toda la logica relacionada.

## Estructura Estandar

Usa `.template/` como base para nuevas features:

```bash
cp -r src/features/.template src/features/mi-nueva-feature
```

## Features Actuales

### `auth/`
Autenticacion y gestion de sesiones con Supabase.
- Login/Signup con Email/Password
- Gestion de sesion
- Proteccion de rutas

## Principios Feature-First

1. **Colocalizacion**: Todo relacionado vive junto
2. **Autocontenido**: Cada feature debe funcionar independientemente
3. **No dependencias circulares**: Features no importan de otras features
4. **Usar `shared/`**: Para codigo reutilizable entre features
