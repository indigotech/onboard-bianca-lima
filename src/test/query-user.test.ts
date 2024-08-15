import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import exp from 'constants';

const prisma = new PrismaClient();
const JWT_SECRET = 'secret_key';
const url = `http://localhost:${process.env.PORT}`;
let validToken = jwt.sign({ userId: 1 }, JWT_SECRET, { expiresIn: '1h' });

describe('User Query', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should return user data for a valid ID', async () => {
    const user = await prisma.user.create({
        data: {
          name: "Existing User",
          email: "existing@example.com",
          password: "Test1234!",
          birthDate: "1990-01-01",
        },
    });

    
    const query = `
      query {
        user(id: ${user.id}) {
          id
          name
          email
          birthDate
        }
      }
    `;

    const response = await axios.post(url, { query }, {
      headers: { Authorization: `Bearer ${validToken}` },
    });

    expect(response.data.data.user).to.have.property('id');
    expect(Number(response.data.data.user.id)).to.equal(user.id);
    expect(response.data.data.user.name).to.equal("Existing User");
    expect(response.data.data.user.email).to.equal("existing@example.com");
    expect(response.data.data.user.birthDate).to.equal("1990-01-01");
    
  });

  it('should return an error for an invalid ID', async () => {
    const invalidUserId = 999; 
    const query = `
      query {
        user(id: ${invalidUserId}) {
          id
          name
          email
          birthDate
        }
      }
    `;

    try {
      const response = await axios.post(url, { query }, {
        headers: { Authorization: `Bearer ${validToken}` },
      });
    } catch (error) {
      expect(error.response.data.errors[0].code).to.equal(404);
      expect(error.response.data.errors[0].message).to.include('User not found');
    }
  });
});
