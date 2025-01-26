import { Comment } from '@prisma/client';
import { FormattedUser } from './user';

export type FormattedComment = Comment & {
  user: FormattedUser;
};
