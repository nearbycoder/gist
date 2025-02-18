import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { getWebRequest } from '@tanstack/start/server';

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
  },
});

export const getSession = async () => {
  const request = getWebRequest();
  const session = await auth.api.getSession({
    headers: request?.headers as unknown as Headers,
  });

  return session;
};
