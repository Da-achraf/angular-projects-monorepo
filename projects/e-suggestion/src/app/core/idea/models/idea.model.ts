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

export type IdeaCreate = IdeaBase & {
  submitter_id: number;
};
export type IdeaUpdate = IdeaBase & {
  id: number;
  status: IdeaStatusType;
  created_at: string;
};

export type Idea = IdeaBase & {
  id: number;
  created_at: string;
  status: IdeaStatusType;
  submitter: User;
  comments: Comment[];
  attachments: Attachement[];
  rating_matrix?: RatingMatrix;
  assignment?: Assignment;
  teoa_review?: TeoaReview;
};
