'use server';

import { db } from '@/app/lib/db';

export async function getUsers() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    console.log('[getUsers] Found users:', users.length);
    return users;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}

export async function createUser(data: {
  name: string;
  avatarUrl: string;
}) {
  console.log('[createUser] Creating user:', data);
  try {
    const user = await db.user.create({
      data: {
        name: data.name,
        avatarUrl: data.avatarUrl,
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    console.log('[createUser] User created:', user.id);
    return user;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw new Error('Failed to create user');
  }
}

export async function getUserById(id: string) {
  console.log('[getUserById] Finding user:', id);
  try {
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
    console.log('[getUserById] User found:', user?.id);
    return user;
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
}
