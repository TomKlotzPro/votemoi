export interface BaseUser {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface User extends BaseUser {
  createdAt: string;
  updatedAt: string;
  links?: Link[];
  votes?: Vote[];
  comments?: Comment[];
}

export interface FormattedUser extends BaseUser {
  createdAt: string;
  updatedAt: string;
}

export function formatUser(user: User): FormattedUser {
  return {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
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
  createdAt: string;
  updatedAt: string;
  createdById: string;
}

interface Vote {
  id: string;
  createdAt: string;
  userId: string;
  linkId: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  linkId: string;
}
