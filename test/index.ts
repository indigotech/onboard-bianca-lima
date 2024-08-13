import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import axios from 'axios';
import { startServer, stopServer } from '../src/server.js';
import * as dotenv from 'dotenv';

let server;
before(async () => {
  server = await startServer(Number(process.env.PORT));
});
after(async () => {
  await stopServer(server);
});

describe('Apollo Server', () => {
  it('should return "Hello world!"', async () => {
    const response = await axios.post('http://localhost:4001', {
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
});
