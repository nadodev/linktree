'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { 
  PlusIcon, 
  ChartBarIcon, 
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableLinkItem from '../components/DraggableLinkItem';
import EditLinkModal from '../components/EditLinkModal';
import { useRouter } from 'next/router'; // Fixed import
import { motion } from 'framer-motion';

interface Link {
  id: string;
  title: string;
  url: string;
  active: boolean;
  order: number;
  isSocial: boolean;
  socialType?: string;
  clicks?: number;
}

interface Analytics {
  totalClicks: number;
  totalViews: number;
  clickRate: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [links, setLinks] = useState<Link[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalClicks: 0,
    totalViews: 0,
    clickRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
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
    fetchAnalytics();
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

  async function fetchAnalytics() {
    setAnalyticsLoading(true);
    try {
      // Temporary mock data until the API is ready
      setAnalytics({
        totalClicks: 150,
        totalViews: 300,
        clickRate: 0.5,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
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
      window.location.reload();
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
      window.location.reload();
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
      window.location.reload();
    } catch (error) {
      console.error('Error updating link status:', error);
      toast.error('Failed to update link status');
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const socialLinks = links.filter(link => link.isSocial);
  const regularLinks = links.filter(link => !link.isSocial);
  const activeLinks = links.filter(link => link.active);
  const inactiveLinks = links.filter(link => !link.active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-gray-600">Manage your links and track performance</p>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          {/* Total Links Card */}
          <motion.div 
            variants={fadeInUp}
            className="group bg-white rounded-2xl shadow-sm p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-indigo-100 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg transform transition-transform group-hover:scale-110 group-hover:rotate-12">
                  <LinkIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  Total Links
                </span>
              </div>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-gray-900">{links.length}</p>
                <span className="ml-2 text-sm text-gray-500">links</span>
              </div>
              <div className="mt-2 flex items-center space-x-3 text-sm text-gray-500">
                <span>{socialLinks.length} social</span>
                <span>•</span>
                <span>{regularLinks.length} regular</span>
              </div>
            </div>
          </motion.div>

          {/* Active Links Card */}
          <motion.div 
            variants={fadeInUp}
            className="group bg-white rounded-2xl shadow-sm p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-green-100 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-50 rounded-lg transform transition-transform group-hover:scale-110 group-hover:rotate-12">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">
                  Active
                </span>
              </div>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-gray-900">{activeLinks.length}</p>
                <span className="ml-2 text-sm text-gray-500">active links</span>
              </div>
              <div className="mt-2">
                <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${(activeLinks.length / links.length) * 100}%` }}
                  ></div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {((activeLinks.length / links.length) * 100).toFixed(0)}% of total links
                </p>
              </div>
            </div>
          </motion.div>

          {/* Inactive Links Card */}
          <motion.div 
            variants={fadeInUp}
            className="group bg-white rounded-2xl shadow-sm p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-red-100 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-red-50 rounded-lg transform transition-transform group-hover:scale-110 group-hover:rotate-12">
                  <XCircleIcon className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-sm font-medium text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">
                  Inactive
                </span>
              </div>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-gray-900">{inactiveLinks.length}</p>
                <span className="ml-2 text-sm text-gray-500">inactive links</span>
              </div>
              <div className="mt-2">
                <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${(inactiveLinks.length / links.length) * 100}%` }}
                  ></div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {((inactiveLinks.length / links.length) * 100).toFixed(0)}% of total links
                </p>
              </div>
            </div>
          </motion.div>

          {/* Performance Card */}
          <motion.div 
            variants={fadeInUp}
            className="group bg-white rounded-2xl shadow-sm p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-purple-100 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-50 rounded-lg transform transition-transform group-hover:scale-110 group-hover:rotate-12">
                  <ChartBarIcon className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
                  Performance
                </span>
              </div>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsLoading ? '-' : `${(analytics.clickRate * 100).toFixed(1)}%`}
                </p>
                <span className="ml-2 text-sm text-gray-500">click rate</span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {analyticsLoading ? '-' : `${analytics.totalClicks} clicks • ${analytics.totalViews} views`}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Links Management Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 backdrop-blur-sm bg-white/50"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <SparklesIcon className="w-6 h-6 mr-2 text-indigo-600" />
                Manage Links
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop to reorder your links
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingLink(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add New Link
            </motion.button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {/* Social Links Section */}
            {socialLinks.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-50 p-1.5 rounded-lg mr-2 transform transition-transform group-hover:rotate-12">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </span>
                  Social Media Links
                  <span className="ml-3 text-sm text-gray-500">({socialLinks.length})</span>
                </h3>
                <SortableContext
                  items={socialLinks.map((link) => link.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <motion.div 
                    variants={staggerChildren}
                    initial="initial"
                    animate="animate"
                    className="space-y-3"
                  >
                    {socialLinks.map((link) => (
                      <motion.div
                        key={link.id}
                        variants={fadeInUp}
                      >
                        <DraggableLinkItem
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
                      </motion.div>
                    ))}
                  </motion.div>
                </SortableContext>
              </motion.div>
            )}

            {/* Regular Links Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <span className="bg-purple-50 p-1.5 rounded-lg mr-2 transform transition-transform group-hover:rotate-12">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </span>
                Regular Links
                <span className="ml-3 text-sm text-gray-500">({regularLinks.length})</span>
              </h3>
              <SortableContext
                items={regularLinks.map((link) => link.id)}
                strategy={verticalListSortingStrategy}
              >
                <motion.div 
                  variants={staggerChildren}
                  initial="initial"
                  animate="animate"
                  className="space-y-3"
                >
                  {regularLinks.map((link) => (
                    <motion.div
                      key={link.id}
                      variants={fadeInUp}
                    >
                      <DraggableLinkItem
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
                    </motion.div>
                  ))}
                </motion.div>
              </SortableContext>
            </motion.div>
          </DndContext>
        </motion.div>
      </div>

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