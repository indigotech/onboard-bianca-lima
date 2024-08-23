import jwt from 'jsonwebtoken';
import { CustomError } from '../errors/custom-error.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyToken = (token: string) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
};

export const generateToken = (id: number, expiresIn: string) => {
  return jwt.sign({ userId: id }, JWT_SECRET, { expiresIn });
};

export async function authenticateToken(context) {
  if (!context.headers.authorization || !context.headers.authorization.startsWith('Bearer')) {
    throw CustomError.authenticationRequired();
  }
  const token = context.headers.authorization.split(' ')[1];
  try {
    await verifyToken(token);
  } catch {
    throw CustomError.authenticationFalied();
  }
}
