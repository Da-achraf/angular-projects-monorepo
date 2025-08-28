type AttachementBase = {
  name?: string;
  size: number;
};

export type AttachementCreate = AttachementBase & {
  idea_id: number;
  uploaded_by: number;
};

export type Attachement = AttachementBase & {
  id: number;
  file_path: string;
};
