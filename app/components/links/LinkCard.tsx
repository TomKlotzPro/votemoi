'use client';

import { useUser } from '@/app/context/user-context';
import { useUserDataStore } from '@/app/stores/userDataStore';
import { FormattedLink } from '@/app/types/link';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState, useCallback } from 'react';
import AuthForm from '../auth/AuthForm';
import UserInfo from './link-card/link-card-header/UserInfo';
import DeleteLinkButton from './link-card/link-card-header/DeleteLinkButton';
import UpdateLinkButton from './link-card/link-card-header/UpdateLinkButton';
import LinkCardContent from './link-card/LinkCardContent';
import VotingButton from './link-card/link-card-footer/VotingButton';
import VoterList from './link-card/link-card-footer/VoterList';
import CommentButton from './link-card/link-card-footer/CommentButton';
import CommentList from './link-card/link-card-footer/comment-list/CommentList';
import EditLinkModal from './EditLinkModal';

type LinkCardProps = {
  link: FormattedLink;
  isVoted: boolean;
  isOwner: boolean;
  isRemoving?: boolean;
  onVote: (linkId: string) => void;
  onUnvote: (linkId: string) => void;
  onDelete: (linkId: string) => void;
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [voters, setVoters] = useState(link.voters);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(link.comments);
  const [optimisticCommentCount, setOptimisticCommentCount] = useState(link.comments.length);
  const userData = useUserDataStore((state) => state.getUserData(link.user.id));
  const syncWithUser = useUserDataStore((state) => state.syncWithUser);
  const { user, setUser } = useUser();

  const handleVote = async () => {
    try {
      const response = await fetch(`/api/links/${link.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to vote');
      }

      // Update the link data with the response
      if (data.link) {
        link.votes = data.link.votes;
        link.voters = data.link.voters;
        setVoters(data.link.voters);
      }
      
      onVote(link.id);
    } catch (error) {
      console.error('Error voting:', error);
      throw error;
    }
  };

  const handleUnvote = async () => {
    try {
      const response = await fetch(`/api/links/${link.id}/unvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to unvote');
      }

      // Update the link data with the response
      if (data.link) {
        link.votes = data.link.votes;
        link.voters = data.link.voters;
        setVoters(data.link.voters);
      }
      
      onUnvote(link.id);
    } catch (error) {
      console.error('Error unvoting:', error);
      throw error;
    }
  };

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
      setComments(prev => [...prev, newCommentObj]);
      setOptimisticCommentCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to add comment:', error);
      // You might want to show a toast or error message to the user here
    }
  };

  const handleVoteSuccess = useCallback((vote: any | null) => {
    if (!user) return;

    // For voting
    if (vote) {
      const newVoter = {
        id: user.id,
        name: user.name || '',
        avatarUrl: user.avatarUrl || '',
      };
      setVoters(current => {
        // Don't add if already exists
        if (current.some(v => v.id === user.id)) return current;
        return [...current, newVoter];
      });
    } else {
      // For unvoting
      setVoters(current => current.filter(v => v.id !== user.id));
    }
  }, [user]);

  const handleCommentSuccess = useCallback((newComment: any | null) => {
    if (!user) return;

    if (newComment) {
      // Update comments for the link
      link.comments = [...link.comments.filter(c => c.id !== newComment.id), newComment];
      setComments(prev => [...prev.filter(c => c.id !== newComment.id), newComment]);
    }
  }, [user]);

  const handleCommentDelete = useCallback((commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    setOptimisticCommentCount(prev => prev - 1);
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
      }}
      className={`relative bg-[#1e1e38]/80 backdrop-blur-md rounded-xl border border-purple-500/10 overflow-hidden ${
        isRemoving ? 'pointer-events-none opacity-50' : ''
      }`}
    >
      <div className="relative">
        <div className="relative">
          <div className="p-4">
            {/* Header with User Info and Actions */}
            <div className="flex items-center justify-between mb-3">
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
              title={link.title}
              description={link.description}
              url={link.url}
              previewImage={link.previewImage}
              previewTitle={link.previewTitle}
            />
          </div>

          {/* Footer with Vote and Comment Buttons */}
          <div className="p-4 pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <VotingButton
                  linkId={link.id}
                  votes={voters}
                  isVoted={isVoted}
                  onVoteSuccess={handleVoteSuccess}
                />
                <CommentButton
                  commentCount={comments.length}
                  showComments={showComments}
                  onClick={() => setShowComments(!showComments)}
                />
              </div>
              <VoterList voters={voters} />
            </div>

            {/* Comments Section */}
            <AnimatePresence>
              {showComments && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 overflow-hidden"
                >
                  <CommentList
                    comments={comments}
                    currentUser={user}
                    linkId={link.id}
                    onCommentSuccess={handleCommentSuccess}
                    onCommentAdded={handleCommentSubmit}
                    onCommentDelete={handleCommentDelete}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditLinkModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          link={link}
        />
      )}

      {showAuthForm && (
        <AuthForm
          onSuccess={(newUser) => {
            setUser(newUser);
            setShowAuthForm(false);
            // Try to vote after successful login
            onVote(link.id);
          }}
          onClose={() => setShowAuthForm(false)}
        />
      )}
    </motion.div>
  );
}
