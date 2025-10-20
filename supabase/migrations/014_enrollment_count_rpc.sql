-- ============================================================================
-- Migration 014: Enrollment Count RPC Function
-- ============================================================================
-- Purpose: Create atomic enrollment count increment function
-- Date: 2025-10-19
-- Description:
--   - Adds RPC function to atomically increment course enrollment count
--   - Prevents race conditions when multiple users enroll simultaneously
--   - Updates updated_at timestamp automatically
-- ============================================================================

-- Drop function if exists (for re-running migration)
DROP FUNCTION IF EXISTS increment_enrollment_count(TEXT);

-- Create function to atomically increment enrollment count
CREATE OR REPLACE FUNCTION increment_enrollment_count(course_id_param TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atomically increment the enrollment count
  UPDATE courses
  SET
    enrollment_count = enrollment_count + 1,
    updated_at = NOW()
  WHERE id = course_id_param;

  -- Check if the update actually happened
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Course not found: %', course_id_param;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_enrollment_count(TEXT) TO authenticated;

-- Grant execute permission to anonymous users (for future public API)
GRANT EXECUTE ON FUNCTION increment_enrollment_count(TEXT) TO anon;

-- Add comment
COMMENT ON FUNCTION increment_enrollment_count(TEXT) IS
'Atomically increments the enrollment count for a course. Used when a user enrolls in a course to prevent race conditions.';

-- ============================================================================
-- Verification
-- ============================================================================
-- Test the function (optional, comment out in production)
-- SELECT increment_enrollment_count('course_001');
-- SELECT enrollment_count FROM courses WHERE id = 'course_001';
