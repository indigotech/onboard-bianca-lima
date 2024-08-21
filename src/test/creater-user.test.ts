import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { generateToken } from '../utilits/verify-token.js';
import './index.js';

const prisma = new PrismaClient();

describe('Create User Mutation', () => {
  const url = `http://localhost:${process.env.PORT}`;
  const validToken = generateToken(1, '1h');

  const createUserMutation = `
  mutation ($data: UserInput!) {
    createUser(data: $data) {
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
  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should fail without a token', async () => {
    const variables = {
      data: {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
        birthDate: '1990-01-01',
        addresses: [
          {
            cep: 'cep-test',
            city: 'city-test',
            complement: 'complement-test',
            neighborhood: 'neighborhood-test',
            state: 'state-test',
            street: 'street-test',
            streetNumber: 'street-number-test',
          },
        ],
      },
    };

    const response = await axios.post(url, { query: createUserMutation, variables });

    expect(response.data.errors[0].extensions.code).to.equal('BAD_USER_INPUT');
    expect(response.data.errors[0].message).to.include('No token provided');
  });

  it('should fail with an invalid token', async () => {
    const variables = {
      data: {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
        birthDate: '1990-01-01',
        addresses: [
          {
            cep: 'cep-test',
            city: 'city-test',
            complement: 'complement-test',
            neighborhood: 'neighborhood-test',
            state: 'state-test',
            street: 'street-test',
            streetNumber: 'street-number-test',
          },
        ],
      },
    };

    const response = await axios.post(
      url,
      {
        query: createUserMutation,
        variables,
      },
      {
        headers: { Authorization: 'Bearer invalid_token' },
      },
    );

    expect(response.data.errors[0].extensions.code).to.equal('BAD_USER_INPUT');
    expect(response.data.errors[0].message).to.include('Invalid token');
  });

  it('should create a new user', async () => {
    const variables = {
      data: {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
        birthDate: '1990-01-01',
        addresses: [
          {
            cep: 'cep-test',
            city: 'city-test',
            complement: 'complement-test',
            neighborhood: 'neighborhood-test',
            state: 'state-test',
            street: 'street-test',
            streetNumber: 'street-number-test',
          },
        ],
      },
      include: { adresses: true },
    };

    const response = await axios.post(
      url,
      {
        query: createUserMutation,
        variables,
      },
      {
        headers: { Authorization: `Bearer ${validToken}` },
      },
    );
    expect(response.data.data.createUser).to.have.property('id');
    expect(response.data.data.createUser.name).to.equal(variables.data.name);
    expect(response.data.data.createUser.email).to.equal(variables.data.email);
    expect(response.data.data.createUser.birthDate).to.equal(variables.data.birthDate);
    response.data.data.createUser.addresses.forEach((addresses, index) => {
      expect(addresses.cep).to.equal(variables.data.addresses[index].cep);
      expect(addresses.city).to.equal(variables.data.addresses[index].city);
      expect(addresses.complement).to.equal(variables.data.addresses[index].complement);
      expect(addresses.neighborhood).to.equal(variables.data.addresses[index].neighborhood);
      expect(addresses.state).to.equal(variables.data.addresses[index].state);
      expect(addresses.street).to.equal(variables.data.addresses[index].street);
      expect(addresses.streetNumber).to.equal(variables.data.addresses[index].streetNumber);
    });
    const userInDb = await prisma.user.findUnique({
      where: { email: variables.data.email },
    });

    expect(userInDb).to.not.equal(null);
    expect(userInDb!.id).to.equal(Number(response.data.data.createUser.id));
    expect(userInDb!.name).to.equal(variables.data.name);
    expect(userInDb!.email).to.equal(variables.data.email);
    expect(userInDb!.birthDate).to.equal(variables.data.birthDate);
  });

  it('should return an error if the email is already taken', async () => {
    await prisma.user.create({
      data: {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'Test1234!',
        birthDate: '1990-01-01',
      },
    });

    const variables = {
      data: {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
        birthDate: '1990-01-01',
        addresses: [
          {
            cep: 'cep-test',
            city: 'city-test',
            complement: 'complement-test',
            neighborhood: 'neighborhood-test',
            state: 'state-test',
            street: 'street-test',
            streetNumber: 'street-number-test',
          },
        ],
      },
    };

    const response = await axios.post(
      url,
      {
        query: createUserMutation,
        variables,
      },
      {
        headers: { Authorization: `Bearer ${validToken}` },
      },
    );

    expect(response.data.errors[0].message).to.equal('Email is already in use');
    expect(response.data.errors[0].extensions.code).to.equal('BAD_USER_INPUT');
  });

  it('should return an error if the password is weak', async () => {
    const variables = {
      data: {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password',
        birthDate: '1990-01-01',
        addresses: [
          {
            cep: 'cep-test',
            city: 'city-test',
            complement: 'complement-test',
            neighborhood: 'neighborhood-test',
            state: 'state-test',
            street: 'street-test',
            streetNumber: 'street-number-test',
          },
        ],
      },
    };

    const response = await axios.post(
      url,
      {
        query: createUserMutation,
        variables,
      },
      {
        headers: { Authorization: `Bearer ${validToken}` },
      },
    );

    expect(response.data.errors[0].message).to.equal('Password does not meet security requirements');
    expect(response.data.errors[0].extensions.code).to.equal('BAD_USER_INPUT');
  });
});
