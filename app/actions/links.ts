'use server';

import { FormattedComment, FormattedLink } from '../types/link';
import { Comment, Link, User, Vote } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { fetchUrlMetadata } from '@/lib/url-metadata';

const formatComment = (comment: Comment & { user: User }): FormattedComment => ({
  id: comment.id,
  userId: comment.userId,
  linkId: comment.linkId,
  content: comment.content,
  createdAt: comment.createdAt.toISOString(),
  updatedAt: comment.updatedAt.toISOString(),
  user: {
    id: comment.user.id,
    name: comment.user.name,
    avatarUrl: comment.user.avatarUrl,
  },
});

const formatLink = (link: Link & { 
  createdBy?: User; 
  votes?: Vote[]; 
  comments?: (Comment & { user?: User })[];
  hasVoted?: boolean;
}): FormattedLink => ({
  id: link.id,
  url: link.url,
  title: link.title,
  description: link.description ?? null,
  imageUrl: link.previewImage ?? null, 
  userId: link.createdById,
  createdAt: link.createdAt instanceof Date 
    ? link.createdAt.toISOString() 
    : link.createdAt,
  updatedAt: link.updatedAt instanceof Date 
    ? link.updatedAt.toISOString() 
    : link.updatedAt,
  comments: (link.comments || []).map(comment => ({
    id: comment.id,
    userId: comment.userId,
    linkId: comment.linkId,
    content: comment.content,
    createdAt: comment.createdAt instanceof Date 
      ? comment.createdAt.toISOString() 
      : comment.createdAt,
    updatedAt: comment.updatedAt instanceof Date 
      ? comment.updatedAt.toISOString() 
      : comment.updatedAt,
    user: {
      id: comment.user?.id || comment.userId,
      name: comment.user?.name || null,
      avatarUrl: comment.user?.avatarUrl || null,
    },
  })),
  voteCount: (link.votes || []).length,
  votedByUsers: (link.votes || []).map(vote => vote.user?.id || ''),
  hasVoted: link.hasVoted ?? false,
  user: {
    id: link.createdById,
    name: link.createdBy?.name || null,
    avatarUrl: link.createdBy?.avatarUrl || null,
  },
  createdBy: link.createdBy ? {
    id: link.createdBy.id,
    name: link.createdBy.name,
    avatarUrl: link.createdBy.avatarUrl,
    createdAt: link.createdAt instanceof Date 
      ? link.createdAt 
      : new Date(link.createdAt),
    updatedAt: link.updatedAt instanceof Date 
      ? link.updatedAt 
      : new Date(link.updatedAt),
  } : undefined,
  createdById: link.createdById,
  previewImage: link.previewImage ?? null,
  previewTitle: link.previewTitle ?? null,
  previewDescription: link.previewDescription ?? null,
  previewFavicon: link.previewFavicon ?? null,
  previewSiteName: link.previewSiteName ?? null,
});

export async function getLinks(
  userId?: string
): Promise<{ links?: FormattedLink[]; error?: string }> {
  try {
    const links = (await prisma.link.findMany({
      orderBy: {
        createdAt: 'desc',
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
          select: {
            id: true,
            createdAt: true,
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
          select: {
            id: true,
            content: true,
            createdAt: true,
            updatedAt: true,
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
    })) as (Link & { createdBy: User; votes: Vote[]; comments: Comment[] })[];

    if (!links) {
      return { links: [] };
    }

    const formattedLinks = links.map(formatLink);

    return { links: formattedLinks };
  } catch {
    throw new Error('Failed to load links');
  }
}

export async function createLink(data: {
  url: string;
  title?: string;
  description?: string;
  userId: string;
}): Promise<{ link?: FormattedLink; error?: string }> {
  if (!data.url || !data.userId) {
    throw new Error('URL and userId are required');
  }

  try {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error('User not found. Please try logging in again.');
    }

    // Extract metadata from URL
    let metadata = {
      previewTitle: '',
      previewDescription: '',
      previewImage: '',
      previewFavicon: '',
      previewSiteName: '',
    };

    try {
      const extractedMetadata = await fetchUrlMetadata(data.url);
      if (extractedMetadata) {
        metadata = {
          previewTitle: extractedMetadata.previewTitle || '',
          previewDescription: extractedMetadata.previewDescription || '',
          previewImage: extractedMetadata.previewImage || '',
          previewFavicon: extractedMetadata.previewFavicon || '',
          previewSiteName: extractedMetadata.previewSiteName || '',
        };
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      // Silently continue with default metadata
    }

    // Get hostname for fallback values
    let hostname = '';
    try {
      hostname = new URL(data.url).hostname;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      hostname = data.url.split('/')[2] || 'unknown site';
    }

    const link = await prisma.link.create({
      data: {
        url: data.url,
        title: data.title || metadata.previewTitle || hostname,
        description: data.description || metadata.previewDescription || '',
        previewTitle: metadata.previewTitle || '',
        previewDescription: metadata.previewDescription || '',
        previewImage: metadata.previewImage || '',
        previewFavicon: metadata.previewFavicon || '',
        previewSiteName: metadata.previewSiteName || hostname,
        createdBy: {
          connect: { id: data.userId },
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

    if (!link) {
      throw new Error('Failed to create link in database');
    }

    const formattedLink = formatLink(link);

    revalidatePath('/');
    return { link: formattedLink };
  } catch {
    throw new Error('Failed to create link');
  }
}

export async function updateLink(data: {
  id: string;
  url: string;
  title: string;
  description?: string;
  userId: string;
}): Promise<{ link?: FormattedLink; error?: string }> {
  try {
    // Extract metadata from URL if URL has changed
    const existingLink = await prisma.link.findUnique({
      where: { id: data.id },
    });

    let metadata = null;
    if (existingLink && existingLink.url !== data.url) {
      metadata = await fetchUrlMetadata(data.url);
    }

    const link = await prisma.link.update({
      where: { id: data.id },
      data: {
        url: data.url,
        title: data.title,
        description: data.description,
        ...(metadata && {
          previewTitle: metadata.previewTitle,
          previewDescription: metadata.previewDescription,
          previewImage: metadata.previewImage,
          previewFavicon: metadata.previewFavicon,
          previewSiteName: metadata.previewSiteName,
        }),
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

    const formattedLink = formatLink(link);

    revalidatePath('/');
    return { link: formattedLink };
  } catch {
    throw new Error('Failed to update link');
  }
}

export async function deleteLink(data: {
  id: string;
  userId: string;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    const link = await prisma.link.findUnique({
      where: { id: data.id },
      include: { createdBy: true },
    });

    if (!link) {
      throw new Error('Link not found');
    }

    if (link.createdById !== data.userId) {
      throw new Error('Not authorized');
    }

    // Delete all related records first
    await prisma.$transaction([
      // Delete all votes for this link
      prisma.vote.deleteMany({
        where: { linkId: data.id },
      }),
      // Delete all comments for this link
      prisma.comment.deleteMany({
        where: { linkId: data.id },
      }),
      // Finally delete the link itself
      prisma.link.delete({
        where: { id: data.id },
      }),
    ]);

    revalidatePath('/');
    return { success: true };
  } catch {
    throw new Error('Failed to delete link');
  }
}

export async function vote(data: { linkId: string; userId: string }): Promise<{
  success?: boolean;
  user?: { id: string; name: string; avatarUrl: string };
  error?: string;
}> {
  try {
    const existingVote = await prisma.vote.findFirst({
      where: {
        linkId: data.linkId,
        userId: data.userId,
      },
    });

    if (existingVote) {
      throw new Error('Already voted for this link');
    }

    const newVote = await prisma.vote.create({
      data: {
        link: {
          connect: { id: data.linkId },
        },
        user: {
          connect: { id: data.userId },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    revalidatePath('/');
    return { success: true, user: newVote.user };
  } catch {
    throw new Error('Failed to vote for link');
  }
}

export async function unvote(data: {
  linkId: string;
  userId: string;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    await prisma.vote.deleteMany({
      where: {
        linkId: data.linkId,
        userId: data.userId,
      },
    });

    revalidatePath('/');
    return { success: true };
  } catch {
    throw new Error('Failed to remove vote');
  }
}

export async function createComment(data: {
  linkId: string;
  userId: string;
  content: string;
}): Promise<{
  link?: FormattedLink;
  error?: string;
}> {
  try {
    // Fetch the updated link with all its relations
    const link = await prisma.link.findUnique({
      where: { id: data.linkId },
      include: {
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
        createdBy: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
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

    if (!link) {
      return { error: 'Link not found' };
    }

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        userId: data.userId,
        linkId: data.linkId,
      },
      include: {
        user: true,
      },
    });

    const updatedLink = {
      ...link,
      comments: [...link.comments, comment].map((comment) => ({
        ...comment,
        createdAt:
          comment.createdAt instanceof Date
            ? comment.createdAt.toISOString()
            : comment.createdAt,
        updatedAt:
          comment.updatedAt instanceof Date
            ? comment.updatedAt.toISOString()
            : comment.updatedAt,
      })),
    };

    const formattedLink = formatLink(updatedLink);

    revalidatePath('/');
    return { link: formattedLink };
  } catch {
    return { error: 'Failed to create comment' };
  }
}

export async function updateComment(data: {
  id: string;
  content: string;
  userId: string;
}): Promise<{
  comment?: Comment & { user: Pick<User, 'id' | 'name' | 'avatarUrl'> };
  error?: string;
}> {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: data.id },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.userId !== data.userId) {
      throw new Error('Not authorized to update this comment');
    }

    const updatedComment = await prisma.comment.update({
      where: { id: data.id },
      data: { content: data.content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    revalidatePath('/');
    return { comment: updatedComment };
  } catch {
    throw new Error('Failed to update comment');
  }
}

export async function deleteComment(data: {
  id: string;
  userId: string;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: data.id },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.userId !== data.userId) {
      throw new Error('Not authorized to delete this comment');
    }

    await prisma.comment.delete({
      where: { id: data.id },
    });

    revalidatePath('/');
    return { success: true };
  } catch {
    throw new Error('Failed to delete comment');
  }
}

export async function getCommentsByUser(userId: string): Promise<{
  comments?: (Comment & { user: Pick<User, 'id' | 'name' | 'avatarUrl'> })[];
  error?: string;
}> {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        link: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { comments };
  } catch {
    throw new Error('Failed to load comments');
  }
}
