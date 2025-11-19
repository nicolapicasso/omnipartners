# Omniwallet Partner Portal

Portal de gestión de partners para Omniwallet. Permite a los partners gestionar leads, ver comisiones y administrar su equipo.

## 🚀 Configuración Rápida (Primera vez)

Después de clonar el repositorio, ejecuta **un solo comando**:

```bash
npm run setup
```

Este comando hará TODO automáticamente:
- ✅ Crea el archivo `.env`
- ✅ Instala dependencias
- ✅ Genera el cliente de Prisma
- ✅ Crea la base de datos
- ✅ Ejecuta las migraciones
- ✅ Crea el usuario administrador inicial

## 👤 Usuario Admin Inicial

Después del setup, puedes iniciar sesión con:

- **Email**: `admin@omniwallet.com`
- **Password**: `admin123`

⚠️ **IMPORTANTE**: Cambia esta contraseña en producción.

## 🏃‍♂️ Iniciar el Servidor

```bash
npm run dev
```

Luego visita: [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
/app
  /admin              # Panel de administración
    /partners         # Gestión de partners
    /leads           # Gestión de leads
  /partner            # Portal de partners
    /leads           # Gestión de leads del partner
    /commissions     # Vista de comisiones
    /team            # Gestión de equipo
  /api/auth          # Autenticación NextAuth
  /login             # Página de login
  /register          # Registro de partners

/lib                 # Utilidades y configuración
/prisma              # Schema y migraciones de base de datos
/types               # Tipos TypeScript
```

## 🔧 Variables de Entorno

El archivo `.env` se crea automáticamente con `npm run setup`.

Las variables que puedes configurar:

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-aqui"

# Integraciones Futuras (déjalos vacíos por ahora)
HUBSPOT_API_KEY=""
HUBSPOT_WEBHOOK_SECRET=""
OMNIWALLET_API_URL=""
OMNIWALLET_API_KEY=""
```

**Nota**: Las variables de Hubspot y Omniwallet API son para integraciones futuras. Por ahora déjalas vacías.

## 📊 Base de Datos

### Crear/Resetear la base de datos

```bash
npx prisma migrate dev
```

### Ver la base de datos con Prisma Studio

```bash
npx prisma studio
```

### Crear usuario admin nuevamente

```bash
npm run db:seed
```

## 🌟 Funcionalidades

### Panel de Admin (`/admin`)
- Aprobar/rechazar partners
- Gestionar partners (categorías, estado)
- Crear y asignar leads
- Configurar comisiones por lead
- Ver estadísticas generales

### Portal de Partner (`/partner`)
- Dashboard con estadísticas
- Gestión de leads
- Vista de comisiones ganadas
- Gestión de equipo (invitar miembros)
- Colaboración multi-usuario

### Sistema de Autenticación
- Login unificado para admins y partners
- Registro público de partners (requiere aprobación)
- Sesiones seguras con NextAuth
- Protección de rutas por rol

## 🎨 Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Base de Datos**: SQLite (Prisma ORM)
- **Autenticación**: NextAuth v4
- **Estilos**: Tailwind CSS
- **Lenguaje**: TypeScript
- **Iconos**: Lucide React

## 📝 Scripts Disponibles

```bash
npm run dev          # Inicia servidor de desarrollo
npm run build        # Build para producción
npm run start        # Inicia servidor de producción
npm run setup        # Configuración inicial completa
npm run db:seed      # Crea usuario admin
```

## 🔐 Roles de Usuario

- **ADMIN**: Acceso completo al panel de administración
- **PARTNER_OWNER**: Propietario del partner, puede invitar usuarios
- **PARTNER_USER**: Usuario del equipo de un partner

## 📦 Modelo de Comisiones

Las comisiones se configuran **por lead individual**, no por partner. Esto permite flexibilidad en las tasas según el tipo de lead.

**Tipos de comisión**:
- `AGENCY_PARTNER`: Partners de agencia
- `TECH_PARTNER`: Partners tecnológicos
- `REFERRAL`: Partners de referencia
- `CUSTOM`: Comisión personalizada

## 🚧 Próximas Fases

- [ ] Sistema de pagos e invoicing (generación de PDFs)
- [ ] Gestión de contenidos educativos
- [ ] Integración con Hubspot
- [ ] Integración con intranet de Omniwallet
- [ ] Sistema de notificaciones email

## 🎨 Colores de Omniwallet

- **Primary**: `#3e95b0` (Turquesa)
- **Secondary**: `#255664` (Azul Oscuro)
- **Accent**: `#4dbbdd` (Cyan Claro)
- **Dark**: `#232323` (Negro)
- **Light**: `#f7f7f7` (Gris Claro)

## 📄 Licencia

Omniwallet © 2024
