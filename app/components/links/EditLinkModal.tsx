'use client';

import { fr } from '@/app/translations/fr';
import { FormattedLink } from '@/app/types/link';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import React, { Fragment } from 'react';

interface EditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string, title: string, description: string | null) => void;
  link: FormattedLink;
}

export default function EditLinkModal({
  isOpen,
  onClose,
  onSubmit,
  link,
}: EditLinkModalProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(
      formData.get('url') as string,
      formData.get('title') as string,
      formData.get('description') as string
    );
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={onClose}
      >
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
            <div
              className="fixed inset-0 bg-black/25 backdrop-blur-sm"
              aria-hidden="true"
            />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
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
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium text-gray-200"
                  >
                    {fr.common.editLink}
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
                    <span>{fr.links.urlLabel}</span>
                  </label>
                  <input
                    type="url"
                    name="url"
                    id="url"
                    required
                    defaultValue={link.url}
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
                    <span className="text-xs text-gray-400">
                      {fr.common.optional}
                    </span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    defaultValue={link.title}
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
                    <span className="text-xs text-gray-400">
                      {fr.common.optional}
                    </span>
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    defaultValue={link.description || ''}
                    className="w-full rounded-lg bg-[#1e1e38] border border-purple-500/20 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-400 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/10 transition-colors resize-none"
                    placeholder={fr.placeholders.linkDescription}
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-400 hover:bg-purple-500/10 hover:text-purple-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 transition-colors"
                  >
                    {fr.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-medium text-white hover:from-purple-500 hover:to-pink-400 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 transition-all"
                  >
                    {fr.common.save}
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
