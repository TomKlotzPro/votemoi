import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const userId = cookies().get('userId')?.value;
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated', vote: null },
        { status: 401 }
      );
    }

    const { urlId } = await request.json();
    if (!urlId) {
      return NextResponse.json(
        { error: 'URL ID is required', vote: null },
        { status: 400 }
      );
    }

    // Check if user has already voted for this URL
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId,
        urlId,
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
        urlId,
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
