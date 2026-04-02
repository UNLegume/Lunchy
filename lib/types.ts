export type SessionStatus = 'gathering' | 'voting' | 'runoff' | 'decided';

export type Session = {
  id: string;
  organizerId: string;
  location: string;
  status: SessionStatus;
  members: Member[];
  preferences: Preference[];
  candidates: Candidate[];
  votes: Vote[];
  runoffVotes: Vote[];
  result: Candidate | null;
  createdAt: string;
};

export type Member = {
  id: string;
  displayName: string;
  isOrganizer: boolean;
};

export type Preference = {
  memberId: string;
  allergy: string[];
  category: 'meat' | 'fish' | 'other';
  hungerLevel: number;
  place: string | null;
  budget: string;
};

export type Candidate = {
  id: string;
  name: string;
  genre: string;
  walkMinutes: number;
  rating: number;
  priceRange: string;
  photoUrl: string;
};

export type Vote = {
  memberId: string;
  candidateId: string;
};
