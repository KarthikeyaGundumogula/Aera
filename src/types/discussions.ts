export interface DiscussionItem {
  id: string;
  artistId?: string;
  artistName?: string;
  artistPicture?: string;
  originalId?: string;
  originalTitle?: string;
  thoughtText?: string;
  text?: string;
  title?: string;
  content?: string;
  body?: string;
  work?: any;
  taggedWorkId?: string;
  threadCount?: number;
  setName?: string;
  setId?: string;
  authorName?: string;
  timestamp?: string;
  hits?: number;
  score?: number;
  createdAt?: string;
}

export type DiscussionPostItem = DiscussionItem;
