'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { fr } from '@/app/translations/fr';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  comment: string;
  onChange: (value: string) => void;
}

export default function CommentModal({
  isOpen,
  onClose,
  onSubmit,
  comment,
  onChange,
}: CommentModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

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
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-[var(--text-primary)]"
                >
                  {fr.forms.comment}
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4">
                  <textarea
                    value={comment}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={fr.placeholders.comment}
                    rows={4}
                    className="w-full px-4 py-3 bg-black/50 backdrop-blur-sm rounded-xl border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-colors resize-none"
                  />

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 rounded-lg"
                    >
                      {fr.actions.cancel}
                    </button>
                    <button
                      type="submit"
                      disabled={!comment.trim()}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        comment.trim()
                          ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90'
                          : 'bg-[var(--primary)]/50 text-white/50 cursor-not-allowed'
                      } focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75`}
                    >
                      {fr.actions.submit}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
