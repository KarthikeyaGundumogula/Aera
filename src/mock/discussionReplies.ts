export interface DiscussionReply {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  timestamp: string;
  taggedWorkId?: string;
  reactions?: {
    heart?: number;
    zap?: number;
    flame?: number;
    star?: number;
    sparkles?: number;
  };
  replies?: DiscussionReply[];
}

export const MOCK_DISCUSSION_REPLIES: Record<string, DiscussionReply[]> = {};
