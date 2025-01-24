import { User } from './user';

export interface Link {
  id: string;
  url: string;
  title: string;
  description: string | null;
  previewImage: string | null;
  previewTitle: string | null;
  previewDescription: string | null;
  previewFavicon: string | null;
  previewSiteName: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  createdBy: User;
  votes: Vote[];
  comments: Comment[];
  hasVoted?: boolean;
}

export interface Vote {
  id: string;
  createdAt: Date;
  userId: string;
  linkId: string;
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  link: Pick<Link, 'id' | 'url' | 'title'>;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  linkId: string;
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  link: Pick<Link, 'id' | 'url' | 'title'>;
}

export interface FormattedLink extends Omit<Link, 'createdAt' | 'updatedAt' | 'createdBy' | 'votes' | 'comments'> {
  createdAt: string;
  updatedAt: string;
  createdBy: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  votes: FormattedVote[];
  comments: FormattedComment[];
}

export interface FormattedVote extends Omit<Vote, 'createdAt' | 'user' | 'link'> {
  createdAt: string;
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}

export interface FormattedComment extends Omit<Comment, 'createdAt' | 'updatedAt' | 'user' | 'link'> {
  createdAt: string;
  updatedAt: string;
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}
