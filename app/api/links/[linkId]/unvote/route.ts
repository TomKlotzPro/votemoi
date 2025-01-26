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

    // Delete the vote
    const vote = await prisma.vote.deleteMany({
      where: {
        userId,
        linkId,
      },
    });

    return NextResponse.json({ vote });
  } catch (error) {
    console.error('Failed to delete vote:', error);
    return NextResponse.json(
      { error: 'Failed to delete vote', vote: null },
      { status: 500 }
    );
  }
}
