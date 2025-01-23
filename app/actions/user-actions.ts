'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getUsers() {
  try {
    return await prisma.user.findMany({
      include: {
        votes: {
          include: {
            url: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw new Error('Failed to fetch users');
  }
}

export async function createUser(data: {
  name: string;
  avatarUrl: string;
}) {
  try {
    const existingUser = await prisma.user.findFirst({
      where: { name: data.name },
    });

    if (existingUser) {
      throw new Error('User with this name already exists');
    }

    const user = await prisma.user.create({
      data: {
        name: data.name,
        avatarUrl: data.avatarUrl,
      },
      include: {
        votes: {
          include: {
            url: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });
    revalidatePath('/users');
    return user;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  }
}

export async function updateUser(id: string, data: {
  name: string;
  avatarUrl: string;
}) {
  try {
    const existingUser = await prisma.user.findFirst({
      where: { 
        name: data.name,
        NOT: { id },
      },
    });

    if (existingUser) {
      throw new Error('User with this name already exists');
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        avatarUrl: data.avatarUrl,
      },
      include: {
        votes: {
          include: {
            url: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });
    revalidatePath('/users');
    return user;
  } catch (error) {
    console.error('Failed to update user:', error);
    throw error;
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath('/users');
    return true;
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw new Error('Failed to delete user');
  }
}

export async function toggleVote(urlId: string, userId: string) {
  try {
    const existingVote = await prisma.vote.findFirst({
      where: {
        urlId,
        userId,
      },
    });

    if (existingVote) {
      await prisma.vote.delete({
        where: { id: existingVote.id },
      });
    } else {
      await prisma.vote.create({
        data: {
          urlId,
          userId,
        },
      });
    }

    revalidatePath('/');
    revalidatePath('/users');
    return true;
  } catch (error) {
    console.error('Failed to toggle vote:', error);
    throw new Error('Failed to toggle vote');
  }
}
