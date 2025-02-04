export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Vote {
  id: string;
  userId: string;
  urlId: string;
  user: User;
}

export interface Url {
  id: string;
  url: string;
  title: string;
  description?: string;
  votes: Vote[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: User;
}
