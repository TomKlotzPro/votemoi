'use client';

import AuthForm from '@/app/components/auth/AuthForm';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to VoteMoi
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your name to continue
          </p>
        </div>
        <AuthForm
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          onSuccess={(user) => {
            router.push('/');
          }}
          onClose={() => {
            router.push('/');
          }}
        />
      </div>
    </div>
  );
}
