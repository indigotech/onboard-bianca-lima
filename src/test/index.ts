import { before, after } from 'mocha';
import { startServer, stopServer } from '../api/config/server.js';

let server;
before(async () => {
  server = await startServer(Number(process.env.PORT));
});

after(async () => {
  await stopServer(server.server);
});
