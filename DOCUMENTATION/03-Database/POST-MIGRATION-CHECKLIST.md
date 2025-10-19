# Post-Migration Checklist

**Complete Verification Guide After Database Migration**

Use this checklist to ensure your Web3Versity database is fully configured and ready for development.

---

## 📋 Overview

After running the database migration, work through each section below. Check off items as you complete them.

**Total Checks:** 50+
**Estimated Time:** 15-20 minutes
**Required Tools:** Supabase Dashboard, SQL Editor, Browser

---

## ✅ Section 1: Database Structure (Required)

### Tables

- [ ] **All 17 tables exist**
  ```sql
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN (
    'users', 'courses', 'course_prerequisites', 'lessons',
    'user_progress', 'lesson_completions', 'achievements',
    'user_achievements', 'user_streaks', 'leaderboard_cache',
    'discussions', 'replies', 'discussion_votes', 'faucet_requests',
    'transactions', 'nft_certificates', 'platform_settings'
  );
  -- Should return: 17
  ```

- [ ] **Each table has correct structure**
  - [ ] `users` - Has evm_address, hedera_account_id, username columns
  - [ ] `courses` - Has id, title, track, difficulty columns
  - [ ] `lessons` - Has id, course_id, title, content (JSONB) columns
  - [ ] `achievements` - Has id, name, icon_emoji, criteria (JSONB) columns
  - [ ] `platform_settings` - Has setting_key, setting_value (JSONB) columns

**How to Check:**
1. Go to Supabase Dashboard → Table Editor
2. Click on each table name in left sidebar
3. Verify columns exist

### Indexes

- [ ] **45+ indexes created**
  ```sql
  SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';
  -- Should return: 45 or more
  ```

- [ ] **Critical indexes exist**
  - [ ] `idx_users_evm_address` - Fast wallet lookup
  - [ ] `idx_users_hedera_account` - Hedera account lookup
  - [ ] `idx_courses_track` - Filter courses by track
  - [ ] `idx_lessons_course` - Get lessons for a course
  - [ ] `idx_user_progress_user` - User progress queries
  - [ ] `idx_achievements_category` - Filter achievements

**How to Check:**
```sql
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN (
  'idx_users_evm_address',
  'idx_users_hedera_account',
  'idx_courses_track',
  'idx_lessons_course',
  'idx_user_progress_user',
  'idx_achievements_category'
);
-- Should return all 6 indexes
```

---

## ✅ Section 2: Database Functions & Triggers (Required)

### Functions

- [ ] **All 7 functions exist**
  ```sql
  SELECT proname FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND proname IN (
    'update_updated_at_column',
    'calculate_user_level',
    'update_course_progress',
    'award_xp',
    'check_achievements',
    'update_streak',
    'refresh_leaderboard'
  );
  -- Should return all 7 function names
  ```

- [ ] **Test key functions work**
  - [ ] `calculate_user_level(10000)` returns `10`
    ```sql
    SELECT calculate_user_level(10000);
    -- Should return: 10
    ```

  - [ ] `calculate_user_level(100)` returns `1`
    ```sql
    SELECT calculate_user_level(100);
    -- Should return: 1
    ```

### Triggers

- [ ] **All 8 triggers exist**
  ```sql
  SELECT COUNT(DISTINCT tgname) FROM pg_trigger
  WHERE NOT tgisinternal
  AND tgname IN (
    'update_users_updated_at',
    'update_courses_updated_at',
    'update_lessons_updated_at',
    'update_user_progress_updated_at',
    'update_discussions_updated_at',
    'update_replies_updated_at',
    'update_transactions_updated_at',
    'trigger_update_course_progress'
  );
  -- Should return: 8
  ```

### Views

- [ ] **Both views exist**
  ```sql
  SELECT viewname FROM pg_views
  WHERE schemaname = 'public'
  AND viewname IN ('v_user_dashboard', 'v_course_catalog');
  -- Should return: 2 rows
  ```

---

## ✅ Section 3: Data Population (Required)

### Platform Settings

- [ ] **9 platform settings inserted**
  ```sql
  SELECT COUNT(*) FROM platform_settings;
  -- Should return: 9
  ```

- [ ] **Critical settings exist**
  - [ ] `faucet_daily_limit_hbar` = 10
  - [ ] `quiz_passing_score` = 70
  - [ ] `xp_per_lesson` = 10
  - [ ] `xp_course_complete` = 100

**How to Check:**
```sql
SELECT setting_key, setting_value
FROM platform_settings
WHERE setting_key IN (
  'faucet_daily_limit_hbar',
  'quiz_passing_score',
  'xp_per_lesson',
  'xp_course_complete'
);
```

### Achievements

- [ ] **25+ achievements inserted**
  ```sql
  SELECT COUNT(*) FROM achievements;
  -- Should return: 25 or more
  ```

- [ ] **Key achievements exist**
  - [ ] badge_001: "First Steps"
  - [ ] badge_002: "Speed Learner"
  - [ ] badge_007: "Week Warrior"
  - [ ] badge_010: "Course Conqueror"

**How to Check:**
```sql
SELECT id, name, icon_emoji, rarity
FROM achievements
WHERE id IN ('badge_001', 'badge_002', 'badge_007', 'badge_010');
```

### Courses

- [ ] **44 courses inserted**
  ```sql
  SELECT COUNT(*) FROM courses;
  -- Should return: 44
  ```

- [ ] **Course distribution is correct**
  ```sql
  SELECT track, COUNT(*) as count
  FROM courses
  GROUP BY track;
  -- Should show both 'explorer' and 'developer' tracks
  ```

- [ ] **Featured courses exist**
  ```sql
  SELECT COUNT(*) FROM courses WHERE is_featured = TRUE;
  -- Should return: 6 or more
  ```

- [ ] **Key courses exist**
  - [ ] course_001: "Hedera Fundamentals"
  - [ ] course_004: "Wallet Security Best Practices"
  - [ ] course_009: "Understanding Transactions"
  - [ ] course_014: "Understanding Testnet on Hedera"

**How to Check:**
```sql
SELECT id, title, track, difficulty
FROM courses
WHERE id IN ('course_001', 'course_004', 'course_009', 'course_014');
```

### Lessons

- [ ] **28+ lessons inserted**
  ```sql
  SELECT COUNT(*) FROM lessons;
  -- Should return: 28 or more
  ```

- [ ] **Lessons distributed across courses**
  ```sql
  SELECT course_id, COUNT(*) as lesson_count
  FROM lessons
  GROUP BY course_id
  ORDER BY course_id;
  -- Should show lessons for multiple courses
  ```

- [ ] **Lesson content is valid JSONB**
  ```sql
  SELECT id, title, jsonb_typeof(content) as content_type
  FROM lessons
  LIMIT 5;
  -- content_type should be 'object' for all
  ```

### Course Prerequisites

- [ ] **15+ prerequisites defined**
  ```sql
  SELECT COUNT(*) FROM course_prerequisites;
  -- Should return: 15 or more
  ```

- [ ] **Prerequisites are valid (no orphans)**
  ```sql
  SELECT COUNT(*) FROM course_prerequisites cp
  WHERE NOT EXISTS (
    SELECT 1 FROM courses c WHERE c.id = cp.course_id
  ) OR NOT EXISTS (
    SELECT 1 FROM courses c WHERE c.id = cp.prerequisite_course_id
  );
  -- Should return: 0
  ```

---

## ✅ Section 4: Application Integration (Required)

### Environment Configuration

- [ ] **.env.local has Supabase credentials**
  - [ ] `VITE_SUPABASE_URL=https://xlbnfetefknsqsdbngvp.supabase.co`
  - [ ] `VITE_SUPABASE_ANON_KEY=eyJ...` (your actual key)

- [ ] **Environment config loads correctly**
  ```bash
  pnpm run dev
  # Check console for "Supabase URL: https://xlbnfetefknsqsdbngvp.supabase.co"
  ```

### Supabase Client Connection

- [ ] **Client connects successfully**
  - Open: `http://localhost:3000/test-supabase.html`
  - Click "Test Connection"
  - Verify "✅ Supabase Connection Successful!"

- [ ] **Table counts are correct**
  - courses: 44
  - achievements: 25+
  - lessons: 28+
  - platform_settings: 9

### API Functions

- [ ] **getCourses() works**
  ```typescript
  const courses = await getCourses();
  console.log(courses.length); // Should be 44
  ```

- [ ] **getAchievements() works**
  ```typescript
  const achievements = await getAchievements();
  console.log(achievements.length); // Should be 25+
  ```

- [ ] **getAllPlatformSettings() works**
  ```typescript
  const settings = await getAllPlatformSettings();
  console.log(settings.length); // Should be 9
  ```

**How to Check:**
1. Open browser console on test page
2. Run the TypeScript code above
3. Verify correct counts

---

## ✅ Section 5: Performance & Optimization (Important)

### Table Statistics

- [ ] **Run ANALYZE to update statistics**
  ```sql
  ANALYZE;
  ```

- [ ] **Verify statistics collected**
  ```sql
  SELECT schemaname, tablename, last_analyze
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY last_analyze DESC NULLS LAST;
  -- last_analyze should have recent timestamps
  ```

### Index Usage

- [ ] **Indexes are being used**
  ```sql
  SELECT schemaname, tablename, indexname, idx_scan
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
  AND idx_scan = 0
  ORDER BY tablename, indexname;
  -- Some indexes may show 0 if no queries yet - that's OK
  ```

### Query Performance

- [ ] **Test query speed**
  ```sql
  EXPLAIN ANALYZE
  SELECT * FROM courses WHERE track = 'explorer';
  -- Execution time should be < 10ms
  ```

---

## ✅ Section 6: Data Integrity (Important)

### Foreign Key Constraints

- [ ] **All foreign keys valid**
  ```sql
  -- Check lessons reference valid courses
  SELECT COUNT(*) FROM lessons l
  WHERE NOT EXISTS (SELECT 1 FROM courses c WHERE c.id = l.course_id);
  -- Should return: 0

  -- Check prerequisites reference valid courses
  SELECT COUNT(*) FROM course_prerequisites cp
  WHERE NOT EXISTS (SELECT 1 FROM courses c WHERE c.id = cp.course_id)
  OR NOT EXISTS (SELECT 1 FROM courses c WHERE c.id = cp.prerequisite_course_id);
  -- Should return: 0
  ```

### Unique Constraints

- [ ] **No duplicate course IDs**
  ```sql
  SELECT id, COUNT(*) FROM courses GROUP BY id HAVING COUNT(*) > 1;
  -- Should return: 0 rows
  ```

- [ ] **No duplicate achievement IDs**
  ```sql
  SELECT id, COUNT(*) FROM achievements GROUP BY id HAVING COUNT(*) > 1;
  -- Should return: 0 rows
  ```

### Check Constraints

- [ ] **Course track values valid**
  ```sql
  SELECT COUNT(*) FROM courses
  WHERE track NOT IN ('explorer', 'developer');
  -- Should return: 0
  ```

- [ ] **Course difficulty values valid**
  ```sql
  SELECT COUNT(*) FROM courses
  WHERE difficulty NOT IN ('beginner', 'intermediate', 'advanced');
  -- Should return: 0
  ```

- [ ] **Lesson types valid**
  ```sql
  SELECT COUNT(*) FROM lessons
  WHERE lesson_type NOT IN ('text', 'interactive', 'quiz', 'practical');
  -- Should return: 0
  ```

---

## ✅ Section 7: Security (Recommended)

### Row Level Security (RLS)

- [ ] **Decide on RLS strategy**
  - [ ] Enable RLS for user-specific tables (recommended for production)
  - [ ] Keep RLS disabled for development (current state)

**To enable RLS later:**
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;
-- etc.
```

### Permissions

- [ ] **Verify API key security**
  - [ ] `VITE_SUPABASE_ANON_KEY` in `.env.local` (OK to expose in client)
  - [ ] Service role key is NOT in `.env.local`
  - [ ] Service role key is NOT committed to git

- [ ] **Check .gitignore**
  - [ ] `.env.local` is ignored
  - [ ] `.env.*.local` are ignored

---

## ✅ Section 8: Logging & Monitoring (Recommended)

### Supabase Logs

- [ ] **Check for errors in logs**
  - Go to Dashboard → Logs → Postgres Logs
  - Look for ERROR or WARNING messages
  - Verify no serious issues

- [ ] **Check for slow queries**
  - Go to Dashboard → Logs → Postgres Logs
  - Filter by "slow" queries (> 1 second)
  - All migration queries should be fast (< 1s)

### Error Handling

- [ ] **Test error scenarios**
  - [ ] Query non-existent course: `getCourseById('nonexistent')`
  - [ ] Verify returns null, not error
  - [ ] Check error is caught gracefully

---

## ✅ Section 9: Backup & Recovery (Recommended)

### Create Backup

- [ ] **Manual backup before development**
  - Go to Dashboard → Database → Backups
  - Click "Create Backup"
  - Label: "Post-Migration Baseline"

- [ ] **Enable daily backups**
  - Dashboard → Database → Backups → Settings
  - Enable automated daily backups

### Test Recovery

- [ ] **Document recovery process**
  - [ ] Know how to restore from backup
  - [ ] Save rollback script location
  - [ ] Test rollback script on dev database (optional)

---

## ✅ Section 10: Documentation (Recommended)

### Project Documentation

- [ ] **README.md is updated**
  - [ ] Database setup instructions
  - [ ] Environment variables documented
  - [ ] Migration process documented

- [ ] **Migration files are in repository**
  - [ ] `DOCUMENTATION/03-Database/Database-Migrations.sql`
  - [ ] `DOCUMENTATION/03-Database/MIGRATION-GUIDE.md`
  - [ ] `DOCUMENTATION/03-Database/Migration-Troubleshooting.md`
  - [ ] `scripts/verify-migration.sql`
  - [ ] `scripts/rollback-migration.sql`

### Team Onboarding

- [ ] **New developers can set up database**
  - [ ] Instructions are clear
  - [ ] All required files are available
  - [ ] Environment setup is documented

---

## ✅ Section 11: Next Steps (Action Items)

### Immediate

- [ ] **Continue to Phase 1, Task 1.4**
  - Metamask Wallet Integration
  - User authentication system

- [ ] **Test with real data**
  - [ ] Create test user account
  - [ ] Enroll in a course
  - [ ] Complete a lesson
  - [ ] Verify progress tracking works

### Soon

- [ ] **Complete remaining lesson content**
  - Currently: 28+ lessons
  - Goal: 100+ lessons across all 44 courses
  - Add lesson content migrations as needed

- [ ] **Configure Row Level Security**
  - Define RLS policies for production
  - Test policies thoroughly
  - Document policy rules

- [ ] **Set up monitoring**
  - Query performance monitoring
  - Error rate tracking
  - User activity logging

---

## 📊 Verification Script

Run the comprehensive verification:

```bash
# In Supabase SQL Editor, run:
scripts/verify-migration.sql
```

**Expected Output:**
- All checks show ✅ PASS
- No ❌ FAIL status
- Warnings (⚠️) should be investigated

**If you see failures:**
1. Read error messages carefully
2. Check Migration-Troubleshooting.md
3. Fix issues and re-verify
4. Do not proceed until all critical checks pass

---

## ✅ Final Verification

### Quick Visual Check

Go to Supabase Dashboard → Table Editor:

```
Left Sidebar Should Show:
  ✓ achievements
  ✓ course_prerequisites
  ✓ courses
  ✓ discussion_votes
  ✓ discussions
  ✓ faucet_requests
  ✓ leaderboard_cache
  ✓ lesson_completions
  ✓ lessons
  ✓ nft_certificates
  ✓ platform_settings
  ✓ replies
  ✓ transactions
  ✓ user_achievements
  ✓ user_progress
  ✓ user_streaks
  ✓ users
```

### Sample Query Test

Run this comprehensive test query:

```sql
SELECT
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM courses) as courses_count,
  (SELECT COUNT(*) FROM lessons) as lessons_count,
  (SELECT COUNT(*) FROM achievements) as achievements_count,
  (SELECT COUNT(*) FROM platform_settings) as settings_count,
  (SELECT COUNT(*) FROM course_prerequisites) as prerequisites_count,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as indexes_count,
  (SELECT COUNT(*) FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public') as functions_count;
```

**Expected Results:**
- users_count: 0 (empty - will be populated during usage)
- courses_count: 44
- lessons_count: 28+
- achievements_count: 25+
- settings_count: 9
- prerequisites_count: 15+
- indexes_count: 45+
- functions_count: 7+

---

## 🎉 Completion Certificate

Once all required sections (✅ Section 1-4) are checked off:

```
╔════════════════════════════════════════════════╗
║                                                ║
║   WEB3VERSITY DATABASE MIGRATION               ║
║            SUCCESSFULLY COMPLETED               ║
║                                                ║
║   All tables, functions, and data verified     ║
║   Application integration tested               ║
║   Ready for Phase 1, Task 1.4                  ║
║                                                ║
║   Date: _______________                        ║
║   Verified by: _______________                 ║
║                                                ║
╚════════════════════════════════════════════════╝
```

---

## 📝 Checklist Summary

**Total Checks:** 50+
**Completed:** _____ / 50+

**Critical (Must Complete):**
- Section 1: Database Structure
- Section 2: Functions & Triggers
- Section 3: Data Population
- Section 4: Application Integration

**Important (Should Complete):**
- Section 5: Performance
- Section 6: Data Integrity
- Section 7: Security

**Recommended (Nice to Have):**
- Section 8: Logging
- Section 9: Backup
- Section 10: Documentation

**Action Items:**
- Section 11: Next Steps

---

**Post-Migration Checklist Version:** 1.0.0
**Last Updated:** October 19, 2025
**Project:** Web3Versity - Hedera Africa Hackathon 2025
