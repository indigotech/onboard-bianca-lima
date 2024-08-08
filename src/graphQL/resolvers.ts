import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const resolvers = {
  Query: {
    hello: () => 'Hello, World!',
  },
  Mutation: {
    createUser: async (parent, args) => {
      const { data } = args;
      if (data.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (!/\d/.test(data.password) || !/[a-zA-Z]/.test(data.password)) {
        throw new Error('Password must contain at least 1 letter and 1 digit');
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error('Email is already in use');
      }

      const newUser = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
          birthDate: data.birthDate,
        },
      });
      return newUser;
    },
  },
};

export default resolvers;
