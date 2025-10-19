# Database Migration Guide

## Overview

The `Database-Migrations.sql` file is a comprehensive, production-ready SQL migration that creates the complete Web3Versity database schema with all initial data.

**File Size:** 1,235 lines of SQL
**Database:** PostgreSQL 15 (Supabase compatible)
**Version:** 1.0.0
**Created:** 2025-10-19

---

## What's Included

### 1. Database Schema (17 Tables)

#### Core User & Learning Tables
- **users** - User accounts with wallet connections and gamification stats
- **courses** - All 44 courses from mockData.ts (courses 001-044)
- **lessons** - Individual lessons with JSONB content storage
- **course_prerequisites** - Course dependency relationships
- **user_progress** - Course enrollment and completion tracking
- **lesson_completions** - Detailed lesson completion records

#### Gamification Tables
- **achievements** - Badge/achievement definitions (25+ achievements)
- **user_achievements** - User-earned achievements
- **user_streaks** - Daily activity streak tracking
- **leaderboard_cache** - Cached rankings for performance

#### Community Tables
- **discussions** - Forum threads
- **replies** - Discussion replies (with nested support)
- **discussion_votes** - Upvote/downvote tracking

#### Blockchain Integration Tables
- **faucet_requests** - Testnet HBAR faucet tracking
- **transactions** - All blockchain transaction logs
- **nft_certificates** - NFT certificate registry

#### Configuration
- **platform_settings** - Global platform configuration

### 2. Performance Indexes (45+)

Strategic indexes for:
- Fast user lookups by wallet address, username
- Course browsing by track, difficulty, category
- Progress tracking and completion queries
- Leaderboard rankings (all-time, weekly, monthly)
- Discussion activity and search
- Blockchain transaction lookups

### 3. Functions (7 Database Functions)

1. **update_updated_at_column()** - Auto-update timestamps
2. **calculate_user_level(xp)** - Calculate level from XP
3. **update_course_progress()** - Recalculate course completion
4. **award_xp(user_id, amount)** - Award XP and update level
5. **check_achievements(user_id)** - Check and award achievements
6. **update_streak(user_id)** - Update daily streak
7. **refresh_leaderboard()** - Recalculate leaderboard rankings

### 4. Triggers (8 Automatic Triggers)

- Auto-update `updated_at` on: users, courses, lessons, user_progress, discussions, replies, transactions
- Auto-update course progress when lessons completed
- Trigger achievement checks on milestones

### 5. Views (2 Materialized Views)

1. **v_user_dashboard** - Aggregated user statistics
2. **v_course_catalog** - Enhanced course catalog with prerequisites

### 6. Initial Data Population

#### Platform Settings (9 settings)
- Faucet limits and cooldown periods
- XP reward amounts
- Quiz passing scores
- Leaderboard refresh intervals

#### All 44 Courses
Complete course data from `mockData.ts`:
- **Explorer Track** (36 courses): Blockchain basics, NFTs, DeFi, Security, etc.
- **Developer Track** (8 courses): Smart contracts, Token development, DApp building

Includes for each course:
- Title, description, thumbnail emoji
- Track, category, difficulty level
- Estimated hours, enrollment stats
- XP rewards, publication status

#### 25+ Achievements
Categorized badges:
- **Learning achievements**: First Steps, Speed Learner, Perfect Score, etc.
- **Social achievements**: Community Helper, Discussion Starter, etc.
- **Special achievements**: Explorer Track Champion, Platform Pioneer, etc.
- **Course-specific**: Hedera Expert, Security Expert, NFT Enthusiast, etc.

#### Course Prerequisites (20+ relationships)
Proper course dependency mapping ensuring logical learning paths

#### Sample Lesson Content
Full lesson content with JSONB storage for:
- **Course 001**: Hedera Fundamentals (7 lessons)
- **Course 004**: Wallet Security (6 lessons)
- **Course 009**: Understanding Transactions (6 lessons)
- **Course 010**: NFTs - Beginner (4 lessons)
- **Course 014**: Understanding Testnet (5 lessons)

Each lesson includes:
- Structured content sections with headings, text, lists
- Interactive component specifications
- Quiz questions with explanations
- Practical exercises with step-by-step guidance

---

## Key Features

### Production-Ready Design

✅ **Idempotent** - Safe to run multiple times (uses IF NOT EXISTS, ON CONFLICT)
✅ **Transactional** - Proper foreign key constraints
✅ **Performant** - Comprehensive indexing strategy
✅ **Auditable** - Created/updated timestamps on all tables
✅ **Flexible** - JSONB content storage for extensibility
✅ **Secure** - Ready for Row Level Security policies

### Data Integrity

- CHECK constraints on critical fields (XP >= 0, levels 1-100, valid statuses)
- UNIQUE constraints prevent duplicates
- Foreign keys with proper CASCADE/SET NULL rules
- Validated enums for controlled vocabularies

### Scalability Considerations

- Composite indexes for multi-column queries
- GIN indexes for JSONB and array searches
- Denormalized counters for fast aggregations
- Cached leaderboard for performance
- Partitioning-ready transaction logs

---

## How to Use

### Option 1: Supabase Dashboard

1. Log into your Supabase project
2. Go to **SQL Editor**
3. Create new query
4. Copy entire contents of `Database-Migrations.sql`
5. Click **Run**
6. Verify completion with the final SELECT query

### Option 2: psql Command Line

```bash
psql -h your-db-host -U your-username -d your-database -f Database-Migrations.sql
```

### Option 3: Supabase CLI

```bash
supabase db push
```

---

## Post-Migration Steps

### 1. Verify Installation

Run the verification query at the end of the migration:

```sql
SELECT 'Total Courses' as metric, COUNT(*)::text as value FROM courses
UNION ALL
SELECT 'Total Lessons', COUNT(*)::text FROM lessons
UNION ALL
SELECT 'Total Achievements', COUNT(*)::text FROM achievements;
```

Expected results:
- Total Courses: 44
- Total Lessons: 28+ (sample lessons, more to be added)
- Total Achievements: 25+

### 2. Update Table Statistics

```sql
ANALYZE;
```

### 3. Add Remaining Lesson Content

The migration includes sample lessons for 5 courses. You need to add lessons for the remaining 39 courses by converting TypeScript content from:
- `src/lib/additionalCourseContent.ts`
- `src/lib/explorerCourseContent.ts`
- `src/lib/newExplorerCourses1.ts` through `newExplorerCourses8.ts`

### 4. Configure Row Level Security (Supabase)

If using Supabase Auth, enable RLS and add policies:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
-- ... (see Database-Schema.md for complete RLS policies)
```

### 5. Set Up Scheduled Jobs

Create a cron job to refresh the leaderboard:

```sql
-- Using pg_cron extension
SELECT cron.schedule(
    'refresh-leaderboard',
    '0 * * * *', -- Every hour
    'SELECT refresh_leaderboard();'
);
```

### 6. Test Core Functions

```sql
-- Test XP award
SELECT award_xp('user-uuid-here'::uuid, 100);

-- Test streak update
SELECT update_streak('user-uuid-here'::uuid);

-- Test achievement check
SELECT check_achievements('user-uuid-here'::uuid);
```

---

## Adding More Content

### Adding a New Course

```sql
INSERT INTO courses (id, title, description, thumbnail_emoji, track, category, difficulty, estimated_hours, total_lessons, completion_xp)
VALUES ('course_045', 'New Course Title', 'Description...', '📚', 'explorer', 'Category', 'beginner', 3, 5, 100);
```

### Adding Lessons

```sql
INSERT INTO lessons (id, course_id, title, lesson_type, content, sequence_number, duration_minutes, completion_xp)
VALUES (
    'new_lesson_1',
    'course_045',
    'Lesson Title',
    'text',
    '{"sections": [{"heading": "Title", "text": "Content..."}]}',
    1,
    5,
    10
);
```

### Adding Prerequisites

```sql
INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_required)
VALUES ('course_045', 'course_001', TRUE);
```

---

## Troubleshooting

### Common Issues

**Error: relation already exists**
- Solution: Tables already created. Drop tables or use `IF NOT EXISTS` (already included)

**Error: permission denied**
- Solution: Ensure database user has CREATE privileges

**Error: syntax error**
- Solution: Ensure you're using PostgreSQL 12+ with JSONB support

**Slow INSERT performance**
- Solution: Disable indexes before bulk insert, recreate after:
  ```sql
  DROP INDEX idx_name;
  -- ... insert data ...
  CREATE INDEX idx_name ON table(column);
  ```

### Validation Queries

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verify foreign keys
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE contype = 'f';

-- Check trigger status
SELECT tgname, tgrelid::regclass, tgenabled
FROM pg_trigger
WHERE tgname LIKE 'update_%';
```

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor faucet requests for abuse
- Check transaction success rates

**Weekly:**
- Refresh leaderboard manually if cron fails
- Review discussion activity

**Monthly:**
- ANALYZE tables for updated statistics
- VACUUM to reclaim space
- Review and archive old transactions

### Backup Strategy

```bash
# Full database backup
pg_dump -h host -U user -d database > backup_$(date +%Y%m%d).sql

# Schema only
pg_dump -h host -U user -d database --schema-only > schema.sql

# Data only
pg_dump -h host -U user -d database --data-only > data.sql
```

---

## Next Development Steps

### Phase 1: Complete Lesson Content
1. Convert remaining TypeScript lessons to SQL
2. Add all 44 courses with full content
3. Update `total_lessons` counts

### Phase 2: Enhanced Features
1. Add course ratings table
2. Add user course reviews
3. Add lesson bookmarks
4. Add learning path recommendations

### Phase 3: Advanced Analytics
1. Create analytics views
2. Add user journey tracking
3. Add course completion funnels
4. Add engagement metrics

---

## Support & Resources

- **Database Schema Documentation**: `Database-Schema.md`
- **Course Content**: `src/lib/courseContent.ts` and related files
- **Mock Data Reference**: `src/lib/mockData.ts`
- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

## Version History

- **v1.0.0** (2025-10-19): Initial comprehensive migration
  - 17 tables, 45+ indexes
  - 7 functions, 8 triggers, 2 views
  - 44 courses, 25+ achievements
  - Sample lessons for 5 courses
  - Complete platform settings

---

**Migration Status:** ✅ Complete and Production-Ready

**Important Note:** This migration includes sample lesson content for key courses (001, 004, 009, 010, 014). The remaining courses (002, 003, 005-008, 011-013, 015-044) need their lesson content added by converting the TypeScript data from the source files listed above. The table structure and relationships are complete and ready to receive this data.
