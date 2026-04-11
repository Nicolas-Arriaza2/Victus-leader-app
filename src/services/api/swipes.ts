import apiClient from './client';

export type SwipeAction = 'LIKE' | 'PASS';

export interface SwipeCandidate {
  id: string;
  username: string | null;
  profile: {
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    city: string | null;
    sexualOrientation: string[];
    showOrientation: boolean;
  } | null;
  interests: { interest: { id: string; name: string; slug: string } }[];
  photos: { url: string; position: number }[];
}

export interface SwipeResult {
  match: { id: string; userAId: string; userBId: string } | null;
}

export interface CompatibilityStats {
  totalMatches: number;
  topInterests: { name: string; count: number }[];
  topActivities: { id: string; title: string; type: string; count: number }[];
}

export const swipesApi = {
  discover: (params?: Record<string, string>) =>
    apiClient.get<SwipeCandidate[]>('/swipes/discover', { params }),

  swipe: (toUserId: string, action: SwipeAction, sessionId?: string) =>
    apiClient.post<SwipeResult>('/swipes', { toUserId, action, sessionId }),

  stats: () =>
    apiClient.get<CompatibilityStats>('/matches/stats'),
};
