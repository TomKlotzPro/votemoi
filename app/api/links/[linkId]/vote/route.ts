import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated', vote: null },
        { status: 401 }
      );
    }

    const linkId = params.linkId;
    if (!linkId) {
      return NextResponse.json(
        { error: 'Link ID is required', vote: null },
        { status: 400 }
      );
    }

    // Check if user has already voted for this URL
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId,
        linkId,
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'User has already voted for this URL', vote: existingVote },
        { status: 400 }
      );
    }

    // Create the vote
    const vote = await prisma.vote.create({
      data: {
        userId,
        linkId,
      },
    });

    return NextResponse.json({ vote });
  } catch (error) {
    console.error('Failed to create vote:', error);
    return NextResponse.json(
      { error: 'Failed to create vote', vote: null },
      { status: 500 }
    );
  }
}
