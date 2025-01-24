'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = 'danger'
}: ConfirmDialogProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-black/90 backdrop-blur-xl p-6 text-left align-middle shadow-xl transition-all border border-[var(--border)]">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    type === 'danger' ? 'bg-red-500/10' : 
                    type === 'warning' ? 'bg-yellow-500/10' : 
                    'bg-blue-500/10'
                  }`}>
                    <ExclamationTriangleIcon className={`h-6 w-6 ${
                      type === 'danger' ? 'text-red-400' : 
                      type === 'warning' ? 'text-yellow-400' : 
                      'text-blue-400'
                    }`} />
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-[var(--text-primary)]"
                  >
                    {title}
                  </Dialog.Title>
                </div>

                <div className="mt-3">
                  <p className="text-sm text-[var(--text-secondary)]">
                    {message}
                  </p>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75"
                    onClick={onClose}
                  >
                    {cancelText}
                  </button>
                  <button
                    type="button"
                    className={`inline-flex justify-center rounded-lg px-4 py-2 text-sm font-medium ${
                      type === 'danger' ? 'bg-red-500 hover:bg-red-600 text-white' : 
                      type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 
                      'bg-blue-500 hover:bg-blue-600 text-white'
                    } focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75`}
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                  >
                    {confirmText}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
