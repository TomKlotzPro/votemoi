'use client';

import { useUsers } from '@/app/hooks/useUsers';
import { fr } from '@/app/translations/fr';
import { Menu, Transition } from '@headlessui/react';
import Image from 'next/image';
import { Fragment, useState } from 'react';
import UserForm from '../forms/UserForm';

export default function UserMenu() {
  const { currentUser, signOut } = useUsers();
  const [showUserForm, setShowUserForm] = useState(false);

  if (!currentUser) {
    return (
      <>
        <button
          onClick={() => setShowUserForm(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {fr.auth.signIn}
        </button>

        {showUserForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1e1e38] p-6 rounded-lg w-full max-w-md">
              <UserForm
                onClose={() => setShowUserForm(false)}
                onSubmit={(_id) => {
                  // Handle user creation/update here
                  setShowUserForm(false);
                }}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center space-x-3 hover:bg-white/5 rounded-lg px-4 py-2 transition-colors">
        <div className="relative w-8 h-8">
          <Image
            src={currentUser.avatarUrl || '/default-avatar.png'}
            alt={currentUser.name || ''}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <span className="text-white text-sm hidden sm:block">
          {currentUser.name}
        </span>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-[#1e1e38] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => signOut()}
                  className={`${
                    active ? 'bg-white/5' : ''
                  } block w-full px-4 py-2 text-left text-sm text-white`}
                >
                  {fr.auth.signOut}
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
