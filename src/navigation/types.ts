import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';

// ─── Auth Stack ───────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// ─── Onboarding Stack ─────────────────────────────────────────────────────────

export type OnboardingStackParamList = {
  OnboardingPhotos: undefined;
  OnboardingProfile: undefined;
  OnboardingInterests: undefined;
  OnboardingSwipe: undefined;
};

// ─── Swipe Stack ──────────────────────────────────────────────────────────────

export type SwipeStackParamList = {
  Discover: undefined;
  CompatibilityStats: undefined;
};

// ─── Activities Stack ─────────────────────────────────────────────────────────

export type ActivitiesStackParamList = {
  ActivitiesList: undefined;
  ActivityDetail: { activityId: string };
  ActivityCreate: undefined;
  ActivityEdit: { activityId: string };
  SessionList: { activityId: string; activityTitle: string };
  SessionDetail: { sessionId: string; activityId: string; sessionDate?: string };
  SessionCreate: { activityId: string };
  SessionEdit: { sessionId: string; activityId: string };
  Enrollments: { sessionId: string; sessionDate?: string };
  Subscribers: { activityId: string; activityTitle: string };
  CheckIn: { sessionId: string };
};

// ─── Profile Stack ────────────────────────────────────────────────────────────

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  BankInfo: undefined;
  Photos: undefined;
  ProfilePreview: undefined;
  Earnings: undefined;
  Notifications: undefined;
};

// ─── Main Tabs ────────────────────────────────────────────────────────────────

export type MainTabParamList = {
  SwipeTab: undefined;
  ActivitiesTab: undefined;
  ProfileTab: undefined;
};

// ─── Screen Props Helpers ─────────────────────────────────────────────────────

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type OnboardingStackScreenProps<T extends keyof OnboardingStackParamList> =
  NativeStackScreenProps<OnboardingStackParamList, T>;

export type SwipeStackScreenProps<T extends keyof SwipeStackParamList> =
  NativeStackScreenProps<SwipeStackParamList, T>;

export type ActivitiesStackScreenProps<T extends keyof ActivitiesStackParamList> =
  NativeStackScreenProps<ActivitiesStackParamList, T>;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> =
  NativeStackScreenProps<ProfileStackParamList, T>;
