import { TeoaComment } from './teoa-comment.model';

type TeoaReviewBase = {};

export type TeoaReviewCreate = TeoaReviewBase & {
  idea_id: number;
};
export type TeoaReviewUpdate = TeoaReviewBase & {
  id: number;
  created_at: string;
};

export type TeoaReview = TeoaReviewBase & {
  id: number;
  created_at: string;
  comments: TeoaComment[];
};
