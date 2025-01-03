'use server';

import { createServerFn } from '@tanstack/start';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';
import { prisma } from '@/libs/db';
import { useAppSession } from '@/libs/session';

export const getGists = createServerFn({
  method: 'GET',
}).handler(async () => {
  const session = await useAppSession();
  const user = await prisma.user.findUnique({
    where: { email: session.data.userEmail },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return await prisma.gist.findMany({
    where: {
      userId: user.id,
    },
    include: {
      versions: true,
    },
  });
});

export const deleteGist = createServerFn({
  method: 'POST',
})
  .validator(
    z.object({
      gistId: z.string(),
    })
  )
  .handler(async ({ data }) => {
    const session = await useAppSession();
    const user = await prisma.user.findUnique({
      where: { email: session.data.userEmail },
    });

    if (!user) {
      throw new Error('User not found');
    }

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

export const updateGist = createServerFn({ method: 'POST' })
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
  .handler(async ({ data }) => {
    const session = await useAppSession();
    const user = await prisma.user.findUnique({
      where: { email: session.data.userEmail },
    });

    if (!user) {
      throw new Error('User not found');
    }

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

export const createGist = createServerFn({ method: 'POST' })
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
  .handler(async ({ data }) => {
    const session = await useAppSession();
    const user = await prisma.user.findUnique({
      where: { email: session.data.userEmail },
    });

    if (!user) {
      throw new Error('User not found');
    }

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

export const getGist = createServerFn()
  .validator(
    zodValidator(
      z.object({
        id: z.string(),
      })
    )
  )
  .handler(async ({ data }) => {
    const session = await useAppSession();
    const user = await prisma.user.findUnique({
      where: { email: session.data.userEmail },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const gist = await prisma.gist.findUnique({
      where: { id: data.id, userId: user.id },
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

export const getPublicGist = createServerFn()
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
