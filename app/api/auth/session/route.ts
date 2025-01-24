import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sessionId = cookies().get('session_id')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ user: null });
    }

    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        active: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ 
      user: {
        id: session.user.id,
        name: session.user.name,
        avatarUrl: session.user.avatarUrl,
      }
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ user: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create a new session
    const session = await prisma.session.create({
      data: {
        userId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      include: {
        user: true,
      },
    });

    // Set session cookie
    cookies().set('session_id', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: session.expiresAt,
    });

    return NextResponse.json({ 
      user: {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
      }
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const sessionId = cookies().get('session_id')?.value;
    
    if (sessionId) {
      await prisma.session.update({
        where: { id: sessionId },
        data: { active: false },
      });
    }

    cookies().delete('session_id');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
