import { startServer, stopServer } from './server.js';
import * as dotenv from 'dotenv';

dotenv.config();

const server = await startServer(Number(process.env.PORT));
