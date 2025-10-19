/**
 * Database Type Definitions
 *
 * TypeScript interfaces matching the PostgreSQL database schema.
 * These types correspond exactly to the tables defined in the database migration.
 *
 * Reference: DOCUMENTATION/03-Database/Database-Schema.md
 */

// ============================================================================
// Database Types
// ============================================================================

/** PostgreSQL UUID type */
export type UUID = string;

/** PostgreSQL TIMESTAMPTZ type */
export type Timestamp = string;

/** PostgreSQL JSONB type */
export type JSONB = Record<string, any>;

// ============================================================================
// Enum Types
// ============================================================================

export type CourseTrack = 'explorer' | 'developer';
export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type LessonType = 'text' | 'interactive' | 'quiz' | 'practical';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type DiscussionCategory = 'general' | 'course_question' | 'help' | 'showcase';
export type VoteType = 'upvote' | 'downvote';
export type TransactionStatus = 'pending' | 'success' | 'failed';
export type TransactionType =
  | 'faucet_request'
  | 'practice_transfer'
  | 'nft_mint_certificate'
  | 'nft_mint_badge'
  | 'token_transfer';

// ============================================================================
// Table: users
// ============================================================================

export interface User {
  id: UUID;

  // Wallet & Identity
  evm_address: string;
  hedera_account_id: string | null;
  username: string;
  email: string | null;

  // Profile
  avatar_emoji: string;
  bio: string | null;
  location: string | null;

  // Gamification Stats
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string; // DATE type

  // Counters
  courses_completed: number;
  lessons_completed: number;
  badges_earned: number;

  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
  last_login_at: Timestamp | null;

  // Account Status
  is_active: boolean;
  is_verified: boolean;

  // Privacy Settings
  profile_public: boolean;
  show_on_leaderboard: boolean;
}

export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type UserUpdate = Partial<Omit<User, 'id' | 'evm_address' | 'created_at'>>;

// ============================================================================
// Table: courses
// ============================================================================

export interface Course {
  id: string; // course_001, course_002, etc.

  // Basic Info
  title: string;
  description: string;
  thumbnail_emoji: string;

  // Classification
  track: CourseTrack;
  category: string;
  difficulty: CourseDifficulty;

  // Metrics
  estimated_hours: number;
  total_lessons: number;

  // Stats
  enrollment_count: number;
  completion_count: number;
  average_rating: number;
  total_ratings: number;

  // Content
  learning_objectives: string[] | null;
  what_you_will_learn: string[] | null;

  // XP Rewards
  completion_xp: number;

  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
  published_at: Timestamp | null;

  // Status
  is_published: boolean;
  is_featured: boolean;
}

export type CourseInsert = Omit<Course, 'created_at' | 'updated_at'>;
export type CourseUpdate = Partial<Omit<Course, 'id' | 'created_at'>>;

// ============================================================================
// Table: course_prerequisites
// ============================================================================

export interface CoursePrerequisite {
  id: UUID;
  course_id: string;
  prerequisite_course_id: string;
  is_required: boolean;
  created_at: Timestamp;
}

// ============================================================================
// Table: lessons
// ============================================================================

export interface Lesson {
  id: string; // ws_lesson_1, bf_lesson_1, etc.
  course_id: string;

  // Basic Info
  title: string;
  lesson_type: LessonType;

  // Content (JSONB)
  content: JSONB;

  // Metadata
  sequence_number: number;
  duration_minutes: number;

  // XP Rewards
  completion_xp: number;
  perfect_score_xp: number | null;

  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type LessonInsert = Omit<Lesson, 'created_at' | 'updated_at'>;
export type LessonUpdate = Partial<Omit<Lesson, 'id' | 'course_id' | 'created_at'>>;

// ============================================================================
// Table: user_progress
// ============================================================================

export interface UserProgress {
  id: UUID;
  user_id: UUID;
  course_id: string;

  // Progress Tracking
  enrollment_date: Timestamp;
  started_at: Timestamp | null;
  completed_at: Timestamp | null;
  last_accessed_at: Timestamp | null;

  // Stats
  lessons_completed: number;
  total_lessons: number;
  progress_percentage: number;

  // Current Position
  current_lesson_id: string | null;

  // Performance
  total_quiz_attempts: number;
  average_quiz_score: number | null;

  // Certificate
  certificate_nft_id: string | null;
  certificate_minted_at: Timestamp | null;

  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type UserProgressInsert = Omit<UserProgress, 'id' | 'created_at' | 'updated_at'>;
export type UserProgressUpdate = Partial<Omit<UserProgress, 'id' | 'user_id' | 'course_id' | 'created_at'>>;

// ============================================================================
// Table: lesson_completions
// ============================================================================

export interface LessonCompletion {
  id: UUID;
  user_id: UUID;
  lesson_id: string;
  course_id: string;

  // Completion Details
  completed_at: Timestamp;
  time_spent_seconds: number | null;

  // Performance (for quizzes)
  score_percentage: number | null;
  attempts: number;

  // XP Awarded
  xp_earned: number;

  // Metadata
  created_at: Timestamp;
}

export type LessonCompletionInsert = Omit<LessonCompletion, 'id' | 'created_at'>;

// ============================================================================
// Table: achievements
// ============================================================================

export interface Achievement {
  id: string; // badge_first_steps, etc.

  // Basic Info
  name: string;
  description: string;
  icon_emoji: string;

  // Classification
  category: string;
  rarity: BadgeRarity;

  // Criteria (JSONB)
  criteria: JSONB;

  // Rewards
  xp_reward: number;

  // NFT Info
  nft_collection_id: string | null;
  nft_metadata_uri: string | null;

  // Stats
  times_earned: number;

  // Metadata
  created_at: Timestamp;
  is_active: boolean;
}

export type AchievementInsert = Omit<Achievement, 'created_at'>;
export type AchievementUpdate = Partial<Omit<Achievement, 'id' | 'created_at'>>;

// ============================================================================
// Table: user_achievements
// ============================================================================

export interface UserAchievement {
  id: UUID;
  user_id: UUID;
  achievement_id: string;

  // Earning Details
  earned_at: Timestamp;

  // NFT Info
  nft_token_id: string | null;
  nft_minted_at: Timestamp | null;
  nft_transaction_id: string | null;

  // Metadata
  created_at: Timestamp;
}

export type UserAchievementInsert = Omit<UserAchievement, 'id' | 'created_at'>;

// ============================================================================
// Table: user_streaks
// ============================================================================

export interface UserStreak {
  id: UUID;
  user_id: UUID;

  // Streak Data
  streak_date: string; // DATE type
  streak_count: number;

  // Activity Type
  activity_type: 'login' | 'lesson_complete' | 'quiz_complete';

  // Metadata
  created_at: Timestamp;
}

export type UserStreakInsert = Omit<UserStreak, 'id' | 'created_at'>;

// ============================================================================
// Table: leaderboard_cache
// ============================================================================

export interface LeaderboardCache {
  id: UUID;
  user_id: UUID;

  // Rankings
  all_time_rank: number | null;
  all_time_xp: number | null;

  weekly_rank: number | null;
  weekly_xp: number | null;
  week_start_date: string | null; // DATE type

  monthly_rank: number | null;
  monthly_xp: number | null;
  month_start_date: string | null; // DATE type

  // Metadata
  calculated_at: Timestamp;
  updated_at: Timestamp;
}

// ============================================================================
// Table: discussions
// ============================================================================

export interface Discussion {
  id: UUID;
  author_id: UUID | null;
  course_id: string | null;

  // Content
  title: string;
  content: string;

  // Classification
  category: DiscussionCategory;
  tags: string[] | null;

  // Status
  is_pinned: boolean;
  is_locked: boolean;
  is_solved: boolean;

  // Stats
  view_count: number;
  reply_count: number;
  upvote_count: number;

  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
  last_activity_at: Timestamp;
}

export type DiscussionInsert = Omit<Discussion, 'id' | 'created_at' | 'updated_at' | 'last_activity_at'>;
export type DiscussionUpdate = Partial<Omit<Discussion, 'id' | 'author_id' | 'created_at'>>;

// ============================================================================
// Table: replies
// ============================================================================

export interface Reply {
  id: UUID;
  discussion_id: UUID;
  author_id: UUID | null;
  parent_reply_id: UUID | null;

  // Content
  content: string;

  // Status
  is_solution: boolean;
  upvote_count: number;

  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type ReplyInsert = Omit<Reply, 'id' | 'created_at' | 'updated_at'>;
export type ReplyUpdate = Partial<Omit<Reply, 'id' | 'discussion_id' | 'author_id' | 'created_at'>>;

// ============================================================================
// Table: discussion_votes
// ============================================================================

export interface DiscussionVote {
  id: UUID;
  user_id: UUID;
  discussion_id: UUID | null;
  reply_id: UUID | null;

  // Vote
  vote_type: VoteType;

  // Metadata
  created_at: Timestamp;
}

export type DiscussionVoteInsert = Omit<DiscussionVote, 'id' | 'created_at'>;

// ============================================================================
// Table: faucet_requests
// ============================================================================

export interface FaucetRequest {
  id: UUID;
  user_id: UUID;

  // Request Details
  hedera_account_id: string;
  amount_hbar: number;

  // Transaction
  transaction_id: string | null;
  status: TransactionStatus;

  // Rate Limiting
  requested_at: Timestamp;
  completed_at: Timestamp | null;

  // IP tracking
  request_ip: string | null;

  // Metadata
  created_at: Timestamp;
}

export type FaucetRequestInsert = Omit<FaucetRequest, 'id' | 'created_at'>;

// ============================================================================
// Table: transactions
// ============================================================================

export interface Transaction {
  id: UUID;
  user_id: UUID | null;

  // Transaction Details
  transaction_id: string;
  transaction_type: TransactionType;

  // Amounts
  amount_hbar: number | null;

  // Accounts
  from_account: string | null;
  to_account: string | null;

  // Status
  status: TransactionStatus;

  // References
  related_course_id: string | null;
  related_achievement_id: string | null;

  // Blockchain Data
  consensus_timestamp: Timestamp | null;
  memo: string | null;
  hashscan_url: string | null;

  // Error Info
  error_message: string | null;

  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type TransactionInsert = Omit<Transaction, 'id' | 'created_at' | 'updated_at'>;
export type TransactionUpdate = Partial<Omit<Transaction, 'id' | 'transaction_id' | 'created_at'>>;

// ============================================================================
// Table: nft_certificates
// ============================================================================

export interface NFTCertificate {
  id: UUID;
  user_id: UUID;
  course_id: string;

  // NFT Details
  token_id: string;
  collection_id: string;
  serial_number: number | null;

  // Metadata
  metadata_uri: string | null;
  certificate_number: string;

  // Issue Details
  issued_at: Timestamp;
  transaction_id: string | null;

  // Content
  course_title: string;
  completion_date: string; // DATE type

  // Verification
  verification_code: string;

  // Metadata
  created_at: Timestamp;
}

export type NFTCertificateInsert = Omit<NFTCertificate, 'id' | 'created_at'>;

// ============================================================================
// Table: platform_settings
// ============================================================================

export interface PlatformSetting {
  id: UUID;
  setting_key: string;
  setting_value: JSONB;
  description: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// ============================================================================
// Helper Types for API
// ============================================================================

/**
 * Course with prerequisites populated
 */
export interface CourseWithPrerequisites extends Course {
  prerequisites?: Course[];
}

/**
 * User progress with course details
 */
export interface UserProgressWithCourse extends UserProgress {
  course?: Course;
}

/**
 * Lesson completion with lesson details
 */
export interface LessonCompletionWithLesson extends LessonCompletion {
  lesson?: Lesson;
}

/**
 * User achievement with achievement details
 */
export interface UserAchievementWithDetails extends UserAchievement {
  achievement?: Achievement;
}

/**
 * Discussion with author details
 */
export interface DiscussionWithAuthor extends Discussion {
  author?: Pick<User, 'id' | 'username' | 'avatar_emoji'>;
}

/**
 * Reply with author details
 */
export interface ReplyWithAuthor extends Reply {
  author?: Pick<User, 'id' | 'username' | 'avatar_emoji'>;
}

/**
 * Leaderboard entry for display
 */
export interface LeaderboardEntry {
  rank: number;
  user_id: UUID;
  username: string;
  avatar_emoji: string;
  total_xp: number;
  current_level: number;
  courses_completed: number;
  badges_earned: number;
}

// ============================================================================
// Filter Types for Queries
// ============================================================================

export interface CourseFilters {
  track?: CourseTrack;
  difficulty?: CourseDifficulty;
  category?: string;
  search?: string;
  is_published?: boolean;
  is_featured?: boolean;
}

export interface DiscussionFilters {
  category?: DiscussionCategory;
  course_id?: string;
  author_id?: UUID;
  is_solved?: boolean;
  tags?: string[];
  search?: string;
}

export interface UserFilters {
  show_on_leaderboard?: boolean;
  is_active?: boolean;
  min_level?: number;
  search?: string;
}

// ============================================================================
// Database Schema Type
// ============================================================================

/**
 * Complete database schema type for Supabase client
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      courses: {
        Row: Course;
        Insert: CourseInsert;
        Update: CourseUpdate;
      };
      course_prerequisites: {
        Row: CoursePrerequisite;
        Insert: Omit<CoursePrerequisite, 'id' | 'created_at'>;
        Update: Partial<Omit<CoursePrerequisite, 'id' | 'created_at'>>;
      };
      lessons: {
        Row: Lesson;
        Insert: LessonInsert;
        Update: LessonUpdate;
      };
      user_progress: {
        Row: UserProgress;
        Insert: UserProgressInsert;
        Update: UserProgressUpdate;
      };
      lesson_completions: {
        Row: LessonCompletion;
        Insert: LessonCompletionInsert;
        Update: never;
      };
      achievements: {
        Row: Achievement;
        Insert: AchievementInsert;
        Update: AchievementUpdate;
      };
      user_achievements: {
        Row: UserAchievement;
        Insert: UserAchievementInsert;
        Update: never;
      };
      user_streaks: {
        Row: UserStreak;
        Insert: UserStreakInsert;
        Update: never;
      };
      leaderboard_cache: {
        Row: LeaderboardCache;
        Insert: Omit<LeaderboardCache, 'id' | 'calculated_at' | 'updated_at'>;
        Update: Partial<Omit<LeaderboardCache, 'id' | 'user_id'>>;
      };
      discussions: {
        Row: Discussion;
        Insert: DiscussionInsert;
        Update: DiscussionUpdate;
      };
      replies: {
        Row: Reply;
        Insert: ReplyInsert;
        Update: ReplyUpdate;
      };
      discussion_votes: {
        Row: DiscussionVote;
        Insert: DiscussionVoteInsert;
        Update: never;
      };
      faucet_requests: {
        Row: FaucetRequest;
        Insert: FaucetRequestInsert;
        Update: Partial<Omit<FaucetRequest, 'id' | 'user_id' | 'created_at'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: TransactionInsert;
        Update: TransactionUpdate;
      };
      nft_certificates: {
        Row: NFTCertificate;
        Insert: NFTCertificateInsert;
        Update: never;
      };
      platform_settings: {
        Row: PlatformSetting;
        Insert: Omit<PlatformSetting, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PlatformSetting, 'id' | 'setting_key' | 'created_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calculate_user_level: {
        Args: { xp: number };
        Returns: number;
      };
      award_xp: {
        Args: { p_user_id: UUID; p_xp_amount: number };
        Returns: void;
      };
      update_streak: {
        Args: { p_user_id: UUID };
        Returns: void;
      };
      refresh_leaderboard: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
  };
}
