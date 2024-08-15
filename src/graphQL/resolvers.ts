import { PrismaClient } from '@prisma/client';
import { CustomError } from '../errors/custom-error.js';
import { hashPassword, verifyPassword } from '../utilits/hash-password.js';
import { verifyToken } from '../utilits/verify-token.js';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;
const JWT_SECRET = 'secret_key';


const resolvers = {
  Query: {
    hello: () => 'Hello, World!',
  },
  Mutation: {
    createUser: async (parent, args, context) => {
      const { data } = args;

      if (!context.headers.authorization) {
        throw new CustomError(401, 'No token provided', 'Authentication required');
      }

      const token = context.headers.authorization.split(' ')[1];
      try {
        await verifyToken(token); 
      } catch {
        throw new CustomError(401, 'Invalid token', 'Authentication failed');
      }

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
        throw new CustomError(400, 'Email is required', 'MISSING_EMAIL');
      }

      const user = await prisma.user.findUnique({ 
        where: { email: data.email },
      });

      if (!user) {
        throw new CustomError(400, 'Invalid email or password', 'INVALID_CREDENTIALS');
      }
      const hashedPassword = await verifyPassword(data.password, user.password);
      if (!hashedPassword) {
        throw new CustomError(400, 'Invalid email or password', 'INVALID_CREDENTIALS');
      }

      const expiresIn = args.rememberMe ? '1w' : '1h';
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn });
    
      return {
        user,
        token,
      };
    },
  },
};

export default resolvers;
