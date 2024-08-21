import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utilits/hash-password.js';

const prisma = new PrismaClient();

export async function seed(length: number = 50) {
  const hashedPassword = await hashPassword('password123');
  const users = [];

  for (let i = 0; i < length; i++) {
    const address = [
      {
        cep: `cep-test ${i + 1}`,
        city: `city-test ${i + 1}`,
        complement: `complement-test ${i + 1}`,
        neighborhood: `neighborhood-test ${i + 1}`,
        state: `state-test ${i + 1}`,
        street: `street-test ${i + 1}`,
        streetNumber: `${i + 1}`,
      },
    ];

    const user = await prisma.user.create({
      data: {
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        password: hashedPassword,
        birthDate: new Date().toISOString().split('T')[0],
        addresses: {
          create: address,
        },
      },
      include: { addresses: true },
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
