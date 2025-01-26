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

    // Delete vote if it exists
    const vote = await prisma.vote.delete({
      where: {
        userId_linkId: {
          userId: session.user.name.toLowerCase(),
          linkId: linkId,
        },
      },
    });

    return NextResponse.json({ vote });
  } catch (error) {
    console.error('Error unvoting:', error);
    return NextResponse.json({ error: 'Failed to unvote' }, { status: 500 });
  }
}
