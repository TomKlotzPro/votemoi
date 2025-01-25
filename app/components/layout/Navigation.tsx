'use client';

import { useUser } from '@/app/context/user-context';
import { fr } from '@/app/translations/fr';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';

export default function Navigation() {
  const { user, setUser } = useUser();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#1e1e38]/80 backdrop-blur-md border-b border-purple-500/20 h-16">
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          <Link href="/" className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/50 to-purple-400/0 opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="relative text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {fr.common.title}
            </span>
          </Link>

          <div className="flex items-center">
            {user ? (
              <Menu as="div" className="relative inline-block text-left">
                <Menu.Button className="flex items-center space-x-3 hover:bg-white/5 rounded-lg px-3 py-2 transition-all duration-200 h-10">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.name}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    ) : (
                      <UserCircleIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-300 whitespace-nowrap">
                    {user.name}
                  </span>
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
                  <Menu.Items className="absolute right-0 mt-1 w-56 origin-top-right rounded-lg border border-purple-500/20 bg-[#1e1e38] shadow-lg backdrop-blur-sm focus:outline-none z-50">
                    <div className="p-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() =>
                              window.dispatchEvent(
                                new CustomEvent('show-auth-form')
                              )
                            }
                            className={`${
                              active ? 'bg-purple-500/10 text-primary' : 'text-gray-300'
                            } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors duration-200`}
                          >
                            <UserCircleIcon 
                              className={`${
                                active ? 'text-primary' : 'text-gray-300'
                              } mr-2 h-5 w-5 transition-colors duration-200`} 
                              aria-hidden="true"
                            />
                            {fr.common.editProfile}
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setUser(null)}
                            className={`${
                              active ? 'bg-purple-500/10 text-red-500' : 'text-gray-300'
                            } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors duration-200`}
                          >
                            <ArrowRightOnRectangleIcon 
                              className={`${
                                active ? 'text-red-500' : 'text-gray-300'
                              } mr-2 h-5 w-5 transition-colors duration-200`} 
                              aria-hidden="true"
                            />
                            {fr.auth.signOut}
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('show-auth-form'));
                }}
                className="h-10 px-4 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg hover:from-purple-500 hover:to-pink-400 transition-all duration-200 hover:scale-105"
              >
                {fr.auth.signIn}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
