'use server';

import { prisma } from '@/lib/prisma';
import { fetchUrlMetadata } from '@/lib/url-metadata';
import { revalidatePath } from 'next/cache';

export async function getUrls() {
  try {
    return await prisma.url.findMany({
      include: {
        votes: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        votes: {
          _count: 'desc',
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch URLs:', error);
    throw new Error('Failed to fetch URLs');
  }
}

export async function createUrl(data: { url: string }) {
  try {
    const metadata = await fetchUrlMetadata(data.url);
    
    if (!metadata) {
      throw new Error('Could not fetch URL metadata');
    }

    const url = await prisma.url.create({
      data: {
        url: data.url,
        title: metadata.title,
        description: metadata.description,
        imageUrl: metadata.imageUrl,
        metaFetched: true,
      },
      include: {
        votes: {
          include: {
            user: true,
          },
        },
      },
    });

    revalidatePath('/');
    return url;
  } catch (error) {
    console.error('Error creating URL:', error);
    throw error;
  }
}

export async function updateUrl(id: string, data: { url: string }) {
  try {
    const metadata = await fetchUrlMetadata(data.url);
    
    if (!metadata) {
      throw new Error('Could not fetch URL metadata');
    }

    const url = await prisma.url.update({
      where: { id },
      data: {
        url: data.url,
        title: metadata.title,
        description: metadata.description,
        imageUrl: metadata.imageUrl,
        metaFetched: true,
      },
      include: {
        votes: {
          include: {
            user: true,
          },
        },
      },
    });

    revalidatePath('/');
    return url;
  } catch (error) {
    console.error('Error updating URL:', error);
    throw error;
  }
}

export async function deleteUrl(id: string) {
  try {
    await prisma.url.delete({
      where: { id },
    });
    revalidatePath('/');
    return true;
  } catch (error) {
    console.error('Error deleting URL:', error);
    throw error;
  }
}

export async function voteForUrl(urlId: string, userId: string) {
  try {
    const vote = await prisma.vote.create({
      data: {
        urlId,
        userId,
      },
      include: {
        user: true,
      },
    });
    revalidatePath('/');
    return vote;
  } catch (error) {
    console.error('Error voting for URL:', error);
    throw error;
  }
}

export async function unvoteForUrl(urlId: string, userId: string) {
  try {
    await prisma.vote.delete({
      where: {
        urlId_userId: {
          urlId,
          userId,
        },
      },
    });
    revalidatePath('/');
    return true;
  } catch (error) {
    console.error('Error removing vote:', error);
    throw error;
  }
}
