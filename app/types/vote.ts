import { Link } from './link';
import { User } from './user';

export interface Vote {
  id: string;
  createdAt: Date;
  userId: string;
  linkId: string;
  user: User;
  link: Link;
}
