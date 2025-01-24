'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { User } from '@/app/types/user';

interface CreateUserData {
  name: string;
  avatarUrl: string;
}

interface UpdateUserData {
  name: string;
  avatarUrl: string;
}

export async function getUsers(): Promise<User[]> {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        votes: {
          include: {
            url: true,
          },
        },
      },
    });
    return users;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw new Error('Failed to fetch users');
  }
}

export async function createUser(data: CreateUserData): Promise<User> {
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
    });

    revalidatePath('/');
    return user;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new Error('User with this name already exists');
      }
    }
    console.error('Failed to create user:', error);
    throw new Error('Failed to create user');
  }
}

export async function updateUser(id: string, data: UpdateUserData): Promise<User> {
  if (!id) {
    throw new Error('User ID is required');
  }

  if (!data?.name || !data?.avatarUrl) {
    throw new Error('Name and avatar are required');
  }

  const trimmedName = data.name.trim();
  if (!trimmedName) {
    throw new Error('Name is required');
  }

  try {
    // First check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    // Then check for duplicate names
    const duplicateUser = await prisma.user.findFirst({
      where: { 
        name: trimmedName,
        NOT: { id },
      },
    });

    if (duplicateUser) {
      throw new Error('User with this name already exists');
    }

    // If all checks pass, update the user
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: trimmedName,
        avatarUrl: data.avatarUrl,
      },
    });

    if (!user) {
      throw new Error('Failed to update user');
    }

    revalidatePath('/');
    return user;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new Error('User with this name already exists');
      }
      if (error.code === 'P2025') {
        throw new Error('User not found');
      }
    }
    
    if (error instanceof Error) {
      console.error('Failed to update user:', error.message);
      throw error;
    }
    
    console.error('Failed to update user:', error);
    throw new Error('Failed to update user');
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath('/');
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw new Error('Failed to delete user');
  }
}

export async function toggleVote(urlId: string, userId: string): Promise<void> {
  try {
    const existingVote = await prisma.vote.findFirst({
      where: {
        urlId,
        userId,
      },
    });

    if (existingVote) {
      await prisma.vote.delete({
        where: {
          id: existingVote.id,
        },
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
  } catch (error) {
    console.error('Failed to toggle vote:', error);
    throw new Error('Failed to toggle vote');
  }
}
