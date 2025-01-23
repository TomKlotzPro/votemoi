import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fr } from '@/app/translations/fr';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            votes: true,
          },
        },
        votes: {
          include: {
            url: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: fr.errors.fetchUsersFailed },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, avatarUrl } = await request.json();

    // Check if a user with this name already exists
    const existingUser = await prisma.user.findUnique({
      where: { name },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: fr.errors.userNameExists },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        avatarUrl,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json(
      { error: fr.errors.createUserFailed },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, avatarUrl } = await request.json();

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        avatarUrl,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
