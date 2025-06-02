import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(
  request: Request,
  context: RouteParams
): Promise<NextResponse> {
  try {
    const link = await prisma.link.update({
      where: { id: context.params.id },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ clicks: link.clicks });
  } catch (error) {
    console.error('Error updating click count:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}