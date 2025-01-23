'use client';

import { useState } from 'react';
import { Link } from '@/app/types/link';
import { User } from '@/app/types/user';
import { useUser } from '@/app/context/user-context';
import { fr } from '@/app/translations/fr';
import Loader from '../ui/Loader';
import SafeImage from '../ui/SafeImage';
import AvatarLoader from '../ui/AvatarLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { HandThumbUpIcon, EllipsisVerticalIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import LinkFormModal from './LinkFormModal';

interface LinkListProps {
  links: Link[];
  isLoading: boolean;
  onVote: (linkId: string, user: User) => Promise<void>;
  onUnvote: (linkId: string, user: User) => Promise<void>;
  onAddComment: (linkId: string, content: string) => Promise<void>;
  onDeleteLink: (linkId: string, user: User) => Promise<void>;
  onUpdateLink: (data: { id: string; url: string; title?: string; description?: string }, user: User) => Promise<void>;
}

export default function LinkList({ 
  links, 
  isLoading, 
  onVote, 
  onUnvote,
  onAddComment,
  onDeleteLink,
  onUpdateLink
}: LinkListProps) {
  const { user, showAuthForm } = useUser();
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [showCommentsForLinkId, setShowCommentsForLinkId] = useState<string | null>(null);
  const [loadingVotes, setLoadingVotes] = useState<{ [key: string]: boolean }>({});
  const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});
  const [showVotersForLinkId, setShowVotersForLinkId] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});

  const handleVote = async (linkId: string) => {
    if (!user) {
      setSelectedLinkId(linkId);
      showAuthForm();
      return;
    }

    try {
      setLoadingVotes(prev => ({ ...prev, [linkId]: true }));
      const hasVoted = links.find(link => 
        link.id === linkId && link.votes.some(vote => vote.userId === user.id)
      );

      if (hasVoted) {
        await onUnvote(linkId, user);
      } else {
        await onVote(linkId, user);
      }
    } catch (error) {
      console.error('Error handling vote:', error);
    } finally {
      setLoadingVotes(prev => ({ ...prev, [linkId]: false }));
    }
  };

  const handleUpdateLink = async (data: { url: string; title?: string; description?: string }) => {
    if (!user || !editingLink) return;
    await onUpdateLink({
      id: editingLink.id,
      ...data
    }, user);
    setEditingLink(null);
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!user) return;
    await onDeleteLink(linkId, user);
  };

  const toggleVoters = (linkId: string) => {
    setShowVotersForLinkId(current => current === linkId ? null : linkId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-black/80 backdrop-blur-lg rounded-lg border border-white/10 p-4">
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 bg-white/5 rounded-lg animate-pulse" />
              <div className="flex-grow space-y-3">
                <div className="h-6 bg-white/5 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-white/5 rounded animate-pulse w-1/2" />
                <div className="h-4 bg-white/5 rounded animate-pulse w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!links?.length) {
    return (
      <div className="text-center py-12 text-white/60">
        <p>{fr.common.noUrls}</p>
        <p className="mt-2 text-sm">{fr.common.noUrlsDesc}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="divide-y divide-white/10">
        {links.map((link) => (
          <div key={link.id} className="group">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {link.imageUrl && (
                  <div className="flex-shrink-0 w-full sm:w-32 h-48 sm:h-24 relative rounded-lg overflow-hidden bg-white/5">
                    <SafeImage
                      src={link.imageUrl}
                      alt={link.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-grow space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1 flex-grow">
                      <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {link.title}
                        </a>
                      </h3>
                      <p className="text-white/60 text-sm line-clamp-2">{link.description}</p>
                    </div>

                    {user?.id === link.createdBy.id && (
                      <div className="relative">
                        <Menu as="div" className="relative">
                          <Menu.Button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <EllipsisVerticalIcon className="w-5 h-5 text-white/60" />
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
                            <Menu.Items className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-lg rounded-lg shadow-lg border border-white/10 py-1 z-10">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => setEditingLink(link)}
                                    className={`${
                                      active ? 'bg-white/10' : ''
                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm text-white/80`}
                                  >
                                    Modifier
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleDeleteLink(link.id)}
                                    className={`${
                                      active ? 'bg-white/10' : ''
                                    } group flex w-full items-center rounded-md px-2 py-2 text-sm text-red-400`}
                                  >
                                    Supprimer
                                  </button>
                                )}
                              </Menu.Item>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => handleVote(link.id)}
                        disabled={!user}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                          links.find(l => l.id === link.id && l.votes.some(vote => vote.userId === user?.id))
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'hover:bg-white/10 text-white/60'
                        }`}
                      >
                        <motion.div
                          animate={loadingVotes[link.id] ? { rotate: 360 } : {}}
                          transition={{ duration: 1, repeat: loadingVotes[link.id] ? Infinity : 0, ease: "linear" }}
                        >
                          <HandThumbUpIcon className="w-4 h-4" />
                        </motion.div>
                        <motion.span
                          key={link.votes.length}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          {link.votes.length}
                        </motion.span>
                      </motion.button>

                      <button
                        onClick={() => setShowCommentsForLinkId(current => current === link.id ? null : link.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                          showCommentsForLinkId === link.id
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'hover:bg-white/10 text-white/60'
                        }`}
                      >
                        <ChatBubbleLeftIcon className="w-4 h-4" />
                        <span>{link.comments.length}</span>
                      </button>
                    </div>

                    <div className="text-white/40 flex items-center gap-2">
                      <span>{fr.common.votedBy}</span>
                      <div className="flex -space-x-2">
                        <AnimatePresence>
                          {link.votes.slice(0, 3).map((vote, index) => (
                            <motion.div
                              key={vote.userId}
                              initial={{ opacity: 0, scale: 0, x: -20 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0, x: 20 }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                                delay: index * 0.1
                              }}
                              whileHover={{ 
                                scale: 1.2, 
                                zIndex: 10,
                                transition: { type: "spring", stiffness: 300, damping: 20 }
                              }}
                              className="relative group"
                            >
                              <motion.div
                                initial={false}
                                animate={{
                                  boxShadow: "0 0 0 2px rgba(0,0,0,1)",
                                  scale: 1
                                }}
                                whileHover={{
                                  boxShadow: "0 0 0 3px rgba(168,85,247,0.4)",
                                  scale: 1.1
                                }}
                                className="relative rounded-full overflow-hidden"
                              >
                                <SafeImage
                                  src={vote.user?.avatarUrl || '/default-avatar.png'}
                                  alt={vote.user?.name || 'Unknown User'}
                                  className="w-6 h-6 rounded-full"
                                />
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  whileHover={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-2 py-1 text-xs bg-black/90 text-white rounded-md pointer-events-none"
                                >
                                  {vote.user?.name}
                                </motion.div>
                              </motion.div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                      {link.votes.length > 3 && (
                        <motion.span
                          key={link.votes.length}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="text-sm"
                        >
                          +{link.votes.length - 3}
                        </motion.span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {showCommentsForLinkId === link.id && (
                <div className="mt-6 space-y-4">
                  <div className="space-y-4">
                    {link.comments.map((comment) => (
                      <div key={comment.id} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <SafeImage
                              src={comment.user.avatarUrl || '/default-avatar.png'}
                              alt={comment.user.name}
                              className="w-8 h-8 rounded-full"
                            />
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-baseline gap-2">
                              <span className="font-medium text-white">{comment.user.name}</span>
                              <span className="text-sm text-white/40">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-1 text-white/80">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {user && (
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!user) return;
                      const content = newComment[link.id]?.trim();
                      if (!content) return;
                      try {
                        await onAddComment(link.id, content);
                        setNewComment(prev => ({ ...prev, [link.id]: '' }));
                      } catch (error) {
                        console.error('Error adding comment:', error);
                      }
                    }} className="flex gap-3">
                      <input
                        type="text"
                        value={newComment[link.id] || ''}
                        onChange={(e) => setNewComment(prev => ({ ...prev, [link.id]: e.target.value }))}
                        placeholder={fr.placeholders.addComment}
                        className="flex-grow px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                      />
                      <button
                        type="submit"
                        disabled={!newComment[link.id]?.trim()}
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:hover:bg-purple-500 text-white rounded-lg transition-colors"
                      >
                        {fr.actions.send}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Edit Link Modal */}
      <LinkFormModal
        isOpen={!!editingLink}
        onClose={() => setEditingLink(null)}
        onSubmit={handleUpdateLink}
        initialData={editingLink || undefined}
        mode="edit"
      />
    </div>
  );
}
