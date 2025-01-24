import { createMiddleware, createServerFn } from '@tanstack/start';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';
import { prisma } from '@/libs/db';
import { useAppSession } from '@/libs/session';

// Middleware
export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const session = await useAppSession();

  const user = await prisma.user.findFirst({
    where: { email: session.data.userEmail },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return next({
    context: {
      user,
    },
  });
});

// GET /api/gists
export const getGists = createServerFn({
  method: 'GET',
})
  .middleware([authMiddleware])
  .validator(
    zodValidator(
      z.object({
        search: z.string().optional(),
        language: z.string().optional(),
        isPublic: z.boolean().optional(),
        favoritesOnly: z.boolean().optional(),
      })
    )
  )
  .handler(async ({ data, context }) => {
    const user = context.user;

    const where = {
      userId: user.id,
      ...(data.search
        ? {
            OR: [
              { title: { contains: data.search } },
              { versions: { some: { body: { contains: data.search } } } },
            ],
          }
        : {}),
      ...(data.language ? { language: data.language } : {}),
      ...(typeof data.isPublic === 'boolean'
        ? { isPublic: data.isPublic }
        : {}),
      ...(data.favoritesOnly
        ? {
            favoritedBy: {
              some: {
                id: user.id,
              },
            },
          }
        : {}),
    };

    const gists = await prisma.gist.findMany({
      where,
      include: {
        versions: true,
        favoritedBy: {
          where: {
            id: user.id,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return gists.map((gist) => ({
      ...gist,
      isFavorite: gist.favoritedBy.length > 0,
      favoritedBy: undefined,
    }));
  });

// GET /api/gists/:id
export const getGist = createServerFn({
  method: 'GET',
})
  .middleware([authMiddleware])
  .validator(
    zodValidator(
      z.object({
        id: z.string(),
      })
    )
  )
  .handler(async ({ data, context }) => {
    const user = context.user;

    const gist = await prisma.gist.findUnique({
      where: { id: data.id, userId: user.id },
      include: {
        versions: {
          orderBy: {
            version: 'desc',
          },
        },
        favoritedBy: {
          where: {
            id: user.id,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!gist) return null;

    return {
      ...gist,
      isFavorite: gist.favoritedBy.length > 0,
      favoritedBy: undefined,
    };
  });

// GET /api/gists/:id/public
export const getPublicGist = createServerFn({
  method: 'GET',
})
  .validator(
    zodValidator(
      z.object({
        id: z.string(),
      })
    )
  )
  .handler(async ({ data }) => {
    const gist = await prisma.gist.findUnique({
      where: { id: data.id, isPublic: true },
      include: {
        versions: {
          orderBy: {
            version: 'desc',
          },
        },
      },
    });

    return gist;
  });

// POST /api/gists
export const createGist = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    zodValidator(
      z.object({
        title: z.string(),
        body: z.string(),
        language: z.string(),
        isPublic: z.boolean(),
      })
    )
  )
  .handler(async ({ data, context }) => {
    const user = context.user;

    const gist = await prisma.gist.create({
      data: {
        title: data.title,
        language: data.language,
        isPublic: data.isPublic,
        userId: user.id,
      },
    });

    await prisma.version.create({
      data: {
        version: 1,
        body: data.body,
        gistId: gist.id,
      },
    });

    return gist;
  });

// PATCH /api/gists/:id
export const updateGist = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    zodValidator(
      z.object({
        id: z.string(),
        title: z.string(),
        body: z.string(),
        language: z.string(),
        isPublic: z.boolean(),
      })
    )
  )
  .handler(async ({ data, context }) => {
    const user = context.user;

    const versions = await prisma.version.findMany({
      where: { gistId: data.id },
      orderBy: {
        version: 'desc',
      },
    });

    const gist = await prisma.gist.update({
      where: { id: data.id, userId: user.id },
      data: {
        title: data.title,
        language: data.language,
        isPublic: data.isPublic,
      },
    });

    await prisma.version.create({
      data: {
        version: versions[0].version + 1,
        body: data.body,
        gistId: gist.id,
      },
    });

    return gist;
  });

// DELETE /api/gists/:id
export const deleteGist = createServerFn({
  method: 'POST',
})
  .middleware([authMiddleware])
  .validator(
    z.object({
      gistId: z.string(),
    })
  )
  .handler(async ({ data, context }) => {
    const user = context.user;

    await prisma.version.deleteMany({
      where: {
        gistId: data.gistId,
      },
    });

    await prisma.gist.delete({
      where: { id: data.gistId, userId: user.id },
    });

    return;
  });

// POST /api/gists/:id/favorite
export const toggleFavorite = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    zodValidator(
      z.object({
        gistId: z.string(),
      })
    )
  )
  .handler(async ({ data, context }) => {
    const user = context.user;

    const favorite = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        favorites: {
          where: { id: data.gistId },
        },
      },
    });

    if (favorite?.favorites.length) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          favorites: {
            disconnect: { id: data.gistId },
          },
        },
      });
      return false;
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          favorites: {
            connect: { id: data.gistId },
          },
        },
      });
      return true;
    }
  });
