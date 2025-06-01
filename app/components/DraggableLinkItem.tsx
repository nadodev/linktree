'use client';

import { useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { FaInstagram, FaLinkedin, FaTwitter, FaYoutube, FaTiktok, FaFacebook, FaGithub, FaWhatsapp } from 'react-icons/fa';
import { SiNotion, SiDiscord, SiSpotify } from 'react-icons/si';
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DraggableLinkItemProps {
  id: string;
  title: string;
  url: string;
  active: boolean;
  isSocial: boolean;
  socialType?: string;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onEdit: (id: string) => void;
}

const socialIcons = {
  instagram: FaInstagram,
  linkedin: FaLinkedin,
  'twitter/x': FaTwitter,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  facebook: FaFacebook,
  github: FaGithub,
  whatsapp: FaWhatsapp,
  notion: SiNotion,
  discord: SiDiscord,
  spotify: SiSpotify,
};

export default function DraggableLinkItem({
  id,
  title,
  url,
  active,
  isSocial,
  socialType,
  onDelete,
  onToggleActive,
  onEdit,
}: DraggableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const SocialIcon = socialType ? socialIcons[socialType.toLowerCase() as keyof typeof socialIcons] : null;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(id);
  };

  const handleToggleActive = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleActive(id, !active);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center justify-between gap-x-4 rounded-lg border bg-white p-4 shadow-sm hover:shadow transition-all
                 ${isDragging ? 'border-indigo-500 shadow-lg' : 'border-gray-200'}`}
    >
      <div className="flex min-w-0 gap-x-4 items-center">
        <div className="cursor-move p-2 hover:bg-gray-50 rounded" {...attributes} {...listeners}>
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
          </svg>
        </div>
        
        <div className="min-w-0 flex-auto">
          <div className="flex items-center gap-2">
            {isSocial && SocialIcon && (
              <SocialIcon className={`text-lg ${
                socialType?.toLowerCase() === 'instagram' ? 'text-pink-500' :
                socialType?.toLowerCase() === 'linkedin' ? 'text-blue-600' :
                socialType?.toLowerCase() === 'twitter/x' ? 'text-blue-400' :
                socialType?.toLowerCase() === 'youtube' ? 'text-red-600' :
                socialType?.toLowerCase() === 'tiktok' ? 'text-black' :
                socialType?.toLowerCase() === 'facebook' ? 'text-blue-700' :
                socialType?.toLowerCase() === 'github' ? 'text-gray-900' :
                socialType?.toLowerCase() === 'whatsapp' ? 'text-green-500' :
                socialType?.toLowerCase() === 'notion' ? 'text-gray-900' :
                socialType?.toLowerCase() === 'discord' ? 'text-indigo-600' :
                socialType?.toLowerCase() === 'spotify' ? 'text-green-500' :
                'text-gray-500'
              }`} />
            )}
            <p className="text-sm font-medium leading-6 text-gray-900">{title}</p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 truncate text-xs leading-5 text-gray-500 hover:text-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {url}
          </a>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleToggleActive}
          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
            active
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {active ? 'Ativo' : 'Inativo'}
        </button>

        <button
          type="button"
          onClick={handleEdit}
          className="p-1 text-gray-400 hover:text-gray-500"
        >
          <PencilIcon className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="p-1 text-gray-400 hover:text-red-500"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
} 