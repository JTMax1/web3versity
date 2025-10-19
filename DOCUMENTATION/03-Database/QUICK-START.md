# Database Quick Start Guide

## TL;DR - Get Your Database Running in 5 Minutes

### Step 1: Run the Migration (2 minutes)

**Option A: Supabase Dashboard**
1. Open Supabase Dashboard → SQL Editor
2. Copy all content from `Database-Migrations.sql`
3. Click "Run"
4. Wait for success message

**Option B: Command Line**
```bash
psql -h your-host -U your-user -d your-db -f Database-Migrations.sql
```

### Step 2: Verify Installation (1 minute)

```sql
-- Quick verification
SELECT
    (SELECT COUNT(*) FROM courses) as total_courses,
    (SELECT COUNT(*) FROM lessons) as total_lessons,
    (SELECT COUNT(*) FROM achievements) as total_achievements,
    (SELECT COUNT(*) FROM platform_settings) as settings;

-- Expected: 44 courses, 28+ lessons, 25+ achievements, 9 settings
```

### Step 3: Create Your First Test User (1 minute)

```sql
INSERT INTO users (evm_address, username, avatar_emoji)
VALUES ('0x1234567890abcdef1234567890abcdef12345678', 'TestUser', '👨‍💻')
RETURNING id, username, total_xp, current_level;
```

### Step 4: Enroll in a Course (1 minute)

```sql
-- Get user ID and course info
WITH user_data AS (
    SELECT id FROM users WHERE username = 'TestUser'
),
course_data AS (
    SELECT id, total_lessons FROM courses WHERE id = 'course_001'
)
INSERT INTO user_progress (user_id, course_id, total_lessons)
SELECT u.id, c.id, c.total_lessons
FROM user_data u, course_data c
RETURNING *;
```

### Step 5: Test Core Functions (Optional)

```sql
-- Award XP
SELECT award_xp(
    (SELECT id FROM users WHERE username = 'TestUser'),
    100
);

-- Check achievements
SELECT check_achievements(
    (SELECT id FROM users WHERE username = 'TestUser')
);

-- View dashboard
SELECT * FROM v_user_dashboard
WHERE username = 'TestUser';
```

---

## Essential Queries

### Browse Courses

```sql
-- All beginner explorer courses
SELECT id, title, description, estimated_hours, enrollment_count, average_rating
FROM courses
WHERE track = 'explorer' AND difficulty = 'beginner' AND is_published = TRUE
ORDER BY average_rating DESC, enrollment_count DESC;

-- Featured courses
SELECT id, title, thumbnail_emoji, category, difficulty
FROM courses
WHERE is_featured = TRUE;

-- Course with prerequisites
SELECT
    c.id,
    c.title,
    ARRAY(
        SELECT cp.prerequisite_course_id
        FROM course_prerequisites cp
        WHERE cp.course_id = c.id
    ) as prerequisites
FROM courses c
WHERE c.id = 'course_003';
```

### Get Course Content

```sql
-- All lessons for a course (ordered)
SELECT id, title, lesson_type, sequence_number, duration_minutes
FROM lessons
WHERE course_id = 'course_001'
ORDER BY sequence_number;

-- Lesson content
SELECT title, lesson_type, content
FROM lessons
WHERE id = 'bf_lesson_1';
```

### User Progress

```sql
-- User's enrolled courses
SELECT
    c.title,
    c.thumbnail_emoji,
    up.progress_percentage,
    up.lessons_completed,
    up.total_lessons,
    up.last_accessed_at
FROM user_progress up
JOIN courses c ON up.course_id = c.id
WHERE up.user_id = 'user-uuid-here'
ORDER BY up.last_accessed_at DESC;

-- Complete a lesson
WITH lesson_data AS (
    SELECT user_id, lesson_id, course_id, completion_xp
    FROM (VALUES (
        'user-uuid'::uuid,
        'bf_lesson_1',
        'course_001',
        10
    )) AS t(user_id, lesson_id, course_id, xp)
)
INSERT INTO lesson_completions (user_id, lesson_id, course_id, xp_earned)
SELECT user_id, lesson_id, course_id, xp
FROM lesson_data
RETURNING *;
```

### Leaderboard

```sql
-- Top 10 users
SELECT
    u.username,
    u.avatar_emoji,
    u.total_xp,
    u.current_level,
    lc.all_time_rank
FROM users u
JOIN leaderboard_cache lc ON u.id = lc.user_id
ORDER BY lc.all_time_rank
LIMIT 10;

-- Refresh leaderboard
SELECT refresh_leaderboard();
```

### Achievements

```sql
-- All available achievements
SELECT id, name, description, icon_emoji, category, rarity, xp_reward
FROM achievements
WHERE is_active = TRUE
ORDER BY rarity, category;

-- User's earned achievements
SELECT
    a.name,
    a.icon_emoji,
    a.rarity,
    ua.earned_at
FROM user_achievements ua
JOIN achievements a ON ua.achievement_id = a.id
WHERE ua.user_id = 'user-uuid-here'
ORDER BY ua.earned_at DESC;

-- Award achievement manually
INSERT INTO user_achievements (user_id, achievement_id)
VALUES ('user-uuid'::uuid, 'badge_001')
ON CONFLICT DO NOTHING;
```

---

## Common Operations

### Create New Course

```sql
INSERT INTO courses (
    id, title, description, thumbnail_emoji,
    track, category, difficulty,
    estimated_hours, total_lessons, completion_xp
) VALUES (
    'course_045',
    'Advanced Hedera Topics',
    'Deep dive into advanced Hedera features and optimization techniques',
    '⚡',
    'developer',
    'Advanced Topics',
    'advanced',
    12.5,
    0, -- Will be updated when lessons added
    200
);
```

### Add Lesson to Course

```sql
INSERT INTO lessons (
    id, course_id, title, lesson_type, content,
    sequence_number, duration_minutes, completion_xp
) VALUES (
    'advanced_lesson_1',
    'course_045',
    'Hedera State Proofs',
    'text',
    '{
        "sections": [
            {
                "heading": "What are State Proofs?",
                "text": "State proofs provide cryptographic verification...",
                "emoji": "🔐"
            }
        ]
    }'::jsonb,
    1,
    15,
    10
);

-- Update course lesson count
UPDATE courses
SET total_lessons = (SELECT COUNT(*) FROM lessons WHERE course_id = 'course_045')
WHERE id = 'course_045';
```

### Track Faucet Request

```sql
INSERT INTO faucet_requests (
    user_id, hedera_account_id, amount_hbar, status
) VALUES (
    'user-uuid'::uuid,
    '0.0.123456',
    10.00,
    'pending'
) RETURNING *;
```

### Log Blockchain Transaction

```sql
INSERT INTO transactions (
    user_id, transaction_id, transaction_type,
    amount_hbar, from_account, to_account, status
) VALUES (
    'user-uuid'::uuid,
    '0.0.123456@1234567890.123456789',
    'practice_transfer',
    0.1,
    '0.0.123456',
    '0.0.789012',
    'success'
) RETURNING *;
```

---

## Useful Maintenance Commands

### Update Statistics

```sql
ANALYZE; -- Update all table statistics
ANALYZE users; -- Update specific table
```

### Check Table Sizes

```sql
SELECT
    relname as table_name,
    pg_size_pretty(pg_total_relation_size(relid)) as total_size,
    pg_size_pretty(pg_relation_size(relid)) as table_size,
    pg_size_pretty(pg_indexes_size(relid)) as indexes_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

### Monitor Active Queries

```sql
SELECT
    pid,
    usename,
    datname,
    state,
    query,
    now() - query_start as duration
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC;
```

### Check Index Usage

```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
```

---

## Performance Tips

### 1. Use Prepared Statements

```sql
-- Instead of dynamic SQL, use parameterized queries
PREPARE get_user_progress (uuid) AS
    SELECT * FROM user_progress WHERE user_id = $1;

EXECUTE get_user_progress('user-uuid'::uuid);
```

### 2. Batch Operations

```sql
-- Insert multiple lessons at once
INSERT INTO lessons (id, course_id, title, lesson_type, content, sequence_number, duration_minutes, completion_xp)
VALUES
    ('lesson_1', 'course_001', 'Title 1', 'text', '{}'::jsonb, 1, 5, 10),
    ('lesson_2', 'course_001', 'Title 2', 'text', '{}'::jsonb, 2, 5, 10),
    ('lesson_3', 'course_001', 'Title 3', 'quiz', '{}'::jsonb, 3, 5, 20);
```

### 3. Use Views for Complex Queries

```sql
-- Already created: v_user_dashboard, v_course_catalog
SELECT * FROM v_user_dashboard WHERE username = 'TestUser';
```

### 4. Enable Query Result Caching (Supabase)

Cache frequently accessed data in your application layer.

---

## Debugging

### Check Constraints

```sql
-- View all constraints on a table
SELECT
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'users'::regclass;
```

### Test Triggers

```sql
-- Update a user and see trigger fire
UPDATE users
SET total_xp = total_xp + 100
WHERE username = 'TestUser'
RETURNING updated_at; -- Should show current timestamp
```

### Validate JSONB Content

```sql
-- Check lesson content structure
SELECT
    id,
    title,
    jsonb_pretty(content) as formatted_content
FROM lessons
WHERE id = 'bf_lesson_1';
```

---

## Emergency Operations

### Rollback Recent Changes

```sql
BEGIN;
-- Your operations here
-- If something goes wrong:
ROLLBACK;
-- If everything looks good:
COMMIT;
```

### Reset User Progress

```sql
-- Delete user's progress (use with caution!)
DELETE FROM user_progress WHERE user_id = 'user-uuid'::uuid;
DELETE FROM lesson_completions WHERE user_id = 'user-uuid'::uuid;
UPDATE users SET
    total_xp = 0,
    current_level = 1,
    courses_completed = 0,
    lessons_completed = 0
WHERE id = 'user-uuid'::uuid;
```

### Recreate Leaderboard

```sql
TRUNCATE leaderboard_cache;
SELECT refresh_leaderboard();
```

---

## Next Steps

1. ✅ Database is set up
2. ⬜ Add remaining lesson content (39 courses)
3. ⬜ Configure Row Level Security
4. ⬜ Set up automated backups
5. ⬜ Create API endpoints (Supabase or custom)
6. ⬜ Connect frontend application

**See `MIGRATION-README.md` for comprehensive documentation.**
