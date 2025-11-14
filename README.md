# Omniwallet - Portal de Partners

Portal de gestión de partners para Omniwallet.

## Características

- Dashboard de administración con estadísticas en tiempo real
- Gestión de solicitudes de partners pendientes
- Visualización de partners activos
- Sistema de aprobación/rechazo de solicitudes
- Diseño responsive con colores corporativos de Omniwallet

## Tecnologías

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Prisma** - ORM para base de datos
- **SQLite** - Base de datos
- **Tailwind CSS** - Estilos y diseño
- **Lucide React** - Iconos

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar base de datos:
```bash
cp .env.example .env
# La base de datos SQLite se creará automáticamente
```

3. Ejecutar migraciones de Prisma:
```bash
npx prisma migrate dev
npx prisma generate
```

4. Iniciar servidor de desarrollo:
```bash
npm run dev
```

5. Abrir [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
omnipartners/
├── app/
│   ├── admin/              # Dashboard de administración
│   │   ├── components/     # Componentes del admin
│   │   ├── actions.ts      # Server actions
│   │   └── page.tsx        # Página principal del dashboard
│   ├── layout.tsx          # Layout global
│   ├── page.tsx            # Página de inicio
│   └── globals.css         # Estilos globales
├── lib/
│   └── prisma.ts           # Cliente de Prisma
├── prisma/
│   └── schema.prisma       # Schema de base de datos
├── types/
│   └── index.ts            # Tipos TypeScript
└── tailwind.config.js      # Configuración de Tailwind
```

## Colores de Omniwallet

- **Primary**: `#6366f1` (Indigo)
- **Secondary**: `#8b5cf6` (Purple)
- **Accent**: `#ec4899` (Pink)
- **Dark**: `#1e1b4b` (Dark Indigo)
- **Light**: `#f1f5f9` (Light Gray)
