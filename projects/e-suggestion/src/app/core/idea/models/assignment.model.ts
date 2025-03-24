import { User } from '../../auth/data-access/auth.model';
import { AssignmentComment } from './assignment-comment.model';

type AssignmentBase = {
  due_date: Date;
  progress: number;
};

export type AssignmentCreate = AssignmentBase & {
  idea_id: number;
  assignees: number[];
};

export type AssignmentUpdate = AssignmentBase & {
  id: number;
  assignees: number[];
  created_at: string;
};

export type Assignment = AssignmentBase & {
  id: number;
  created_at: string;
  comments: AssignmentComment[];
  assignees: User[];
};
