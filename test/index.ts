import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import axios from 'axios';

import { startServer, stopServer } from '../src/server.js';

describe('Apollo Server', () => {
  let server;
  before(async () => {
    server = await startServer();
  });

  it('should return "Hello world!"', async () => {
    const response = await axios.post('http://localhost:4000', {
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
