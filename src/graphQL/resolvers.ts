import { PrismaClient } from '@prisma/client';
import { scrypt, randomBytes } from 'crypto';

const prisma = new PrismaClient();
const salt = randomBytes(32).toString("hex");

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

      const hashedPassword = await scrypt(data.password, salt, 64, (err, derivedKey)=>{
        if(err) throw err;
        console.log(derivedKey.toString());
      });
      
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
