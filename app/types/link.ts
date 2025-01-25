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

export type FormattedComment = {
  id: string;
  userId: string;
  linkId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
};

export type FormattedLink = {
  id: string;
  url: string;
  title: string;
  description: string | null;
  previewImage: string | null;
  previewTitle: string | null;
  previewDescription: string | null;
  previewFavicon: string | null;
  previewSiteName: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  voteCount: number;
  votes: Vote[];
  voters: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  }[];
  comments: FormattedComment[];
  hasVoted: boolean;
  user: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
};

export type UserBasicInfo = Pick<User, 'id' | 'name' | 'avatarUrl'>;

export interface VoteWithUser {
  id: string;
  createdAt: Date;
  user: UserBasicInfo;
}

export interface CommentWithUser {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: UserBasicInfo;
}

export interface LinkWithRelations
  extends Omit<Link, 'createdBy' | 'votes' | 'comments'> {
  createdBy: UserBasicInfo;
  votes: VoteWithUser[];
  comments: CommentWithUser[];
}
