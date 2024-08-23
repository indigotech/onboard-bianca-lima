import { startServer } from './api/config/server.js';
import * as dotenv from 'dotenv';

dotenv.config();

await startServer(Number(process.env.PORT));
