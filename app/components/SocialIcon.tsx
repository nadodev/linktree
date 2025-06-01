'use client';

import { FaInstagram, FaLinkedin, FaTwitter, FaYoutube, FaTiktok, FaFacebook, FaGithub, FaWhatsapp } from 'react-icons/fa';
import { SiNotion, SiDiscord, SiSpotify } from 'react-icons/si';

interface SocialIconProps {
  id: string;
  url: string;
  type: string;
  color: string;
  iconName: string;
}

const iconMap = {
  'instagram': FaInstagram,
  'linkedin': FaLinkedin,
  'twitter/x': FaTwitter,
  'youtube': FaYoutube,
  'tiktok': FaTiktok,
  'facebook': FaFacebook,
  'github': FaGithub,
  'whatsapp': FaWhatsapp,
  'notion': SiNotion,
  'discord': SiDiscord,
  'spotify': SiSpotify,
};

export default function SocialIcon({ id, url, type, color, iconName }: SocialIconProps) {
  const handleClick = async () => {
    try {
      await fetch(`/api/links/${id}/click`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error updating click count:', error);
    }
  };

  const Icon = iconMap[iconName.toLowerCase() as keyof typeof iconMap];
  if (!Icon) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`transform transition-all duration-300 hover:scale-110 ${color}`}
      onClick={handleClick}
    >
      <Icon className="w-6 h-6 hover:opacity-80" />
    </a>
  );
} 