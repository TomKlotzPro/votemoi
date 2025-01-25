'use client';

import React from 'react';
import { fr } from '@/app/translations/fr';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';

type AddLinkFormProps = {
  onSubmit: (data: {
    url: string;
    title?: string;
    description?: string;
  }) => Promise<void>;
  onClose: () => void;
  isOpen: boolean;
};

export default function AddLinkForm({ onSubmit, onClose, isOpen }: AddLinkFormProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUrl('');
      setTitle('');
      setDescription('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError(fr.errors.urlRequired);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({
        url: url.trim(),
        title: title.trim(),
        description: description.trim(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : fr.errors.unknownError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" aria-hidden="true" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-[#1e1e38]/95 backdrop-blur-sm shadow-xl rounded-2xl border border-purple-500/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Dialog.Title as="h3" className="text-lg font-medium text-gray-200">
                    {fr.common.addLink}
                  </Dialog.Title>
                  <p className="mt-1 text-sm text-gray-400">
                    {fr.links.shareLink}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 text-gray-400 hover:bg-purple-500/10 hover:text-purple-400 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="url"
                    className="block text-sm font-medium text-gray-300 mb-1.5"
                  >
                    {fr.links.urlLabel} <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="url"
                    name="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    className="w-full rounded-lg bg-[#1e1e38] border border-purple-500/20 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-400 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/10 transition-colors"
                    placeholder={fr.placeholders.linkUrl}
                  />
                </div>

                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center justify-between"
                  >
                    <span>{fr.links.titleLabel}</span>
                    <span className="text-xs text-gray-400">{fr.common.optional}</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg bg-[#1e1e38] border border-purple-500/20 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-400 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/10 transition-colors"
                    placeholder={fr.placeholders.linkTitle}
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center justify-between"
                  >
                    <span>{fr.links.descriptionLabel}</span>
                    <span className="text-xs text-gray-400">{fr.common.optional}</span>
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg bg-[#1e1e38] border border-purple-500/20 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-400 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/10 transition-colors resize-none"
                    placeholder={fr.placeholders.linkDescription}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 px-4 py-2.5 rounded-lg">
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-400 hover:bg-purple-500/10 hover:text-purple-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 transition-colors"
                    disabled={isSubmitting}
                  >
                    {fr.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-medium text-white hover:from-purple-500 hover:to-pink-400 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? fr.common.adding : fr.common.add}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
