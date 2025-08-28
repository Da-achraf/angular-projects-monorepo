import { User } from '../../auth/data-access/auth.model';

type PostponedDueDateBase = {
  new_due_date: Date;
  created_at?: Date;
  reason?: string;
};

export type PostponedDueDateCreate = PostponedDueDateBase & {
  assignment_id: number;
  postponed_by_id: number;
};
export type PostponedDueDateUpdate = PostponedDueDateBase & {
  id: number;
};

export type PostponedDueDate = PostponedDueDateBase & {
  id: number;
  postponed_by: User;
};
