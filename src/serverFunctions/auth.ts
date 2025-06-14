import { createServerFn } from '@tanstack/react-start';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { prisma } from '@/lib/db';
import { auth, getSession } from '@/lib/auth';

export const fetchUserFromSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await getSession();

    if (!session?.user.email) {
      return { email: null, impersonatedBy: null };
    }

    return {
      email: session.user.email,
      impersonatedBy: session.session.impersonatedBy,
    };
  }
);

export const fetchUser = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await getSession();

  const user = await prisma.user.findFirstOrThrow({
    where: { email: session?.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  try {
    return {
      ...user,
      impersonatedBy: session?.session.impersonatedBy,
    };

    // eslint-disable-next-line unused-imports/no-unused-vars
  } catch (error) {
    if (session?.session.token) {
      await auth.api.revokeSession({
        body: {
          token: session.session.token,
        },
        headers: getRequestHeaders() as unknown as Headers,
      });
    }
    throw new Error('Not authenticated');
  }
});

export const UpdateUserName = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const updateUserName = createServerFn({ method: 'POST' })
  .validator(zodValidator(UpdateUserName))
  .handler(async ({ data }) => {
    const session = await getSession();

    if (!session?.user.email) {
      throw new Error('Not authenticated');
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { name: data.name },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return user;
  });
