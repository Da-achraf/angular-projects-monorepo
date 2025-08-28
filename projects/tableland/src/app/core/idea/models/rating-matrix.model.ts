type RatingMatrixBase = {
  comments?: string;
  quality: number;
  cost_reduction: number;
  time_savings: number;
  ehs: number;
  initiative: number;
  creativity: number;
  transversalization: number;
  effectiveness: number;
  total_score: number;
};

export type RatingMatrixCreate = RatingMatrixBase & {
  idea_id: number;
};

export type RatingMatrixUpdate = RatingMatrixBase & {
  id: number;
  idea_id: number;
};

export type RatingMatrix = RatingMatrixBase & {
  id: number;
};
