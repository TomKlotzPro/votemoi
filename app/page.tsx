'use client';

import AddLinkButton from './components/links/AddLinkButton';
import LinkList from './components/links/LinkList';
import { useUser } from './context/user-context';
import { useLinks } from './hooks/useLinks';
import { fr } from './translations/fr';

export default function Home() {
  const {
    links,
    isLoading,
    error,
    addLink,
    updateLink,
    deleteLink,
    vote,
    unvote,
    addComment,
  } = useLinks();
  const { user } = useUser();

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
            <AddLinkButton onAdd={(data) => user && addLink(data)} />
          </div>

          {/* Links Section */}
          <section className="space-y-8">
            {error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : (
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
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
