import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

const linkSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  order: z.number().int().nonnegative(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const links = await prisma.link.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json();
    const body = linkSchema.parse(json);

    const link = await prisma.link.create({
      data: {
        ...body,
        userId: session.user.id,
      },
    });

    return NextResponse.json(link);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error creating link:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 