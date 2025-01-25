'use client';

import { Comment } from '@/app/types/link';
import SafeImage from '../ui/SafeImage';

type LinkCommentsProps = {
  comments: Comment[];
}

export default function LinkComments({ comments }: LinkCommentsProps) {
  return (
    <div className="border-t border-white/10 divide-y divide-white/10">
      {comments.map((comment) => (
        <div key={comment.id} className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <SafeImage
              src={comment.user.avatarUrl}
              alt={comment.user.name}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-[var(--text-primary)]">
                  {comment.user.name}
                </span>
                <span className="text-[var(--text-secondary)]">•</span>
                <time
                  dateTime={new Date(comment.createdAt).toISOString()}
                  className="text-[var(--text-secondary)]"
                >
                  {new Date(comment.createdAt).toLocaleDateString()}
                </time>
              </div>
              <p className="mt-1 text-sm text-[var(--text-primary)]">
                {comment.content}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
