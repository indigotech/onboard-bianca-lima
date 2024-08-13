import { PrismaClient } from '@prisma/client';
import { scrypt as scryptAsync, randomBytes } from 'crypto';

const prisma = new PrismaClient();
const saltRounds = 16;
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;

function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    scryptAsync(password, salt, 64, (err, derivedKey) => {
      if (err) {
        return reject(err);
      }
      resolve(derivedKey.toString('hex'));
    });
  });
}

const resolvers = {
  Query: {
    hello: () => 'Hello, World!',
  },
  Mutation: {
    createUser: async (parent, args) => {
      const { data } = args;

      if (!passwordRegex.test(data.password)) {
        throw new Error('Password must be at least 6 characters long and contain at least 1 letter and 1 digit');
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error('Email is already in use');
      }

      const salt = randomBytes(saltRounds).toString('hex');
      const hashedPassword = await hashPassword(data.password, salt);

      const newUser = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          birthDate: data.birthDate,
        },
      });
      return newUser;
    },
  },
};

export default resolvers;
