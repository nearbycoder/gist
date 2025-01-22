import { createServerFn } from '@tanstack/start';
import { zodValidator } from '@tanstack/zod-adapter';
import z from 'node_modules/zod/lib';
import { useAppSession } from '@/libs/session';
import { hashPassword, prisma } from '@/libs/db';

export const fetchUserFromSession = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await useAppSession();

    if (!session.data.userEmail) {
      return null;
    }

    return {
      email: session.data.userEmail,
    };
  }
);

export const fetchUser = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await useAppSession();

  try {
    return await prisma.user.findFirstOrThrow({
      where: { email: session.data.userEmail },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    // eslint-disable-next-line unused-imports/no-unused-vars
  } catch (error) {
    await session.clear();
    throw new Error('Not authenticated');
  }
});

export const UserRegister = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ['confirm'],
  });

export const registerUser = createServerFn({ method: 'POST' })
  .validator(zodValidator(UserRegister))
  .handler(async ({ data }) => {
    const currentUser = await prisma.user.findFirst({
      where: { email: data.email },
    });

    if (data.password !== data.confirm) {
      return {
        data: {
          error: 'Passwords do not match',
        },
      };
    }

    if (currentUser) {
      return {
        data: {
          error: 'Email or password is incorrect',
        },
      };
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
      },
    });

    // Create a session
    const session = await useAppSession();

    // Store the user's email in the session
    await session.update({
      userEmail: user.email,
    });

    return user;
  });

export const UserLogin = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginUser = createServerFn({ method: 'POST' })
  .validator(zodValidator(UserLogin))
  .handler(async ({ data }) => {
    const user = await prisma.user.findFirst({ where: { email: data.email } });

    if (!user || (await hashPassword(data.password)) !== user.password) {
      return {
        data: {
          error: 'Email or password is incorrect',
        },
      };
    }

    // Create a session
    const session = await useAppSession();

    // Store the user's email in the session
    await session.update({
      userEmail: user.email,
    });

    return user;
  });

export const logOut = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await useAppSession();

  session.clear();

  return {
    success: true,
  };
});
