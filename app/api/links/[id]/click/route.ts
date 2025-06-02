import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const POST = async (request: Request, context: any) => {
  try {
    const { id } = context.params;
    const link = await prisma.link.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });
    return NextResponse.json({ clicks: link.clicks });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
};