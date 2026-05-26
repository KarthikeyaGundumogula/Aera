export interface DiscussionReply {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  timestamp: string;
  taggedWorkId?: string; // ID of a work tagged in this reply
  reactions?: {
    ignite?: number;
    resonate?: number;
    toast?: number;
    love?: number;
    insight?: number;
  };
  replies?: DiscussionReply[]; // For deeply nested thread
}

export const MOCK_DISCUSSION_REPLIES: Record<string, DiscussionReply[]> = {
  "th-1": [
    {
      id: "rep-1-1",
      authorId: "fh-002",
      authorName: "Priya Nair",
      text: "Agreed. The editing isn't just invisible; it's driving the tension. Especially the bridge sequence, the cross-cutting was pure musical structure.",
      timestamp: "1 hour ago",
      reactions: { ignite: 5, resonate: 2 },
      taggedWorkId: "work-rrr-2", // Let's mock a work tag
      replies: [
        {
          id: "rep-1-1-1",
          authorId: "fh-001",
          authorName: "Karthik G",
          text: "The pacing in that scene is relentless. How do you feel about the transition right after?",
          timestamp: "50 mins ago",
          reactions: { toast: 1 },
          replies: [
            {
              id: "rep-1-1-1-1",
              authorId: "fh-003",
              authorName: "Arjun Reddy",
              text: "It was a bit jarring at first, but it establishes the chaotic aftermath perfectly.",
              timestamp: "30 mins ago",
              reactions: { insight: 4 }
            }
          ]
        }
      ]
    },
    {
      id: "rep-1-2",
      authorId: "fh-001",
      authorName: "Karthik G",
      text: "True, but does it leave enough breathing room? Sometimes a rhythm needs a pause to land properly. Priya, what do you think of the slower tracking shots in the warehouse?",
      timestamp: "45 mins ago",
      reactions: { love: 3 }
    }
  ],
  "th-2": [
    {
      id: "rep-2-1",
      authorId: "fh-001",
      authorName: "Karthik G",
      text: "The pre-interval sequence is literally where fire and water clash. The color grading makes you feel the moisture in the air turning to steam. It's sensory overload in the best way.",
      timestamp: "4 hours ago",
      reactions: { ignite: 12, insight: 2 }
    },
    {
      id: "rep-2-2",
      authorId: "fh-003",
      authorName: "Arjun Reddy",
      text: "Exactly. The warmth is suffocating, but it matches the narrative peak perfectly. A masterclass in thematic color correction.",
      timestamp: "2 hours ago"
    }
  ],
  "th-3": [
    {
      id: "rep-3-1",
      authorId: "fh-003",
      authorName: "Arjun Reddy",
      text: "The darkness is a physical presence. Most action sequences try to highlight everything, but KGF embraces the shadows to make the frames feel heavier.",
      timestamp: "18 hours ago"
    },
    {
      id: "rep-3-2",
      authorId: "fh-002",
      authorName: "Priya Nair",
      text: "Exactly. The high-contrast lighting is reminiscent of classic expressionism. Rocky isn't just hiding in the dark, he is part of the shadow itself.",
      timestamp: "12 hours ago",
      reactions: { resonate: 8 }
    }
  ],
  "th-4": [
    {
      id: "rep-4-1",
      authorId: "fh-001",
      authorName: "Karthik G",
      text: "Sukumar stages the frames like classical paintings. The alignment of secondary characters isn't random; it creates leading lines directly towards Pushpa's silhouette.",
      timestamp: "1 day ago"
    }
  ]
};
export type { DiscussionReply as DiscussionReplyType };
