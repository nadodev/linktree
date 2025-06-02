import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { prisma } from '@/app/lib/prisma';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  username: z.string().min(3).regex(/^[a-zA-Z0-9_-]+$/),
});

export async function POST(req: Request) {
  try {
    // Log the request headers and body for debugging
    console.log('Request headers:', Object.fromEntries(req.headers));
    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);

    // Parse the JSON body
    let json;
    try {
      json = JSON.parse(rawBody);
    } catch (e) {
      console.error('JSON parse error:', e);
      return NextResponse.json(
        { message: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Validate the request body
    try {
      const body = registerSchema.parse(json);
      console.log('Validated body:', body);

      // Check for existing user
      const exists = await prisma.user.findFirst({
        where: {
          OR: [
            { email: body.email },
            { username: body.username },
          ],
        },
      });

      if (exists) {
        const field = exists.email === body.email ? 'email' : 'username';
        return NextResponse.json(
          { message: `User with that ${field} already exists` },
          { status: 400 }
        );
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(body.password, 10);
      
      console.log('Creating user with data:', {
        email: body.email,
        username: body.username,
        name: body.name,
        // password omitted for security
      });

      const user = await prisma.user.create({
        data: {
          email: body.email,
          username: body.username,
          password: hashedPassword,
          name: body.name,
        },
      });

      console.log('User created successfully:', user.id);

      const { password: _, ...result } = user;
      return NextResponse.json(result);
    } catch (e) {
      if (e instanceof z.ZodError) {
        console.error('Validation error:', e.errors);
        return NextResponse.json(
          { message: e.errors[0].message },
          { status: 400 }
        );
      }
      throw e; // Re-throw other errors to be caught by the outer try-catch
    }
  } catch (error: unknown) {
    // Log the full error for debugging
    console.error('Registration error:', {
      name: error instanceof Error ? error.name : 'Unknown error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Handle Prisma-specific errors
    if (error instanceof PrismaClientKnownRequestError) {
      console.error('Prisma error code:', error.code);
      return NextResponse.json(
        { 
          message: 'Database error. Please try again later.',
          code: error.code 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Something went wrong! Please try again later.' },
      { status: 500 }
    );
  }
} 