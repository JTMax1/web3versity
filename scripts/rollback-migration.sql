-- ============================================================================
-- WEB3VERSITY DATABASE MIGRATION ROLLBACK SCRIPT
-- ============================================================================
-- Purpose: Safely remove all database objects created by the migration
-- Usage: Run this script in Supabase SQL Editor BEFORE re-running migration
-- WARNING: This will DELETE ALL DATA in Web3Versity tables!
-- ============================================================================

-- \echo '⚠️  WARNING: DATABASE ROLLBACK STARTING';
-- \echo '⚠️  This will delete ALL Web3Versity data!';
-- \echo '⚠️  Press Ctrl+C within 5 seconds to cancel...';
-- \echo '';

-- Add a safety delay (comment out if running non-interactively)
-- SELECT pg_sleep(5);

-- \echo 'Starting rollback...';
-- \echo '';

-- ============================================================================
-- SECTION 1: DROP VIEWS
-- ============================================================================

-- \echo 'Dropping views...';

DROP VIEW IF EXISTS v_user_dashboard CASCADE;
DROP VIEW IF EXISTS v_course_catalog CASCADE;

-- \echo '  ✓ Views dropped';
-- \echo '';

-- ============================================================================
-- SECTION 2: DROP TRIGGERS
-- ============================================================================

-- \echo 'Dropping triggers...';

-- Triggers must be dropped before their associated tables or functions
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;
DROP TRIGGER IF EXISTS update_discussions_updated_at ON discussions;
DROP TRIGGER IF EXISTS update_replies_updated_at ON replies;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
DROP TRIGGER IF EXISTS trigger_update_course_progress ON lesson_completions;

-- \echo '  ✓ All triggers dropped';
-- \echo '';

-- ============================================================================
-- SECTION 3: DROP TABLES (in reverse dependency order)
-- ============================================================================

-- \echo 'Dropping tables (reverse dependency order)...';

-- These tables depend on others, drop them first
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

-- \echo '  ✓ All tables dropped';
-- \echo '';

-- ============================================================================
-- SECTION 4: DROP FUNCTIONS
-- ============================================================================

-- \echo 'Dropping functions...';

-- Drop functions (with CASCADE to handle dependencies)
DROP FUNCTION IF EXISTS refresh_leaderboard() CASCADE;
DROP FUNCTION IF EXISTS update_streak(UUID) CASCADE;
DROP FUNCTION IF EXISTS check_achievements(UUID) CASCADE;
DROP FUNCTION IF EXISTS award_xp(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_course_progress() CASCADE;
DROP FUNCTION IF EXISTS calculate_user_level(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- \echo '  ✓ All functions dropped';
-- \echo '';

-- ============================================================================
-- SECTION 5: DROP EXTENSIONS (OPTIONAL)
-- ============================================================================

-- \echo 'Checking extensions...';

-- NOTE: We typically DON'T drop extensions as they might be used by other
-- applications or schemas. Uncomment the lines below ONLY if you're sure
-- you want to remove these extensions entirely from your database.

-- DROP EXTENSION IF EXISTS pg_trgm CASCADE;
-- DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- \echo '  ℹ️  Extensions left intact (used by other applications)';
-- \echo '  ℹ️  To remove extensions, uncomment lines in Section 5 of rollback script';
-- \echo '';

-- ============================================================================
-- SECTION 6: VERIFICATION
-- ============================================================================

-- \echo 'Verifying rollback completion...';
-- \echo '';

-- Check that all Web3Versity tables are gone
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✅ SUCCESS'
        ELSE '⚠️  WARNING'
    END as status,
    'Remaining Web3Versity Tables' as component,
    COUNT(*) as count,
    CASE
        WHEN COUNT(*) = 0 THEN 'All tables successfully removed'
        ELSE 'Found ' || COUNT(*)::text || ' remaining tables (see list below)'
    END as details
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
AND table_name IN (
    'users', 'courses', 'course_prerequisites', 'lessons',
    'user_progress', 'lesson_completions', 'achievements',
    'user_achievements', 'user_streaks', 'leaderboard_cache',
    'discussions', 'replies', 'discussion_votes', 'faucet_requests',
    'transactions', 'nft_certificates', 'platform_settings'
);

-- List any remaining Web3Versity tables (should be none)
SELECT
    '  ⚠️  ' || table_name as remaining_table
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
AND table_name IN (
    'users', 'courses', 'course_prerequisites', 'lessons',
    'user_progress', 'lesson_completions', 'achievements',
    'user_achievements', 'user_streaks', 'leaderboard_cache',
    'discussions', 'replies', 'discussion_votes', 'faucet_requests',
    'transactions', 'nft_certificates', 'platform_settings'
);

-- Check that all Web3Versity views are gone
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✅ SUCCESS'
        ELSE '⚠️  WARNING'
    END as status,
    'Remaining Views' as component,
    COUNT(*) as count,
    CASE
        WHEN COUNT(*) = 0 THEN 'All views successfully removed'
        ELSE 'Found ' || COUNT(*)::text || ' remaining views'
    END as details
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN ('v_user_dashboard', 'v_course_catalog');

-- Check that all Web3Versity functions are gone
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✅ SUCCESS'
        ELSE '⚠️  WARNING'
    END as status,
    'Remaining Functions' as component,
    COUNT(*) as count,
    CASE
        WHEN COUNT(*) = 0 THEN 'All functions successfully removed'
        ELSE 'Found ' || COUNT(*)::text || ' remaining functions'
    END as details
FROM pg_proc p
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

-- Check that all Web3Versity triggers are gone
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✅ SUCCESS'
        ELSE '⚠️  WARNING'
    END as status,
    'Remaining Triggers' as component,
    COUNT(*) as count,
    CASE
        WHEN COUNT(*) = 0 THEN 'All triggers successfully removed'
        ELSE 'Found ' || COUNT(*)::text || ' remaining triggers'
    END as details
FROM pg_trigger
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

-- ============================================================================
-- SECTION 7: COMPLETE NUCLEAR OPTION (COMMENTED OUT)
-- ============================================================================

-- DANGER ZONE: Use this ONLY if the above rollback didn't work completely
-- This will drop EVERYTHING in the public schema, including non-Web3Versity objects!

-- Uncomment the lines below ONLY if:
--   1. Normal rollback left orphaned objects
--   2. You want to completely reset the database
--   3. You're ABSOLUTELY SURE you want to delete EVERYTHING

/*
-- \echo '';
-- \echo '⚠️⚠️⚠️  NUCLEAR OPTION ACTIVATED  ⚠️⚠️⚠️';
-- \echo '⚠️  Dropping entire public schema...';

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Restore default permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
COMMENT ON SCHEMA public IS 'standard public schema';

-- \echo '  ✓ Public schema completely reset';
-- \echo '';
*/

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- \echo '';
-- \echo '==========================================';
-- \echo 'ROLLBACK COMPLETE';
-- \echo '==========================================';
-- \echo '';
-- \echo 'Database has been rolled back. You can now:';
-- \echo '  1. Re-run the migration (Database-Migrations.sql)';
-- \echo '  2. Verify with verification script (verify-migration.sql)';
-- \echo '';
-- \echo 'If you see any warnings above:';
-- \echo '  - Review remaining objects';
-- \echo '  - Drop them manually if needed';
-- \echo '  - Or use the NUCLEAR OPTION (commented out in Section 7)';
-- \echo '';
-- \echo '==========================================';
-- \echo '';

-- ============================================================================
-- ADDITIONAL CLEANUP QUERIES (RUN MANUALLY IF NEEDED)
-- ============================================================================

-- If you need to manually check for any remaining objects, uncomment and run:

/*
-- List all tables in public schema
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- List all views in public schema
SELECT viewname FROM pg_views WHERE schemaname = 'public';

-- List all functions in public schema
SELECT proname, pg_get_functiondef(oid)
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public';

-- List all triggers
SELECT tgname, relname
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE NOT tgisinternal;

-- List all indexes
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';
*/

-- ============================================================================
-- END OF ROLLBACK SCRIPT
-- ============================================================================
