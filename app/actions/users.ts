'use server';

import { fr } from '@/app/translations/fr';
import { FormattedUser } from '@/app/types/user';
import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

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

export async function getCurrentSession() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('sessionId')?.value;
    const userId = cookieStore.get('userId')?.value;

    if (!sessionId || !userId) {
      return null;
    }

    const session = await prisma.session.findUnique({
      where: {
        id: sessionId,
        userId: userId,
        active: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      // Clear invalid cookies
      cookieStore.delete('sessionId');
      cookieStore.delete('userId');
      return null;
    }

    return {
      id: session.id,
      user: {
        ...session.user,
        createdAt: session.user.createdAt.toISOString(),
        updatedAt: session.user.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
}

export async function createSession(userId: string) {
  try {
    // First, invalidate any existing sessions for this user
    await prisma.session.updateMany({
      where: {
        userId: userId,
        active: true,
      },
      data: {
        active: false,
      },
    });

    // Create new session
    const session = await prisma.session.create({
      data: {
        id: randomUUID(),
        userId: userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Set cookies
    const cookieStore = await cookies();
    cookieStore.set('userId', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
    cookieStore.set('sessionId', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return session.id;
  } catch (error) {
    console.error('Error creating session:', error);
    throw new Error(fr.errors.failedToCreateSession);
  }
}

export async function createUser(data: {
  name: string;
  avatarUrl?: string;
}): Promise<FormattedUser & { sessionId: string }> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: data.name,
          avatarUrl: data.avatarUrl,
        },
      });

      // Create session
      const session = await tx.session.create({
        data: {
          id: randomUUID(),
          userId: user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      // Set cookies
      const cookieStore = cookies();
      (await cookieStore).set('userId', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
      (await cookieStore).set('sessionId', session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });

      return {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        sessionId: session.id,
      };
    });

    revalidatePath('/');
    return result;
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
    const cookieStore = await cookies();
    cookieStore.delete('userId');
    cookieStore.delete('sessionId');
    revalidatePath('/');
  } catch (error) {
    console.error('Failed to sign out:', error);
    throw new Error(fr.errors.failedToSignOut);
  }
}
