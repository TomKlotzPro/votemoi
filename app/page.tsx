'use client';

import { useEffect, useState } from 'react';
import AuthForm from './components/auth/AuthForm';
import AddLinkButton from './components/links/AddLinkButton';
import LinkList from './components/links/LinkList';
import { showToast } from './components/ui/Toast';
import { useUser } from './context/user-context';
import { useLinks } from './hooks/useLinks';
import { fr } from './translations/fr';
import { FormattedLink } from './types/link';

export default function Home() {
  const {
    links,
    error,
    isLoading,
    addLink,
    vote,
    unvote,
    deleteLink,
    updateLink,
  } = useLinks();
  const { user, setUser } = useUser();
  const [showAuthForm, setShowAuthForm] = useState(false);

  useEffect(() => {
    const handleShowAuthForm = () => setShowAuthForm(true);
    window.addEventListener('show-auth-form', handleShowAuthForm);
    return () =>
      window.removeEventListener('show-auth-form', handleShowAuthForm);
  }, []);

  const handleVote = async (linkId: string) => {
    try {
      if (!user) return;
      await vote(linkId);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleUnvote = async (linkId: string) => {
    try {
      if (!user) return;
      await unvote(linkId);
    } catch (error) {
      console.error('Error unvoting:', error);
    }
  };

  const handleDelete = async (linkId: string) => {
    if (user) {
      await deleteLink(linkId);
    }
  };

  const handleEdit = async (link: Partial<FormattedLink>) => {
    if (user && link.id && link.url) {
      try {
        await updateLink(link.id, {
          url: link.url,
          title: link.title,
          description: link.description || undefined,
        });
        showToast(fr.common.success, 'success');
      } catch (error) {
        showToast(
          error instanceof Error ? error.message : fr.errors.failedToUpdateLink,
          'error'
        );
      }
    }
  };

  return (
    <main className="container mx-auto px-4 sm:px-6 pt-20 pb-12">
      <div className="max-w-4xl mx-auto flex flex-col gap-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
            {fr.common.welcome}
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
            {fr.common.description}
          </p>
        </section>

        {/* Add Link Button */}
        <div className="flex justify-center">
          <AddLinkButton
            onAdd={async (data) => {
              if (user) {
                return addLink(data);
              }
            }}
          />
        </div>

        {/* Links Section */}
        <section className="space-y-8">
          {error && (
            <div className="rounded-lg bg-red-500/10 p-4 text-red-500 text-center">
              {error}
            </div>
          )}
          <LinkList
            links={links}
            isLoading={isLoading}
            onVote={handleVote}
            onUnvote={handleUnvote}
            onDelete={handleDelete}
            onEdit={handleEdit}
            user={user}
          />
        </section>

        {showAuthForm && (
          <AuthForm
            onSuccess={(user) => {
              setUser(user);
              setShowAuthForm(false);
            }}
            onClose={() => setShowAuthForm(false)}
          />
        )}
      </div>
    </main>
  );
}
