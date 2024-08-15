import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  const users = await Array.from({ length: 50 }).map((_, i) => ({
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    password: 'password123', //adicionar hash
    birthDate: (new Date()).toDateString(),
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
