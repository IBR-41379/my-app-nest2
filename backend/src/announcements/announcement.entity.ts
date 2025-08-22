export type Status = 'active' | 'closed';

export interface Announcement {
  id: string;
  title: string;
  description?: string;
  status: Status;
  createdAt: string; // ISO string
}
