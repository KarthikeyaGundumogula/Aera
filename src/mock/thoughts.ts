export interface ThoughtContextTag {
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
  timestamp: string;
  tag?: ThoughtContextTag;
  setId?: string;
  setName?: string;
}

export const THOUGHTS_MOCK: ThoughtItem[] = [
  {
    id: "th-1",
    authorId: "art-1",
    authorName: "KAIF",
    authorAvatar: "https://i.pinimg.com/1200x/c0/83/8d/c0838da1580980cf7bcda233de7361bf.jpg",
    text: "The pacing in the second act of OG isn't just fast; it's rhythmic. Sujeeth treats every cut like a beat in a metronome. You don't watch it, you feel the tempo.",
    hits: 84,
    timestamp: "2 hours ago",
    setId: "set-neo-noir",
    setName: "Neo-Noir",
    tag: {
      type: "Original",
      id: "og-01",
      title: "OG",
      image: "https://i.pinimg.com/1200x/ab/f6/8b/abf68b35ce82d8c97dd3d100c8227b40.jpg"
    }
  },
  {
    id: "th-2",
    authorId: "art-2",
    authorName: "NEXUS",
    authorAvatar: "https://i.pinimg.com/736x/44/d5/47/44d547fecab1aeb9bb359677353f81e3.jpg",
    text: "RRR’s water and fire motif isn't subtle, but the color grading in the pre-interval scene physically raises the temperature of the screen. Absolute mastery of visual warmth.",
    hits: 120,
    timestamp: "5 hours ago",
    setId: "set-epic-builders",
    setName: "Epic Builders",
    tag: {
      type: "Original",
      id: "rrr-01",
      title: "RRR",
      image: "https://i.pinimg.com/1200x/e0/8a/a5/e08aa58ed4dc0c3ceccfe8dce28ff0b8.jpg"
    }
  },
  {
    id: "th-3",
    authorId: "art-3",
    authorName: "VALERA",
    authorAvatar: "https://i.pinimg.com/736x/2b/bb/68/2bbb68f94cb4c55ecb121b6191b2c6a0.jpg",
    text: "Why does no one talk about the negative space in KGF's underground scenes? The darkness isn't just lighting; it's a character pressing down on Rocky. Claustrophobia as an art form.",
    hits: 42,
    timestamp: "1 day ago",
    setId: "set-raw-grit",
    setName: "Raw Grit",
    tag: {
      type: "Original",
      id: "kgf-01",
      title: "KGF",
      image: "https://i.pinimg.com/736x/cd/6d/46/cd6d4608ed1ba763b652886f4a56d98f.jpg"
    }
  },
  {
    id: "th-4",
    authorId: "art-4",
    authorName: "VORTEX",
    authorAvatar: "https://i.pinimg.com/736x/11/1d/15/111d152a5dbfe972e2cf1cb58941655d.jpg",
    text: "Pushpa doesn't just walk; he commands the geometry of the frame. Sukumar stages him so that every other character subconsciously aligns to his posture.",
    hits: 95,
    timestamp: "2 days ago",
    setId: "set-raw-grit",
    setName: "Raw Grit",
    tag: {
      type: "Original",
      id: "pushpa-01",
      title: "PUSHPA",
      image: "https://i.pinimg.com/736x/88/2c/31/882c31c072b2a6f23c9ce0550cf6bbdb.jpg"
    }
  }
];
