import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const cookieStore = cookies();
    const userName = (await cookieStore).get('userName')?.value;
    if (!userName) {
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

    // Get user by name
    const user = await prisma.user.findUnique({
      where: { name: userName },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete vote if it exists
    await prisma.vote.delete({
      where: {
        userId_linkId: {
          userId: user.id,
          linkId: linkId,
        },
      },
    });

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unvoting:', error);
    return NextResponse.json({ error: 'Failed to unvote' }, { status: 500 });
  }
}
