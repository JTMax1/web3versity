-- ============================================================================
-- Migration: Leaderboard Enhancement with Functions
-- ============================================================================
-- Purpose: Add database functions for efficient leaderboard calculations and enhance cache
-- Task: Phase 3, Task 3 - Real Leaderboard with Live Rankings
-- Created: 2025-10-21
-- Updated: 2025-10-21 (Schema reconciliation - fixed table names)
-- ============================================================================

-- Add new columns to existing leaderboard_cache table for better querying
ALTER TABLE leaderboard_cache
  -- Add total_xp as alias/duplicate of all_time_xp for API compatibility
  ADD COLUMN IF NOT EXISTS total_xp INTEGER,
  -- Add detailed stats for all-time leaderboard
  ADD COLUMN IF NOT EXISTS lessons_completed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS courses_completed INTEGER DEFAULT 0;

-- Create index on total_xp for sorting performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_total_xp ON leaderboard_cache(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_all_time_rank ON leaderboard_cache(all_time_rank);

-- Function: Sync total_xp with all_time_xp (one-time data fix)
-- This ensures both columns stay in sync during the migration
DO $$
BEGIN
  -- Copy all_time_xp to total_xp if total_xp is NULL or 0
  UPDATE leaderboard_cache
  SET total_xp = all_time_xp
  WHERE total_xp IS NULL OR total_xp = 0;
END $$;

-- Function: Get Weekly Leaderboard
-- Calculates user rankings based on XP earned in the last 7 days
CREATE OR REPLACE FUNCTION get_weekly_leaderboard(entry_limit INTEGER DEFAULT 100)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  avatar_emoji TEXT,
  level INTEGER,
  current_streak INTEGER,
  last_active_at TIMESTAMPTZ,
  period_xp INTEGER,
  period_lessons INTEGER,
  period_courses INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH weekly_stats AS (
    SELECT
      lc.user_id,
      SUM(lc.xp_earned) AS xp_earned,
      COUNT(DISTINCT lc.lesson_id) AS lessons_completed,
      COUNT(DISTINCT CASE WHEN up.completed_at >= NOW() - INTERVAL '7 days' THEN up.course_id END) AS courses_completed
    FROM lesson_completions lc
    LEFT JOIN user_progress up ON up.user_id = lc.user_id AND up.course_id = lc.course_id
    WHERE lc.completed_at >= NOW() - INTERVAL '7 days'
    GROUP BY lc.user_id
  )
  SELECT
    u.id AS user_id,
    u.username,
    u.avatar_emoji,
    u.current_level AS level,
    u.current_streak,
    u.last_login_at AS last_active_at,
    COALESCE(ws.xp_earned, 0)::INTEGER AS period_xp,
    COALESCE(ws.lessons_completed, 0)::INTEGER AS period_lessons,
    COALESCE(ws.courses_completed, 0)::INTEGER AS period_courses
  FROM users u
  LEFT JOIN weekly_stats ws ON ws.user_id = u.id
  WHERE ws.xp_earned > 0
  ORDER BY period_xp DESC, u.created_at ASC
  LIMIT entry_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get Monthly Leaderboard
-- Calculates user rankings based on XP earned in the last 30 days
CREATE OR REPLACE FUNCTION get_monthly_leaderboard(entry_limit INTEGER DEFAULT 100)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  avatar_emoji TEXT,
  level INTEGER,
  current_streak INTEGER,
  last_active_at TIMESTAMPTZ,
  period_xp INTEGER,
  period_lessons INTEGER,
  period_courses INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH monthly_stats AS (
    SELECT
      lc.user_id,
      SUM(lc.xp_earned) AS xp_earned,
      COUNT(DISTINCT lc.lesson_id) AS lessons_completed,
      COUNT(DISTINCT CASE WHEN up.completed_at >= NOW() - INTERVAL '30 days' THEN up.course_id END) AS courses_completed
    FROM lesson_completions lc
    LEFT JOIN user_progress up ON up.user_id = lc.user_id AND up.course_id = lc.course_id
    WHERE lc.completed_at >= NOW() - INTERVAL '30 days'
    GROUP BY lc.user_id
  )
  SELECT
    u.id AS user_id,
    u.username,
    u.avatar_emoji,
    u.current_level AS level,
    u.current_streak,
    u.last_login_at AS last_active_at,
    COALESCE(ms.xp_earned, 0)::INTEGER AS period_xp,
    COALESCE(ms.lessons_completed, 0)::INTEGER AS period_lessons,
    COALESCE(ms.courses_completed, 0)::INTEGER AS period_courses
  FROM users u
  LEFT JOIN monthly_stats ms ON ms.user_id = u.id
  WHERE ms.xp_earned > 0
  ORDER BY period_xp DESC, u.created_at ASC
  LIMIT entry_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get User's Weekly Rank
-- Gets a specific user's rank for the week
CREATE OR REPLACE FUNCTION get_user_weekly_rank(p_user_id UUID)
RETURNS TABLE (
  rank BIGINT,
  period_xp INTEGER,
  total_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH weekly_stats AS (
    SELECT
      lc.user_id,
      SUM(lc.xp_earned) AS xp_earned
    FROM lesson_completions lc
    WHERE lc.completed_at >= NOW() - INTERVAL '7 days'
    GROUP BY lc.user_id
  ),
  ranked_users AS (
    SELECT
      ws.user_id,
      ws.xp_earned,
      ROW_NUMBER() OVER (ORDER BY ws.xp_earned DESC, u.created_at ASC) AS user_rank
    FROM weekly_stats ws
    JOIN users u ON u.id = ws.user_id
    WHERE ws.xp_earned > 0
  )
  SELECT
    ru.user_rank AS rank,
    ru.xp_earned::INTEGER AS period_xp,
    (SELECT COUNT(*) FROM ranked_users)::BIGINT AS total_users
  FROM ranked_users ru
  WHERE ru.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get User's Monthly Rank
-- Gets a specific user's rank for the month
CREATE OR REPLACE FUNCTION get_user_monthly_rank(p_user_id UUID)
RETURNS TABLE (
  rank BIGINT,
  period_xp INTEGER,
  total_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH monthly_stats AS (
    SELECT
      lc.user_id,
      SUM(lc.xp_earned) AS xp_earned
    FROM lesson_completions lc
    WHERE lc.completed_at >= NOW() - INTERVAL '30 days'
    GROUP BY lc.user_id
  ),
  ranked_users AS (
    SELECT
      ms.user_id,
      ms.xp_earned,
      ROW_NUMBER() OVER (ORDER BY ms.xp_earned DESC, u.created_at ASC) AS user_rank
    FROM monthly_stats ms
    JOIN users u ON u.id = ms.user_id
    WHERE ms.xp_earned > 0
  )
  SELECT
    ru.user_rank AS rank,
    ru.xp_earned::INTEGER AS period_xp,
    (SELECT COUNT(*) FROM ranked_users)::BIGINT AS total_users
  FROM ranked_users ru
  WHERE ru.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Refresh Leaderboard Cache
-- Recalculates all-time rankings and updates the cache
-- This should be called periodically (e.g., via cron job or trigger)
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
  -- Recalculate all-time rankings
  WITH user_stats AS (
    SELECT
      u.id AS user_id,
      u.total_xp,
      u.lessons_completed,
      u.courses_completed,
      ROW_NUMBER() OVER (ORDER BY u.total_xp DESC, u.created_at ASC) AS rank
    FROM users u
    WHERE u.total_xp > 0
  )
  -- Upsert into leaderboard_cache
  INSERT INTO leaderboard_cache (
    user_id,
    all_time_rank,
    all_time_xp,
    total_xp,
    lessons_completed,
    courses_completed,
    calculated_at,
    updated_at
  )
  SELECT
    user_id,
    rank::INTEGER,
    total_xp,
    total_xp, -- Keep in sync with all_time_xp
    lessons_completed,
    courses_completed,
    NOW(),
    NOW()
  FROM user_stats
  ON CONFLICT (user_id)
  DO UPDATE SET
    all_time_rank = EXCLUDED.all_time_rank,
    all_time_xp = EXCLUDED.all_time_xp,
    total_xp = EXCLUDED.total_xp,
    lessons_completed = EXCLUDED.lessons_completed,
    courses_completed = EXCLUDED.courses_completed,
    calculated_at = EXCLUDED.calculated_at,
    updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index on lesson_completions.completed_at for performance
CREATE INDEX IF NOT EXISTS idx_lesson_completions_completed_at
ON lesson_completions(completed_at);

CREATE INDEX IF NOT EXISTS idx_lesson_completions_user_id
ON lesson_completions(user_id);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_weekly_leaderboard(INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_monthly_leaderboard(INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_weekly_rank(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_monthly_rank(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION refresh_leaderboard() TO authenticated;

-- Comments
COMMENT ON FUNCTION get_weekly_leaderboard(INTEGER) IS 'Returns top users by XP earned in the last 7 days';
COMMENT ON FUNCTION get_monthly_leaderboard(INTEGER) IS 'Returns top users by XP earned in the last 30 days';
COMMENT ON FUNCTION get_user_weekly_rank(UUID) IS 'Returns user rank for the current week';
COMMENT ON FUNCTION get_user_monthly_rank(UUID) IS 'Returns user rank for the current month';
COMMENT ON FUNCTION refresh_leaderboard() IS 'Recalculates all-time leaderboard rankings and updates cache';
