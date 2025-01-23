export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Vote {
  id: string;
  urlId: string;
  user: User;
  createdAt: Date;
}
