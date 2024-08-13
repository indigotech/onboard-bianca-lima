import { describe, it, expect, before, after, beforeEach, afterEach } from 'chai';
import { startServer, stopServer } from '../src/server.js'; 
import { PrismaClient } from '@prisma/client';
import { ApolloServer } from '@apollo/server';
import axios from 'axios';

const prisma = new PrismaClient();
let server;
let url: string;

before(async () => {
    server = await startServer(Number(process.env.PORT));
});

after(async () => {
  await stopServer(server); 
  await prisma.$disconnect(); 
});

describe('Create User Mutation', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should create a new user', async () => {
    const createUserMutation = `#graphql
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          name
          email
        }
      }
    `;

    const input = {
      name: "Test User",
      email: "testuser@example.com",
      password: "Test1234!"
    };

    const response = await axios.post(url, {
      query: createUserMutation,
      variables: { input },
    });

    // Verifica a resposta
    expect(response.data.data.createUser).to.have.property('id');
    expect(response.data.data.createUser.name).to.equal(input.name);
    expect(response.data.data.createUser.email).to.equal(input.email);

    // Verifica se o usuário foi criado no banco de dados
    const userInDb = await prisma.user.findUnique({
      where: { email: input.email },
    });
    expect(userInDb).to.not.be.null;
    expect(userInDb!.name).to.equal(input.name);
    expect(userInDb!.email).to.equal(input.email);
  });
});
