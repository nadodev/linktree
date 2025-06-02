import { prisma } from '../../lib/prisma';
import { Metadata } from 'next';
import UserLinksClient from '@/app/components/UserLinksClient';

interface PageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: { name: true },
  });

  if (!user) {
    return {
      title: 'Usuário não encontrado',
      description: 'O perfil que você está procurando não existe.',
    };
  }

  return {
    title: `${user.name || params.username} | Links`,
    description: `Confira os links de ${user.name || params.username}!`,
  };
}

export default async function UserLinksPage({ params }: PageProps) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      theme: true,
      bio: true,
      backgroundColor: true,
      backgroundImage: true,
      links: {
        where: { active: true },
        orderBy: {
          order: 'asc',
        },
        select: {
          id: true,
          title: true,
          url: true,
          isSocial: true,
          socialType: true,
        },
      },
    },
  });

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 px-6">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
            Usuário não encontrado
          </h1>
          <p className="text-xl text-white/80">O perfil @{params.username} não existe.</p>
        </div>
      </main>
    );
  }

  return <UserLinksClient user={user} />;
}