'use server';

import { User } from '@/app/types/user';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

interface CreateUserData {
  name: string;
  avatarUrl: string;
  email: string;
}

interface UpdateUserData {
  name: string;
  avatarUrl: string;
  email: string;
}

export async function getUsers(): Promise<User[]> {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        votes: {
          include: {
            link: true,
          },
        },
        links: true,
        comments: true,
      },
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.createdAt, // Since there's no updatedAt in the schema, we'll use createdAt
      votes: user.votes.map((vote) => ({
        id: vote.id,
        createdAt: vote.createdAt,
        userId: vote.userId,
        linkId: vote.linkId,
      })),
      links: user.links,
      comments: user.comments,
    }));
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
        email: data.email,
      },
      include: {
        votes: true,
        links: true,
        comments: true,
      },
    });

    revalidatePath('/');

    return {
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.createdAt,
      votes: user.votes.map((vote) => ({
        id: vote.id,
        createdAt: vote.createdAt,
        userId: vote.userId,
        linkId: vote.linkId,
      })),
      links: user.links,
      comments: user.comments,
    };
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

export async function updateUser(
  id: string,
  data: UpdateUserData
): Promise<User> {
  if (!id) {
    throw new Error('User ID is required');
  }

  if (!data?.name || !data?.avatarUrl || !data?.email) {
    throw new Error('Name, avatar and email are required');
  }

  const trimmedName = data.name.trim();
  if (!trimmedName) {
    throw new Error('Name is required');
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: trimmedName,
        avatarUrl: data.avatarUrl,
        email: data.email,
      },
      include: {
        votes: true,
        links: true,
        comments: true,
      },
    });

    revalidatePath('/');

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      avatarUrl: updatedUser.avatarUrl,
      email: updatedUser.email,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.createdAt,
      votes: updatedUser.votes.map((vote) => ({
        id: vote.id,
        createdAt: vote.createdAt,
        userId: vote.userId,
        linkId: vote.linkId,
      })),
      links: updatedUser.links,
      comments: updatedUser.comments,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new Error('User with this name already exists');
      }
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

export async function toggleVote(
  linkId: string,
  userId: string
): Promise<void> {
  try {
    const existingVote = await prisma.vote.findFirst({
      where: {
        linkId,
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
          linkId,
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
