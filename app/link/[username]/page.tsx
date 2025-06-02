import { prisma } from '../../lib/prisma';
import { Metadata } from 'next';
import UserLinksClient from '@/app/components/UserLinksClient';
import { PageProps, MetadataProps } from '@/app/types';

type UsernameParams = {
  username: string;
};

export async function generateMetadata(
  props: MetadataProps<UsernameParams>
): Promise<Metadata> {
  const { username } = await props.params;
  
  const user = await prisma.user.findUnique({
    where: { username },
    select: { name: true },
  });

  if (!user) {
    return {
      title: 'Usuário não encontrado',
      description: 'O perfil que você está procurando não existe.',
    };
  }

  return {
    title: `${user.name || username} | Links`,
    description: `Confira os links de ${user.name || username}!`,
  };
}

export default async function UserLinksPage(props: PageProps<UsernameParams>) {
  const { username } = await props.params;
  
  const userData = await prisma.user.findUnique({
    where: { username },
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

  if (!userData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 px-6">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
            Usuário não encontrado
          </h1>
          <p className="text-xl text-white/80">O perfil @{username} não existe.</p>
        </div>
      </main>
    );
  }

  // Transform the data to match the expected types
  const user = {
    ...userData,
    theme: userData.theme || null,
    links: userData.links.map(link => ({
      ...link,
      socialType: link.socialType || undefined
    }))
  };
  return <UserLinksClient user={user} />;
}