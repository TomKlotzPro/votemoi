import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const urls = await prisma.url.findMany({
      include: {
        votes: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        votes: {
          _count: 'desc',
        },
      },
    });
    return NextResponse.json(urls);
  } catch (error) {
    console.error('Failed to fetch URLs:', error);
    return NextResponse.json({ error: 'Failed to fetch URLs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const url = await prisma.url.create({
      data,
      include: {
        votes: {
          include: {
            user: true,
          },
        },
      },
    });
    return NextResponse.json(url);
  } catch (error) {
    console.error('Failed to create URL:', error);
    return NextResponse.json({ error: 'Failed to create URL' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    const url = await prisma.url.update({
      where: { id },
      data: updateData,
      include: {
        votes: {
          include: {
            user: true,
          },
        },
      },
    });
    return NextResponse.json(url);
  } catch (error) {
    console.error('Failed to update URL:', error);
    return NextResponse.json({ error: 'Failed to update URL' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    await prisma.url.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete URL:', error);
    return NextResponse.json({ error: 'Failed to delete URL' }, { status: 500 });
  }
}
