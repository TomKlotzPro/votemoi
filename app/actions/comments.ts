import { FormattedComment } from '../types/comment';

export async function createComment(linkId: string, content: string): Promise<FormattedComment> {
  const response = await fetch(`/api/links/${linkId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create comment');
  }

  const data = await response.json();
  return data.comment;
}

export async function deleteComment(linkId: string, commentId: string): Promise<void> {
  const response = await fetch(`/api/links/${linkId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete comment');
  }
}
