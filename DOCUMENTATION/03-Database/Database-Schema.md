# Database Schema Documentation
## Web3Versity Educational Platform

**Version:** 1.0
**Database:** PostgreSQL 15 (Supabase)
**Last Updated:** October 19, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Table Definitions](#table-definitions)
4. [Indexes](#indexes)
5. [Security & Row Level Security](#security--row-level-security)
6. [Functions & Triggers](#functions--triggers)
7. [Views](#views)

---

## Overview

The Web3Versity database is designed to support a comprehensive educational platform with gamification, blockchain integration, and community features. The schema follows PostgreSQL best practices with proper normalization, indexing, and security policies.

### Design Principles

- **Normalization**: 3NF compliance to minimize redundancy
- **Scalability**: Indexed for high-volume queries
- **Security**: Row-Level Security (RLS) for user data protection
- **Auditability**: Created/updated timestamps on all tables
- **Blockchain Integration**: References to Hedera transactions and NFTs

### Key Metrics

- **Total Tables**: 17
- **Total Indexes**: 45+
- **RLS Policies**: 25+
- **Functions**: 10+
- **Triggers**: 8+

---

## Entity Relationship Diagram

```
users (1) ----< (M) user_progress ---- (1) courses
  |                    |
  |                    |
  |                (M) lesson_completions ---- (1) lessons
  |
  |---- (M) user_achievements ---- (1) achievements
  |
  |---- (M) user_streaks
  |
  |---- (1) leaderboard_cache
  |
  |---- (M) discussions
  |            |
  |            +--- (M) replies
  |            |
  |            +--- (M) discussion_votes
  |
  |---- (M) faucet_requests
  |
  |---- (M) transactions
  |
  +---- (M) nft_certificates

courses (1) ----< (M) lessons
           |
           +---< (M) course_prerequisites

achievements ----< (M) achievement_criteria
```

---

## Table Definitions

### 1. users

Stores user account information and wallet connection details.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Wallet & Identity
    evm_address TEXT UNIQUE NOT NULL, -- Metamask address (0x...)
    hedera_account_id TEXT UNIQUE, -- Hedera format (0.0.xxxxx)
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE, -- Optional, for future email notifications

    -- Profile
    avatar_emoji TEXT DEFAULT '👤',
    bio TEXT,
    location TEXT, -- Country/city (optional)

    -- Gamification Stats
    total_xp INTEGER DEFAULT 0 NOT NULL CHECK (total_xp >= 0),
    current_level INTEGER DEFAULT 1 NOT NULL CHECK (current_level >= 1 AND current_level <= 100),
    current_streak INTEGER DEFAULT 0 NOT NULL CHECK (current_streak >= 0),
    longest_streak INTEGER DEFAULT 0 NOT NULL CHECK (longest_streak >= 0),
    last_activity_date DATE DEFAULT CURRENT_DATE,

    -- Counters (denormalized for performance)
    courses_completed INTEGER DEFAULT 0 NOT NULL,
    lessons_completed INTEGER DEFAULT 0 NOT NULL,
    badges_earned INTEGER DEFAULT 0 NOT NULL,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_login_at TIMESTAMPTZ DEFAULT NOW(),

    -- Account Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE, -- Future: email or KYC verification

    -- Privacy Settings
    profile_public BOOLEAN DEFAULT TRUE,
    show_on_leaderboard BOOLEAN DEFAULT TRUE
);

-- Indexes
CREATE INDEX idx_users_evm_address ON users(evm_address);
CREATE INDEX idx_users_hedera_account ON users(hedera_account_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_total_xp ON users(total_xp DESC);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

### 2. courses

Catalog of all available courses.

```sql
CREATE TABLE courses (
    id TEXT PRIMARY KEY, -- e.g., 'course_001'

    -- Basic Info
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    thumbnail_emoji TEXT DEFAULT '📚',

    -- Classification
    track TEXT NOT NULL CHECK (track IN ('explorer', 'developer')),
    category TEXT NOT NULL, -- 'Blockchain Basics', 'NFTs', 'DeFi', etc.
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),

    -- Metrics
    estimated_hours DECIMAL(4,1) NOT NULL CHECK (estimated_hours > 0),
    total_lessons INTEGER DEFAULT 0 NOT NULL,

    -- Stats (denormalized)
    enrollment_count INTEGER DEFAULT 0 NOT NULL,
    completion_count INTEGER DEFAULT 0 NOT NULL,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_ratings INTEGER DEFAULT 0 NOT NULL,

    -- Content
    learning_objectives TEXT[], -- Array of objectives
    what_you_will_learn TEXT[], -- Array of outcomes

    -- XP Rewards
    completion_xp INTEGER DEFAULT 100 NOT NULL,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    published_at TIMESTAMPTZ,

    -- Status
    is_published BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_courses_track ON courses(track);
CREATE INDEX idx_courses_difficulty ON courses(difficulty);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_published ON courses(is_published, published_at);
CREATE INDEX idx_courses_featured ON courses(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_courses_enrollment ON courses(enrollment_count DESC);
CREATE INDEX idx_courses_rating ON courses(average_rating DESC);
```

---

### 3. course_prerequisites

Defines prerequisite relationships between courses.

```sql
CREATE TABLE course_prerequisites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    prerequisite_course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

    is_required BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    UNIQUE(course_id, prerequisite_course_id)
);

-- Indexes
CREATE INDEX idx_prerequisites_course ON course_prerequisites(course_id);
CREATE INDEX idx_prerequisites_required ON course_prerequisites(prerequisite_course_id, is_required);
```

---

### 4. lessons

Individual lessons within courses.

```sql
CREATE TABLE lessons (
    id TEXT PRIMARY KEY, -- e.g., 'ws_lesson_1'

    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

    -- Basic Info
    title TEXT NOT NULL,
    lesson_type TEXT NOT NULL CHECK (lesson_type IN ('text', 'interactive', 'quiz', 'practical')),

    -- Content (stored as JSONB for flexibility)
    content JSONB NOT NULL,

    -- Metadata
    sequence_number INTEGER NOT NULL, -- Order within course
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),

    -- XP Rewards
    completion_xp INTEGER DEFAULT 10 NOT NULL,
    perfect_score_xp INTEGER DEFAULT 30, -- For quizzes

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Constraints
    UNIQUE(course_id, sequence_number)
);

-- Indexes
CREATE INDEX idx_lessons_course ON lessons(course_id, sequence_number);
CREATE INDEX idx_lessons_type ON lessons(lesson_type);
CREATE INDEX idx_lessons_content_gin ON lessons USING GIN(content); -- For JSONB queries
```

---

### 5. user_progress

Tracks user enrollment and course progress.

```sql
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

    -- Progress Tracking
    enrollment_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    started_at TIMESTAMPTZ, -- When first lesson viewed
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,

    -- Stats
    lessons_completed INTEGER DEFAULT 0 NOT NULL,
    total_lessons INTEGER NOT NULL, -- Snapshot at enrollment
    progress_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),

    -- Current Position
    current_lesson_id TEXT REFERENCES lessons(id),

    -- Performance
    total_quiz_attempts INTEGER DEFAULT 0,
    average_quiz_score DECIMAL(5,2),

    -- Certificate
    certificate_nft_id TEXT, -- Token ID once minted
    certificate_minted_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    UNIQUE(user_id, course_id)
);

-- Indexes
CREATE INDEX idx_user_progress_user ON user_progress(user_id, completed_at);
CREATE INDEX idx_user_progress_course ON user_progress(course_id);
CREATE INDEX idx_user_progress_completed ON user_progress(user_id) WHERE completed_at IS NOT NULL;
CREATE INDEX idx_user_progress_active ON user_progress(user_id, last_accessed_at) WHERE completed_at IS NULL;
```

---

### 6. lesson_completions

Detailed tracking of individual lesson completions.

```sql
CREATE TABLE lesson_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

    -- Completion Details
    completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    time_spent_seconds INTEGER, -- Optional tracking

    -- Performance (for quizzes)
    score_percentage DECIMAL(5,2), -- NULL for non-quiz lessons
    attempts INTEGER DEFAULT 1,

    -- XP Awarded
    xp_earned INTEGER NOT NULL,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    UNIQUE(user_id, lesson_id)
);

-- Indexes
CREATE INDEX idx_lesson_completions_user ON lesson_completions(user_id, completed_at DESC);
CREATE INDEX idx_lesson_completions_lesson ON lesson_completions(lesson_id);
CREATE INDEX idx_lesson_completions_course ON lesson_completions(course_id);
```

---

### 7. achievements

Definition of all available badges/achievements.

```sql
CREATE TABLE achievements (
    id TEXT PRIMARY KEY, -- e.g., 'badge_first_steps'

    -- Basic Info
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_emoji TEXT DEFAULT '🏆',

    -- Classification
    category TEXT NOT NULL, -- 'learning', 'social', 'special'
    rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),

    -- Criteria (stored as JSONB for flexibility)
    criteria JSONB NOT NULL, -- e.g., {"lessons_completed": 1}

    -- Rewards
    xp_reward INTEGER DEFAULT 50 NOT NULL,

    -- NFT Info (if badge is minted)
    nft_collection_id TEXT, -- HTS collection ID
    nft_metadata_uri TEXT,

    -- Stats
    times_earned INTEGER DEFAULT 0 NOT NULL,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Indexes
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);
CREATE INDEX idx_achievements_active ON achievements(is_active) WHERE is_active = TRUE;
```

---

### 8. user_achievements

Tracks which users have earned which achievements.

```sql
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,

    -- Earning Details
    earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- NFT Info
    nft_token_id TEXT, -- Individual token ID if minted
    nft_minted_at TIMESTAMPTZ,
    nft_transaction_id TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    UNIQUE(user_id, achievement_id)
);

-- Indexes
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id, earned_at DESC);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_recent ON user_achievements(earned_at DESC);
```

---

### 9. user_streaks

Tracks daily login streaks.

```sql
CREATE TABLE user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Streak Data
    streak_date DATE NOT NULL,
    streak_count INTEGER NOT NULL,

    -- Activity Type
    activity_type TEXT DEFAULT 'login' CHECK (activity_type IN ('login', 'lesson_complete', 'quiz_complete')),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    UNIQUE(user_id, streak_date)
);

-- Indexes
CREATE INDEX idx_user_streaks_user_date ON user_streaks(user_id, streak_date DESC);
CREATE INDEX idx_user_streaks_date ON user_streaks(streak_date DESC);
```

---

### 10. leaderboard_cache

Cached leaderboard rankings for performance.

```sql
CREATE TABLE leaderboard_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Rankings
    all_time_rank INTEGER,
    all_time_xp INTEGER,

    weekly_rank INTEGER,
    weekly_xp INTEGER,
    week_start_date DATE,

    monthly_rank INTEGER,
    monthly_xp INTEGER,
    month_start_date DATE,

    -- Metadata
    calculated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_leaderboard_all_time ON leaderboard_cache(all_time_rank);
CREATE INDEX idx_leaderboard_weekly ON leaderboard_cache(weekly_rank, week_start_date);
CREATE INDEX idx_leaderboard_monthly ON leaderboard_cache(monthly_rank, month_start_date);
CREATE INDEX idx_leaderboard_updated ON leaderboard_cache(updated_at);
```

---

### 11. discussions

Community forum threads.

```sql
CREATE TABLE discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    author_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,

    -- Content
    title TEXT NOT NULL,
    content TEXT NOT NULL,

    -- Classification
    category TEXT NOT NULL CHECK (category IN ('general', 'course_question', 'help', 'showcase')),
    tags TEXT[],

    -- Status
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_solved BOOLEAN DEFAULT FALSE,

    -- Stats
    view_count INTEGER DEFAULT 0 NOT NULL,
    reply_count INTEGER DEFAULT 0 NOT NULL,
    upvote_count INTEGER DEFAULT 0 NOT NULL,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_activity_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_discussions_author ON discussions(author_id);
CREATE INDEX idx_discussions_course ON discussions(course_id);
CREATE INDEX idx_discussions_category ON discussions(category);
CREATE INDEX idx_discussions_activity ON discussions(last_activity_at DESC);
CREATE INDEX idx_discussions_pinned ON discussions(is_pinned, last_activity_at DESC) WHERE is_pinned = TRUE;
CREATE INDEX idx_discussions_tags ON discussions USING GIN(tags);
```

---

### 12. replies

Replies to discussion threads.

```sql
CREATE TABLE replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    parent_reply_id UUID REFERENCES replies(id) ON DELETE CASCADE, -- For nested replies

    -- Content
    content TEXT NOT NULL,

    -- Status
    is_solution BOOLEAN DEFAULT FALSE, -- Marked as answer
    upvote_count INTEGER DEFAULT 0 NOT NULL,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_replies_discussion ON replies(discussion_id, created_at);
CREATE INDEX idx_replies_author ON replies(author_id);
CREATE INDEX idx_replies_parent ON replies(parent_reply_id);
CREATE INDEX idx_replies_solution ON replies(discussion_id) WHERE is_solution = TRUE;
```

---

### 13. discussion_votes

Tracks upvotes/downvotes on discussions and replies.

```sql
CREATE TABLE discussion_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES replies(id) ON DELETE CASCADE,

    -- Vote
    vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Constraints
    CHECK (
        (discussion_id IS NOT NULL AND reply_id IS NULL) OR
        (discussion_id IS NULL AND reply_id IS NOT NULL)
    ),
    UNIQUE(user_id, discussion_id),
    UNIQUE(user_id, reply_id)
);

-- Indexes
CREATE INDEX idx_votes_user ON discussion_votes(user_id);
CREATE INDEX idx_votes_discussion ON discussion_votes(discussion_id, vote_type);
CREATE INDEX idx_votes_reply ON discussion_votes(reply_id, vote_type);
```

---

### 14. faucet_requests

Tracks testnet HBAR faucet requests.

```sql
CREATE TABLE faucet_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Request Details
    hedera_account_id TEXT NOT NULL,
    amount_hbar DECIMAL(10,2) NOT NULL CHECK (amount_hbar > 0),

    -- Transaction
    transaction_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',

    -- Rate Limiting
    requested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ,

    -- IP tracking for additional security
    request_ip TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_faucet_user ON faucet_requests(user_id, requested_at DESC);
CREATE INDEX idx_faucet_account ON faucet_requests(hedera_account_id, requested_at DESC);
CREATE INDEX idx_faucet_status ON faucet_requests(status, requested_at DESC);
CREATE INDEX idx_faucet_rate_limit ON faucet_requests(user_id, requested_at) WHERE status = 'completed';
```

---

### 15. transactions

Log of all blockchain transactions (for auditing).

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Transaction Details
    transaction_id TEXT UNIQUE NOT NULL, -- Hedera transaction ID
    transaction_type TEXT NOT NULL CHECK (transaction_type IN (
        'faucet_request',
        'practice_transfer',
        'nft_mint_certificate',
        'nft_mint_badge',
        'token_transfer'
    )),

    -- Amounts
    amount_hbar DECIMAL(10,8),

    -- Accounts
    from_account TEXT,
    to_account TEXT,

    -- Status
    status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')) DEFAULT 'pending',

    -- References
    related_course_id TEXT REFERENCES courses(id),
    related_achievement_id TEXT REFERENCES achievements(id),

    -- Blockchain Data
    consensus_timestamp TIMESTAMPTZ,
    memo TEXT,
    hashscan_url TEXT,

    -- Error Info
    error_message TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_transactions_user ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_status ON transactions(status, created_at DESC);
CREATE INDEX idx_transactions_hedera_id ON transactions(transaction_id);
CREATE INDEX idx_transactions_course ON transactions(related_course_id);
```

---

### 16. nft_certificates

Registry of all NFT certificates minted.

```sql
CREATE TABLE nft_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

    -- NFT Details
    token_id TEXT UNIQUE NOT NULL,
    collection_id TEXT NOT NULL, -- HTS collection ID
    serial_number INTEGER,

    -- Metadata
    metadata_uri TEXT, -- IPFS or HFS link
    certificate_number TEXT UNIQUE, -- Human-readable cert number

    -- Issue Details
    issued_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    transaction_id TEXT REFERENCES transactions(transaction_id),

    -- Content
    course_title TEXT NOT NULL,
    completion_date DATE NOT NULL,

    -- Verification
    verification_code TEXT UNIQUE, -- For public verification

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    UNIQUE(user_id, course_id)
);

-- Indexes
CREATE INDEX idx_nft_certificates_user ON nft_certificates(user_id, issued_at DESC);
CREATE INDEX idx_nft_certificates_course ON nft_certificates(course_id);
CREATE INDEX idx_nft_certificates_token ON nft_certificates(token_id);
CREATE INDEX idx_nft_certificates_verify ON nft_certificates(verification_code);
```

---

### 17. platform_settings

Global platform configuration.

```sql
CREATE TABLE platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,

    description TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Initial Settings
INSERT INTO platform_settings (setting_key, setting_value, description) VALUES
('faucet_daily_limit_hbar', '10', 'Daily HBAR limit per user'),
('faucet_cooldown_hours', '24', 'Hours between faucet requests'),
('quiz_passing_score', '70', 'Minimum quiz score percentage to pass'),
('xp_per_lesson', '10', 'Base XP for completing a lesson'),
('xp_per_quiz', '20', 'XP for passing a quiz'),
('xp_perfect_quiz', '30', 'Bonus XP for 100% quiz score'),
('xp_course_complete', '100', 'XP for completing a course'),
('leaderboard_cache_minutes', '60', 'Minutes between leaderboard recalculation'),
('level_formula_divisor', '100', 'Divisor in level calculation formula');
```

---

## Indexes

### Performance Optimization

All indexes are designed for the most common query patterns:

1. **User Lookups**: By wallet address, account ID, username
2. **Course Browsing**: By track, difficulty, category, rating
3. **Progress Tracking**: User's courses, completion status
4. **Leaderboards**: XP rankings, weekly/monthly
5. **Community**: Recent discussions, popular threads
6. **Blockchain**: Transaction lookups by ID, user, type

### Composite Indexes

Strategic composite indexes for multi-column queries:
- `(user_id, created_at DESC)` - User's activity history
- `(course_id, sequence_number)` - Ordered lessons
- `(user_id, completed_at)` - User's completed courses
- `(discussion_id, created_at)` - Chronological replies

---

## Security & Row Level Security

### RLS Policies

Supabase Row Level Security policies protect user data:

#### users table
```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Public profiles are viewable by all
CREATE POLICY "Public profiles viewable"
ON users FOR SELECT
USING (profile_public = TRUE);
```

#### user_progress table
```sql
-- Users can view their own progress
CREATE POLICY "Users view own progress"
ON user_progress FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own enrollments
CREATE POLICY "Users can enroll"
ON user_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- System can update progress
CREATE POLICY "System updates progress"
ON user_progress FOR UPDATE
USING (auth.uid() = user_id);
```

#### discussions table
```sql
-- Anyone can view published discussions
CREATE POLICY "View published discussions"
ON discussions FOR SELECT
USING (TRUE);

-- Authenticated users can create discussions
CREATE POLICY "Create discussions"
ON discussions FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Authors can update their discussions
CREATE POLICY "Update own discussions"
ON discussions FOR UPDATE
USING (auth.uid() = author_id);
```

---

## Functions & Triggers

### 1. update_updated_at_column()

Automatically updates `updated_at` timestamp.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 2. calculate_user_level()

Calculates user level from total XP.

```sql
CREATE OR REPLACE FUNCTION calculate_user_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN LEAST(FLOOR(SQRT(xp / 100.0))::INTEGER, 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### 3. update_course_progress()

Recalculates course progress when lessons completed.

```sql
CREATE OR REPLACE FUNCTION update_course_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_progress
    SET
        lessons_completed = (
            SELECT COUNT(*)
            FROM lesson_completions
            WHERE user_id = NEW.user_id AND course_id = NEW.course_id
        ),
        progress_percentage = (
            SELECT (COUNT(*)::DECIMAL / total_lessons * 100)
            FROM lesson_completions
            WHERE user_id = NEW.user_id AND course_id = NEW.course_id
        ),
        updated_at = NOW()
    WHERE user_id = NEW.user_id AND course_id = NEW.course_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_course_progress
AFTER INSERT ON lesson_completions
FOR EACH ROW
EXECUTE FUNCTION update_course_progress();
```

### 4. award_xp()

Awards XP and updates user level.

```sql
CREATE OR REPLACE FUNCTION award_xp(
    p_user_id UUID,
    p_xp_amount INTEGER
)
RETURNS void AS $$
DECLARE
    v_new_xp INTEGER;
    v_new_level INTEGER;
BEGIN
    -- Update total XP
    UPDATE users
    SET total_xp = total_xp + p_xp_amount
    WHERE id = p_user_id
    RETURNING total_xp INTO v_new_xp;

    -- Calculate new level
    v_new_level := calculate_user_level(v_new_xp);

    -- Update level
    UPDATE users
    SET current_level = v_new_level
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

### 5. check_achievements()

Checks if user has unlocked new achievements.

```sql
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID)
RETURNS void AS $$
DECLARE
    v_achievement RECORD;
BEGIN
    FOR v_achievement IN
        SELECT * FROM achievements WHERE is_active = TRUE
    LOOP
        -- Check if user meets criteria and hasn't earned yet
        IF NOT EXISTS (
            SELECT 1 FROM user_achievements
            WHERE user_id = p_user_id AND achievement_id = v_achievement.id
        ) THEN
            -- Custom logic based on achievement criteria
            -- (Implementation depends on specific criteria)
            NULL; -- Placeholder
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### 6. update_streak()

Updates daily streak on user activity.

```sql
CREATE OR REPLACE FUNCTION update_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
    v_last_date DATE;
    v_current_streak INTEGER;
BEGIN
    SELECT last_activity_date, current_streak
    INTO v_last_date, v_current_streak
    FROM users
    WHERE id = p_user_id;

    -- If last activity was yesterday, increment streak
    IF v_last_date = CURRENT_DATE - INTERVAL '1 day' THEN
        UPDATE users
        SET
            current_streak = current_streak + 1,
            longest_streak = GREATEST(longest_streak, current_streak + 1),
            last_activity_date = CURRENT_DATE
        WHERE id = p_user_id;

    -- If last activity was today, no change
    ELSIF v_last_date = CURRENT_DATE THEN
        RETURN;

    -- Otherwise, reset streak
    ELSE
        UPDATE users
        SET
            current_streak = 1,
            last_activity_date = CURRENT_DATE
        WHERE id = p_user_id;
    END IF;

    -- Log streak
    INSERT INTO user_streaks (user_id, streak_date, streak_count)
    VALUES (p_user_id, CURRENT_DATE, (SELECT current_streak FROM users WHERE id = p_user_id))
    ON CONFLICT (user_id, streak_date) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
```

### 7. refresh_leaderboard()

Recalculates leaderboard rankings.

```sql
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
    -- All-time rankings
    WITH ranked_users AS (
        SELECT
            id,
            total_xp,
            ROW_NUMBER() OVER (ORDER BY total_xp DESC, created_at ASC) as rank
        FROM users
        WHERE is_active = TRUE AND show_on_leaderboard = TRUE
    )
    INSERT INTO leaderboard_cache (user_id, all_time_rank, all_time_xp)
    SELECT id, rank, total_xp FROM ranked_users
    ON CONFLICT (user_id) DO UPDATE
    SET
        all_time_rank = EXCLUDED.all_time_rank,
        all_time_xp = EXCLUDED.all_time_xp,
        calculated_at = NOW();

    -- Weekly rankings (simplified - would need XP tracking by date)
    -- Monthly rankings (simplified - would need XP tracking by date)
END;
$$ LANGUAGE plpgsql;
```

---

## Views

### 1. v_user_dashboard

Aggregated user statistics for dashboard.

```sql
CREATE OR REPLACE VIEW v_user_dashboard AS
SELECT
    u.id,
    u.username,
    u.avatar_emoji,
    u.total_xp,
    u.current_level,
    u.current_streak,
    u.courses_completed,
    u.badges_earned,
    (SELECT COUNT(*) FROM user_progress WHERE user_id = u.id) as courses_enrolled,
    (SELECT all_time_rank FROM leaderboard_cache WHERE user_id = u.id) as rank,
    (
        SELECT JSON_AGG(JSON_BUILD_OBJECT(
            'id', a.id,
            'name', a.name,
            'icon', a.icon_emoji,
            'rarity', a.rarity,
            'earned_at', ua.earned_at
        ) ORDER BY ua.earned_at DESC)
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = u.id
    ) as recent_badges
FROM users u;
```

### 2. v_course_catalog

Enhanced course catalog with enrollment data.

```sql
CREATE OR REPLACE VIEW v_course_catalog AS
SELECT
    c.*,
    (
        SELECT JSON_AGG(p.prerequisite_course_id)
        FROM course_prerequisites p
        WHERE p.course_id = c.id AND p.is_required = TRUE
    ) as prerequisites,
    (
        SELECT COUNT(*)
        FROM lessons
        WHERE course_id = c.id
    ) as lesson_count
FROM courses c
WHERE c.is_published = TRUE;
```

---

## Migration Strategy

See [Database Migrations](./Database-Migrations.sql) for the complete SQL migration script that will:

1. Create all tables in correct order
2. Set up indexes
3. Configure RLS policies
4. Create functions and triggers
5. Populate initial data (courses, lessons, achievements)
6. Create views

---

**Next Steps**:
1. Review schema design
2. Execute migration script in Supabase dashboard
3. Verify all tables created successfully
4. Test RLS policies
5. Populate course data

