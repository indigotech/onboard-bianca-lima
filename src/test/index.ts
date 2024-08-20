import { before, after } from 'mocha';
import { startServer, stopServer } from '../server.js';

let server;
before(async () => {
  server = await startServer(Number(process.env.PORT));
});

after(async () => {
  await stopServer(server.server);
});
