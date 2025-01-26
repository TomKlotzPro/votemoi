import { create } from 'zustand';
import { Comment, User } from '@prisma/client';

type CommentWithUser = Comment & {
  user: User;
};

interface CommentsState {
  comments: Record<string, CommentWithUser[]>;
  getComments: (linkId: string) => CommentWithUser[];
  getCommentCount: (linkId: string) => number;
  addComment: (linkId: string, comment: CommentWithUser) => void;
  removeComment: (linkId: string, commentId: string) => void;
  setComments: (linkId: string, comments: CommentWithUser[]) => void;
  updateUserInComments: (user: User) => void;
}

const useCommentsStore = create<CommentsState>()((set, get) => ({
  comments: {},

  getComments: (linkId: string) => {
    return get().comments[linkId] || [];
  },

  getCommentCount: (linkId: string) => {
    return get().comments[linkId]?.length || 0;
  },

  setComments: (linkId, comments) => {
    // Ensure we have valid comments
    const validComments = comments.filter(comment => 
      comment && 
      typeof comment.id === 'string' && 
      typeof comment.content === 'string' && 
      comment.user && 
      typeof comment.user.id === 'string'
    );

    set((state) => ({
      comments: {
        ...state.comments,
        [linkId]: validComments,
      },
    }));
  },

  addComment: (linkId, comment) => {
    // Validate comment data
    if (!comment || 
        typeof comment.id !== 'string' || 
        typeof comment.content !== 'string' || 
        !comment.user || 
        typeof comment.user.id !== 'string') {
      console.error('Invalid comment data:', comment);
      return;
    }

    set((state) => {
      const currentComments = state.comments[linkId] || [];
      
      // Remove any existing comment with the same ID (including temp IDs)
      const filteredComments = currentComments.filter(c => 
        c.id !== comment.id && 
        (comment.id.startsWith('temp-') ? c.id !== comment.id.replace('temp-', '') : c.id !== `temp-${comment.id}`)
      );

      // Add the new comment
      return {
        comments: {
          ...state.comments,
          [linkId]: [...filteredComments, comment],
        },
      };
    });
  },

  removeComment: (linkId, commentId) => {
    if (typeof commentId !== 'string') {
      console.error('Invalid comment ID:', commentId);
      return;
    }

    set((state) => {
      const currentComments = state.comments[linkId] || [];
      
      // Remove both temp and real versions of the comment
      const filteredComments = currentComments.filter(c => 
        c.id !== commentId && 
        c.id !== `temp-${commentId}` && 
        !c.id.startsWith('temp-')
      );

      return {
        comments: {
          ...state.comments,
          [linkId]: filteredComments,
        },
      };
    });
  },

  updateUserInComments: (user) => {
    if (!user || typeof user.id !== 'string') {
      console.error('Invalid user data:', user);
      return;
    }

    set((state) => {
      const updatedComments = { ...state.comments };
      let hasChanges = false;

      Object.keys(updatedComments).forEach((linkId) => {
        const commentsForLink = updatedComments[linkId];
        const updatedCommentsForLink = commentsForLink.map((comment) => {
          if (comment.userId === user.id) {
            hasChanges = true;
            return {
              ...comment,
              user: { ...comment.user, ...user },
            };
          }
          return comment;
        });

        if (hasChanges) {
          updatedComments[linkId] = updatedCommentsForLink;
        }
      });

      return hasChanges ? { comments: updatedComments } : state;
    });
  },
}));

export { useCommentsStore };
export type { CommentWithUser };
