import { prisma } from '../../lib/prisma';
import LinkItem from '@/app/components/LinkItem';
import SocialIcon from '@/app/components/SocialIcon';
import { FaInstagram, FaLinkedin, FaTwitter, FaYoutube, FaTiktok, FaFacebook, FaGlobe, FaGithub, FaWhatsapp } from 'react-icons/fa';
import { SiNotion, SiDiscord, SiSpotify } from 'react-icons/si';

interface PageProps {
  params: {
    username: string;
  };
}

const socialOptions = [
  { name: 'Instagram', pattern: 'instagram.com', color: 'text-pink-500' },
  { name: 'LinkedIn', pattern: 'linkedin.com', color: 'text-blue-600' },
  { name: 'Twitter/X', pattern: 'twitter.com', color: 'text-blue-400' },
  { name: 'YouTube', pattern: 'youtube.com', color: 'text-red-600' },
  { name: 'TikTok', pattern: 'tiktok.com', color: 'text-black dark:text-white' },
  { name: 'Facebook', pattern: 'facebook.com', color: 'text-blue-700' },
  { name: 'GitHub', pattern: 'github.com', color: 'text-gray-800 dark:text-white' },
  { name: 'WhatsApp', pattern: 'whatsapp.com', color: 'text-green-500' },
  { name: 'Notion', pattern: 'notion.so', color: 'text-black dark:text-white' },
  { name: 'Discord', pattern: 'discord.com', color: 'text-indigo-600' },
  { name: 'Spotify', pattern: 'spotify.com', color: 'text-green-500' },
];

export default async function UserLinksPage({ params }: PageProps) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      theme: true,
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

  const backgroundClass = user.theme || 'from-indigo-900 via-purple-900 to-pink-800';
  const socialLinks = user.links.filter(link => link.isSocial);
  const regularLinks = user.links.filter(link => !link.isSocial);

  return (
    <main className={`min-h-screen bg-gradient-to-br ${backgroundClass} px-6 py-16 flex flex-col items-center`}>
      <div className="text-center mb-8">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || user.username}
            className="w-24 h-24 rounded-full mb-6 mx-auto object-cover border-2 border-white/20"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 mb-6 mx-auto flex items-center justify-center shadow-xl">
            <span className="text-3xl font-bold text-white">
              {(user.name || user.username).charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] tracking-tight">
          {user.name || user.username}
        </h1>
        <p className="text-white/70 mb-6">@{user.username}</p>

        {/* Social Media Icons */}
        {socialLinks.length > 0 && (
          <div className="flex justify-center gap-4 mb-8">
            {socialLinks.map((link) => {
              const social = socialOptions.find(s => s.name.toLowerCase() === link.socialType?.toLowerCase());
              if (social) {
                return (
                  <SocialIcon
                    key={link.id}
                    id={link.id}
                    url={link.url}
                    type={link.socialType || ''}
                    color={social.color}
                    iconName={social.name}
                  />
                );
              }
              return null;
            })}
          </div>
        )}
      </div>

      <div className="w-full max-w-md space-y-4">
        {regularLinks.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/10">
            <p className="text-white/70 italic">Nenhum link cadastrado ainda.</p>
          </div>
        ) : (
          regularLinks.map((link) => (
            <LinkItem
              key={link.id}
              id={link.id}
              title={link.title}
              url={link.url}
              isSocial={link.isSocial}
              socialType={link.socialType || undefined}
            />
          ))
        )}
      </div>

      <footer className="mt-24 pt-8 border-t border-white/10 w-full max-w-md text-center">
        <p className="text-white/50 text-sm">
          Feito com <span className="text-pink-400">♥</span> usando LinkTree Clone
        </p>
      </footer>
    </main>
  );
}