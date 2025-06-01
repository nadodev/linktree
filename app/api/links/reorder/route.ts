import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { items } = await request.json();

    // Update all links in a transaction
    await prisma.$transaction(
      items.map(({ id, order }: { id: string; order: number }) =>
        prisma.link.update({
          where: {
            id,
            userId: session.user.id,
          },
          data: { order },
        })
      )
    );

    return new NextResponse('Links reordered successfully', { status: 200 });
  } catch (error) {
    console.error('Error reordering links:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 