'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';
import { FaInstagram, FaLinkedin, FaTwitter, FaYoutube, FaTiktok, FaFacebook, FaGithub, FaWhatsapp } from 'react-icons/fa';
import { SiNotion, SiDiscord, SiSpotify } from 'react-icons/si';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableLinkItem from '../components/DraggableLinkItem';
import EditLinkModal from '../components/EditLinkModal';
import { useRouter } from 'next/navigation';

interface Link {
  id: string;
  title: string;
  url: string;
  active: boolean;
  order: number;
  isSocial: boolean;
  socialType?: string;
}


export default function DashboardPage() {
  const { data: session } = useSession();
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLink, setNewLink] = useState({
    title: '',
    url: '',
    isSocial: false,
    socialType: '',
  });
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    try {
      const response = await fetch('/api/links');
      if (!response.ok) {
        throw new Error('Failed to fetch links');
      }
      const data = await response.json();
      setLinks(data.sort((a: Link, b: Link) => a.order - b.order));
    } catch (error) {
      console.error('Error fetching links:', error);
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setLinks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        fetch('/api/links/reorder', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: newItems.map((item, index) => ({
              id: item.id,
              order: index,
            })),
          }),
        });

        return newItems;
      });
    }
  };

  const handleEditLink = (link: Link) => {
    setEditingLink(link);
    setIsModalOpen(true);
  };

  const handleSaveLink = async (data: {
    title: string;
    url: string;
    isSocial: boolean;
    socialType?: string;
    active: boolean;
  }) => {
    try {
      if (editingLink) {
        const response = await fetch(`/api/links/${editingLink.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update link');
        }

        const updatedLink = await response.json();
        setLinks((prevLinks) =>
          prevLinks.map((link) =>
            link.id === editingLink.id
              ? { ...link, ...updatedLink }
              : link
          )
        );
        toast.success('Link updated successfully');
      } else {
        const response = await fetch('/api/links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            order: links.length,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create link');
        }

        const newLink = await response.json();
        setLinks((prevLinks) => [...prevLinks, newLink]);
        toast.success('Link created successfully');
      }

      setIsModalOpen(false);
      setEditingLink(null);
      router.refresh();
    } catch (error) {
      console.error('Error saving link:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save link');
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      const response = await fetch(`/api/links/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete link');
      }

      setLinks((prevLinks) => prevLinks.filter((link) => link.id !== id));
      toast.success('Link deleted successfully');
      router.refresh();
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('Failed to delete link');
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const response = await fetch(`/api/links/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active }),
      });

      if (!response.ok) {
        throw new Error('Failed to update link');
      }

      setLinks((prevLinks) =>
        prevLinks.map((link) =>
          link.id === id ? { ...link, active } : link
        )
      );
      toast.success('Link status updated successfully');
      router.refresh();
    } catch (error) {
      console.error('Error updating link status:', error);
      toast.error('Failed to update link status');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Links</h1>
        <button
          onClick={() => {
            setEditingLink(null);
            setIsModalOpen(true);
          }}
          className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Adicionar Novo Link
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={links.map((link) => link.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {links.map((link) => (
              <DraggableLinkItem
                key={link.id}
                id={link.id}
                title={link.title}
                url={link.url}
                active={link.active}
                isSocial={link.isSocial}
                socialType={link.socialType}
                onDelete={handleDeleteLink}
                onToggleActive={handleToggleActive}
                onEdit={() => handleEditLink(link)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <EditLinkModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLink(null);
        }}
        onSave={handleSaveLink}
        link={editingLink || undefined}
      />
    </div>
  );
} 