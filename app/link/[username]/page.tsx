import { prisma } from '../../lib/prisma';
import { FaInstagram, FaLinkedin, FaTwitter, FaYoutube, FaTiktok, FaFacebook, FaGlobe, FaGithub, FaWhatsapp } from 'react-icons/fa';
import { SiNotion, SiDiscord, SiSpotify } from 'react-icons/si';

interface PageProps {
  params: {
    username: string;
  };
}

const getSocialIcon = (url: string) => {
  try {
    const domain = new URL(url).hostname.replace('www.', '').toLowerCase();
    
    if (domain.includes('instagram.com')) return <FaInstagram className="text-pink-500" />;
    if (domain.includes('linkedin.com')) return <FaLinkedin className="text-blue-600" />;
    if (domain.includes('twitter.com') || domain.includes('x.com')) return <FaTwitter className="text-blue-400" />;
    if (domain.includes('youtube.com')) return <FaYoutube className="text-red-600" />;
    if (domain.includes('tiktok.com')) return <FaTiktok className="text-black dark:text-white" />;
    if (domain.includes('facebook.com')) return <FaFacebook className="text-blue-700" />;
    if (domain.includes('github.com')) return <FaGithub className="text-gray-800 dark:text-white" />;
    if (domain.includes('whatsapp.com')) return <FaWhatsapp className="text-green-500" />;
    if (domain.includes('notion.so')) return <SiNotion className="text-black dark:text-white" />;
    if (domain.includes('discord.com') || domain.includes('discord.gg')) return <SiDiscord className="text-indigo-600" />;
    if (domain.includes('spotify.com')) return <SiSpotify className="text-green-500" />;
    
    return <FaGlobe className="text-gray-500" />;
  } catch {
    return <FaGlobe className="text-gray-500" />;
  }
};

const getDomainName = (url: string) => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
};

export default async function UserLinksPage({ params }: PageProps) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      id: true,
      name: true,
      username: true,
      links: {
        select: {
          id: true,
          title: true,
          url: true,
        },
        orderBy: {
          id: 'asc',
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 px-6 py-16 flex flex-col items-center">
      <div className="text-center mb-12">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 mb-6 mx-auto flex items-center justify-center shadow-xl">
          <span className="text-3xl font-bold text-white">
            {(user.name || user.username).charAt(0).toUpperCase()}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] tracking-tight">
          {user.name || user.username}
        </h1>
        <p className="text-white/70">@{user.username}</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        {user.links.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/10">
            <p className="text-white/70 italic">Nenhum link cadastrado ainda.</p>
          </div>
        ) : (
          user.links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center w-full rounded-xl bg-white/10 backdrop-blur-sm text-white text-lg font-medium py-4 px-6
                         transition-all duration-300 hover:bg-white/20 hover:shadow-lg hover:shadow-purple-500/30 
                         hover:-translate-y-1 active:translate-y-0 select-none border border-white/20 hover:border-white/30"
            >
              <div className="mr-4 text-2xl">
                {getSocialIcon(link.url)}
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold">{link.title}</div>
                <div className="text-sm text-white/60 font-normal">
                  {getDomainName(link.url)}
                </div>
              </div>
              <div className="text-white/30 ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </a>
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