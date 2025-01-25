'use server';

import { FormattedLink } from '@/app/types/link';
import { User } from '@/app/types/user';
import { prisma } from '@/lib/prisma';
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

    return links.map((link) => ({
      ...link,
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
      voteCount: link.votes.length,
      voters: link.votes.map((vote) => ({
        id: vote.user.id,
        name: vote.user.name,
        avatarUrl: vote.user.avatarUrl,
      })),
      votes: link.votes.map((vote) => ({
        ...vote,
        link: {
          id: link.id,
          url: link.url,
          title: link.title,
        },
      })),
      hasVoted: false,
      user: {
        id: link.createdById,
        name: link.createdBy.name,
        avatarUrl: link.createdBy.avatarUrl,
      },
      comments: link.comments.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
      })),
    }));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    throw new Error('Failed to fetch links');
  }
}

export async function addLink(
  data: { url: string; title?: string; description?: string },
  _user: User
): Promise<FormattedLink> {
  if (!data.url) {
    throw new Error('URL is required');
  }

  try {
    const metadata = await fetchUrlMetadata(data.url);
    const result = await prisma.link.create({
      data: {
        url: data.url,
        title: data.title || metadata.previewTitle || data.url,
        description: data.description || metadata.previewDescription,
        createdById: _user.id,
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
      ...result,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
      voteCount: result.votes.length,
      voters: result.votes.map((vote) => ({
        id: vote.user.id,
        name: vote.user.name,
        avatarUrl: vote.user.avatarUrl,
      })),
      votes: result.votes.map((vote) => ({
        ...vote,
        link: {
          id: result.id,
          url: result.url,
          title: result.title,
        },
      })),
      hasVoted: false,
      user: {
        id: result.createdById,
        name: result.createdBy.name,
        avatarUrl: result.createdBy.avatarUrl,
      },
      comments: result.comments.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
      })),
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    throw new Error('Failed to add link');
  }
}

export async function editLink(
  data: { id: string; url: string; title?: string; description?: string },
  _user: User
): Promise<FormattedLink> {
  if (!data.url) {
    throw new Error('URL is required');
  }

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
      voteCount: link.votes.length,
      voters: link.votes.map((vote) => ({
        id: vote.user.id,
        name: vote.user.name,
        avatarUrl: vote.user.avatarUrl,
      })),
      votes: link.votes.map((vote) => ({
        ...vote,
        link: {
          id: link.id,
          url: link.url,
          title: link.title,
        },
      })),
      hasVoted: false,
      user: {
        id: link.createdById,
        name: link.createdBy.name,
        avatarUrl: link.createdBy.avatarUrl,
      },
      comments: link.comments.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
      })),
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    throw new Error('Failed to edit link');
  }
}

export async function removeLink(id: string): Promise<void> {
  try {
    await prisma.link.delete({
      where: { id },
    });
    revalidatePath('/');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    throw new Error('Failed to remove link');
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    throw new Error('Failed to vote');
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    throw new Error('Failed to unvote');
  }
}

export async function addComment(
  linkId: string,
  content: string,
  user: User
): Promise<FormattedLink> {
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
      voteCount: link.votes.length,
      voters: link.votes.map((vote) => ({
        id: vote.user.id,
        name: vote.user.name,
        avatarUrl: vote.user.avatarUrl,
      })),
      votes: link.votes.map((vote) => ({
        ...vote,
        link: {
          id: link.id,
          url: link.url,
          title: link.title,
        },
      })),
      hasVoted: false,
      user: {
        id: link.createdById,
        name: link.createdBy.name,
        avatarUrl: link.createdBy.avatarUrl,
      },
      comments: link.comments.map((comment) => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
      })),
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    throw new Error('Failed to add comment');
  }
}
