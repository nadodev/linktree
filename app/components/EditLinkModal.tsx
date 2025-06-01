'use client';

import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface EditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    url: string;
    isSocial: boolean;
    socialType?: string;
    active: boolean;
  }) => void;
  link?: {
    id: string;
    title: string;
    url: string;
    isSocial: boolean;
    socialType?: string;
    active: boolean;
  };
}

const socialOptions = [
  { name: 'Instagram', pattern: 'instagram.com' },
  { name: 'LinkedIn', pattern: 'linkedin.com' },
  { name: 'Twitter/X', pattern: 'twitter.com' },
  { name: 'YouTube', pattern: 'youtube.com' },
  { name: 'TikTok', pattern: 'tiktok.com' },
  { name: 'Facebook', pattern: 'facebook.com' },
  { name: 'GitHub', pattern: 'github.com' },
  { name: 'WhatsApp', pattern: 'whatsapp.com' },
  { name: 'Notion', pattern: 'notion.so' },
  { name: 'Discord', pattern: 'discord.com' },
  { name: 'Spotify', pattern: 'spotify.com' },
];

export default function EditLinkModal({ isOpen, onClose, onSave, link }: EditLinkModalProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [isSocial, setIsSocial] = useState(false);
  const [socialType, setSocialType] = useState<string>('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (link) {
      setTitle(link.title);
      setUrl(link.url);
      setIsSocial(link.isSocial);
      setSocialType(link.socialType || '');
      setActive(link.active);
    } else {
      // Reset form when adding a new link
      setTitle('');
      setUrl('');
      setIsSocial(false);
      setSocialType('');
      setActive(true);
    }
  }, [link, isOpen]); // Add isOpen to dependencies to reset form when modal is opened/closed

  const handleClose = () => {
    // Reset form when closing
    setTitle('');
    setUrl('');
    setIsSocial(false);
    setSocialType('');
    setActive(true);
    onClose();
  };

  const handleSave = () => {
    if (!title || !url) {
      return; // Don't save if required fields are empty
    }

    onSave({
      title,
      url,
      isSocial,
      socialType: isSocial ? socialType : undefined,
      active,
    });
    onClose();
  };

  const handleSocialTypeChange = (type: string) => {
    setSocialType(type);
    const option = socialOptions.find(opt => opt.name.toLowerCase() === type.toLowerCase());
    if (option && !url) {
      setUrl(`https://${option.pattern}/`);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="space-y-4">
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                    {link ? 'Edit Link' : 'Add New Link'}
                  </Dialog.Title>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isSocial"
                        checked={isSocial}
                        onChange={(e) => setIsSocial(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="isSocial" className="text-sm font-medium text-gray-700">
                        Social Media Link
                      </label>
                    </div>
                  </div>

                  {isSocial && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Platform</label>
                      <select
                        value={socialType}
                        onChange={(e) => handleSocialTypeChange(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">Select a platform</option>
                        {socialOptions.map((option) => (
                          <option key={option.name} value={option.name.toLowerCase()}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL</label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="active"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="active" className="text-sm font-medium text-gray-700">
                        Active
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 