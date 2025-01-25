'use client';

import { useEffect, useState } from 'react';
import AuthForm from './components/auth/AuthForm';
import AddLinkButton from './components/links/AddLinkButton';
import LinkList from './components/links/LinkList';
import { useUser } from './context/user-context';
import { useLinks } from './hooks/useLinks';
import { fr } from './translations/fr';

export default function Home() {
  const { links, error, isLoading, addLink, vote, unvote, deleteLink, updateLink, addComment } = useLinks();
  const { user, setUser } = useUser();
  const [showAuthForm, setShowAuthForm] = useState(false);

  useEffect(() => {
    const handleShowAuthForm = () => setShowAuthForm(true);
    window.addEventListener('show-auth-form', handleShowAuthForm);
    return () =>
      window.removeEventListener('show-auth-form', handleShowAuthForm);
  }, []);

  const handleVote = async (linkId: string) => {
    if (user) {
      await vote(linkId, user.id);
    }
  };

  const handleUnvote = async (linkId: string) => {
    if (user) {
      await unvote(linkId, user.id);
    }
  };

  const handleDelete = async (linkId: string) => {
    if (user) {
      await deleteLink(linkId);
    }
  };

  const handleEdit = async (data: string) => {
    if (user) {
      const [id, newData] = JSON.parse(data);
      await updateLink(id, newData);
    }
  };

  const handleAddComment = async (linkId: string, content: string) => {
    if (user) {
      await addComment(linkId, user.id, content);
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
          <AddLinkButton onAdd={(data) => user && addLink(data)} />
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
            onAddComment={handleAddComment}
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
