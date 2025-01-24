'use server';

import { prisma } from '@/lib/prisma';
import { User } from '@/app/types/user';
import { FormattedLink } from '@/app/types/link';
import { fetchUrlMetadata } from '@/lib/url-metadata';
import { revalidatePath } from 'next/cache';

export async function getLinks(): Promise<FormattedLink[]> {
  try {
    const links = await prisma.link.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return links.map(link => ({
      ...link,
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
      votes: link.votes.map(vote => ({
        ...vote,
        createdAt: vote.createdAt.toISOString()
      })),
      comments: link.comments.map(comment => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString()
      }))
    }));
  } catch (error) {
    console.error('Error fetching links:', error);
    throw error;
  }
}

export async function addLink(data: { url: string; title?: string; description?: string }, user: User): Promise<FormattedLink> {
  try {
    const metadata = await fetchUrlMetadata(data.url);
    const link = await prisma.link.create({
      data: {
        url: data.url,
        title: data.title || metadata.previewTitle || data.url,
        description: data.description || metadata.previewDescription,
        createdById: user.id,
        previewImage: metadata.previewImage,
        previewTitle: metadata.previewTitle,
        previewDescription: metadata.previewDescription,
        previewFavicon: metadata.previewFavicon,
        previewSiteName: metadata.previewSiteName,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    revalidatePath('/');
    return {
      ...link,
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
      votes: link.votes.map(vote => ({
        ...vote,
        createdAt: vote.createdAt.toISOString()
      })),
      comments: link.comments.map(comment => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString()
      }))
    };
  } catch (error) {
    console.error('Error adding link:', error);
    throw error;
  }
}

export async function editLink(
  data: { id: string; url: string; title?: string; description?: string },
  user: User
): Promise<FormattedLink> {
  try {
    const metadata = await fetchUrlMetadata(data.url);
    const link = await prisma.link.update({
      where: { id: data.id },
      data: {
        url: data.url,
        title: data.title || metadata.previewTitle || data.url,
        description: data.description || metadata.previewDescription,
        previewImage: metadata.previewImage,
        previewTitle: metadata.previewTitle,
        previewDescription: metadata.previewDescription,
        previewFavicon: metadata.previewFavicon,
        previewSiteName: metadata.previewSiteName,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    revalidatePath('/');
    return {
      ...link,
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
      votes: link.votes.map(vote => ({
        ...vote,
        createdAt: vote.createdAt.toISOString()
      })),
      comments: link.comments.map(comment => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString()
      }))
    };
  } catch (error) {
    console.error('Error editing link:', error);
    throw error;
  }
}

export async function removeLink(id: string, user: User): Promise<void> {
  try {
    await prisma.link.delete({
      where: { id },
    });
    revalidatePath('/');
  } catch (error) {
    console.error('Error removing link:', error);
    throw error;
  }
}

export async function vote(linkId: string, user: User): Promise<void> {
  try {
    await prisma.vote.create({
      data: {
        linkId,
        userId: user.id,
      },
    });
    revalidatePath('/');
  } catch (error) {
    console.error('Error voting:', error);
    throw error;
  }
}

export async function unvote(linkId: string, user: User): Promise<void> {
  try {
    await prisma.vote.delete({
      where: {
        userId_linkId: {
          userId: user.id,
          linkId,
        },
      },
    });
    revalidatePath('/');
  } catch (error) {
    console.error('Error unvoting:', error);
    throw error;
  }
}

export async function addComment(linkId: string, content: string, user: User): Promise<FormattedLink> {
  try {
    const link = await prisma.link.update({
      where: { id: linkId },
      data: {
        comments: {
          create: {
            content,
            userId: user.id,
          },
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    revalidatePath('/');
    return {
      ...link,
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
      votes: link.votes.map(vote => ({
        ...vote,
        createdAt: vote.createdAt.toISOString()
      })),
      comments: link.comments.map(comment => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString()
      }))
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}
