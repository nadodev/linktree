import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import cloudinary from '@/app/lib/cloudinary';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: Request) {
  try {
    // Verify environment variables first
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary credentials');
      return NextResponse.json(
        { error: 'Cloudinary configuration is missing' },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('File received:', {
      type: file.type,
      size: file.size,
      name: file.name
    });

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: 'link-app/avatars',
        public_id: `user-${session.user.id}`,
        overwrite: true,
      });

      // Update user directly using Prisma
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: { image: result.secure_url },
        select: { image: true }
      });

      return NextResponse.json({ url: updatedUser.image });
    } catch (uploadError: any) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { 
          error: uploadError.message || 'Error during upload process',
          details: uploadError.stack
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Internal Server Error',
        details: error.stack
      },
      { status: 500 }
    );
  }
} 