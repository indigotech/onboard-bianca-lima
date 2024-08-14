import { describe, it, beforeEach } from 'mocha';
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
  it('should return a valid login response with mock data', async () => {
    const loginMutation = `#graphql
    mutation {
      login(data: {
        email: "user@example.com", 
        password: "senha123"
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
    expect(response.data.data.login.user.email).to.equal('user@example.com');
  });
});
