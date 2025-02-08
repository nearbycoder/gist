import { createMiddleware, createServerFn } from '@tanstack/start';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';
import { prisma } from '@/libs/db';
import { useAppSession } from '@/libs/session';

// Middleware to ensure only admin users can access these functions
const adminMiddleware = createMiddleware().server(async ({ next }) => {
  const session = await useAppSession();

  const user = await prisma.user.findFirst({
    where: { email: session.data.userEmail },
  });

  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }

  return next({
    context: {
      user,
    },
  });
});

// GET /api/admin/users
export const fetchUsers = createServerFn({
  method: 'GET',
})
  .middleware([adminMiddleware])
  .handler(async () => {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      orderBy: {
        email: 'asc',
      },
    });
  });

// POST /api/admin/users/role
export const updateUserRole = createServerFn({
  method: 'POST',
})
  .middleware([adminMiddleware])
  .validator(
    zodValidator(
      z.object({
        userId: z.string(),
        role: z.enum(['ADMIN', 'MEMBER']),
      })
    )
  )
  .handler(async ({ data, context }) => {
    // Prevent admins from modifying their own role
    if (context.user.id === data.userId) {
      throw new Error('Cannot modify your own role');
    }

    return prisma.user.update({
      where: { id: data.userId },
      data: { role: data.role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  });

// GET /api/admin/gists
export const fetchAllGists = createServerFn({
  method: 'GET',
})
  .middleware([adminMiddleware])
  .validator(
    zodValidator(
      z.object({
        search: z.string().optional(),
        userId: z.string().optional(),
        page: z.number().int().min(1).default(1),
        perPage: z.number().int().min(1).max(100).default(10),
      })
    )
  )
  .handler(async ({ data }) => {
    const skip = (data.page - 1) * data.perPage;

    const where = {
      AND: [
        data.search
          ? {
              OR: [
                { title: { contains: data.search } },
                { versions: { some: { body: { contains: data.search } } } },
              ],
            }
          : {},
        data.userId ? { userId: data.userId } : {},
      ],
    };

    const [gists, total] = await Promise.all([
      prisma.gist.findMany({
        where,
        select: {
          id: true,
          title: true,
          language: true,
          isPublic: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: data.perPage,
      }),
      prisma.gist.count({ where }),
    ]);

    return {
      gists,
      pagination: {
        total,
        page: data.page,
        perPage: data.perPage,
        totalPages: Math.ceil(total / data.perPage),
      },
    };
  });

// GET /api/admin/users/list
export const fetchUsersList = createServerFn({
  method: 'GET',
})
  .middleware([adminMiddleware])
  .handler(async () => {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
      orderBy: {
        email: 'asc',
      },
    });
  });
