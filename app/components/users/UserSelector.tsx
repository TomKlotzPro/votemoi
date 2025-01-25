'use client';

import { fr } from '@/app/translations/fr';
import { FormattedUser } from '@/app/types/user';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';
import { Fragment } from 'react';

type UserSelectorProps = {
  users: FormattedUser[];
  selectedUser: FormattedUser | null;
  onSelect: (user: FormattedUser) => void;
};

export default function UserSelector({
  users,
  selectedUser,
  onSelect,
}: UserSelectorProps) {
  return (
    <Listbox value={selectedUser} onChange={onSelect}>
      <div className="relative mt-1">
        <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 dark:bg-gray-800 sm:text-sm">
          {selectedUser ? (
            <div className="flex items-center gap-2">
              {selectedUser.avatarUrl && (
                <Image
                  src={selectedUser.avatarUrl}
                  alt={selectedUser.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span className="block truncate">{selectedUser.name}</span>
            </div>
          ) : (
            <span className="block truncate text-gray-400">
              {fr.users.selectUser}
            </span>
          )}
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-gray-800 sm:text-sm">
            {users.map((user) => (
              <Listbox.Option
                key={user.id}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-900 dark:text-gray-100'
                  }`
                }
                value={user}
              >
                {({ selected }) => (
                  <>
                    <div className="flex items-center gap-2">
                      {user.avatarUrl && (
                        <Image
                          src={user.avatarUrl}
                          alt={user.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      )}
                      <span
                        className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                      >
                        {user.name}
                      </span>
                    </div>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
