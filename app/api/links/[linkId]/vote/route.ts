import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    // Get userId from cookies
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    const sessionId = cookieStore.get('sessionId')?.value;

    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Validate session
    const session = await prisma.session.findUnique({
      where: {
        id: sessionId,
        userId: userId,
        active: true,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const linkId = params.linkId;

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Verify link exists
      const link = await tx.link.findUnique({
        where: { id: linkId },
        select: { id: true },
      });

      if (!link) {
        throw new Error('Link not found');
      }

      // Check if vote already exists
      const existingVote = await tx.vote.findUnique({
        where: {
          userId_linkId: {
            userId: userId,
            linkId: linkId,
          },
        },
      });

      if (existingVote) {
        throw new Error('Vote already exists');
      }

      // Create vote
      await tx.vote.create({
        data: {
          userId: userId,
          linkId: linkId,
        },
      });

      // Get updated link data with all relations
      const updatedLink = await tx.link.findUnique({
        where: { id: linkId },
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
          createdBy: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });

      if (!updatedLink || !updatedLink.createdBy) {
        throw new Error('Failed to fetch updated link data');
      }

      return {
        id: updatedLink.id,
        url: updatedLink.url,
        title: updatedLink.title,
        description: updatedLink.description,
        previewImage: updatedLink.previewImage,
        previewTitle: updatedLink.previewTitle,
        previewDescription: updatedLink.previewDescription,
        previewFavicon: updatedLink.previewFavicon,
        previewSiteName: updatedLink.previewSiteName,
        createdAt: updatedLink.createdAt.toISOString(),
        updatedAt: updatedLink.updatedAt.toISOString(),
        createdById: updatedLink.createdById,
        votes: updatedLink.votes,
        voters: updatedLink.votes
          .map(vote => vote.user)
          .filter((user): user is NonNullable<typeof user> => user !== null)
          .map(user => ({
            id: user.id,
            name: user.name,
            avatarUrl: user.avatarUrl,
          })),
        comments: updatedLink.comments
          .filter(comment => comment.user !== null)
          .map(comment => ({
            ...comment,
            createdAt: comment.createdAt.toISOString(),
            updatedAt: comment.updatedAt.toISOString(),
          })),
        user: {
          id: updatedLink.createdBy.id,
          name: updatedLink.createdBy.name,
          avatarUrl: updatedLink.createdBy.avatarUrl,
        },
      };
    });

    return NextResponse.json({
      success: true,
      link: result,
    });
  } catch (error) {
    console.error('Error voting:', error);
    const message = error instanceof Error ? error.message : 'Failed to vote';
    const status = message === 'Link not found' ? 404 :
                  message === 'Vote already exists' ? 400 : 500;
    
    return NextResponse.json({ error: message }, { status });
  }
}
