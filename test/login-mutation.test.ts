import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { hashPassword } from '../src/utilits/hash-password.js';
import './index.js';

const prisma = new PrismaClient();

describe('Login Mutation', () => {
  const url = `http://localhost:${process.env.PORT}`;
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
    const loginMutation = `#graphql
    mutation {
      login(data: {
        email: "user@example.com", 
        password: "senha123",
        }) {
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
    const response = await axios.post(url, {
      query: loginMutation,
    });

    expect(response.data.data.login).to.have.property('user');
    expect(response.data.data.login).to.have.property('token');
    expect(response.data.data.login.user.name).to.equal('User Name');
    expect(response.data.data.login.user.birthDate).to.equal('1990-04-25');
    expect(response.data.data.login.user.email).to.equal('user@example.com');
  });

  it('should fail to login with incorrect credentials', async () => {
    const loginMutation = `#graphql
    mutation {
      login(data: {
        email: "wronguser@example.com", 
        password: "wrongpassword123",
        }) {
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
    try {
      await axios.post(url, { query: loginMutation });
    } catch (error: any) {
      expect(error.response.data.errors[0].code).to.equal(400);
      expect(error.response.data.errors[0].message).to.equal('Invalid email or password');
    }
  });

});
