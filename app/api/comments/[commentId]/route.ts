import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: params.commentId },
    });

    if (!comment) {
      return new NextResponse('Comment not found', { status: 404 });
    }

    if (comment.userId !== user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    await prisma.comment.update({
      where: { id: params.commentId },
      data: { isDeleted: true },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
