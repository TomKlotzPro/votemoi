'use client';

import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { fr } from '@/app/translations/fr';

interface LinkCardMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export default function LinkCardMenu({ onEdit, onDelete }: LinkCardMenuProps) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="p-1.5 rounded-full hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
        <EllipsisVerticalIcon className="w-5 h-5" />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-40 rounded-xl bg-black/90 backdrop-blur-xl shadow-lg ring-1 ring-black/5 focus:outline-none py-1.5 border border-[var(--border)] divide-y divide-[var(--border)]">
          <div className="py-0.5">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onEdit}
                  className={`text-[var(--text-primary)] hover:text-[var(--primary)] group flex w-full items-center justify-between px-3 py-2 text-sm font-medium transition-all duration-200`}
                >
                  {fr.actions.edit}
                  <PencilIcon className="w-4 h-4 ml-2 text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors duration-200" />
                </button>
              )}
            </Menu.Item>
          </div>
          <div className="py-0.5">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onDelete}
                  className={`text-[var(--text-primary)] hover:text-rose-500 group flex w-full items-center justify-between px-3 py-2 text-sm font-medium transition-all duration-200`}
                >
                  {fr.actions.delete}
                  <TrashIcon className="w-4 h-4 ml-2 text-[var(--text-secondary)] group-hover:text-rose-500 transition-colors duration-200" />
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
