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

    // Check if vote already exists
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_linkId: {
          userId: user.id,
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
    await prisma.vote.create({
      data: {
        userId: user.id,
        linkId: linkId,
      },
    });

    // Return user data for frontend
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}
