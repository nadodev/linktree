import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const link = await prisma.link.update({
      where: { id: params.id },
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