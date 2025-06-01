'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';

interface Link {
  id: string;
  title: string;
  url: string;
  active: boolean;
  order: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '' });

  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    try {
      const response = await fetch('/api/links');
      const data = await response.json();
      setLinks(data.sort((a: Link, b: Link) => a.order - b.order));
    } catch (error) {
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newLink,
          order: links.length,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add link');
      }

      const data = await response.json();
      setLinks([...links, data]);
      setNewLink({ title: '', url: '' });
      setShowAddForm(false);
      toast.success('Link added successfully');
    } catch (error) {
      toast.error('Failed to add link');
    }
  }

  async function handleDeleteLink(id: string) {
    try {
      const response = await fetch(`/api/links/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete link');
      }

      setLinks(links.filter(link => link.id !== id));
      toast.success('Link deleted successfully');
    } catch (error) {
      toast.error('Failed to delete link');
    }
  }

  async function handleToggleActive(id: string, active: boolean) {
    try {
      const response = await fetch(`/api/links/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active }),
      });

      if (!response.ok) {
        throw new Error('Failed to update link');
      }

      setLinks(links.map(link => 
        link.id === id ? { ...link, active } : link
      ));
      toast.success('Link updated successfully');
    } catch (error) {
      toast.error('Failed to update link');
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Links</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your Linktree links here. Your public page is available at{' '}
            <a
              href={`/${session?.user.username}`}
              className="text-indigo-600 hover:text-indigo-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              /{session?.user.username}
            </a>
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => setShowAddForm(true)}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add link
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddLink} className="mt-6 space-y-4 bg-white p-4 rounded-lg shadow">
          <div>
            <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
              Title
            </label>
            <div className="mt-2">
              <input
                type="text"
                name="title"
                id="title"
                required
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div>
            <label htmlFor="url" className="block text-sm font-medium leading-6 text-gray-900">
              URL
            </label>
            <div className="mt-2">
              <input
                type="url"
                name="url"
                id="url"
                required
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div className="flex justify-end gap-x-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Save
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {links.length === 0 ? (
              <div className="text-center py-12">
                <PlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No links</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new link.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                    Add link
                  </button>
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                      Title
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      URL
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {links.map((link) => (
                    <tr key={link.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {link.title}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                          {link.url}
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <button
                          onClick={() => handleToggleActive(link.id, !link.active)}
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            link.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {link.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 