import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';

// ─── Auth Stack ───────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
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

// ─── Earnings Stack ───────────────────────────────────────────────────────────

export type EarningsStackParamList = {
  Earnings: undefined;
};

// ─── Notifications Stack ──────────────────────────────────────────────────────

export type NotificationsStackParamList = {
  Notifications: undefined;
};

// ─── Profile Stack ────────────────────────────────────────────────────────────

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  BankInfo: undefined;
  Photos: undefined;
  ProfilePreview: undefined;
};

// ─── Main Tabs ────────────────────────────────────────────────────────────────

export type MainTabParamList = {
  ActivitiesTab: undefined;
  EarningsTab: undefined;
  NotificationsTab: undefined;
  ProfileTab: undefined;
};

// ─── Screen Props Helpers ─────────────────────────────────────────────────────

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type ActivitiesStackScreenProps<T extends keyof ActivitiesStackParamList> =
  NativeStackScreenProps<ActivitiesStackParamList, T>;

export type EarningsStackScreenProps<T extends keyof EarningsStackParamList> =
  NativeStackScreenProps<EarningsStackParamList, T>;

export type NotificationsStackScreenProps<T extends keyof NotificationsStackParamList> =
  NativeStackScreenProps<NotificationsStackParamList, T>;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> =
  NativeStackScreenProps<ProfileStackParamList, T>;
