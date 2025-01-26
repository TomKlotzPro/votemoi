import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
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

    const { url, title, description } = await request.json();

    // Validate required fields
    if (!url || !title) {
      return NextResponse.json(
        { error: 'URL and title are required' },
        { status: 400 }
      );
    }

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Find the link and check ownership
      const existingLink = await tx.link.findUnique({
        where: { id: params.linkId },
        select: { id: true, createdById: true },
      });

      if (!existingLink) {
        throw new Error('Link not found');
      }

      if (existingLink.createdById !== userId) {
        throw new Error('Unauthorized');
      }

      // Update the link
      const updatedLink = await tx.link.update({
        where: { id: params.linkId },
        data: {
          url,
          title,
          description,
        },
        include: {
          createdBy: true,
          votes: {
            include: {
              user: true,
            },
          },
          comments: {
            include: {
              user: true,
            },
          },
        },
      });

      return {
        ...updatedLink,
        voters: updatedLink.votes.map(vote => ({
          id: vote.user.id,
          name: vote.user.name,
          avatarUrl: vote.user.avatarUrl,
        })),
        voteCount: updatedLink.votes.length,
        user: {
          id: updatedLink.createdBy.id,
          name: updatedLink.createdBy.name,
          avatarUrl: updatedLink.createdBy.avatarUrl,
        },
      };
    });

    return NextResponse.json({ link: result });
  } catch (error) {
    console.error('Error updating link:', error);
    if (error instanceof Error) {
      if (error.message === 'Link not found') {
        return NextResponse.json({ error: 'Link not found' }, { status: 404 });
      }
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: 'Failed to update link' },
      { status: 500 }
    );
  }
}
