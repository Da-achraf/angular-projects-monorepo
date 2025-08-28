import { User } from '../../auth/data-access/auth.model';

type AssignmentCommentBase = {
  body: string;
};

type AssignmentCommentMixin = {
  commenter_id?: number | null;
  assignment_id?: number | null;
};

export type AssignmentCommentCreate = AssignmentCommentBase & AssignmentCommentMixin;
export type AssignmentCommentUpdate = AssignmentCommentBase & AssignmentCommentMixin & {
  id: number;
};

export type AssignmentComment = AssignmentCommentBase & {
  id: number;
  created_at: Date;
  commenter: User;
};
