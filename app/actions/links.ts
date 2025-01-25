'use server';

import { prisma } from '@/lib/prisma';
import { Comment, Link, User, Vote } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { FormattedLink } from '../types/link';

const formatLink = (
  link: Link & {
    createdBy?: User;
    votes?: (Vote & { user: User })[];
    comments?: (Comment & { user?: User })[];
    hasVoted?: boolean;
    currentUserId?: string;
  }
): FormattedLink => ({
  id: link.id,
  url: link.url,
  title: link.title,
  description: link.description ?? null,
  previewImage: link.previewImage ?? null,
  previewTitle: link.previewTitle ?? null,
  previewDescription: link.previewDescription ?? null,
  previewFavicon: link.previewFavicon ?? null,
  previewSiteName: link.previewSiteName ?? null,
  createdAt:
    link.createdAt instanceof Date
      ? link.createdAt.toISOString()
      : link.createdAt,
  updatedAt:
    link.updatedAt instanceof Date
      ? link.updatedAt.toISOString()
      : link.updatedAt,
  createdById: link.createdById,
  comments: (link.comments || []).map((comment) => ({
    id: comment.id,
    userId: comment.userId,
    linkId: comment.linkId,
    content: comment.content,
    createdAt:
      comment.createdAt instanceof Date
        ? comment.createdAt.toISOString()
        : comment.createdAt,
    updatedAt:
      comment.updatedAt instanceof Date
        ? comment.updatedAt.toISOString()
        : comment.updatedAt,
    user: comment.user
      ? {
          id: comment.user.id,
          name: comment.user.name,
          avatarUrl: comment.user.avatarUrl,
        }
      : null,
  })),
  voteCount: link.votes?.length ?? 0,
  votes: link.votes || [],
  voters:
    link.votes?.map((vote) => ({
      id: vote.user.id,
      name: vote.user.name,
      avatarUrl: vote.user.avatarUrl,
    })) || [],
  hasVoted: link.currentUserId
    ? (link.votes || []).some((vote) => vote.userId === link.currentUserId)
    : false,
  user: {
    id: link.createdBy?.id ?? '',
    name: link.createdBy?.name ?? null,
    avatarUrl: link.createdBy?.avatarUrl ?? null,
  },
});

export async function getLinks(
  userId?: string
): Promise<{ links?: FormattedLink[]; error?: string }> {
  try {
    const links = await prisma.link.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        createdBy: true,
        comments: {
          include: {
            user: true,
          },
        },
        votes: {
          include: {
            user: true,
          },
        },
      },
    });

    const formattedLinks = links.map((link) =>
      formatLink({
        ...link,
        currentUserId: userId,
      })
    );

    return { links: formattedLinks };
  } catch (error) {
    console.error('Error fetching links:', error);
    return { error: 'Failed to fetch links' };
  }
}

export async function createLink(data: {
  url: string;
  title?: string;
  description?: string;
  userId: string;
}): Promise<{ link?: FormattedLink; error?: string }> {
  try {
    const link = await prisma.link.create({
      data: {
        url: data.url,
        title: data.title || '',
        description: data.description,
        createdBy: {
          connect: { id: data.userId },
        },
      },
      include: {
        createdBy: true,
        comments: {
          include: {
            user: true,
          },
        },
        votes: {
          include: {
            user: true,
          },
        },
      },
    });

    revalidatePath('/');
    return { link: formatLink({ ...link, currentUserId: data.userId }) };
  } catch (error) {
    console.error('Error creating link:', error);
    return { error: 'Failed to create link' };
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
    const existingLink = await prisma.link.findUnique({
      where: { id: data.id },
    });

    if (!existingLink) {
      return { error: 'Link not found' };
    }

    if (existingLink.createdById !== data.userId) {
      return { error: 'Not authorized' };
    }

    const updatedLink = await prisma.link.update({
      where: { id: data.id },
      data: {
        url: data.url,
        title: data.title,
        description: data.description,
      },
      include: {
        createdBy: true,
        comments: {
          include: {
            user: true,
          },
        },
        votes: {
          include: {
            user: true,
          },
        },
      },
    });

    revalidatePath('/');
    return { link: formatLink({ ...updatedLink, currentUserId: data.userId }) };
  } catch (error) {
    console.error('Error updating link:', error);
    return { error: 'Failed to update link' };
  }
}

export async function deleteLink(data: {
  id: string;
  userId: string;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    const existingLink = await prisma.link.findUnique({
      where: { id: data.id },
    });

    if (!existingLink) {
      return { error: 'Link not found' };
    }

    if (existingLink.createdById !== data.userId) {
      return { error: 'Not authorized' };
    }

    await prisma.link.delete({
      where: { id: data.id },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting link:', error);
    return { error: 'Failed to delete link' };
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
      return { error: 'Already voted for this link' };
    }

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return { error: 'User not found' };
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
        user: true,
      },
    });

    revalidatePath('/');
    return {
      success: true,
      user: {
        id: newVote.user.id,
        name: newVote.user.name,
        avatarUrl: newVote.user.avatarUrl,
      },
    };
  } catch (error) {
    console.error('Error voting:', error);
    return { error: 'Failed to vote' };
  }
}

export async function unvote(data: {
  linkId: string;
  userId: string;
}): Promise<{
  success?: boolean;
  error?: string;
}> {
  try {
    const existingVote = await prisma.vote.findFirst({
      where: {
        linkId: data.linkId,
        userId: data.userId,
      },
    });

    if (!existingVote) {
      return { error: 'Vote not found' };
    }

    await prisma.vote.delete({
      where: {
        id: existingVote.id,
      },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error unvoting:', error);
    return { error: 'Failed to unvote' };
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
    await prisma.comment.create({
      data: {
        content: data.content,
        link: {
          connect: { id: data.linkId },
        },
        user: {
          connect: { id: data.userId },
        },
      },
    });

    // Fetch the updated link with all its relations
    const link = await prisma.link.findUnique({
      where: { id: data.linkId },
      include: {
        createdBy: true,
        comments: {
          include: {
            user: true,
          },
        },
        votes: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!link) {
      return { error: 'Link not found' };
    }

    revalidatePath('/');
    return { link: formatLink({ ...link, currentUserId: data.userId }) };
  } catch (error) {
    console.error('Error creating comment:', error);
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
    const existingComment = await prisma.comment.findUnique({
      where: { id: data.id },
    });

    if (!existingComment) {
      return { error: 'Comment not found' };
    }

    if (existingComment.userId !== data.userId) {
      return { error: 'Not authorized' };
    }

    const updatedComment = await prisma.comment.update({
      where: { id: data.id },
      data: {
        content: data.content,
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
    return { comment: updatedComment };
  } catch (error) {
    console.error('Error updating comment:', error);
    return { error: 'Failed to update comment' };
  }
}

export async function deleteComment(data: {
  id: string;
  userId: string;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    const existingComment = await prisma.comment.findUnique({
      where: { id: data.id },
    });

    if (!existingComment) {
      return { error: 'Comment not found' };
    }

    if (existingComment.userId !== data.userId) {
      return { error: 'Not authorized' };
    }

    await prisma.comment.delete({
      where: { id: data.id },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { error: 'Failed to delete comment' };
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { comments };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { error: 'Failed to fetch comments' };
  }
}
