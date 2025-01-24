import { User } from './user';

export interface Vote {
  userId: string;
  userName: string;
  createdAt: string;
  user: User;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface Link {
  id: string;
  url: string;
  title: string;
  description?: string | null;
  previewTitle?: string | null;
  previewDescription?: string | null;
  previewImage?: string | null;
  previewFavicon?: string | null;
  previewSiteName?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  votes: Vote[];
  comments: Comment[];
}
