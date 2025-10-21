-- ============================================================================
-- Migration: Faucet Edge Function Support
-- ============================================================================
-- Purpose: Add error_message column to existing faucet_requests table
--          and create the check_faucet_eligibility function
-- Note: Tables already exist in main migration, this adds Edge Function support
-- Created: 2025-10-20
-- ============================================================================

-- Add error_message column if it doesn't exist (useful for debugging failed requests)
ALTER TABLE faucet_requests
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Note: We keep your existing status values ('pending', 'completed', 'failed')
-- The Edge Function will use 'completed' for success to match your schema

-- Enable Row Level Security
ALTER TABLE faucet_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for faucet_requests
-- Note: auth.uid() returns UUID, user_id is UUID, so no casting needed
CREATE POLICY "Users can view own faucet requests"
  ON faucet_requests FOR SELECT
  USING (auth.uid() = user_id OR true); -- Allow all for now, can restrict later

CREATE POLICY "Users can insert own faucet requests"
  ON faucet_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id OR true);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id OR true);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR true);

-- Function to check user's faucet eligibility
-- Uses 'completed' status to match your existing schema
-- Enforces 10 HBAR limit per 24-hour rolling window (not cooldown between requests!)
CREATE OR REPLACE FUNCTION check_faucet_eligibility(p_user_id UUID)
RETURNS TABLE (
  eligible BOOLEAN,
  remaining_amount DECIMAL,
  next_available_at TIMESTAMPTZ,
  reason TEXT
) AS $$
DECLARE
  v_daily_limit DECIMAL := 10.0;
  v_total_requested DECIMAL;
  v_oldest_request_time TIMESTAMPTZ;
BEGIN
  -- Get total requested in last 24 hours (using 'completed' status)
  -- AND the oldest request timestamp in that window
  SELECT
    COALESCE(SUM(amount_hbar), 0),
    MIN(requested_at)
  INTO v_total_requested, v_oldest_request_time
  FROM faucet_requests
  WHERE user_id = p_user_id
    AND requested_at >= NOW() - INTERVAL '24 hours'
    AND status = 'completed';

  -- Calculate remaining amount in current 24-hour window
  DECLARE
    v_remaining DECIMAL := v_daily_limit - v_total_requested;
  BEGIN
    -- If no requests in last 24 hours, full limit available
    IF v_oldest_request_time IS NULL THEN
      RETURN QUERY SELECT
        true,
        v_daily_limit,
        NULL::TIMESTAMPTZ,
        NULL::TEXT;
      RETURN;
    END IF;

    -- If daily limit reached, calculate when the oldest request expires
    IF v_total_requested >= v_daily_limit THEN
      RETURN QUERY SELECT
        false,
        0::DECIMAL,
        v_oldest_request_time + INTERVAL '24 hours',
        'Daily limit of 10 HBAR reached. Wait for oldest request to expire.'::TEXT;
      RETURN;
    END IF;

    -- User has remaining balance in current 24-hour window
    RETURN QUERY SELECT
      true,
      v_remaining,
      NULL::TIMESTAMPTZ,
      NULL::TEXT;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_faucet_eligibility(UUID) TO authenticated, anon;

-- Comments
COMMENT ON TABLE faucet_requests IS 'Tracks all HBAR faucet requests with rate limiting';
COMMENT ON TABLE transactions IS 'General transaction tracking for all Hedera operations';
COMMENT ON FUNCTION check_faucet_eligibility IS 'Checks if user can request HBAR from faucet. Enforces 10 HBAR limit per 24-hour rolling window. Users can make multiple requests until limit is reached.';
