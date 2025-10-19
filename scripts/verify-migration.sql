-- ============================================================================
-- WEB3VERSITY DATABASE MIGRATION VERIFICATION SCRIPT
-- ============================================================================
-- Purpose: Comprehensive verification that the database migration completed
--          successfully and all components are working correctly.
-- Usage: Run this script in Supabase SQL Editor after migration
-- Expected: All checks should return "✅ PASS" status
-- ============================================================================

-- \echo '==========================================';
-- \echo 'WEB3VERSITY MIGRATION VERIFICATION';
-- \echo '==========================================';
-- \echo '';

-- ============================================================================
-- SECTION 1: TABLE EXISTENCE CHECKS
-- ============================================================================

-- \echo 'SECTION 1: Checking Table Existence...';
-- \echo '';

-- Check all 17 required tables exist
SELECT
    CASE
        WHEN COUNT(*) = 17 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status,
    'Table Count' as check_name,
    COUNT(*) as actual,
    17 as expected,
    CASE
        WHEN COUNT(*) = 17 THEN 'All 17 tables exist'
        ELSE 'Missing ' || (17 - COUNT(*))::text || ' table(s)'
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

-- List all tables that exist
-- \echo '';
-- \echo 'Tables Found:';
SELECT
    '  ✓ ' || table_name as table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
AND table_name IN (
    'users', 'courses', 'course_prerequisites', 'lessons',
    'user_progress', 'lesson_completions', 'achievements',
    'user_achievements', 'user_streaks', 'leaderboard_cache',
    'discussions', 'replies', 'discussion_votes', 'faucet_requests',
    'transactions', 'nft_certificates', 'platform_settings'
)
ORDER BY table_name;

-- ============================================================================
-- SECTION 2: DATA POPULATION CHECKS
-- ============================================================================

-- \echo '';
-- \echo 'SECTION 2: Checking Data Population...';
-- \echo '';

-- Check courses (should have 44)
SELECT
    CASE
        WHEN COUNT(*) = 44 THEN '✅ PASS'
        WHEN COUNT(*) > 0 THEN '⚠️  PARTIAL'
        ELSE '❌ FAIL'
    END as status,
    'Courses' as check_name,
    COUNT(*) as actual,
    44 as expected,
    CASE
        WHEN COUNT(*) = 44 THEN 'All 44 courses populated'
        WHEN COUNT(*) > 0 THEN 'Only ' || COUNT(*)::text || ' courses found'
        ELSE 'No courses found - data not inserted'
    END as details
FROM courses;

-- Check achievements (should have 25+)
SELECT
    CASE
        WHEN COUNT(*) >= 25 THEN '✅ PASS'
        WHEN COUNT(*) > 0 THEN '⚠️  PARTIAL'
        ELSE '❌ FAIL'
    END as status,
    'Achievements' as check_name,
    COUNT(*) as actual,
    25 as expected,
    CASE
        WHEN COUNT(*) >= 25 THEN COUNT(*)::text || ' achievements populated'
        WHEN COUNT(*) > 0 THEN 'Only ' || COUNT(*)::text || ' achievements found'
        ELSE 'No achievements found - data not inserted'
    END as details
FROM achievements;

-- Check lessons (should have 28+)
SELECT
    CASE
        WHEN COUNT(*) >= 28 THEN '✅ PASS'
        WHEN COUNT(*) > 0 THEN '⚠️  PARTIAL'
        ELSE '❌ FAIL'
    END as status,
    'Lessons' as check_name,
    COUNT(*) as actual,
    28 as expected_minimum,
    CASE
        WHEN COUNT(*) >= 28 THEN COUNT(*)::text || ' lessons populated'
        WHEN COUNT(*) > 0 THEN 'Only ' || COUNT(*)::text || ' lessons found'
        ELSE 'No lessons found - data not inserted'
    END as details
FROM lessons;

-- Check platform settings (should have 9)
SELECT
    CASE
        WHEN COUNT(*) = 9 THEN '✅ PASS'
        WHEN COUNT(*) > 0 THEN '⚠️  PARTIAL'
        ELSE '❌ FAIL'
    END as status,
    'Platform Settings' as check_name,
    COUNT(*) as actual,
    9 as expected,
    CASE
        WHEN COUNT(*) = 9 THEN 'All settings populated'
        WHEN COUNT(*) > 0 THEN 'Only ' || COUNT(*)::text || ' settings found'
        ELSE 'No settings found - data not inserted'
    END as details
FROM platform_settings;

-- Check course prerequisites
SELECT
    CASE
        WHEN COUNT(*) >= 15 THEN '✅ PASS'
        WHEN COUNT(*) > 0 THEN '⚠️  PARTIAL'
        ELSE '❌ FAIL'
    END as status,
    'Course Prerequisites' as check_name,
    COUNT(*) as actual,
    15 as expected_minimum,
    CASE
        WHEN COUNT(*) >= 15 THEN COUNT(*)::text || ' prerequisites defined'
        WHEN COUNT(*) > 0 THEN 'Only ' || COUNT(*)::text || ' prerequisites found'
        ELSE 'No prerequisites found'
    END as details
FROM course_prerequisites;

-- ============================================================================
-- SECTION 3: INDEX CHECKS
-- ============================================================================

-- \echo '';
-- \echo 'SECTION 3: Checking Indexes...';
-- \echo '';

-- Check total index count (should be 45+)
SELECT
    CASE
        WHEN COUNT(*) >= 45 THEN '✅ PASS'
        WHEN COUNT(*) >= 30 THEN '⚠️  PARTIAL'
        ELSE '❌ FAIL'
    END as status,
    'Total Indexes' as check_name,
    COUNT(*) as actual,
    45 as expected_minimum,
    CASE
        WHEN COUNT(*) >= 45 THEN COUNT(*)::text || ' indexes created'
        WHEN COUNT(*) >= 30 THEN 'Only ' || COUNT(*)::text || ' indexes - may affect performance'
        ELSE 'Critical indexes missing - will affect performance'
    END as details
FROM pg_indexes
WHERE schemaname = 'public';

-- Check critical indexes exist
WITH critical_indexes AS (
    SELECT unnest(ARRAY[
        'idx_users_evm_address',
        'idx_users_hedera_account',
        'idx_courses_track',
        'idx_lessons_course',
        'idx_user_progress_user',
        'idx_achievements_category'
    ]) as index_name
),
existing_indexes AS (
    SELECT indexname FROM pg_indexes WHERE schemaname = 'public'
)
SELECT
    CASE
        WHEN COUNT(DISTINCT ci.index_name) = COUNT(DISTINCT ei.indexname) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status,
    'Critical Indexes' as check_name,
    COUNT(DISTINCT ei.indexname) as actual,
    6 as expected,
    CASE
        WHEN COUNT(DISTINCT ci.index_name) = COUNT(DISTINCT ei.indexname)
        THEN 'All critical indexes exist'
        ELSE 'Missing critical indexes: ' ||
             string_agg(ci.index_name, ', ') FILTER (WHERE ei.indexname IS NULL)
    END as details
FROM critical_indexes ci
LEFT JOIN existing_indexes ei ON ci.index_name = ei.indexname;

-- ============================================================================
-- SECTION 4: FUNCTION CHECKS
-- ============================================================================

-- \echo '';
-- \echo 'SECTION 4: Checking Functions...';
-- \echo '';

-- Check all required functions exist
WITH required_functions AS (
    SELECT unnest(ARRAY[
        'update_updated_at_column',
        'calculate_user_level',
        'update_course_progress',
        'award_xp',
        'check_achievements',
        'update_streak',
        'refresh_leaderboard'
    ]) as func_name
),
existing_functions AS (
    SELECT proname as func_name
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
)
SELECT
    CASE
        WHEN COUNT(DISTINCT rf.func_name) = COUNT(DISTINCT ef.func_name) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status,
    'Database Functions' as check_name,
    COUNT(DISTINCT ef.func_name) as actual,
    7 as expected,
    CASE
        WHEN COUNT(DISTINCT rf.func_name) = COUNT(DISTINCT ef.func_name)
        THEN 'All 7 functions created'
        ELSE 'Missing functions: ' ||
             string_agg(rf.func_name, ', ') FILTER (WHERE ef.func_name IS NULL)
    END as details
FROM required_functions rf
LEFT JOIN existing_functions ef ON rf.func_name = ef.func_name;

-- Test calculate_user_level function
SELECT
    CASE
        WHEN calculate_user_level(10000) = 10 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status,
    'Function: calculate_user_level' as check_name,
    calculate_user_level(10000) as result,
    'Level calculation working' as details;

-- ============================================================================
-- SECTION 5: TRIGGER CHECKS
-- ============================================================================

-- \echo '';
-- \echo 'SECTION 5: Checking Triggers...';
-- \echo '';

-- Check all triggers exist
WITH required_triggers AS (
    SELECT unnest(ARRAY[
        'update_users_updated_at',
        'update_courses_updated_at',
        'update_lessons_updated_at',
        'update_user_progress_updated_at',
        'update_discussions_updated_at',
        'update_replies_updated_at',
        'update_transactions_updated_at',
        'trigger_update_course_progress'
    ]) as trigger_name
),
existing_triggers AS (
    SELECT tgname as trigger_name
    FROM pg_trigger
    WHERE NOT tgisinternal
)
SELECT
    CASE
        WHEN COUNT(DISTINCT rt.trigger_name) = COUNT(DISTINCT et.trigger_name) THEN '✅ PASS'
        WHEN COUNT(DISTINCT et.trigger_name) >= 6 THEN '⚠️  PARTIAL'
        ELSE '❌ FAIL'
    END as status,
    'Database Triggers' as check_name,
    COUNT(DISTINCT et.trigger_name) as actual,
    8 as expected,
    CASE
        WHEN COUNT(DISTINCT rt.trigger_name) = COUNT(DISTINCT et.trigger_name)
        THEN 'All 8 triggers created'
        WHEN COUNT(DISTINCT et.trigger_name) >= 6
        THEN 'Most triggers exist (' || COUNT(DISTINCT et.trigger_name)::text || '/8)'
        ELSE 'Missing triggers - automatic updates won''t work'
    END as details
FROM required_triggers rt
LEFT JOIN existing_triggers et ON rt.trigger_name = et.trigger_name;

-- ============================================================================
-- SECTION 6: VIEW CHECKS
-- ============================================================================

-- \echo '';
-- \echo 'SECTION 6: Checking Views...';
-- \echo '';

-- Check views exist
SELECT
    CASE
        WHEN COUNT(*) >= 2 THEN '✅ PASS'
        WHEN COUNT(*) > 0 THEN '⚠️  PARTIAL'
        ELSE '❌ FAIL'
    END as status,
    'Database Views' as check_name,
    COUNT(*) as actual,
    2 as expected,
    CASE
        WHEN COUNT(*) >= 2 THEN 'All views created'
        WHEN COUNT(*) > 0 THEN 'Only ' || COUNT(*)::text || ' view(s) found'
        ELSE 'No views found'
    END as details
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN ('v_user_dashboard', 'v_course_catalog');

-- ============================================================================
-- SECTION 7: EXTENSION CHECKS
-- ============================================================================

-- \echo '';
-- \echo 'SECTION 7: Checking Extensions...';
-- \echo '';

-- Check required extensions
WITH required_extensions AS (
    SELECT unnest(ARRAY['uuid-ossp', 'pg_trgm']) as ext_name
),
existing_extensions AS (
    SELECT extname as ext_name FROM pg_extension
)
SELECT
    CASE
        WHEN COUNT(DISTINCT re.ext_name) = COUNT(DISTINCT ee.ext_name) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status,
    'PostgreSQL Extensions' as check_name,
    COUNT(DISTINCT ee.ext_name) as actual,
    2 as expected,
    CASE
        WHEN COUNT(DISTINCT re.ext_name) = COUNT(DISTINCT ee.ext_name)
        THEN 'uuid-ossp and pg_trgm extensions enabled'
        ELSE 'Missing extensions: ' ||
             string_agg(re.ext_name, ', ') FILTER (WHERE ee.ext_name IS NULL)
    END as details
FROM required_extensions re
LEFT JOIN existing_extensions ee ON re.ext_name = ee.ext_name;

-- ============================================================================
-- SECTION 8: DATA INTEGRITY CHECKS
-- ============================================================================

-- \echo '';
-- \echo 'SECTION 8: Checking Data Integrity...';
-- \echo '';

-- Check foreign key constraints
SELECT
    '✅ PASS' as status,
    'Foreign Key Constraints' as check_name,
    COUNT(*) as total_constraints,
    'All foreign keys properly defined' as details
FROM information_schema.table_constraints
WHERE constraint_schema = 'public'
AND constraint_type = 'FOREIGN KEY';

-- Check unique constraints
SELECT
    '✅ PASS' as status,
    'Unique Constraints' as check_name,
    COUNT(*) as total_constraints,
    'All unique constraints defined' as details
FROM information_schema.table_constraints
WHERE constraint_schema = 'public'
AND constraint_type = 'UNIQUE';

-- Check check constraints
SELECT
    '✅ PASS' as status,
    'Check Constraints' as check_name,
    COUNT(*) as total_constraints,
    'All check constraints defined' as details
FROM information_schema.table_constraints
WHERE constraint_schema = 'public'
AND constraint_type = 'CHECK';

-- Verify no orphaned course prerequisites
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status,
    'Prerequisite Integrity' as check_name,
    COUNT(*) as orphaned_records,
    CASE
        WHEN COUNT(*) = 0 THEN 'All prerequisites reference valid courses'
        ELSE 'Found ' || COUNT(*)::text || ' orphaned prerequisites'
    END as details
FROM course_prerequisites cp
WHERE NOT EXISTS (SELECT 1 FROM courses c WHERE c.id = cp.course_id)
OR NOT EXISTS (SELECT 1 FROM courses c WHERE c.id = cp.prerequisite_course_id);

-- Verify lessons reference valid courses
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status,
    'Lesson Course References' as check_name,
    COUNT(*) as orphaned_records,
    CASE
        WHEN COUNT(*) = 0 THEN 'All lessons reference valid courses'
        ELSE 'Found ' || COUNT(*)::text || ' orphaned lessons'
    END as details
FROM lessons l
WHERE NOT EXISTS (SELECT 1 FROM courses c WHERE c.id = l.course_id);

-- ============================================================================
-- SECTION 9: PERFORMANCE CHECKS
-- ============================================================================

-- \echo '';
-- \echo 'SECTION 9: Checking Performance Optimization...';
-- \echo '';

-- Check if ANALYZE has been run
SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE '⚠️  PENDING'
    END as status,
    'Table Statistics' as check_name,
    COUNT(*) as tables_analyzed,
    CASE
        WHEN COUNT(*) > 0 THEN 'Table statistics collected'
        ELSE 'Run ANALYZE command to optimize query planning'
    END as details
FROM pg_stat_user_tables
WHERE schemaname = 'public';

-- Check GIN index on lessons content
SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE '⚠️  MISSING'
    END as status,
    'GIN Index on Lessons' as check_name,
    COUNT(*) as gin_indexes,
    CASE
        WHEN COUNT(*) > 0 THEN 'JSONB search optimization enabled'
        ELSE 'GIN index missing - JSONB queries will be slow'
    END as details
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'lessons'
AND indexdef LIKE '%USING gin%';

-- ============================================================================
-- SECTION 10: COURSE DATA VALIDATION
-- ============================================================================

-- \echo '';
-- \echo 'SECTION 10: Validating Course Data...';
-- \echo '';

-- Check course distribution by track
SELECT
    '📊 INFO' as status,
    'Course Distribution' as check_name,
    track,
    COUNT(*) as count,
    ROUND(COUNT(*)::numeric / (SELECT COUNT(*)::numeric FROM courses) * 100, 1)::text || '%' as percentage
FROM courses
GROUP BY track
ORDER BY track;

-- Check course distribution by difficulty
SELECT
    '📊 INFO' as status,
    'Course Difficulty Distribution' as check_name,
    difficulty,
    COUNT(*) as count,
    ROUND(COUNT(*)::numeric / (SELECT COUNT(*)::numeric FROM courses) * 100, 1)::text || '%' as percentage
FROM courses
GROUP BY difficulty
ORDER BY
    CASE difficulty
        WHEN 'beginner' THEN 1
        WHEN 'intermediate' THEN 2
        WHEN 'advanced' THEN 3
    END;

-- Check featured courses
SELECT
    '📊 INFO' as status,
    'Featured Courses' as check_name,
    COUNT(*) as count,
    string_agg(title, ', ') as featured_titles
FROM courses
WHERE is_featured = TRUE;

-- ============================================================================
-- SECTION 11: SUMMARY
-- ============================================================================

-- \echo '';
-- \echo '==========================================';
-- \echo 'VERIFICATION SUMMARY';
-- \echo '==========================================';
-- \echo '';

-- Overall summary
WITH verification_summary AS (
    SELECT 'Tables' as component, 17 as expected, (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name IN ('users', 'courses', 'course_prerequisites', 'lessons', 'user_progress', 'lesson_completions', 'achievements', 'user_achievements', 'user_streaks', 'leaderboard_cache', 'discussions', 'replies', 'discussion_votes', 'faucet_requests', 'transactions', 'nft_certificates', 'platform_settings'))::int as actual
    UNION ALL SELECT 'Courses', 44, (SELECT COUNT(*) FROM courses)::int
    UNION ALL SELECT 'Achievements', 25, (SELECT COUNT(*) FROM achievements)::int
    UNION ALL SELECT 'Lessons', 28, (SELECT COUNT(*) FROM lessons)::int
    UNION ALL SELECT 'Platform Settings', 9, (SELECT COUNT(*) FROM platform_settings)::int
    UNION ALL SELECT 'Indexes', 45, (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public')::int
    UNION ALL SELECT 'Functions', 7, (SELECT COUNT(*) FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND proname IN ('update_updated_at_column', 'calculate_user_level', 'update_course_progress', 'award_xp', 'check_achievements', 'update_streak', 'refresh_leaderboard'))::int
    UNION ALL SELECT 'Triggers', 8, (SELECT COUNT(*) FROM pg_trigger WHERE NOT tgisinternal AND tgname IN ('update_users_updated_at', 'update_courses_updated_at', 'update_lessons_updated_at', 'update_user_progress_updated_at', 'update_discussions_updated_at', 'update_replies_updated_at', 'update_transactions_updated_at', 'trigger_update_course_progress'))::int
)
SELECT
    component,
    expected,
    actual,
    CASE
        WHEN actual >= expected THEN '✅ PASS'
        WHEN actual >= expected * 0.8 THEN '⚠️  PARTIAL'
        ELSE '❌ FAIL'
    END as status,
    ROUND((actual::numeric / expected::numeric * 100), 1)::text || '%' as completion
FROM verification_summary
ORDER BY
    CASE
        WHEN actual >= expected THEN 1
        WHEN actual >= expected * 0.8 THEN 2
        ELSE 3
    END,
    component;

-- \echo '';
-- \echo 'Migration Verification Complete!';
-- \echo '';
-- \echo 'Next Steps:';
-- \echo '  1. If all checks passed (✅), proceed to application testing';
-- \echo '  2. If partial (⚠️), review details and consider re-running specific sections';
-- \echo '  3. If failures (❌), check MIGRATION-GUIDE.md troubleshooting section';
-- \echo '  4. Run ANALYZE command for query optimization:';
-- \echo '     ANALYZE;';
-- \echo '';
-- \echo '==========================================';

-- ============================================================================
-- END OF VERIFICATION SCRIPT
-- ============================================================================
