import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - VoteMoi',
  description: 'Sign in to VoteMoi to start voting and sharing links',
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
