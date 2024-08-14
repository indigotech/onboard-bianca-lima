import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import axios from 'axios';
import { startServer, stopServer } from '../src/server.js';
import * as dotenv from 'dotenv';
import { createUserMutationTests } from './createrUser.test.js';

let server;
before(async () => {
  server = await startServer(Number(process.env.PORT));
});
after(async () => {
  await stopServer(server.server);
});

describe('Apollo Server', () => {
  it('should return "Hello world!"', async () => {
    const response = await axios.post(server.url, {
      query: `
        query {
          hello
        }
      `,
    });
    const data = response.data;
    expect(data).to.have.property('data');
    expect(data.data.hello).to.equal('Hello, World!');
  });

  it('create user mutation', async () => {
    await createUserMutationTests(server.url);
  })
  
});
