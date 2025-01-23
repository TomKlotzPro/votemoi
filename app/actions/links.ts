'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/app/lib/db';
import { Link, User, Vote, Comment } from '@prisma/client';
import { extractURLMetadata } from './url-metadata';

type LinkWithRelations = Link & {
  createdBy: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  votes: Array<Vote & { user: Pick<User, 'name' | 'id' | 'avatarUrl'> }>;
  comments: Array<Comment & { user: Pick<User, 'id' | 'name' | 'avatarUrl'> }>;
};

type FormattedLink = Omit<LinkWithRelations, 'votes'> & {
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
};

export async function getLinks(): Promise<{ links?: FormattedLink[]; error?: string }> {
  try {
    console.log('[getLinks] Starting...');
    
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('[getLinks] Raw links fetched:', JSON.stringify({ count: links?.length }));

    if (!links) {
      console.log('[getLinks] No links found');
      return { links: [] };
    }

    const formattedLinks = links.map(link => {
      try {
        return {
          ...link,
          createdAt: link.createdAt.toISOString(),
          updatedAt: link.updatedAt.toISOString(),
          votes: (link.votes || []).map(vote => ({
            userId: vote.userId,
            userName: vote.user?.name || 'Unknown User',
            createdAt: vote.createdAt.toISOString(),
            user: {
              id: vote.user?.id || 'unknown',
              name: vote.user?.name || 'Unknown User',
              avatarUrl: vote.user?.avatarUrl || '/default-avatar.png',
            }
          })),
          comments: (link.comments || []).map(comment => ({
            ...comment,
            createdAt: comment.createdAt.toISOString(),
            updatedAt: comment.updatedAt.toISOString(),
            user: {
              id: comment.user?.id || 'unknown',
              name: comment.user?.name || 'Unknown User',
              avatarUrl: comment.user?.avatarUrl || '/default-avatar.png',
            },
          })),
        };
      } catch (formatError) {
        console.log('[getLinks] Error formatting link:', link.id, formatError);
        return null;
      }
    }).filter(Boolean) as FormattedLink[];

    console.log('[getLinks] Successfully formatted links:', JSON.stringify({ count: formattedLinks.length }));
    return { links: formattedLinks };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('[getLinks] Error:', errorMessage);
    return { 
      error: `Failed to load links: ${errorMessage}`,
      links: [] 
    };
  }
}

export async function createLink(data: {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  userId: string;
}): Promise<{ link?: FormattedLink; error?: string }> {
  if (!data?.url) {
    return { error: 'URL is required' };
  }

  if (!data?.userId) {
    return { error: 'User ID is required' };
  }

  try {
    console.log('[createLink] Starting with data:', JSON.stringify(data));
    
    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: data.userId },
      select: { id: true }
    });

    if (!user) {
      console.error('[createLink] User not found:', data.userId);
      return { error: 'User not found' };
    }
    
    console.log('[createLink] Extracting metadata...');
    let metadata;
    try {
      metadata = await extractURLMetadata(data.url);
      console.log('[createLink] Metadata extracted:', JSON.stringify(metadata));
    } catch (metadataError) {
      console.error('[createLink] Failed to extract metadata:', metadataError);
      metadata = {
        title: data.url,
        description: null,
        imageUrl: null
      };
    }
    
    console.log('[createLink] Creating link in database...');
    const link = await db.link.create({
      data: {
        url: data.url,
        title: data.title || metadata.title || data.url,
        description: data.description || metadata.description || null,
        imageUrl: data.imageUrl || metadata.imageUrl || null,
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
    console.log('[createLink] Link created:', JSON.stringify({ id: link.id }));

    console.log('[createLink] Formatting link data...');
    const formattedLink = {
      ...link,
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
      votes: link.votes.map(vote => ({
        userId: vote.userId,
        userName: vote.user?.name || 'Unknown User',
        createdAt: vote.createdAt.toISOString(),
        user: {
          id: vote.user?.id || 'unknown',
          name: vote.user?.name || 'Unknown User',
          avatarUrl: vote.user?.avatarUrl || '/default-avatar.png',
        }
      })),
      comments: link.comments.map(comment => ({
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        user: {
          id: comment.user?.id || 'unknown',
          name: comment.user?.name || 'Unknown User',
          avatarUrl: comment.user?.avatarUrl || '/default-avatar.png',
        },
      })),
    };
    console.log('[createLink] Link formatted successfully');

    revalidatePath('/');
    return { link: formattedLink };
  } catch (error) {
    console.error('[createLink] Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      data: JSON.stringify(data)
    });
    
    if (error instanceof Error) {
      return { error: `Failed to create link: ${error.message}` };
    }
    
    return { error: 'Failed to create link' };
  }
}

export async function updateLink(data: {
  id: string;
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  userId: string;
}): Promise<{ link?: FormattedLink; error?: string }> {
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

    const updatedLink = await db.link.update({
      where: { id: data.id },
      data: {
        url: data.url,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
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
            userId: true,
            user: {
              select: {
                name: true,
                id: true,
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
      ...updatedLink,
      votes: updatedLink.votes.map(vote => ({
        userId: vote.userId,
        userName: vote.user.name,
        createdAt: new Date().toISOString(),
        user: {
          id: vote.user.id,
          name: vote.user.name,
          avatarUrl: vote.user.avatarUrl,
        }
      })),
    };

    revalidatePath('/');
    return { link: formattedLink };
  } catch (error) {
    console.error('Error in updateLink:', error);
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
