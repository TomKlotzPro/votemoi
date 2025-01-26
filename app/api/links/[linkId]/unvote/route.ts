import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ linkId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const params = await context.params;

    if (!session?.user?.name) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Delete vote if it exists
    try {
      await prisma.vote.deleteMany({
        where: {
          userId: session.user.name.toLowerCase(),
          linkId: params.linkId,
        },
      });

      // Return success response
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting vote:', error);
      return NextResponse.json({ success: true }); // Return success even if vote doesn't exist
    }
  } catch (error) {
    console.error('Error unvoting:', error);
    return NextResponse.json({ error: 'Failed to unvote' }, { status: 500 });
  }
}
