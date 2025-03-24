import { User } from '../../auth/data-access/auth.model';

type CommentBase = {
  body: string;
  likes?: number;
};

type CommentMixin = {
  commenter_id?: number | null;
  idea_id?: number | null;
};

export type CommentCreate = CommentBase & CommentMixin;
export type CommentUpdate = CommentBase & CommentMixin & {
  id: number;
};

export type Comment = CommentBase & {
  id: number;
  created_at: Date;
  commenter: User;
};
