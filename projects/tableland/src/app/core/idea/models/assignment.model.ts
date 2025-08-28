import { User } from '../../auth/data-access/auth.model';
import { AssignmentComment } from './assignment-comment.model';

type AssignmentBase = {
  due_date: Date;
  progress: number;
  due_date_set_by?: User;
};

export type AssignmentCreate = AssignmentBase & {
  idea_id: number;
  assignees: number[];
};

export type AssignmentUpdate = AssignmentBase & {
  id: number;
  assignees: number[];
  created_at: string;
  idea_id?: number;
  due_date_set_by_id?: number;
};

export type Assignment = AssignmentBase & {
  id: number;
  created_at: string;
  comments: AssignmentComment[];
  assignees: User[];
  postponed_due_dates: PostoponedDueDate[];
};

type PostoponedDueDate = {
  id: number;

  new_due_date: Date;
  created_at: Date;
  reason: string;

  postponed_by: User;
};
