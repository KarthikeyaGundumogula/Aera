export interface Thought {
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

export type ThoughtItem = Thought;
