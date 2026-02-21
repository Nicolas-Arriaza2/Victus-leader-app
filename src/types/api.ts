// ─── Enums ───────────────────────────────────────────────────────────────────

export type UserRole = 'USER' | 'COMMUNITY_LEADER' | 'ADMIN';
export type ActivityType =
  | 'trekking' | 'theater' | 'dance' | 'fitness' | 'outdoor'
  | 'wellness' | 'gastronomy' | 'music' | 'art' | 'sports' | 'other';
export type EnrollmentStatus = 'pending' | 'confirmed' | 'attended' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type TransferStatus = 'pending' | 'transferred' | 'cancelled';
export type SubscriptionStatus = 'active' | 'pending_payment' | 'overdue' | 'cancelled';
export type ActivityPricingModel = 'per_session' | 'monthly_subscription';
export type BankAccountType =
  | 'cuenta_corriente' | 'cuenta_vista' | 'cuenta_ahorro' | 'cuenta_rut';
export type Gender = 'male' | 'female' | 'non_binary' | 'na';

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  gender: Gender | null;
  birthDate: string | null;
}

export interface User {
  id: string;
  email: string;
  username: string;
  roles: UserRole[];
  profile: UserProfile | null;
  createdAt: string;
}

export interface UserPhoto {
  id: string;
  url: string;
  format: string;
  position: number;
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
}

// ─── Interest ────────────────────────────────────────────────────────────────

export interface Interest {
  id: string;
  name: string;
  slug: string;
}

// ─── Activity ────────────────────────────────────────────────────────────────

export interface Activity {
  id: string;
  slug: string;
  title: string;
  type: ActivityType;
  description: string | null;
  isActive: boolean;
  pricingModel: ActivityPricingModel;
  monthlyPriceCents: number | null;
  createdAt: string;
  interests: Array<{ interest: Interest }>;
}

export interface ActivityDashboard {
  id: string;
  title: string;
  type: ActivityType;
  interests: Interest[];
  totalEnrollmentsAllSessions: number;
  totalMatchesAllSessions: number;
  totalRevenueCents: number;
  sessions: Array<{
    id: string;
    startsAt: string;
    capacity: number | null;
    totalEnrollments: number;
    totalSwipes: number;
    totalMatches: number;
    revenueCents: number;
  }>;
}

// ─── Session ─────────────────────────────────────────────────────────────────

export interface ActivitySession {
  id: string;
  activityId: string;
  startsAt: string;
  endsAt: string;
  capacity: number | null;
  priceCents: number | null;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

export interface SessionStats {
  sessionId: string;
  activityTitle: string;
  capacity: number | null;
  spotsLeft: number | null;
  totalEnrollments: number;
  enrollmentsByStatus: Record<string, number>;
  totalLikes: number;
  totalPasses: number;
  totalMatches: number;
  startsAt: string;
  endsAt: string;
}

// ─── Enrollment ──────────────────────────────────────────────────────────────

export interface ActivityEnrollment {
  id: string;
  sessionId: string;
  userId: string;
  status: EnrollmentStatus;
  paymentStatus: string;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    profile: UserProfile | null;
  };
}

// ─── Bank Info ───────────────────────────────────────────────────────────────

export interface LeaderBankInfo {
  id: string;
  userId: string;
  rut: string;
  holderName: string;
  bankName: string;
  accountType: BankAccountType;
  accountNumber: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Payments ────────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  enrollmentId: string;
  totalAmount: string;
  platformFee: string;
  leaderAmount: string;
  status: PaymentStatus;
  transferStatus: TransferStatus;
  paidAt: string | null;
}

export interface LeaderEarnings {
  totalEarnings: string;
  pendingTransfers: string;
  completedTransfers: string;
  payments: Array<
    Payment & {
      enrollment: {
        session: {
          activity: Pick<Activity, 'id' | 'title'>;
          startsAt: string;
        };
      };
    }
  >;
}

export interface TransferSchedule {
  nextTransferDate: string;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

export interface SubscriptionBilling {
  id: string;
  subscriptionId: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  totalAmount: string;
  platformFee: string;
  leaderAmount: string;
  status: string;
  transferStatus: TransferStatus;
  paidAt: string | null;
}

export interface Subscription {
  id: string;
  userId: string;
  activityId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  activity?: Pick<Activity, 'id' | 'title' | 'type' | 'monthlyPriceCents'>;
  billings?: SubscriptionBilling[];
}

// ─── Auth DTOs ────────────────────────────────────────────────────────────────

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    roles: UserRole[];
  };
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  role: 'COMMUNITY_LEADER';
  firstName?: string;
  lastName?: string;
}
