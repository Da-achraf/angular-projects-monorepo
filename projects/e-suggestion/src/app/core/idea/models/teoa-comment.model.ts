import { User } from '../../auth/data-access/auth.model';

type TeoaCommentBase = {
  body: string;
};

type TeoaCommentMixin = {
  commenter_id?: number | null;
  teoa_review_id?: number | null;
};

export type TeoaCommentCreate = TeoaCommentBase & TeoaCommentMixin;
export type TeoaCommentUpdate = TeoaCommentBase & TeoaCommentMixin & {
  id: number;
};

export type TeoaComment = TeoaCommentBase & {
  id: number;
  created_at: Date;
  commenter: User;
};
