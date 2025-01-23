'use client';

import { useLinks } from './hooks/useLinks';
import { useUser } from './context/user-context';
import { fr } from './translations/fr';
import LinkList from './components/links/LinkList';
import AddLinkButton from './components/links/AddLinkButton';

export default function Home() {
  const {
    links,
    isLoading,
    error,
    addLink,
    removeLink,
    editLink,
    addComment,
    handleVote,
    handleUnvote,
  } = useLinks();
  const { user } = useUser();

  return (
    <main className="relative min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
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
            <AddLinkButton onAdd={(data) => user && addLink(data, user)} />
          </div>

          {/* Links Section */}
          <section className="space-y-8">
            <div className="bg-black/30 rounded-xl backdrop-blur-sm border border-white/10 shadow-xl">
              {error ? (
                <div className="text-red-500 text-center py-4">{error}</div>
              ) : (
                <LinkList
                  links={links}
                  isLoading={isLoading}
                  onVote={handleVote}
                  onUnvote={handleUnvote}
                  onAddComment={(linkId, content) => user && addComment(linkId, content, user)}
                  onDeleteLink={(linkId) => user && removeLink(linkId, user)}
                  onUpdateLink={(data) => user && editLink(data, user)}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
