import { scrypt as scryptAsync, randomBytes } from 'crypto';

const saltRounds = 16;

export const hashPassword = (password: string): Promise<string> => {
  const salt = randomBytes(saltRounds).toString('hex');
  return new Promise((resolve, reject) => {
    scryptAsync(password, salt, 64, (err, derivedKey) => {
      if (err) {
        return reject(err);
      }
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
};

export const verifyPassword = (password: string, hashedPassword: string): Promise<boolean> => {
  const [salt, storedHash] = hashedPassword.split(':');
  return new Promise((resolve, reject) => {
    scryptAsync(password, salt, 64, (err, derivedKey) => {
      if (err) {
        return reject(err);
      }
      resolve(storedHash === derivedKey.toString('hex'));
    });
  });
};
