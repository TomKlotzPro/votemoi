import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ linkId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const params = await context.params;

    if (!session?.user?.name) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Check if vote already exists
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: session.user.name.toLowerCase(),
        linkId: params.linkId,
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'Vote already exists' },
        { status: 400 }
      );
    }

    // Create vote
    const vote = await prisma.vote.create({
      data: {
        userId: session.user.name.toLowerCase(),
        linkId: params.linkId,
      },
    });

    if (!vote) {
      return NextResponse.json(
        { error: 'Failed to create vote' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      user: {
        id: session.user.name.toLowerCase(),
        name: session.user.name,
        avatarUrl: session.user.image || null,
      },
    });
  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}
