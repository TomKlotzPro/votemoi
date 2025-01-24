'use client';

import { useState } from 'react';
import { User } from '@/app/types/user';
import { fr } from '@/app/translations/fr';
import { Menu } from '@headlessui/react';
import AnimatedAvatar from '@/app/components/ui/AnimatedAvatar';
import AnimatedText from '@/app/components/ui/AnimatedText';
import { useUser } from '@/app/context/user-context';

interface UserMenuProps {
  user: User;
}

export default function UserMenu({ user }: UserMenuProps) {
  const { logout } = useUser();

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
        <AnimatedAvatar
          src={user.avatarUrl}
          alt={user.name}
          className="w-8 h-8 rounded-full"
        />
        <AnimatedText text={user.name} className="text-sm font-medium text-white" />
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-black/90 backdrop-blur-lg border border-white/10 rounded-lg shadow-lg overflow-hidden">
        <div className="py-1">
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={logout}
                className={`w-full text-left px-4 py-2 text-sm ${
                  active ? 'bg-white/5 text-white' : 'text-white/80'
                }`}
              >
                {fr.actions.logout}
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
}
