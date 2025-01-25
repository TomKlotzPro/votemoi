import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

type ToastType = 'success' | 'error';

export const showToast = (message: string, type: ToastType = 'success') => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } pointer-events-auto flex max-w-xs items-center rounded-lg bg-[#1e1e38]/80 backdrop-blur-md shadow-lg ring-1 ${
          type === 'success'
            ? 'ring-purple-500/20'
            : 'ring-red-500/20'
        }`}
      >
        <div className="flex items-center p-2">
          {type === 'success' ? (
            <CheckCircleIcon className="h-5 w-5 text-purple-500" aria-hidden="true" />
          ) : (
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
          )}
          <p className="ml-2 text-sm font-medium text-gray-100">{message}</p>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-4 inline-flex rounded-md p-1 hover:bg-[#1e1e38] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <span className="sr-only">Close</span>
            <XMarkIcon 
              className={`h-4 w-4 ${
                type === 'success' 
                  ? 'text-purple-400 hover:text-purple-500' 
                  : 'text-red-400 hover:text-red-500'
              }`} 
              aria-hidden="true" 
            />
          </button>
        </div>
      </div>
    ),
    {
      position: 'bottom-right',
      duration: 3000,
    }
  );
};
