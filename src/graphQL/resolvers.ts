import { PrismaClient } from '@prisma/client';
import { CustomError } from '../errors/custom-error.js';
import { hashPassword, verifyPassword } from '../utilits/hash-password.js';
import { authenticateToken, generateToken } from '../utilits/verify-token.js';

const prisma = new PrismaClient();
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;

const resolvers = {
  Query: {
    user: async (parent, args, context) => {
      const { id } = args;

      await authenticateToken(context);

      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
      });

      if (!user) {
        throw CustomError.userNotFound();
      }
      return user;
    },

    users: async (parent, args: { skip: number; take: number }, context) => {
      await authenticateToken(context);

      const { skip = 0, take = 10 } = args;
      const users = prisma.user.findMany({
        skip,
        take,
        orderBy: {
          name: 'asc',
        },
      });

      const totalUsers = await prisma.user.count();

      return {
        users,
        totalUsers,
        hasMore: skip + take < totalUsers,
        hasPrevious: skip > 0,
      };
    },
  },
  Mutation: {
    createUser: async (parent, args, context) => {
      const { data } = args;

      await authenticateToken(context);

      if (!passwordRegex.test(data.password)) {
        throw CustomError.unsecurityPassword();
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser) {
        throw CustomError.emailInUse();
      }

      const hashedPassword = await hashPassword(data.password);
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

    login: async (parent, args) => {
      const { data } = args;
      if (!data.email) {
        throw CustomError.invalidCredentials();
      }
      const user = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        throw CustomError.invalidCredentials();
      }
      const hashedPassword = await verifyPassword(data.password, user.password);
      if (!hashedPassword) {
        throw CustomError.invalidCredentials();
      }

      const expiresIn = args.rememberMe ? '1w' : '1h';
      const token = generateToken(user.id, expiresIn);
      return {
        user,
        token,
      };
    },
  },
};

export default resolvers;
