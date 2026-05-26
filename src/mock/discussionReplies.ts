export interface DiscussionReply {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  timestamp: string;
}

export const MOCK_DISCUSSION_REPLIES: Record<string, DiscussionReply[]> = {
  "th-1": [
    {
      id: "rep-1-1",
      authorId: "art-2",
      authorName: "NEXUS",
      text: "Agreed. The editing isn't just invisible; it's driving the tension. Especially the bridge sequence, the cross-cutting was pure musical structure.",
      timestamp: "1 hour ago"
    },
    {
      id: "rep-1-2",
      authorId: "art-3",
      authorName: "VALERA",
      text: "True, but does it leave enough breathing room? Sometimes a rhythm needs a pause to land properly. Kaif, what do you think of the slower tracking shots in the warehouse?",
      timestamp: "45 mins ago"
    }
  ],
  "th-2": [
    {
      id: "rep-2-1",
      authorId: "art-1",
      authorName: "KAIF",
      text: "The pre-interval sequence is literally where fire and water clash. The color grading makes you feel the moisture in the air turning to steam. It's sensory overload in the best way.",
      timestamp: "4 hours ago"
    },
    {
      id: "rep-2-2",
      authorId: "art-4",
      authorName: "VORTEX",
      text: "Exactly. The warmth is suffocating, but it matches the narrative peak perfectly. A masterclass in thematic color correction.",
      timestamp: "2 hours ago"
    }
  ],
  "th-3": [
    {
      id: "rep-3-1",
      authorId: "art-4",
      authorName: "VORTEX",
      text: "The darkness is a physical presence. Most action sequences try to highlight everything, but KGF embraces the shadows to make the frames feel heavier.",
      timestamp: "18 hours ago"
    },
    {
      id: "rep-3-2",
      authorId: "art-2",
      authorName: "NEXUS",
      text: "Exactly. The high-contrast lighting is reminiscent of classic expressionism. Rocky isn't just hiding in the dark, he is part of the shadow itself.",
      timestamp: "12 hours ago"
    }
  ],
  "th-4": [
    {
      id: "rep-4-1",
      authorId: "art-1",
      authorName: "KAIF",
      text: "Sukumarstages the frames like classical paintings. The alignment of secondary characters isn't random; it creates leading lines directly towards Pushpa's silhouette.",
      timestamp: "1 day ago"
    }
  ]
};
export type { DiscussionReply as DiscussionReplyType };
