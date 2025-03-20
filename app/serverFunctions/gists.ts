import { createMiddleware, createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

// Middleware
export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const session = await getSession();

  const user = await prisma.user.findFirst({
    where: { email: session?.user.email },
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
        take: z.number().optional(),
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

    const [gists, total] = await Promise.all([
      prisma.gist.findMany({
        where,
        take: data.take,
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
      }),
      prisma.gist.count({ where: { userId: user.id } }),
    ]);

    return {
      gists: gists.map((gist) => ({
        ...gist,
        isFavorite: gist.favoritedBy.length > 0,
        favoritedBy: undefined,
      })),
      total,
    };
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
        forkedFrom: {
          select: {
            id: true,
            title: true,
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
        forkedFrom: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return gist;
  });

// GET /api/gists/public
export const getPublicGists = createServerFn({
  method: 'GET',
})
  .validator(
    zodValidator(
      z.object({
        take: z.number().optional(),
      })
    )
  )
  .handler(async ({ data }) => {
    const publicGists = await prisma.gist.findMany({
      where: {
        isPublic: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        versions: {
          orderBy: {
            version: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: data.take,
    });

    return {
      publicGists,
    };
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

// POST /api/gists/:id/fork
export const forkGist = createServerFn({ method: 'POST' })
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

    // Get the original gist with its latest version
    const originalGist = await prisma.gist.findUnique({
      where: { id: data.gistId, isPublic: true },
      include: {
        versions: {
          orderBy: {
            version: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!originalGist) {
      throw new Error('Gist not found or is not public');
    }

    // Create a new gist as a fork
    const forkedGist = await prisma.gist.create({
      data: {
        title: originalGist.title,
        language: originalGist.language,
        isPublic: originalGist.isPublic,
        userId: user.id,
        forkedFromId: originalGist.id,
      },
    });

    // Create the first version of the forked gist
    await prisma.version.create({
      data: {
        version: 1,
        body: originalGist.versions[0].body,
        gistId: forkedGist.id,
      },
    });

    // Increment the fork count on the original gist
    await prisma.gist.update({
      where: { id: originalGist.id },
      data: {
        forksCount: {
          increment: 1,
        },
      },
    });

    return forkedGist;
  });
