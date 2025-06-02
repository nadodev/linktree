import React from 'react';
import { FaInstagram, FaLinkedin, FaTwitter, FaYoutube, FaTiktok, FaFacebook, FaGlobe } from 'react-icons/fa';
import { SiNotion, SiDiscord } from 'react-icons/si';

export const getSocialIcon = (url: string) => {
  const domain = new URL(url).hostname.replace('www.', '').toLowerCase();
  
  if (domain.includes('instagram.com')) return <FaInstagram className="text-pink-600" />;
  if (domain.includes('linkedin.com')) return <FaLinkedin className="text-blue-700" />;
  if (domain.includes('twitter.com') || domain.includes('x.com')) return <FaTwitter className="text-blue-400" />;
  if (domain.includes('youtube.com')) return <FaYoutube className="text-red-600" />;
  if (domain.includes('tiktok.com')) return <FaTiktok className="text-black" />;
  if (domain.includes('facebook.com')) return <FaFacebook className="text-blue-600" />;
  if (domain.includes('notion.so')) return <SiNotion className="text-black" />;
  if (domain.includes('discord.com') || domain.includes('discord.gg')) return <SiDiscord className="text-indigo-600" />;
  
  return <FaGlobe className="text-gray-500" />;
};

export const getSocialName = (url: string) => {
  const domain = new URL(url).hostname.replace('www.', '').toLowerCase();
  
  if (domain.includes('instagram.com')) return 'Instagram';
  if (domain.includes('linkedin.com')) return 'LinkedIn';
  if (domain.includes('twitter.com') || domain.includes('x.com')) return 'Twitter';
  if (domain.includes('youtube.com')) return 'YouTube';
  if (domain.includes('tiktok.com')) return 'TikTok';
  if (domain.includes('facebook.com')) return 'Facebook';
  if (domain.includes('notion.so')) return 'Notion';
  if (domain.includes('discord.com') || domain.includes('discord.gg')) return 'Discord';
  
  return new URL(url).hostname.replace('www.', '');
}; 