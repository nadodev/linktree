import { notFound } from 'next/dist/client/components/not-found';
import { prisma } from '@/app/lib/prisma';
import { Metadata } from 'next';
import { Links } from '@/app/components/Links';
import { UsernamePageProps } from '../types';

export async function generateMetadata({ params }: UsernamePageProps): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: { name: true },
  });

  if (!user) {
    return {
      title: 'User Not Found',
    };
  }

  return {
    title: `${user.name}'s Links`,
  };
}

export default async function ProfilePage({ params }: UsernamePageProps) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      links: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Increment page views
  await prisma.user.update({
    where: { id: user.id },
    data: { pageViews: { increment: 1 } },
  });

  const backgroundStyle = {
    backgroundImage: user.backgroundImage ? `url(${user.backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  const overlayStyle = {
    backgroundColor: user.backgroundColor || 'rgba(0, 0, 0, 0.5)',
  };

  return (
    <main className="min-h-screen relative">
      {/* Background container */}
      <div 
        className="absolute inset-0 z-0" 
        style={backgroundStyle}
      />
      
      {/* Overlay container */}
      <div 
        className="absolute inset-0 z-[1]" 
        style={overlayStyle}
      />
      
      {/* Content container */}
      <div className="relative z-[2] min-h-screen flex flex-col items-center px-4 py-16">
        {/* Profile section */}
        <div className="w-full max-w-xl mx-auto text-center mb-8">
          <div className="mb-4">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || user.username}
                className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-2xl font-medium text-gray-500">
                  {(user.name || user.username)[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
            {user.name || user.username}
          </h1>

          {user.bio && (
            <p className="text-white/90 mb-6 max-w-md mx-auto drop-shadow">
              {user.bio}
            </p>
          )}
        </div>

        {/* Links section */}
        <div className="w-full max-w-xl mx-auto space-y-4">
          <Links links={user.links} />
        </div>
      </div>
    </main>
  );
} 