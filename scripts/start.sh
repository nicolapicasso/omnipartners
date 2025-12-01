#!/bin/sh
set -e

echo "Syncing database schema..."
npx prisma db push --skip-generate

echo "Checking if admin user exists..."
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!existingAdmin) {
      const hash = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          email: 'admin@omniwallet.com',
          password: hash,
          name: 'Admin',
          role: 'ADMIN'
        }
      });
      console.log('Admin user created: admin@omniwallet.com / admin123');
    } else {
      console.log('Admin user already exists, skipping seed.');
    }
  } catch (error) {
    console.error('Error during seed:', error.message);
  } finally {
    await prisma.\$disconnect();
  }
}

seedAdmin();
"

echo "Starting application..."
exec node server.js
