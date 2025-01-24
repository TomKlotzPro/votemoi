'use server';

import { db } from '@/app/lib/db';
import { User, FormattedUser } from '../types/user';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

type ServerActionResponse<T> = {
  data?: T;
  error?: string;
};

type UserSelect = {
  id: string;
  name: string;
  avatarUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

const userSelect = {
  id: true,
  name: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function getUsers(): Promise<ServerActionResponse<FormattedUser[]>> {
  try {
    const users = await db.user.findMany({
      select: userSelect,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return {
      data: users.map(formatUser)
    };
  } catch (e) {
    const error = e as Error;
    return { error: error.message || 'Failed to fetch users' };
  }
}

export async function createUser(input: { name: string; avatarUrl: string }): Promise<ServerActionResponse<FormattedUser>> {
  try {
    if (!input?.name || !input?.avatarUrl) {
      return { error: 'Name and avatar URL are required' };
    }

    const name = input.name.trim();
    if (!name) {
      return { error: 'Name cannot be empty' };
    }

    // Check if user exists
    const existing = await db.user.findUnique({
      where: { name },
      select: userSelect
    });

    if (existing) {
      return { error: 'A user with this name already exists' };
    }

    const user = await db.user.create({
      data: {
        name,
        avatarUrl: input.avatarUrl,
      },
      select: userSelect,
    });

    revalidatePath('/');
    
    return {
      data: formatUser(user)
    };
  } catch (e) {
    const error = e as Error;
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { error: 'A user with this name already exists' };
    }
    return { error: error.message || 'Failed to create user' };
  }
}

export async function getUserById(id: string): Promise<ServerActionResponse<FormattedUser>> {
  try {
    if (!id) {
      return { error: 'User ID is required' };
    }

    const user = await db.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      return { error: 'User not found' };
    }

    return {
      data: formatUser(user)
    };
  } catch (e) {
    const error = e as Error;
    return { error: error.message || 'Failed to get user' };
  }
}

function formatUser(user: UserSelect): FormattedUser {
  return {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}
