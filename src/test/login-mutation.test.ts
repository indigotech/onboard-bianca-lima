import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { hashPassword } from '../utilits/hash-password.js';
import './index.js';

const prisma = new PrismaClient();

describe('Login Mutation', () => {
  const url = `http://localhost:${process.env.PORT}`;
  const loginMutation = `#graphql
      mutation Login($email: String!, $password: String!) {
        login(data: { email: $email, password: $password }) {
          user {
            id
            name
            email
            birthDate
          }
          token
        }
      }
    `;

  beforeEach(async () => {
    await prisma.user.deleteMany();
    const hashedPassword = await hashPassword('senha123');
    await prisma.user.create({
      data: {
        name: 'User Name',
        email: 'user@example.com',
        password: hashedPassword,
        birthDate: '1990-04-25',
      },
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should login successfully with correct credentials', async () => {
    const variables = {
      email: "user@example.com",
      password: "senha123",
    };
    const response = await axios.post(url, {
      query: loginMutation,
      variables: variables,
    });

    expect(response.data.data.login).to.have.property('user');
    expect(response.data.data.login).to.have.property('token');
    expect(response.data.data.login.user.name).to.equal('User Name');
    expect(response.data.data.login.user.birthDate).to.equal('1990-04-25');
    expect(response.data.data.login.user.email).to.equal('user@example.com');
  });

  it('should fail to login with incorrect credentials', async () => {
    const variables = {
      email: "wronguser@example.com",
      password: "wrongpassword123",
    };

    const response = await axios.post(url, {
      query: loginMutation,
      variables: variables,
    });

    expect(response.data.errors[0].extensions.code).to.equal('BAD_USER_INPUT');
    expect(response.data.errors[0].message).to.equal('Invalid email or password');
  });
});
