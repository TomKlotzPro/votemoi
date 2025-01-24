
export interface BaseUser {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface User extends BaseUser {
  createdAt: Date;
  updatedAt: Date;
  links: Link[];
  votes: Vote[];
  comments: Comment[];
  email: string | null;
}

export interface FormattedUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export function formatUser(user: User): FormattedUser {
  return {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

interface Link {
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
}

interface Vote {
  id: string;
  createdAt: Date;
  userId: string;
  linkId: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  linkId: string;
}
