import { prisma } from '@/app/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
  params: {
    username: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: { name: true },
  });

  if (!user) {
    return {
      title: 'Not Found',
      description: 'The page you are looking for does not exist.',
    };
  }

  return {
    title: `${user.name || params.username}'s Links`,
    description: `Check out ${user.name || params.username}'s links!`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      name: true,
      image: true,
      links: {
        where: { active: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white px-4 py-12">
      <div className="mx-auto max-w-lg">
        <div className="text-center">
          {user.image && (
            <img
              src={user.image}
              alt={user.name || params.username}
              className="mx-auto h-24 w-24 rounded-full object-cover"
            />
          )}
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            {user.name || params.username}
          </h1>
        </div>

        <div className="mt-8 space-y-4">
          {user.links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-lg bg-white px-4 py-3 text-center text-sm font-medium text-gray-900 shadow hover:bg-gray-50 transition-colors duration-200"
              onClick={async () => {
                // Update click count
                await fetch(`/api/links/${link.id}/click`, {
                  method: 'POST',
                });
              }}
            >
              {link.title}
            </a>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          Powered by Linktree Clone
        </div>
      </div>
    </div>
  );
} 