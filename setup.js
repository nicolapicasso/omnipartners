#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando Omniwallet Partner Portal...\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (fs.existsSync(envPath)) {
  console.log('⚠️  El archivo .env ya existe. Se mantendrá el existente.');
} else {
  console.log('📝 Creando archivo .env desde .env.example...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ Archivo .env creado');
}

console.log('\n📦 Instalando dependencias...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error instalando dependencias');
  process.exit(1);
}

console.log('\n🔧 Generando cliente de Prisma...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error generando cliente de Prisma');
  process.exit(1);
}

console.log('\n🗄️  Creando base de datos y ejecutando migraciones...');
try {
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error creando base de datos');
  process.exit(1);
}

console.log('\n🌱 Creando usuario administrador inicial...');
try {
  execSync('npm run db:seed', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error creando usuario admin');
  process.exit(1);
}

console.log('\n✅ ¡Configuración completada!');
console.log('\n👤 Usuario Admin creado:');
console.log('   Email: admin@omniwallet.com');
console.log('   Password: admin123');
console.log('\n🚀 Para iniciar el servidor:');
console.log('   npm run dev');
console.log('\n📖 Luego visita: http://localhost:3000\n');
