type SetRole = 'Captain' | 'Organizer' | 'Member';

interface SetMember {
  profileId: string;
  role: SetRole;
  joinedAt: string;
}

export interface Set {
  id: string;
  title: string;
  description: string;
  captainId: string; // The Profile ID of the founder
  coverImage: string; // Cinematic Canvas (16:9)
  accentColor: string;
  themeLine: string;
  members: SetMember[];
  activeFestivalId?: string;
  festivalStatus?: 'ONGOING' | 'ARCHIVED';
  tickerText?: string; // Custom marquee text for active festivals
}

export interface Festival {
  id: string;
  setId: string;
  organizerId: string;
  title: string;
  description: string;
  coverImage: string;
  status: 'UPCOMING' | 'LIVE' | 'CONCLUDED';
  startDate: string;
  endDate: string;
  rules?: string[];
  prizes?: string[];
  presenceLeader?: string; // Profile ID of the top performer / winner
}
