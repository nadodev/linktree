'use client';

import { FaInstagram, FaLinkedin, FaTwitter, FaYoutube, FaTiktok, FaFacebook, FaGlobe, FaGithub, FaWhatsapp } from 'react-icons/fa';
import { SiNotion, SiDiscord, SiSpotify } from 'react-icons/si';
import { motion } from 'framer-motion';
import LinkItem from './LinkItem';
import SocialIcon from './SocialIcon';

interface Link {
  id: string;
  title: string;
  url: string;
  isSocial: boolean;
  socialType?: string;
}

interface User {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  theme: string | null;
  bio: string | null;
  backgroundColor: string | null;
  backgroundImage: string | null;
  links: Link[];
}

interface UserLinksClientProps {
  user: User;
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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function UserLinksClient({ user }: UserLinksClientProps) {
  const backgroundStyle = user.backgroundImage ? {
    backgroundImage: `linear-gradient(to bottom, ${user.backgroundColor || 'rgba(0,0,0,0.5)'}, ${user.backgroundColor || 'rgba(0,0,0,0.5)'}), url(${user.backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {
    backgroundColor: user.backgroundColor || undefined,
  };

  const backgroundClass = !user.backgroundColor && !user.backgroundImage 
    ? `bg-gradient-to-br ${user.theme || 'from-indigo-900 via-purple-900 to-pink-800'}`
    : '';

  const socialLinks = user.links.filter(link => link.isSocial);
  const regularLinks = user.links.filter(link => !link.isSocial);

  return (
    <main 
      className={`min-h-screen ${backgroundClass} px-6 py-16 flex flex-col items-center relative overflow-hidden`}
      style={backgroundStyle}
    >
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <motion.div 
        className="text-center relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {user.image ? (
          <div className="relative inline-block">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full blur-xl opacity-50"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.3, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.img
              src={user.image}
              alt={user.name || user.username}
              className="w-24 h-24 rounded-full mb-6 mx-auto object-cover border-2 border-white/20 relative z-10"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            />
          </div>
        ) : (
          <motion.div 
            className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-500 to-violet-600 mb-6 mx-auto flex items-center justify-center shadow-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-3xl font-bold text-white">
              {(user.name || user.username).charAt(0).toUpperCase()}
            </span>
          </motion.div>
        )}
        
        <motion.h1 
          className="text-4xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)] tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {user.name || user.username}
        </motion.h1>
        
        <motion.p 
          className="text-white/70 mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          @{user.username}
        </motion.p>
        
        {user.bio && (
          <motion.p 
            className="text-white/90 mb-6 max-w-md mx-auto text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {user.bio}
          </motion.p>
        )}

        {/* Social Media Icons */}
        {socialLinks.length > 0 && (
          <motion.div 
            className="flex justify-center gap-4 mb-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {socialLinks.map((link) => {
              const social = socialOptions.find(s => s.name.toLowerCase() === link.socialType?.toLowerCase());
              if (social) {
                return (
                  <motion.div
                    key={link.id}
                    variants={item}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SocialIcon
                      id={link.id}
                      url={link.url}
                      type={link.socialType || ''}
                      color={social.color}
                      iconName={social.name}
                    />
                  </motion.div>
                );
              }
              return null;
            })}
          </motion.div>
        )}
      </motion.div>

      <motion.div 
        className="w-full max-w-md space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {regularLinks.length === 0 ? (
          <motion.div 
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/10"
            variants={item}
          >
            <p className="text-white/70 italic">Nenhum link cadastrado ainda.</p>
          </motion.div>
        ) : (
          regularLinks.map((link) => (
            <motion.div
              key={link.id}
              variants={item}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LinkItem
                id={link.id}
                title={link.title}
                url={link.url}
                isSocial={link.isSocial}
                socialType={link.socialType || undefined}
              />
            </motion.div>
          ))
        )}
      </motion.div>

      <motion.footer 
        className="mt-24 pt-8 border-t border-white/10 w-full max-w-md text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <p className="text-white/50 text-sm">
          Feito com <span className="text-pink-400">♥</span> usando LinkTree Clone
        </p>
      </motion.footer>
    </main>
  );
} 