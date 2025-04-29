import { Attachement } from '../../../pattern/attachment-upload/models/attachement.model';
import { User } from '../../auth/data-access/auth.model';
import { Assignment } from './assignment.model';
import { Comment } from './comment.model';
import { IdeaStatusType } from './idea-status.model';
import { RatingMatrix } from './rating-matrix.model';
import { TeoaReview } from './teoa-review.model';

type IdeaBase = {
  title: string;
  actual_situation: string;
  description: string;
  category: string;
  department: string;
};

type IdeaMixin = {
  created_at: string;
  updated_at?: string;
  assigned_at?: string;
  implemented_at?: string;
  closed_at?: string;
};

export type IdeaCreate = IdeaBase & {
  submitter_id: number;
};
export type IdeaUpdate = IdeaBase &
  IdeaMixin & {
    id: number;
    status: IdeaStatusType;
    /**
     * This helps the backend services to determin the email/app notification
     * body that will be sent to the affected users by the idea update.
     */
    action?: IdeaAction;
  };

export type Idea = IdeaBase &
  IdeaMixin & {
    id: number;
    status: IdeaStatusType;
    submitter: User;
    comments: Comment[];
    attachments: Attachement[];
    rating_matrix?: RatingMatrix;
    assignment?: Assignment;
    teoa_review?: TeoaReview;
  };

export type IdeaAction =
  | 'modified'
  | 'rated'
  | 'approved'
  | 'assigned'
  | 'rejected'
  | 'closed';
