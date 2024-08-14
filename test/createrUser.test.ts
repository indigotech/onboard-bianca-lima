import { describe, it, before, after, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { startServer, stopServer } from '../src/server.js'; 
import { PrismaClient } from '@prisma/client';
import { ApolloServer } from '@apollo/server';
import axios from 'axios';

const prisma = new PrismaClient();

export const createUserMutationTests = (url: string) => {
  describe('Create User Mutation', () => {
    beforeEach(async () => {
      await prisma.user.deleteMany();
    });
  
    afterEach(async () => {
      await prisma.user.deleteMany();
    });
  
    it('should create a new user', async () => {
      const createUserMutation = `#graphql
        mutation {
          createUser(data: {
            name: "bia",
            email: "bia@example.com",
            password: "senha123",
            birthDate: "1990-01-01"
          }) {
            id
            name
            email
            birthDate
          }
        }
      `;
  
      const response = await axios.post(url, {
        query: createUserMutation,
      });
  
      // Verifica a resposta
      expect(response.data.data.createUser).to.have.property('id');
      expect(response.data.data.createUser.name).to.equal("bia");
      expect(response.data.data.createUser.email).to.equal("bia@example.com");
      expect(response.data.data.createUser.birthDate).to.equal("1990-01-01");
  
      // Verifica se o usuário foi criado no banco de dados
      const userInDb = await prisma.user.findUnique({
        where: { email: "bia@example.com" },
      });
      expect(userInDb).to.not.be.null;
      expect(userInDb!.name).to.equal("bia");
      expect(userInDb!.email).to.equal("bia@example.com");
      expect(userInDb!.birthDate).to.equal("1990-01-01");
    });
  });
}
