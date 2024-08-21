import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { generateToken } from '../utilits/verify-token.js';
import { seed } from '../scripts/seeds.js';

const prisma = new PrismaClient();

describe('Users Query', () => {
  const url = `http://localhost:${process.env.PORT}`;
  const validToken = generateToken(1, '1h');
  const totalUsers = 15;
  let users;
  const query = `#graphql
    query Users($skip: Int, $take: Int) {
      users(skip: $skip, take: $take) {
        users {
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
        totalUsers
        hasMore
        hasPrevious
      }
    }`;

  beforeEach(async () => {
    await prisma.user.deleteMany();
    users = await seed(totalUsers);
    users.sort((a, b) => a.name.localeCompare(b.name));
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should return the first page of users with correct pagination metadata', async () => {
    const variables = {
      skip: 0,
      take: 5,
    };

    const response = await axios.post(
      url,
      { query, variables },
      {
        headers: { Authorization: `Bearer ${validToken}` },
      },
    );

    const returnedUsers = response.data.data.users.users;
    expect(returnedUsers).to.have.lengthOf(variables.take);
    expect(response.data.data.users.totalUsers).to.be.greaterThanOrEqual(totalUsers);
    expect(response.data.data.users.hasMore).to.equal(true);
    expect(response.data.data.users.hasPrevious).to.equal(false);

    returnedUsers.forEach((user, index) => {
      const expectedUser = users[variables.skip + index];
      expect(user.id).to.equal(String(expectedUser.id));
      expect(user.name).to.equal(expectedUser.name);
      expect(user.email).to.equal(expectedUser.email);
      expect(user.birthDate).to.equal(expectedUser.birthDate);
      user.addresses.forEach((addresses, index2) => {
        expect(addresses.cep).to.equal(expectedUser.addresses[index2].cep);
        expect(addresses.city).to.equal(expectedUser.addresses[index2].city);
        expect(addresses.complement).to.equal(expectedUser.addresses[index2].complement);
        expect(addresses.neighborhood).to.equal(expectedUser.addresses[index2].neighborhood);
        expect(addresses.state).to.equal(expectedUser.addresses[index2].state);
        expect(addresses.street).to.equal(expectedUser.addresses[index2].street);
        expect(addresses.streetNumber).to.equal(expectedUser.addresses[index2].streetNumber);
      });
    });
  });

  it('should return the second page of users with correct pagination metadata', async () => {
    const variables = {
      skip: 5,
      take: 5,
    };

    const response = await axios.post(
      url,
      { query, variables },
      {
        headers: { Authorization: `Bearer ${validToken}` },
      },
    );

    const returnedUsers = response.data.data.users.users;
    expect(returnedUsers).to.have.lengthOf(variables.take);
    expect(response.data.data.users.totalUsers).to.be.greaterThanOrEqual(totalUsers);
    expect(response.data.data.users.hasMore).to.equal(true);
    expect(response.data.data.users.hasPrevious).to.equal(true);

    returnedUsers.forEach((user, index) => {
      const expectedUser = users[variables.skip + index];
      expect(user.id).to.equal(String(expectedUser.id));
      expect(user.name).to.equal(expectedUser.name);
      expect(user.email).to.equal(expectedUser.email);
      expect(user.birthDate).to.equal(expectedUser.birthDate);
      user.addresses.forEach((addresses, index2) => {
        expect(addresses.cep).to.equal(expectedUser.addresses[index2].cep);
        expect(addresses.city).to.equal(expectedUser.addresses[index2].city);
        expect(addresses.complement).to.equal(expectedUser.addresses[index2].complement);
        expect(addresses.neighborhood).to.equal(expectedUser.addresses[index2].neighborhood);
        expect(addresses.state).to.equal(expectedUser.addresses[index2].state);
        expect(addresses.street).to.equal(expectedUser.addresses[index2].street);
        expect(addresses.streetNumber).to.equal(expectedUser.addresses[index2].streetNumber);
      });
    });
  });

  it('should correctly paginate to the last page of users', async () => {
    const variables = {
      skip: 10,
      take: 5,
    };

    const response = await axios.post(
      url,
      { query, variables },
      {
        headers: { Authorization: `Bearer ${validToken}` },
      },
    );

    const returnedUsers = response.data.data.users.users;
    expect(returnedUsers).to.have.lengthOf(variables.take);
    expect(response.data.data.users.totalUsers).to.be.greaterThanOrEqual(totalUsers);
    expect(response.data.data.users.hasMore).to.equal(false);
    expect(response.data.data.users.hasPrevious).to.equal(true);

    returnedUsers.forEach((user, index) => {
      const expectedUser = users[variables.skip + index];
      expect(user.id).to.equal(String(expectedUser.id));
      expect(user.name).to.equal(expectedUser.name);
      expect(user.email).to.equal(expectedUser.email);
      expect(user.birthDate).to.equal(expectedUser.birthDate);
      user.addresses.forEach((addresses, index2) => {
        expect(addresses.cep).to.equal(expectedUser.addresses[index2].cep);
        expect(addresses.city).to.equal(expectedUser.addresses[index2].city);
        expect(addresses.complement).to.equal(expectedUser.addresses[index2].complement);
        expect(addresses.neighborhood).to.equal(expectedUser.addresses[index2].neighborhood);
        expect(addresses.state).to.equal(expectedUser.addresses[index2].state);
        expect(addresses.street).to.equal(expectedUser.addresses[index2].street);
        expect(addresses.streetNumber).to.equal(expectedUser.addresses[index2].streetNumber);
      });
    });
  });

  it('should return an empty list when skip exceeds the total number of users', async () => {
    const variables = {
      skip: 15,
      take: 5,
    };

    const response = await axios.post(
      url,
      { query, variables },
      {
        headers: { Authorization: `Bearer ${validToken}` },
      },
    );

    const returnedUsers = response.data.data.users.users;
    expect(returnedUsers).to.have.lengthOf(0);
    expect(response.data.data.users.totalUsers).to.be.greaterThanOrEqual(totalUsers);
    expect(response.data.data.users.hasMore).to.equal(false);
    expect(response.data.data.users.hasPrevious).to.equal(true);
  });
});
