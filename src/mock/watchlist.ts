export type TaggedWork = {
  id: string;
  type: 'poster' | 'hype_cut';
  thumbnailUrl: string;
  authorName: string;
  platform?: string;
  srcId?: string;
};

export type WatchlistItem = {
  id: string;
  originalId: string;
  originalName: string;
  originalPosterUrl: string; 
  status: 'want_to_watch' | 'watched';
  hypeText: string;
  afterThoughts?: string;
  taggedWorks: TaggedWork[];
  addedAt: string;
};

export const mockWatchlist: WatchlistItem[] = [
  {
    id: "wl_01",
    originalId: "og-original",
    originalName: "OG",
    originalPosterUrl: "/posters/og.jpeg", 
    status: 'want_to_watch',
    hypeText: "Pawan Kalyan's most raw, unstoppable avatar. The hype cuts for this are insane, I need to see this day one.",
    taggedWorks: [
      { 
        id: "w-og-1", 
        type: "hype_cut", 
        thumbnailUrl: "https://img.youtube.com/vi/GG1_DsScm6U/hqdefault.jpg", 
        authorName: "PowerStar_FC",
        platform: "youtube",
        srcId: "GG1_DsScm6U"
      },
      { 
        id: "w-og-3", 
        type: "poster", 
        thumbnailUrl: "/posters/og.jpeg", 
        authorName: "Andhra_Cuts" 
      }
    ],
    addedAt: "2026-04-24T10:00:00Z"
  },
  {
    id: "wl_02",
    originalId: "rrr-original",
    originalName: "RRR",
    originalPosterUrl: "/posters/rrr.jpeg",
    status: 'watched',
    hypeText: "The legendary team up of Ram and Bheem. The edits have me hyped for the interval sequence.",
    afterThoughts: "Absolutely overwhelming. The animal sequence and Naatu Naatu exceeded all expectations. Peak cinema.",
    taggedWorks: [
      { 
        id: "w-rrr-1", 
        type: "hype_cut", 
        thumbnailUrl: "https://img.youtube.com/vi/D9O20qxyvT0/hqdefault.jpg", 
        authorName: "Ram_Charan_FC",
        platform: "youtube",
        srcId: "D9O20qxyvT0"
      },
      { 
        id: "w-rrr-3", 
        type: "poster", 
        thumbnailUrl: "/posters/rrr.jpeg", 
        authorName: "Telugu_Talkies" 
      }
    ],
    addedAt: "2026-04-20T14:30:00Z"
  },
  {
    id: "wl_03",
    originalId: "kgf-original",
    originalName: "KGF: Chapter 2",
    originalPosterUrl: "/posters/kgf.jpeg",
    status: 'want_to_watch',
    hypeText: "Rocky Bhai's empire. The sheer scale and swagger in these edits is unmatched.",
    taggedWorks: [
      { 
        id: "w-kgf-1", 
        type: "hype_cut", 
        thumbnailUrl: "https://img.youtube.com/vi/us9PTfKlvuY/hqdefault.jpg", 
        authorName: "KGF_Yash_FC",
        platform: "youtube",
        srcId: "us9PTfKlvuY"
      },
      { 
        id: "w-kgf-3", 
        type: "poster", 
        thumbnailUrl: "/posters/kgf.jpeg", 
        authorName: "Kolar_Frames" 
      }
    ],
    addedAt: "2026-04-22T09:15:00Z"
  }
];
