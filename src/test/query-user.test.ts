import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { generateToken } from '../utils/verify-token.js';
import { seed } from '../data/seeds/seeds.js';

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
        addresses {
          cep
          city
          complement
          id
          neighborhood
          state
          street
          streetNumber
        }
      }
    }
  `;

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should return user data for a valid ID', async () => {
    const users = await seed(1);

    const variables = {
      userId: Number(users[0].id),
    };

    const response = await axios.post(
      url,
      { query, variables },
      {
        headers: { Authorization: `Bearer ${validToken}` },
      },
    );
    console.log(response.data.errors);

    const expectedUser = users[0];
    const user = response.data.data.user;
    expect(user.id).to.equal(String(expectedUser.id));
    expect(user.name).to.equal(expectedUser.name);
    expect(user.email).to.equal(expectedUser.email);
    expect(user.birthDate).to.equal(expectedUser.birthDate);
    user.addresses.forEach((addresses, index) => {
      expect(addresses.cep).to.equal(expectedUser.addresses[index].cep);
      expect(addresses.city).to.equal(expectedUser.addresses[index].city);
      expect(addresses.complement).to.equal(expectedUser.addresses[index].complement);
      expect(addresses.neighborhood).to.equal(expectedUser.addresses[index].neighborhood);
      expect(addresses.state).to.equal(expectedUser.addresses[index].state);
      expect(addresses.street).to.equal(expectedUser.addresses[index].street);
      expect(addresses.streetNumber).to.equal(expectedUser.addresses[index].streetNumber);
    });
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
