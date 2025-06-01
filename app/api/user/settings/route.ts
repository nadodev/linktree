import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';

const updateSettingsSchema = z.object({
  image: z.string().url().nullish(),
  theme: z.string().nullish(),
  bio: z.string().max(500).nullish(),
  backgroundColor: z
    .string()
    .regex(/^(#[0-9A-Fa-f]{6}|rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\))$/)
    .nullish(),
  backgroundImage: z.string().url().nullish(),
}).partial();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        image: true,
        theme: true,
        bio: true,
        backgroundColor: true,
        backgroundImage: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json();
    console.log('Received update request:', json);

    try {
      // Transformar strings vazias em null
      const sanitizedData = Object.entries(json).reduce((acc, [key, value]) => {
        acc[key] = value === '' ? null : value;
        return acc;
      }, {} as Record<string, any>);

      console.log('Sanitized data:', sanitizedData);

      const body = updateSettingsSchema.parse(sanitizedData);
      console.log('Validated body:', body);

      // Remover campos undefined
      const updateData = Object.entries(body).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      console.log('Final update data:', updateData);

      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
        select: {
          image: true,
          theme: true,
          bio: true,
          backgroundColor: true,
          backgroundImage: true,
        },
      });

      return NextResponse.json(user);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { 
            message: 'Validation error', 
            errors: validationError.errors.map(e => ({
              path: e.path.join('.'),
              message: e.message
            }))
          },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 