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

export async function createUrl(data: { url: string; title: string; description: string; userId: string }) {
  try {
    const metadata = await fetchUrlMetadata(data.url);
    
    if (!metadata) {
      throw new Error('Could not fetch URL metadata');
    }

    const url = await prisma.url.create({
      data: {
        url: data.url,
        title: data.title,
        description: data.description,
        previewImage: metadata.previewImage,
        previewTitle: metadata.previewTitle,
        previewDescription: metadata.previewDescription,
        previewFavicon: metadata.previewFavicon,
        previewSiteName: metadata.previewSiteName,
        createdById: data.userId,
      },
      include: {
        votes: {
          include: {
            user: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
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

export async function updateUrl(id: string, data: { url: string; title: string; description: string; userId: string }) {
  try {
    const metadata = await fetchUrlMetadata(data.url);
    
    if (!metadata) {
      throw new Error('Could not fetch URL metadata');
    }

    const url = await prisma.url.update({
      where: { id, createdById: data.userId },
      data: {
        url: data.url,
        title: data.title,
        description: data.description,
        previewImage: metadata.previewImage,
        previewTitle: metadata.previewTitle,
        previewDescription: metadata.previewDescription,
        previewFavicon: metadata.previewFavicon,
        previewSiteName: metadata.previewSiteName,
      },
      include: {
        votes: {
          include: {
            user: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
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
