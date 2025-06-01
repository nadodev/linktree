import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

const linkSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  order: z.number().int().nonnegative(),
  isSocial: z.boolean().default(false),
  socialType: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
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
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();

    const newLink = await prisma.link.create({
      data: {
        title: data.title,
        url: data.url,
        order: data.order || 0,
        active: data.active !== undefined ? data.active : true,
        isSocial: data.isSocial || false,
        socialType: data.socialType,
        userId: session.user.id,
      },
    });

    return NextResponse.json(newLink);
  } catch (error) {
    console.error('Error creating link:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 