import { fr } from '@/app/translations/fr';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface LinkCardMenuProps {
  onDelete: () => Promise<void>;
}

export default function LinkCardMenu({ onDelete }: LinkCardMenuProps) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="p-2 hover:bg-white/5 rounded-full">
        <span className="sr-only">{fr.common.openMenu}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
          />
        </svg>
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {() => (
                <button
                  onClick={onDelete}
                  className="text-red-600 hover:bg-red-50 block w-full px-4 py-2 text-left text-sm"
                >
                  {fr.common.delete}
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
