import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const resolvers = {
  Query: {
    hello: () => 'Hello, World!',
  },
  Mutation: {
    createUser: async (parent, args) => {
      const { data } = args;
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
