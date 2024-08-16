import {describe, it, beforeEach, afterEach} from 'mocha';
import { expect } from 'chai';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { generateToken } from '../utilits/verify-token.js';
import { seed } from '../scripts/seeds.js';

const prisma = new PrismaClient();

const url = `http://localhost:${process.env.PORT}`;
const validToken = generateToken(1, '1h');

describe('Users Query', () =>{
    beforeEach(async () => {
        await prisma.user.deleteMany();
        seed(50);
    });

});