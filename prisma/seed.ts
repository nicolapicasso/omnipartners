import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@omniwallet.com' },
  })

  if (existingAdmin) {
    console.log('✅ El usuario admin ya existe')
    return
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@omniwallet.com',
      password: hashedPassword,
      name: 'Administrador Omniwallet',
      role: 'ADMIN',
    },
  })

  console.log('✅ Usuario admin creado:')
  console.log('   Email: admin@omniwallet.com')
  console.log('   Password: admin123')
  console.log('   ID:', admin.id)
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
