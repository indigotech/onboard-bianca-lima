import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utilits/hash-password.js';

const prisma = new PrismaClient();

export async function seed(length?: number) {
  const newLength = length || 50;
  const hashedPassword = await hashPassword('password123');
  const users: { name: string; email: string; password: string; birthDate: string }[] = [];

  for (let i = 0; i < 50; i++) {
    users.push({
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      password: hashedPassword,
      birthDate: new Date().toDateString(),
    });
  }

  await prisma.user.createMany({
    data: users,
  });
  
  return users;
}

try {
  await seed();
  await prisma.$disconnect();
} catch (e) {
  console.error(e);
}
