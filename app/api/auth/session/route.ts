import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ user: null });
    }

    const session = await prisma.$queryRaw`
      SELECT * FROM "session"
      WHERE id = ${sessionId}
      AND active = true
      AND "expiresAt" > NOW()
      LIMIT 1
    `;

    if (!session || !Array.isArray(session) || session.length === 0) {
      return NextResponse.json({ user: null });
    }

    const sessionData = session[0];

    return NextResponse.json({ 
      user: {
        id: sessionData.userId,
        name: sessionData.user.name,
        avatarUrl: sessionData.user.avatarUrl,
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
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const sessionId = crypto.randomUUID();
    const session = await prisma.$queryRaw`
      INSERT INTO "Session" (id, "userId", active, "expiresAt", "createdAt")
      VALUES (${sessionId}, ${userId}, true, ${expiresAt}, NOW())
      RETURNING *
    `;

    if (!session || !Array.isArray(session) || session.length === 0) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    const sessionData = session[0];

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
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
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    if (sessionId) {
      await prisma.$queryRaw`
        UPDATE "Session"
        SET active = false
        WHERE id = ${sessionId}
      `;
    }

    cookieStore.delete('session_id');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
