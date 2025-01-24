'use server';

import { fr } from '@/app/translations/fr';
import { FormattedUser } from '@/app/types/user';
import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getUsers(): Promise<FormattedUser[]> {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return users.map((user: User) => ({
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));
  } catch {
    throw new Error(fr.errors.failedToFetchUsers);
  }
}

export async function createUser(data: {
  name: string;
  avatarUrl?: string;
}): Promise<FormattedUser> {
  try {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        avatarUrl: data.avatarUrl,
      },
    });

    revalidatePath('/');
    return {
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  } catch {
    throw new Error(fr.errors.failedToAddUser);
  }
}

export async function updateUser(
  id: string,
  data: { name?: string; avatarUrl?: string }
): Promise<FormattedUser> {
  try {
    const user = await prisma.user.update({
      where: { id },
      data,
    });

    revalidatePath('/');
    return {
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  } catch {
    throw new Error(fr.errors.failedToUpdateUser);
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath('/');
  } catch {
    throw new Error(fr.errors.failedToDeleteUser);
  }
}

export async function signOut(): Promise<void> {
  try {
    // Implement your sign out logic here
    // This might involve clearing session, cookies, etc.
    revalidatePath('/');
  } catch (error) {
    console.error('Failed to sign out:', error);
    throw new Error(fr.errors.failedToSignOut);
  }
}
