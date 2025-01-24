'use server';

import { db } from '@/app/lib/db';
import { User } from '../types/user';
import { revalidatePath } from 'next/cache';

type ServerActionResponse<T> = {
  data?: T;
  error?: string;
};

export async function getUsers(): Promise<ServerActionResponse<User[]>> {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return {
      data: users.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
      }))
    };
  } catch (e) {
    const error = e as Error;
    return { error: error.message || 'Failed to fetch users' };
  }
}

export async function createUser(input: { name: string; avatarUrl: string }): Promise<ServerActionResponse<User>> {
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
      where: { name }
    });

    if (existing) {
      return { error: 'A user with this name already exists' };
    }

    const user = await db.user.create({
      data: {
        name,
        avatarUrl: input.avatarUrl,
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    revalidatePath('/');
    
    return {
      data: {
        ...user,
        createdAt: user.createdAt.toISOString(),
      }
    };
  } catch (e) {
    const error = e as Error;
    if ((error as any)?.code === 'P2002') {
      return { error: 'A user with this name already exists' };
    }
    return { error: error.message || 'Failed to create user' };
  }
}

export async function getUserById(id: string): Promise<ServerActionResponse<User>> {
  try {
    if (!id) {
      return { error: 'User ID is required' };
    }

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    return {
      data: {
        ...user,
        createdAt: user.createdAt.toISOString(),
      }
    };
  } catch (e) {
    const error = e as Error;
    return { error: error.message || 'Failed to get user' };
  }
}
