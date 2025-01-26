import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session?.user?.name) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const linkId = params.linkId;
    if (!linkId) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      );
    }

    // Check if vote already exists
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_linkId: {
          userId: session.user.name.toLowerCase(),
          linkId: linkId,
        },
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
        linkId: linkId,
      },
    });

    return NextResponse.json({ vote });
  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}
