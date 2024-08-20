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
        }
        totalUsers
        hasMore
        hasPrevious
      }
    }`;

  beforeEach(async () => {
    await prisma.user.deleteMany();
    users = await seed(totalUsers);
    users.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
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

    expect(response.data.data.users.users).to.have.lengthOf(variables.take);
    expect(response.data.data.users.totalUsers).to.be.greaterThanOrEqual(totalUsers);
    expect(response.data.data.users.hasMore).to.equal(true);
    expect(response.data.data.users.hasPrevious).to.equal(false);
    expect(response.data.data.users.users).to.be.deep.equal(
      users
        .slice(variables.skip, variables.take + variables.skip)
        .map((user) => ({ id: String(user.id), name: user.name, email: user.email, birthDate: user.birthDate })),
    );
  });

  it('should return the first page of users with correct pagination metadata', async () => {
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

    expect(response.data.data.users.users).to.have.lengthOf(variables.take);
    expect(response.data.data.users.totalUsers).to.be.greaterThanOrEqual(totalUsers);
    expect(response.data.data.users.hasMore).to.equal(true);
    expect(response.data.data.users.hasPrevious).to.equal(true);
    expect(response.data.data.users.users).to.be.deep.eq(
      users
        .slice(variables.skip, variables.take + variables.skip)
        .map((user) => ({ id: String(user.id), name: user.name, email: user.email, birthDate: user.birthDate })),
    );
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

    expect(response.data.data.users.users).to.have.lengthOf(variables.take);
    expect(response.data.data.users.totalUsers).to.be.greaterThanOrEqual(totalUsers);
    expect(response.data.data.users.hasMore).to.equal(false);
    expect(response.data.data.users.hasPrevious).to.equal(true);
    expect(response.data.data.users.users).to.be.deep.eq(
      users
        .slice(variables.skip, variables.take + variables.skip)
        .map((user) => ({ id: String(user.id), name: user.name, email: user.email, birthDate: user.birthDate })),
    );
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

    expect(response.data.data.users.users).to.have.lengthOf(0);
    expect(response.data.data.users.totalUsers).to.be.greaterThanOrEqual(totalUsers);
    expect(response.data.data.users.hasMore).to.equal(false);
    expect(response.data.data.users.hasPrevious).to.equal(true);
    expect(response.data.data.users.users).to.be.deep.eq(
      users
        .slice(variables.skip, variables.take + variables.skip)
        .map((user) => ({ id: String(user.id), name: user.name, email: user.email, birthDate: user.birthDate })),
    );
  });

});
