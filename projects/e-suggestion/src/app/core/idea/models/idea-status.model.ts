export const IdeaStatus = {
  CREATED: 'created',
  REJECTED: 'rejected',
  APPROVED: 'approved',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in progress',
  IMPLEMENTED: 'implemented',
  OVERDUE: 'overdue',
  CLOSED: 'closed',
} as const;

export type IdeaStatusType = (typeof IdeaStatus)[keyof typeof IdeaStatus];

// Mapper for displayable status
export const IdeaStatusDisplay: Record<IdeaStatusType, string> = {
  [IdeaStatus.CREATED]: 'Created',
  [IdeaStatus.REJECTED]: 'Rejected',
  [IdeaStatus.APPROVED]: 'Approved',
  [IdeaStatus.ASSIGNED]: 'Assigned',
  [IdeaStatus.IN_PROGRESS]: 'In Progress',
  [IdeaStatus.IMPLEMENTED]: 'Implemented',
  [IdeaStatus.OVERDUE]: 'Overdue',
  [IdeaStatus.CLOSED]: 'Closed',
};