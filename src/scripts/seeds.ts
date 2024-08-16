import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utilits/hash-password.js';

const prisma = new PrismaClient();

async function seed() {
  const hashedPassword = await hashPassword('password123');
  const users = await Array.from({ length: 50 }).map((_, i) => ({
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    password: hashedPassword,
    birthDate: new Date().toDateString(),
  }));

  await prisma.user.createMany({
    data: users,
  });
}

seed()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
