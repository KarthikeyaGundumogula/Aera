export interface DiscussionItem {
  id: string;
  setId: string;
  setName?: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  title: string;
  body: string;
  commentCount: number;
  work?: any;
  createdAt: string;
  updatedAt?: string;
}

export type DiscussionPostItem = DiscussionItem;
