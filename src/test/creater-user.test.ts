import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { generateToken } from '../utilits/verify-token.js';
import './index.js';

const prisma = new PrismaClient();

describe('Create User Mutation', () => {
  const url = `http://localhost:${process.env.PORT}`;
  const validToken = generateToken(1, '1h');

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });
  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should fail without a token', async () => {
    const createUserMutation = `
      mutation {
        createUser(data: {
          name: "Test User",
          email: "testuser@example.com",
          password: "password123",
          birthDate: "1990-01-01"
        }) {
          id
          name
          email
          birthDate
        }
      }
    `;

    const response = await axios.post(url, { query: createUserMutation });

    expect(response.data.errors[0].extensions.code).to.equal('BAD_USER_INPUT');
    expect(response.data.errors[0].message).to.include('No token provided');
  });

  it('should fail with an invalid token', async () => {
    const createUserMutation = `
      mutation {
        createUser(data: {
          name: "Test User",
          email: "testuser@example.com",
          password: "password123",
          birthDate: "1990-01-01"
        }) {
          id
          name
          email
          birthDate
        }
      }
    `;

    const response = await axios.post(
      url,
      {
        query: createUserMutation,
      },
      {
        headers: { Authorization: 'Bearer invalid_token' },
      },
    );

    expect(response.data.errors[0].extensions.code).to.equal('BAD_USER_INPUT');
    expect(response.data.errors[0].message).to.include('Invalid token');
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

    const response = await axios.post(
      url,
      {
        query: createUserMutation,
      },
      {
        headers: { Authorization: `Bearer ${validToken}` },
      },
    );

    expect(response.data.data.createUser).to.have.property('id');
    expect(response.data.data.createUser.name).to.equal('bia');
    expect(response.data.data.createUser.email).to.equal('bia@example.com');
    expect(response.data.data.createUser.birthDate).to.equal('1990-01-01');

    const userInDb = await prisma.user.findUnique({
      where: { email: 'bia@example.com' },
    });

    expect(userInDb).to.not.equal(null);
    expect(userInDb!.id).to.equal(Number(response.data.data.createUser.id));
    expect(userInDb!.name).to.equal('bia');
    expect(userInDb!.email).to.equal('bia@example.com');
    expect(userInDb!.birthDate).to.equal('1990-01-01');
  });

  it('should return an error if the email is already taken', async () => {
    await prisma.user.create({
      data: {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'Test1234!',
        birthDate: '1990-01-01',
      },
    });

    const createUserMutation = `#graphql
      mutation {
        createUser(data: {
          name: "Existing User",
          email: "existing@example.com",
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

    const response = await axios.post(
      url,
      {
        query: createUserMutation,
      },
      {
        headers: { Authorization: `Bearer ${validToken}` },
      },
    );

    expect(response.data.errors[0].message).to.equal('Email is already in use');
    expect(response.data.errors[0].extensions.code).to.equal('BAD_USER_INPUT');
  });

  it('should return an error if the password is weak', async () => {
    const createUserMutation = `#graphql
      mutation {
        createUser(data: {
          name: "Existing User",
          email: "existing@example.com",
          password: "senha",
          birthDate: "1990-01-01"
        }) {
          id
          name
          email
          birthDate
        }
      }
    `;

    const response = await axios.post(
      url,
      {
        query: createUserMutation,
      },
      {
        headers: { Authorization: `Bearer ${validToken}` },
      },
    );

    expect(response.data.errors[0].message).to.equal('Password does not meet security requirements');
    expect(response.data.errors[0].extensions.code).to.equal('BAD_USER_INPUT');
  });
});
