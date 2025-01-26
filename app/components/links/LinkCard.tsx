'use client';

import { useUser } from '@/app/context/user-context';
import { useUserDataStore } from '@/app/stores/userDataStore';
import { FormattedLink } from '@/app/types/link';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import AuthForm from '../auth/AuthForm';
import UserInfo from './link-card/link-card-header/UserInfo';
import DeleteLinkButton from './link-card/link-card-header/DeleteLinkButton';
import UpdateLinkButton from './link-card/link-card-header/UpdateLinkButton';
import LinkCardContent from './link-card/LinkCardContent';
import VotingButton from './link-card/link-card-footer/VotingButton';
import VoterList from './link-card/link-card-footer/VoterList';
import CommentButton from './link-card/link-card-footer/CommentButton';
import CommentList from './link-card/link-card-footer/comment-list/CommentList';

type LinkCardProps = {
  link: FormattedLink;
  isVoted: boolean;
  isOwner: boolean;
  isRemoving?: boolean;
  onVote: () => Promise<void>;
  onUnvote: () => Promise<void>;
  onEdit: (data: Partial<FormattedLink>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function LinkCard({
  link,
  isVoted,
  isOwner,
  isRemoving = false,
  onVote,
  onUnvote,
 
  onDelete,
}: LinkCardProps) {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [voters, setVoters] = useState(link.voters);
  const [showComments, setShowComments] = useState(false);
  const userData = useUserDataStore((state) => state.getUserData(link.user.id));
  const syncWithUser = useUserDataStore((state) => state.syncWithUser);
  const { user, setUser } = useUser();


  useEffect(() => {
    if (user) {
      // Update link owner data if it matches the current user
      if (link.user.id === user.id) {
        link.user = {
          ...link.user,
          name: user.name,
          avatarUrl: user.avatarUrl,
        };
      }

      // Update voters data
      const updatedVoters = link.voters.map((voter) =>
        voter.id === user.id
          ? { ...voter, name: user.name, avatarUrl: user.avatarUrl }
          : voter
      );
      link.voters = updatedVoters;
      setVoters(updatedVoters);

      // Update comments data
      link.comments = link.comments.map((comment) =>
        comment.user.id === user.id
          ? {
              ...comment,
              user: {
                ...comment.user,
                name: user.name,
                avatarUrl: user.avatarUrl,
              },
            }
          : comment
      );
    }
  }, [user, link]);

  
  // Sync user data on mount
  /* eslint-disable react-hooks/exhaustive-deps */
  React.useEffect(() => {
    syncWithUser({
      id: link.user.id,
      name: link.user.name || '',
      avatarUrl: link.user.avatarUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }, [link.user.id, syncWithUser]);

  // Update voters when link.voters changes
  React.useEffect(() => {
    setVoters(link.voters);
  }, [link.voters]);

  // Update voter info when user data changes
  React.useEffect(() => {
    if (userData && voters.some((voter) => voter.id === link.user.id)) {
      const updatedVoters = voters.map((voter) => {
        if (voter.id === link.user.id) {
          return {
            ...voter,
            name: userData.name,
            avatarUrl: userData.avatarUrl,
          };
        }
        return voter;
      });
      setVoters(updatedVoters);
      setIsUpdating(true);
      const timer = setTimeout(() => setIsUpdating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [userData, link.user.id]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const handleCommentSubmit = async (comment: string) => {
    if (!user) {
      setShowAuthForm(true);
      return;
    }

    if (!comment.trim()) return;

    try {
      const response = await fetch(`/api/links/${link.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment.trim() }),
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          setShowAuthForm(true);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.comment || !data.comment.id) {
        throw new Error('Invalid server response');
      }

      // Create new comment object with all required fields
      const newCommentObj = {
        id: data.comment.id,
        content: data.comment.content,
        createdAt: data.comment.createdAt,
        user: data.comment.user,
        userId: data.comment.userId,
        linkId: data.comment.linkId,
        isDeleted: false,
      };

      // Update comments array with new comment
      link.comments = [...link.comments, newCommentObj];

      // Automatically show comments when adding the first comment
      if (!showComments) {
        setShowComments(true);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      // You might want to show a toast or error message to the user here
    }
  };

  return (
    <>
      <motion.article
        className="relative rounded-xl"
        animate={{
          opacity: isRemoving ? 0.5 : 1,
          scale: isRemoving ? 0.98 : 1,
          filter: isRemoving ? 'blur(2px)' : 'blur(0px)',
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="relative"
          whileHover={!isRemoving && { scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative bg-[#1e1e38]/80 rounded-xl border border-purple-500/10 overflow-hidden"
          >
            {/* Main card content */}
            <div className="p-4">
              {/* Header with User Info and Actions */}
              <div className="flex items-center justify-between mb-2">
                <UserInfo
                  userId={link.user.id}
                  userName={link.user.name}
                  userAvatarUrl={link.user.avatarUrl}
                  createdAt={link.createdAt}
                />
                {isOwner && (
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <UpdateLinkButton onUpdate={() => setShowEditModal(true)} />
                    <DeleteLinkButton onDelete={() => onDelete(link.id)} />
                  </div>
                )}
              </div>

              <LinkCardContent
                url={link.url}
                title={link.title}
                description={link.description}
                previewImage={link.previewImage}
                previewTitle={link.previewTitle}
              />

              {/* Interactions */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <VotingButton
                    isVoted={isVoted}
                    voteCount={link.voteCount}
                    onVoteClick={isVoted ? onUnvote : onVote}
                    setShowAuthForm={setShowAuthForm}
                  />

                  <CommentButton
                    showComments={showComments}
                    commentCount={link.comments.length}
                    isDisabled={!user && link.comments.length === 0}
                    onClick={() => {
                      if (!user && link.comments.length === 0) {
                        return;
                      }
                      setShowComments(!showComments);
                    }}
                  />
                </div>

                <VoterList voters={voters} voteCount={link.voteCount} />
              </div>

              {/* Comments */}
              <AnimatePresence>
                {showComments && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                    className="mt-3 overflow-hidden"
                  >
                    <CommentList
                      comments={link.comments}
                      currentUser={user}
                      onSubmitComment={handleCommentSubmit}
                      onDeleteComment={async (commentId: string) => {
                        try {
                          const response = await fetch(`/api/comments/${commentId}`, {
                            method: 'DELETE',
                            credentials: 'include',
                          });

                          if (!response.ok) {
                            if (response.status === 401) {
                              setShowAuthForm(true);
                              return;
                            }
                            throw new Error(`HTTP error! status: ${response.status}`);
                          }

                          // Remove the comment from the list
                          link.comments = link.comments.filter(
                            (comment) => comment.id !== commentId
                          );

                          // If there are no more comments, hide the comments section
                          if (link.comments.length === 0) {
                            setShowComments(false);
                          }
                        } catch (error) {
                          console.error('Failed to delete comment:', error);
                          // You might want to show a toast or error message to the user here
                        }
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

        {showAuthForm && (
          <AuthForm
            onSuccess={(newUser) => {
              setUser(newUser);
              setShowAuthForm(false);
              // Try to vote after successful login
              onVote();
            }}
            onClose={() => setShowAuthForm(false)}
          />
        )}
      </motion.article>
    </>
  );
}
