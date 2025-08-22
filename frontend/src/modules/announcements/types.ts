export type ReactionType = "up" | "down" | "heart";

export interface AnnouncementSummary {
  id: string;
  title: string;
  commentCount: number;
  reactions: Record<ReactionType, number>;
  lastActivityAt: string; // ISO
}

export interface Comment {
  id: string;
  announcementId: string;
  authorName: string;
  text: string;
  createdAt: string; // ISO
}

export interface Paginated<T> {
  items: T[];
  nextCursor?: string | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
