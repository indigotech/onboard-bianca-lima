import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utilits/hash-password.js';

const prisma = new PrismaClient();

export async function seed(length: number = 50) {
  const hashedPassword = await hashPassword('password123');
  const users = [];

  for (let i = 0; i < length; i++) {
    const user = await prisma.user.create({
      data: {
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        password: hashedPassword,
        birthDate: new Date().toISOString().split('T')[0],
      },
    });
    users.push(user);
  }

  return users;
}

try {
  await seed();
  await prisma.$disconnect();
} catch (e) {
  console.error(e);
}
