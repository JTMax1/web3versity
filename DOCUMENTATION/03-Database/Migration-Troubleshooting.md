# Database Migration Troubleshooting Guide

**Common Issues and Solutions for Web3Versity Database Migration**

---

## 📋 Quick Diagnostic Checklist

Before diving into specific issues, run through this checklist:

- [ ] Are you signed into the correct Supabase project?
- [ ] Do you have admin/owner permissions?
- [ ] Is your internet connection stable?
- [ ] Did you copy the ENTIRE migration SQL file (all 1,235 lines)?
- [ ] Are you using the correct SQL Editor (not the Table Editor)?
- [ ] Did you wait for the query to complete (30-90 seconds)?

---

## 🔴 ERROR: Permission Denied

### Symptoms
```
ERROR: permission denied for table users
ERROR: must be owner of table courses
ERROR: permission denied to create extension
```

### Cause
Your Supabase account doesn't have sufficient privileges.

### Solutions

**Solution 1: Verify Project Access**
1. Go to Supabase Dashboard
2. Click on your project
3. Go to **Settings → Team**
4. Verify your role is "Owner" or has admin privileges

**Solution 2: Use Service Role Key (Advanced)**
If you need programmatic access:
1. Go to **Settings → API**
2. Copy the `service_role` key (NOT the `anon` key)
3. Use this for admin operations
4. ⚠️ Never expose this key in client-side code!

**Solution 3: Contact Project Owner**
If you're not the owner, ask them to:
- Grant you owner/admin permissions
- Run the migration themselves

---

## 🔴 ERROR: Table Already Exists

### Symptoms
```
ERROR: relation "users" already exists
ERROR: table "courses" already exists
ERROR: constraint "users_pkey" for relation "users" already exists
```

### Cause
The migration was run previously, or tables exist from manual creation.

### Solutions

**Solution 1: Run Rollback Script (Recommended)**
```sql
-- In SQL Editor, execute:
\i scripts/rollback-migration.sql
```
Or manually copy-paste the contents of `scripts/rollback-migration.sql`

Then run the migration again.

**Solution 2: Drop Tables Manually**
```sql
-- Drop all Web3Versity tables
DROP TABLE IF EXISTS nft_certificates CASCADE;
DROP TABLE IF EXISTS discussion_votes CASCADE;
DROP TABLE IF EXISTS replies CASCADE;
DROP TABLE IF EXISTS discussions CASCADE;
DROP TABLE IF EXISTS leaderboard_cache CASCADE;
DROP TABLE IF EXISTS user_streaks CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS lesson_completions CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS faucet_requests CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS course_prerequisites CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS platform_settings CASCADE;
```

**Solution 3: Nuclear Option (Use with Caution!)**
This drops EVERYTHING in the public schema:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```
⚠️ WARNING: This deletes ALL tables, not just Web3Versity ones!

---

## 🔴 ERROR: Foreign Key Violation

### Symptoms
```
ERROR: insert or update on table "lessons" violates foreign key constraint
ERROR: foreign key constraint "lessons_course_id_fkey"
ERROR: Key (course_id)=(course_001) is not present in table "courses"
```

### Cause
Data is being inserted before the referenced table exists, or previous partial migration left inconsistent state.

### Solutions

**Solution 1: Clean Slate**
1. Run rollback script completely
2. Verify all tables are gone:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public';
   ```
3. Run migration again from start

**Solution 2: Check Migration Order**
Ensure you're running the ENTIRE migration file, not sections.
The migration must run in order:
1. Tables (in dependency order)
2. Indexes
3. Triggers
4. Functions
5. Data inserts

**Solution 3: Disable Constraints Temporarily (Not Recommended)**
Only as last resort:
```sql
-- Disable triggers
SET session_replication_role = 'replica';

-- Run your inserts

-- Re-enable triggers
SET session_replication_role = 'origin';
```

---

## 🔴 ERROR: Query Timeout / Connection Lost

### Symptoms
```
ERROR: canceling statement due to statement timeout
ERROR: connection to server was lost
ERROR: server closed the connection unexpectedly
```

### Cause
Network issues, or migration taking too long on slow connections.

### Solutions

**Solution 1: Increase Statement Timeout**
Before running migration:
```sql
SET statement_timeout = '10min';
```
Then run the migration SQL.

**Solution 2: Run in Sections**
Break the migration into smaller parts:

**Section 1: Structure (Tables, Indexes, Triggers, Functions)**
- Lines 1-878 of migration SQL

**Section 2: Data (Settings, Achievements, Courses, Lessons)**
- Lines 880-1149 of migration SQL

**Section 3: Views**
- Lines 1154-1201 of migration SQL

Run each section separately, waiting for each to complete.

**Solution 3: Use Local Connection**
If on unstable network:
1. Download Supabase CLI
2. Connect to local Postgres
3. Run migration locally
4. Export and import to Supabase

---

## 🔴 ERROR: Syntax Error

### Symptoms
```
ERROR: syntax error at or near "CREATE"
ERROR: unterminated quoted string
ERROR: invalid input syntax for type integer
```

### Cause
Incomplete copy-paste, or text encoding issues.

### Solutions

**Solution 1: Re-copy Migration File**
1. Open `Database-Migrations.sql` in a plain text editor (NOT Word!)
2. Select ALL (Ctrl+A / Cmd+A)
3. Copy (Ctrl+C / Cmd+C)
4. Paste in a clean SQL Editor window
5. Verify first line starts with: `-- ============================================================================`
6. Verify last line is: `-- End of migration`

**Solution 2: Check Line Endings**
If editing on Windows but deploying on Linux:
- Use VS Code or Notepad++ to convert line endings to Unix (LF)
- Or use: `dos2unix Database-Migrations.sql`

**Solution 3: Remove Smart Quotes**
If copied from PDF or formatted document:
- Replace all `''` (curly quotes) with `''` (straight quotes)
- Replace all `""` (curly) with `""` (straight)

---

## 🔴 ERROR: Out of Memory

### Symptoms
```
ERROR: out of memory
ERROR: could not resize shared memory segment
```

### Cause
Rare on Supabase, but can occur with large data inserts.

### Solutions

**Solution 1: Run Data Inserts Separately**
Split the course and lesson inserts:
1. Run structure first (tables, indexes, functions)
2. Insert platform settings and achievements
3. Insert courses in batches of 10
4. Insert lessons in batches of 20

**Solution 2: Upgrade Supabase Plan**
Free tier has memory limits:
- Consider upgrading to Pro plan for migrations
- Downgrade after migration complete if needed

---

## 🔴 ERROR: Extension Not Available

### Symptoms
```
ERROR: extension "uuid-ossp" is not available
ERROR: extension "pg_trgm" not found
```

### Cause
Extension not enabled in your Postgres instance.

### Solutions

**Solution 1: Enable in Supabase Dashboard**
1. Go to **Database → Extensions**
2. Search for "uuid-ossp"
3. Click "Enable"
4. Search for "pg_trgm"
5. Click "Enable"
6. Re-run migration

**Solution 2: Enable via SQL**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

**Solution 3: Contact Supabase Support**
If extensions can't be enabled, this may be a Supabase configuration issue.

---

## 🔴 ERROR: Function Already Exists

### Symptoms
```
ERROR: function calculate_user_level already exists
ERROR: function update_course_progress() already exists
```

### Cause
Previous partial migration created functions.

### Solutions

**Solution 1: Use CREATE OR REPLACE**
The migration already uses `CREATE OR REPLACE FUNCTION`, so this shouldn't occur.

**Solution 2: Drop Functions Manually**
```sql
DROP FUNCTION IF EXISTS refresh_leaderboard() CASCADE;
DROP FUNCTION IF EXISTS update_streak(UUID) CASCADE;
DROP FUNCTION IF EXISTS check_achievements(UUID) CASCADE;
DROP FUNCTION IF EXISTS award_xp(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_course_progress() CASCADE;
DROP FUNCTION IF EXISTS calculate_user_level(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

---

## 🔴 ERROR: Trigger Does Not Exist

### Symptoms
```
ERROR: trigger "update_users_updated_at" for table "users" does not exist
```

### Cause
Trying to drop trigger that wasn't created yet, or rollback on clean database.

### Solutions

**Solution 1: Use IF EXISTS**
The migration uses `DROP TRIGGER IF EXISTS`, so this is safe to ignore.

**Solution 2: Ignore and Continue**
If this error occurs during migration, it's not critical - the trigger will be created fresh.

---

## 🔴 ERROR: Unique Constraint Violation

### Symptoms
```
ERROR: duplicate key value violates unique constraint "courses_pkey"
ERROR: Key (id)=(course_001) already exists
```

### Cause
Data was inserted previously and remains in tables.

### Solutions

**Solution 1: Clear Existing Data**
```sql
-- Delete all data but keep tables
TRUNCATE TABLE nft_certificates CASCADE;
TRUNCATE TABLE discussion_votes CASCADE;
TRUNCATE TABLE replies CASCADE;
TRUNCATE TABLE discussions CASCADE;
TRUNCATE TABLE leaderboard_cache CASCADE;
TRUNCATE TABLE user_streaks CASCADE;
TRUNCATE TABLE user_achievements CASCADE;
TRUNCATE TABLE lesson_completions CASCADE;
TRUNCATE TABLE user_progress CASCADE;
TRUNCATE TABLE faucet_requests CASCADE;
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE lessons CASCADE;
TRUNCATE TABLE course_prerequisites CASCADE;
TRUNCATE TABLE achievements CASCADE;
TRUNCATE TABLE courses CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE platform_settings CASCADE;
```

**Solution 2: Run Full Rollback**
Use `scripts/rollback-migration.sql` to drop and recreate everything.

---

## 🔴 ERROR: Invalid Transaction State

### Symptoms
```
ERROR: current transaction is aborted
ERROR: commands ignored until end of transaction block
```

### Cause
A previous error in the transaction block caused subsequent commands to be ignored.

### Solutions

**Solution 1: Rollback and Restart**
```sql
ROLLBACK;
```
Then run the migration again from the beginning.

**Solution 2: Run in Autocommit Mode**
Supabase SQL Editor should be in autocommit mode by default.
If you're using psql or another client:
```sql
\set AUTOCOMMIT on
```

---

## 🔴 ERROR: ROW Level Security (RLS) Issues

### Symptoms
```
ERROR: new row violates row-level security policy
ERROR: permission denied for table users
```

### Cause
RLS policies are enabled and blocking inserts.

### Solutions

**Solution 1: Disable RLS Temporarily**
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
-- Disable for all tables

-- Run migration

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
-- Re-enable for all tables
```

**Solution 2: Use Service Role**
Service role bypasses RLS policies. Ensure you're using service_role key if running programmatically.

---

## 🔴 Verification Script Shows Failures

### Symptoms
After running migration, verification script shows ❌ FAIL or ⚠️ PARTIAL.

### Solutions

**Solution 1: Check Specific Failures**
The verification script shows which component failed.

Common issues:
- **Table Count Wrong**: Some tables didn't create → Check for errors in table creation section
- **Data Count Wrong**: INSERT statements failed → Run data sections again
- **Index Count Low**: Indexes didn't create → Run index section again
- **Function Count Wrong**: Functions didn't create → Run function section again

**Solution 2: Re-run Missing Sections**
Identify which section failed and run it separately:
```sql
-- Example: Re-run just the achievements insert
INSERT INTO achievements (...) VALUES (...) ON CONFLICT DO NOTHING;
```

**Solution 3: Full Re-migration**
If multiple components are missing:
1. Run `scripts/rollback-migration.sql`
2. Run full migration again
3. Run verification script

---

## 🟡 PARTIAL SUCCESS: Some Data Missing

### Symptoms
Verification shows correct table/function/trigger counts, but data counts are low (e.g., only 20 courses instead of 44).

### Solutions

**Solution 1: Check for Insert Errors**
Look for errors in migration output related to INSERT statements.

**Solution 2: Re-run Data Sections**
The INSERT statements use `ON CONFLICT DO NOTHING`, so it's safe to re-run:
```sql
-- Re-run course inserts (lines 940-987)
-- Re-run achievement inserts (lines 899-934)
-- Re-run lesson inserts (lines 1026-1149)
```

**Solution 3: Check Constraints**
Ensure data meets table constraints:
```sql
-- Check courses for constraint violations
SELECT * FROM courses WHERE track NOT IN ('explorer', 'developer');
SELECT * FROM courses WHERE difficulty NOT IN ('beginner', 'intermediate', 'advanced');
```

---

## 🟢 Slow Performance After Migration

### Symptoms
Queries are slow, application feels sluggish, even with correct data.

### Solutions

**Solution 1: Run ANALYZE**
Update table statistics for query planner:
```sql
ANALYZE;
```

This should take 5-30 seconds and dramatically improve query performance.

**Solution 2: Verify Indexes**
```sql
-- Check indexes exist
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

Should show 45+ indexes.

**Solution 3: Check Index Usage**
```sql
-- See if indexes are being used
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
```

If idx_scan is 0 for important indexes, indexes may not be created correctly.

---

## 🛠️ Diagnostic Queries

### Check What Exists
```sql
-- List all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- List all functions
SELECT proname FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY proname;

-- List all triggers
SELECT DISTINCT tgname FROM pg_trigger
WHERE NOT tgisinternal
ORDER BY tgname;

-- List all indexes
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY indexname;

-- List all views
SELECT viewname FROM pg_views
WHERE schemaname = 'public'
ORDER BY viewname;
```

### Check Data Counts
```sql
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL SELECT 'courses', COUNT(*) FROM courses
UNION ALL SELECT 'lessons', COUNT(*) FROM lessons
UNION ALL SELECT 'achievements', COUNT(*) FROM achievements
UNION ALL SELECT 'platform_settings', COUNT(*) FROM platform_settings;
```

### Check Table Sizes
```sql
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 📞 Getting Additional Help

### Before Asking for Help

Gather this information:

1. **Exact Error Message**
   - Copy the complete error text
   - Include error codes if present

2. **Migration Section**
   - Which section was running when error occurred?
   - Line number if available

3. **Verification Results**
   - Run `scripts/verify-migration.sql`
   - Copy the output

4. **Environment Info**
   - Supabase plan (Free/Pro)
   - PostgreSQL version (usually 15 on Supabase)
   - Browser and OS

### Support Channels

1. **Check Existing Documentation**
   - This guide
   - MIGRATION-GUIDE.md
   - README.md

2. **Supabase Support**
   - Dashboard → Support
   - https://supabase.com/support
   - Discord: https://discord.supabase.com

3. **PostgreSQL Documentation**
   - https://www.postgresql.org/docs/
   - Error code reference: https://www.postgresql.org/docs/current/errcodes-appendix.html

4. **Project Repository**
   - GitHub Issues (if applicable)
   - Team Discord/Slack

---

## 🎯 Prevention Tips

### For Future Migrations

1. **Test on Dev First**
   - Create a separate Supabase project for testing
   - Run migrations there before production
   - Verify everything works

2. **Backup Before Migrating**
   - Supabase dashboard → Database → Backups
   - Export existing data if any
   - Save a copy of current schema

3. **Use Version Control**
   - Keep migration SQL in git
   - Tag successful migrations
   - Document changes

4. **Run Verification**
   - Always run `scripts/verify-migration.sql` after migration
   - Check all ✅ PASS before proceeding
   - Address ⚠️ PARTIAL warnings

5. **Monitor Logs**
   - Check Supabase logs after migration
   - Look for warnings or slow queries
   - Run ANALYZE after major data inserts

---

## ✅ Successful Migration Checklist

After resolving issues, verify:

- [ ] All 17 tables exist
- [ ] 44 courses in courses table
- [ ] 25+ achievements in achievements table
- [ ] 28+ lessons in lessons table
- [ ] 9 platform settings
- [ ] 45+ indexes created
- [ ] 7 functions exist and work
- [ ] 8 triggers active
- [ ] 2 views created
- [ ] Verification script shows all ✅ PASS
- [ ] Application connects successfully
- [ ] Sample queries return data
- [ ] No errors in Supabase logs

---

## 📝 Migration Log Template

Keep a log of your migration attempts:

```
Date: 2025-10-19
Attempt: 1
Status: Failed
Error: Table already exists
Solution: Ran rollback script
Result: Success on retry

Date: 2025-10-19
Attempt: 2
Status: Success
Verification: All checks passed
Duration: 45 seconds
Notes: Ran ANALYZE after completion
```

---

**Troubleshooting Guide Version:** 1.0.0
**Last Updated:** October 19, 2025
**Project:** Web3Versity - Hedera Africa Hackathon 2025
