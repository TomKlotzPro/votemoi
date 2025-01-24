'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/app/lib/db';
import { Link, User, Vote, Comment } from '@prisma/client';
import { fetchUrlMetadata } from '@/lib/url-metadata';

type LinkWithRelations = Link & {
  createdBy: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  votes: Array<Vote & { user: Pick<User, 'name' | 'id' | 'avatarUrl'> }>;
  comments: Array<Comment & { user: Pick<User, 'id' | 'name' | 'avatarUrl'> }>;
};

type FormattedLink = {
  id: string;
  url: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  previewDescription: string | null;
  previewFavicon: string | null;
  previewImage: string | null;
  previewSiteName: string | null;
  previewTitle: string | null;
  hasVoted?: boolean;
  createdBy: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  votes: Array<{
    userId: string;
    userName: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      avatarUrl: string;
    }
  }>;
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      name: string;
      avatarUrl: string;
    }
  }>;
};

export async function getLinks(userId?: string): Promise<{ links?: FormattedLink[]; error?: string }> {
  try {
    const links = await db.link.findMany({
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

    if (!links) {
      return { links: [] };
    }

    const formattedLinks = links.map((link) => ({
      id: link.id,
      url: link.url,
      title: link.title,
      description: link.description,
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
      createdById: link.createdById,
      previewDescription: link.previewDescription,
      previewFavicon: link.previewFavicon,
      previewImage: link.previewImage,
      previewSiteName: link.previewSiteName,
      previewTitle: link.previewTitle,
      hasVoted: link.votes.some((vote) => vote.userId === userId),
      createdBy: {
        id: link.createdBy.id,
        name: link.createdBy.name,
        avatarUrl: link.createdBy.avatarUrl,
      },
      votes: link.votes.map((vote) => ({
        userId: vote.userId,
        userName: vote.user.name,
        createdAt: vote.createdAt.toISOString(),
        user: {
          id: vote.user.id,
          name: vote.user.name,
          avatarUrl: vote.user.avatarUrl,
        },
      })),
      comments: link.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        user: {
          id: comment.user.id,
          name: comment.user.name,
          avatarUrl: comment.user.avatarUrl,
        },
      })),
    }));

    return { links: formattedLinks };
  } catch (err) {
    const error = err as Error;
    console.error('[getLinks] Error:', error.message);
    return { error: `Failed to load links: ${error.message}` };
  }
}

export async function createLink(data: {
  url: string;
  title?: string;
  description?: string;
  userId: string;
}): Promise<{ link?: FormattedLink; error?: string }> {
  if (!data.url || !data.userId) {
    return { error: 'URL and userId are required' };
  }

  try {
    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: data.userId },
      select: { id: true }
    });

    if (!user) {
      return { error: 'User not found. Please try logging in again.' };
    }

    // Extract metadata from URL
    let metadata = {
      previewTitle: '',
      previewDescription: '',
      previewImage: '',
      previewFavicon: '',
      previewSiteName: ''
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
    } catch (err) {
      // Silently continue with default metadata
    }

    // Get hostname for fallback values
    let hostname = '';
    try {
      hostname = new URL(data.url).hostname;
    } catch (err) {
      hostname = data.url.split('/')[2] || 'unknown site';
    }
    
    const link = await db.link.create({
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
      return { error: 'Failed to create link in database' };
    }

    const formattedLink = {
      id: link.id,
      url: link.url,
      title: link.title,
      description: link.description,
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
      createdById: link.createdById,
      previewDescription: link.previewDescription,
      previewFavicon: link.previewFavicon,
      previewImage: link.previewImage,
      previewSiteName: link.previewSiteName,
      previewTitle: link.previewTitle,
      createdBy: {
        id: link.createdBy.id,
        name: link.createdBy.name,
        avatarUrl: link.createdBy.avatarUrl,
      },
      votes: link.votes.map((vote) => ({
        userId: vote.userId,
        userName: vote.user?.name || 'Unknown User',
        createdAt: vote.createdAt.toISOString(),
        user: {
          id: vote.user?.id || 'unknown',
          name: vote.user?.name || 'Unknown User',
          avatarUrl: vote.user?.avatarUrl || '/default-avatar.png',
        },
      })),
      comments: link.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        user: {
          id: comment.user?.id || 'unknown',
          name: comment.user?.name || 'Unknown User',
          avatarUrl: comment.user?.avatarUrl || '/default-avatar.png',
        },
      })),
    };

    revalidatePath('/');
    return { link: formattedLink };
  } catch (err) {
    // Safely handle error without causing source map issues
    let message = 'Failed to create link';
    if (err && typeof err === 'object' && 'message' in err) {
      message = String(err.message);
    }
    return { error: message };
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
    console.log('[updateLink] Starting with data:', data);

    // Extract metadata from URL if URL has changed
    const existingLink = await db.link.findUnique({
      where: { id: data.id },
    });

    let metadata = null;
    if (existingLink && existingLink.url !== data.url) {
      metadata = await fetchUrlMetadata(data.url);
    }

    const link = await db.link.update({
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

    const formattedLink = {
      id: link.id,
      url: link.url,
      title: link.title,
      description: link.description,
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
      createdById: link.createdById,
      previewDescription: link.previewDescription,
      previewFavicon: link.previewFavicon,
      previewImage: link.previewImage,
      previewSiteName: link.previewSiteName,
      previewTitle: link.previewTitle,
      createdBy: {
        id: link.createdBy.id,
        name: link.createdBy.name,
        avatarUrl: link.createdBy.avatarUrl,
      },
      votes: link.votes.map((vote) => ({
        userId: vote.userId,
        userName: vote.user.name,
        createdAt: vote.createdAt.toISOString(),
        user: vote.user,
      })),
      comments: link.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        user: comment.user,
      })),
    };

    revalidatePath('/');
    return { link: formattedLink };
  } catch (error) {
    console.error('[updateLink] Error:', error);
    return { error: 'Failed to update link' };
  }
}

export async function deleteLink(data: { id: string; userId: string }): Promise<{ success?: boolean; error?: string }> {
  try {
    const link = await db.link.findUnique({
      where: { id: data.id },
      include: { createdBy: true },
    });

    if (!link) {
      return { error: 'Link not found' };
    }

    if (link.createdById !== data.userId) {
      return { error: 'Not authorized' };
    }

    // Delete all related records first
    await db.$transaction([
      // Delete all votes for this link
      db.vote.deleteMany({
        where: { linkId: data.id },
      }),
      // Delete all comments for this link
      db.comment.deleteMany({
        where: { linkId: data.id },
      }),
      // Finally delete the link itself
      db.link.delete({
        where: { id: data.id },
      }),
    ]);

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error in deleteLink:', error);
    return { error: 'Failed to delete link' };
  }
}

export async function vote(data: { linkId: string; userId: string }): Promise<{ success?: boolean; user?: { id: string; name: string; avatarUrl: string }; error?: string }> {
  try {
    const existingVote = await db.vote.findFirst({
      where: {
        linkId: data.linkId,
        userId: data.userId,
      },
    });

    if (existingVote) {
      return { error: 'Already voted for this link' };
    }

    const newVote = await db.vote.create({
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
  } catch (error) {
    console.error('Error in vote:', error);
    return { error: 'Failed to vote for link' };
  }
}

export async function unvote(data: { linkId: string; userId: string }): Promise<{ success?: boolean; error?: string }> {
  try {
    await db.vote.deleteMany({
      where: {
        linkId: data.linkId,
        userId: data.userId,
      },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error in unvote:', error);
    return { error: 'Failed to remove vote' };
  }
}

export async function createComment(data: {
  linkId: string;
  userId: string;
  content: string;
}): Promise<{ comment?: Comment & { user: Pick<User, 'id' | 'name' | 'avatarUrl'> }; error?: string }> {
  try {
    const comment = await db.comment.create({
      data: {
        content: data.content,
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
    return { comment };
  } catch (error) {
    console.error('Error in createComment:', error);
    return { error: 'Failed to create comment' };
  }
}

export async function updateComment(data: {
  id: string;
  content: string;
  userId: string;
}): Promise<{ comment?: Comment & { user: Pick<User, 'id' | 'name' | 'avatarUrl'> }; error?: string }> {
  try {
    const comment = await db.comment.findUnique({
      where: { id: data.id },
    });

    if (!comment) {
      return { error: 'Comment not found' };
    }

    if (comment.userId !== data.userId) {
      return { error: 'Not authorized to update this comment' };
    }

    const updatedComment = await db.comment.update({
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
  } catch (error) {
    console.error('Error in updateComment:', error);
    return { error: 'Failed to update comment' };
  }
}

export async function deleteComment(data: { id: string; userId: string }): Promise<{ success?: boolean; error?: string }> {
  try {
    const comment = await db.comment.findUnique({
      where: { id: data.id },
    });

    if (!comment) {
      return { error: 'Comment not found' };
    }

    if (comment.userId !== data.userId) {
      return { error: 'Not authorized to delete this comment' };
    }

    await db.comment.delete({
      where: { id: data.id },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error in deleteComment:', error);
    return { error: 'Failed to delete comment' };
  }
}

export async function getCommentsByUser(userId: string): Promise<{ comments?: (Comment & { user: Pick<User, 'id' | 'name' | 'avatarUrl'> })[]; error?: string }> {
  try {
    const comments = await db.comment.findMany({
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
  } catch (error) {
    console.error('Error in getCommentsByUser:', error);
    return { error: 'Failed to load comments' };
  }
}
