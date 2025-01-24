export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  createdAt: string;
}

export interface Vote {
  id: string;
  urlId: string;
  user: User;
  createdAt: Date;
}
