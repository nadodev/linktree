'use client';

import { useState } from 'react';
import { FaInstagram, FaLinkedin, FaTwitter, FaYoutube, FaTiktok, FaFacebook, FaGlobe, FaGithub, FaWhatsapp } from 'react-icons/fa';
import { SiNotion, SiDiscord, SiSpotify } from 'react-icons/si';

interface LinkItemProps {
  id: string;
  title: string;
  url: string;
  isSocial?: boolean;
  socialType?: string;
}

const getSocialIcon = (url: string, socialType?: string) => {
  if (socialType) {
    const type = socialType.toLowerCase();
    if (type === 'instagram') return <FaInstagram className="text-pink-500" />;
    if (type === 'linkedin') return <FaLinkedin className="text-blue-600" />;
    if (type === 'twitter/x') return <FaTwitter className="text-blue-400" />;
    if (type === 'youtube') return <FaYoutube className="text-red-600" />;
    if (type === 'tiktok') return <FaTiktok className="text-black dark:text-white" />;
    if (type === 'facebook') return <FaFacebook className="text-blue-700" />;
    if (type === 'github') return <FaGithub className="text-gray-800 dark:text-white" />;
    if (type === 'whatsapp') return <FaWhatsapp className="text-green-500" />;
    if (type === 'notion') return <SiNotion className="text-black dark:text-white" />;
    if (type === 'discord') return <SiDiscord className="text-indigo-600" />;
    if (type === 'spotify') return <SiSpotify className="text-green-500" />;
  }

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
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  } catch {
    return url;
  }
};

export default function LinkItem({ id, title, url, isSocial, socialType }: LinkItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = async () => {
    try {
      await fetch(`/api/links/${id}/click`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error updating click count:', error);
    }
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative block w-full overflow-hidden rounded-2xl backdrop-blur-md 
                 transition-all duration-300 hover:scale-[1.02] hover:bg-white/15
                 ${isSocial ? 'bg-white/5' : 'bg-white/10'}`}
    >
      {/* Animated border gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/25 to-transparent 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    animate-[gradient_3s_ease-in-out_infinite]" />
      
      {/* Glass effect overlay */}
      <div className="absolute inset-[1px] rounded-2xl bg-white/5 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative flex items-center p-4">
        {/* Icon with glow effect */}
        <div className={`mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl
                      transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg
                      ${isHovered ? 'shadow-[0_0_15px_rgba(255,255,255,0.3)]' : ''}`}>
          {getSocialIcon(url, socialType)}
        </div>

        {/* Text content */}
        <div className="flex-1 overflow-hidden">
          <div className="font-semibold text-white transition-colors duration-300 group-hover:text-white/90">
            {title}
          </div>
          {!isSocial && (
            <div className="truncate text-sm text-white/60 transition-colors duration-300 group-hover:text-white/70">
              {getDomainName(url)}
            </div>
          )}
        </div>

        {/* Arrow icon with animation */}
        <div className="ml-4 text-white/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white/60">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </a>
  );
} 