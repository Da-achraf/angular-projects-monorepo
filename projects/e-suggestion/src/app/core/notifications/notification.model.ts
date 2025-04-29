export type Notification = {
  id: number;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  is_important: boolean;
  action_url?: string;
  created_at: string;
  read_at?: string;
};

export type NotificationCreate = {};

export type NotificationUpdate = {
  id: number;
};
