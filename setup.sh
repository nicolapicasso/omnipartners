#!/bin/bash

echo "🚀 Configurando Omniwallet Partner Portal..."
echo ""

# Check if .env exists
if [ -f .env ]; then
  echo "⚠️  El archivo .env ya existe. ¿Quieres sobrescribirlo? (y/N)"
  read -r response
  if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "Manteniendo .env existente..."
  else
    echo "📝 Copiando .env.example a .env..."
    cp .env.example .env
    echo "✅ Archivo .env creado"
  fi
else
  echo "📝 Creando archivo .env desde .env.example..."
  cp .env.example .env
  echo "✅ Archivo .env creado"
fi

echo ""
echo "📦 Instalando dependencias..."
npm install

echo ""
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

echo ""
echo "🗄️  Creando base de datos y ejecutando migraciones..."
npx prisma migrate dev --name init

echo ""
echo "🌱 Creando usuario administrador inicial..."
npm run db:seed

echo ""
echo "✅ ¡Configuración completada!"
echo ""
echo "👤 Usuario Admin creado:"
echo "   Email: admin@omniwallet.com"
echo "   Password: admin123"
echo ""
echo "🚀 Para iniciar el servidor:"
echo "   npm run dev"
echo ""
echo "📖 Luego visita: http://localhost:3000"
