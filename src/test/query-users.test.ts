import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { generateToken } from '../utilits/verify-token.js';
import { seed } from '../scripts/seeds.js';

const prisma = new PrismaClient();

const url = `http://localhost:${process.env.PORT}`;
const validToken = generateToken(1, '1h');
let users;
describe('Users Query', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
    users = await seed(50);
    users.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should return users with pagination', async () => {
    const query = `#graphql
        query {
          users(skip: 0, take: 5) {
            users {
              name
              email
              birthDate
            }
            totalUsers
            hasMore
            hasPrevious
          }
        }
        `;

    const response = await axios.post(
      url,
      { query },
      {
        headers: { Authorization: `Bearer ${validToken}` },
      },
    );

    expect(response.data.data.users.users).to.have.lengthOf(5);
    expect(response.data.data.users.totalUsers).to.be.greaterThanOrEqual(20);
    expect(response.data.data.users.hasMore).to.equal(true);
    expect(response.data.data.users.hasPrevious).to.equal(false);
    expect(response.data.data.users.users[0].email).to.equal(users[0].email);
    expect(response.data.data.users.users[1].email).to.equal(users[1].email);
    expect(response.data.data.users.users[2].email).to.equal(users[2].email);
    expect(response.data.data.users.users[3].email).to.equal(users[3].email);
    expect(response.data.data.users.users[4].email).to.equal(users[4].email);
  });

  it('should skip and take users correctly', async () => {
    const query = `#graphql
        query {
          users(skip: 5, take: 5) {
            users {
              name
              email
              birthDate
            }
            totalUsers
            hasMore
            hasPrevious
          }
        }
        `;

    const response = await axios.post(
      url,
      { query },
      {
        headers: { Authorization: `Bearer ${validToken}` },
      },
    );

    expect(response.data.data.users.users).to.have.lengthOf(5);
    expect(response.data.data.users.hasMore).to.equal(true);
    expect(response.data.data.users.hasPrevious).to.equal(true);
    expect(response.data.data.users.users[0].email).to.equal(users[5].email);
    expect(response.data.data.users.users[1].email).to.equal(users[6].email);
    expect(response.data.data.users.users[2].email).to.equal(users[7].email);
    expect(response.data.data.users.users[3].email).to.equal(users[8].email);
    expect(response.data.data.users.users[4].email).to.equal(users[9].email);
  });
});
