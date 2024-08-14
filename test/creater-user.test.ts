import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import './index.js';

const prisma = new PrismaClient();

describe('Create User Mutation', () => {
  const url = `http://localhost:${process.env.PORT}`;
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });
  afterEach(async () => {
    await prisma.user.deleteMany();
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

    const response = await axios.post(url, {
      query: createUserMutation,
    });

    expect(response.data.data.createUser).to.have.property('id');
    expect(response.data.data.createUser.name).to.equal('bia');
    expect(response.data.data.createUser.email).to.equal('bia@example.com');
    expect(response.data.data.createUser.birthDate).to.equal('1990-01-01');

    const userInDb = await prisma.user.findUnique({
      where: { email: 'bia@example.com' },
    });
    expect(userInDb).to.not.be.null;
    expect(userInDb!.id).to.equal(Number(response.data.data.createUser.id));
    expect(userInDb!.name).to.equal('bia');
    expect(userInDb!.email).to.equal('bia@example.com');
    expect(userInDb!.birthDate).to.equal('1990-01-01');
  });

  it('should return an error if the email is already taken', async () => {      
    await prisma.user.create({
      data: {
        name: "Existing User",
        email: "existing@example.com",
        password: "Test1234!",
        birthDate: "1990-01-01",
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

    try{
      const response = await axios.post(url, {
        query: createUserMutation,
      });  
    }catch (error){
      expect(error.response.data.errors[0].message).to.equal('Email is already in use');
      expect(error.response.data.errors[0].code).to.equal(409);
    }
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

    try {
      await axios.post(url, {
        query: createUserMutation,
      });
    } catch (error) {
      expect(error.response.data.errors[0].message).to.equal('Password does not meet security requirements');
      expect(error.response.data.errors[0].code).to.equal(400);
    }
  });
});
