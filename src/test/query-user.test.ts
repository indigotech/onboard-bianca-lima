import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { generateToken } from '../utilits/verify-token.js';

describe('User Query', () => {
  const prisma = new PrismaClient();
  const url = `http://localhost:${process.env.PORT}`;
  const validToken = generateToken(1, '1h');
  const query = `
    query ($userId: Int!) {
      user(id: $userId) {
        id
        name
        email
        birthDate
      }
    }
  `;

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should return user data for a valid ID', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'Test1234!',
        birthDate: '1990-01-01',
      },
    });

    const variables = {
      userId: user.id,
    };

    const response = await axios.post(
      url,
      { query, variables },
      {
        headers: { Authorization: `Bearer ${validToken}` },
      },
    );

    const expectedUser = {
      id: user.id.toString(),
      name: 'Existing User',
      email: 'existing@example.com',
      birthDate: '1990-01-01',
    };
    expect(response.data.data.user).to.have.property('id');
    expect(response.data.data.user).to.deep.equal(expectedUser);
  });

  it('should return an error for an invalid ID', async () => {
    const invalidUserId = 999;

    const variables = {
      userId: invalidUserId,
    };

    const response = await axios.post(
      url,
      { query, variables },
      {
        headers: { Authorization: `Bearer ${validToken}` },
      },
    );

    expect(response.data.errors[0].extensions.code).to.equal('BAD_USER_INPUT');
    expect(response.data.errors[0].message).to.include('User not found');
  });
});
