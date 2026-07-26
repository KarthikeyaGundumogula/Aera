interface ThoughtContextTag {
  type: "Original" | "Work" | "Artist";
  id: string;
  title: string;
  image?: string;
}

export interface ThoughtItem {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  hits: number;
  threadCount?: number;
  reactionCount?: number;
  topReactions?: ("heart" | "zap" | "flame" | "star" | "sparkles")[];
  timestamp: string;
  tag?: ThoughtContextTag;
  setId?: string;
  setName?: string;
}

export const THOUGHTS_MOCK: ThoughtItem[] = [];
