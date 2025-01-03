import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

export function hashPassword(password: string) {
  return new Promise<string>((resolve, reject) => {
    if (!process.env.PASSWORD_SALT) {
      throw new Error('PASSWORD_SALT is not set');
    }

    crypto.pbkdf2(
      password,
      process.env.PASSWORD_SALT,
      100000,
      64,
      'sha256',
      (err, derivedKey) => {
        if (err) {
          reject(err);
        } else {
          resolve(derivedKey.toString('hex'));
        }
      }
    );
  });
}
