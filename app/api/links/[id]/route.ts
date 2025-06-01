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
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log("session", session);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const link = await prisma.link.findUnique({
      where: { id: params.id },
    });

    if (!link) {
      return NextResponse.json({ message: 'Link not found' }, { status: 404 });
    }

    if (link.userId !== session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json();
    const body = updateSchema.parse(json);

    const updatedLink = await prisma.link.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(updatedLink);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Error updating link:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const link = await prisma.link.findUnique({
      where: { id: params.id },
    });

    if (!link) {
      return NextResponse.json({ message: 'Link not found' }, { status: 404 });
    }

    if (link.userId !== session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await prisma.link.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Link deleted' });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 