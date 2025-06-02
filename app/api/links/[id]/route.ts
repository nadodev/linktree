import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  url: z.string().url().optional(),
  active: z.boolean().optional(),
  order: z.number().int().nonnegative().optional(),
  isSocial: z.boolean().optional(),
  socialType: z.string().optional(),
});

export const PUT = async (request: Request, context: any) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await updateSchema.parseAsync(await request.json());
    const linkId = context.params.id;

    // Verify link ownership
    const existingLink = await prisma.link.findUnique({
      where: {
        id: linkId,
        userId: session.user.id,
      },
    });

    if (!existingLink) {
      return new NextResponse('Link not found or unauthorized', { status: 404 });
    }

    // Update the link
    const updatedLink = await prisma.link.update({
      where: {
        id: linkId,
      },
      data: {
        title: data.title,
        url: data.url,
        active: data.active,
        isSocial: data.isSocial,
        socialType: data.socialType,
      },
    });

    return NextResponse.json(updatedLink);
  } catch (error) {
    console.error('Error updating link:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};

export const DELETE = async (request: Request, context: any) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const linkId = context.params.id;

    // Verify link ownership
    const existingLink = await prisma.link.findUnique({
      where: {
        id: linkId,
        userId: session.user.id,
      },
    });

    if (!existingLink) {
      return new NextResponse('Link not found or unauthorized', { status: 404 });
    }

    // Delete the link
    await prisma.link.delete({
      where: {
        id: linkId,
      },
    });

    return new NextResponse('Link deleted successfully', { status: 200 });
  } catch (error) {
    console.error('Error deleting link:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
};