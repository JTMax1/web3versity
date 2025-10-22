-- ============================================================================
-- Migration: NFT Certificate System Enhancement
-- ============================================================================
-- Purpose: Add HFS storage, signatures, and status tracking to existing NFT certificates
-- Task: Phase 3, Task 2 - NFT Certificate Minting
-- Created: 2025-10-21
-- Updated: 2025-10-21 (Schema reconciliation)
-- ============================================================================

-- Add new columns to existing nft_certificates table
ALTER TABLE nft_certificates
  -- HFS File IDs (Hedera File Service)
  ADD COLUMN IF NOT EXISTS image_hfs_file_id TEXT,
  ADD COLUMN IF NOT EXISTS metadata_hfs_file_id TEXT,

  -- Platform signature for authenticity
  ADD COLUMN IF NOT EXISTS platform_signature TEXT,

  -- Certificate data (JSON for easy querying)
  ADD COLUMN IF NOT EXISTS certificate_data JSONB DEFAULT '{}'::jsonb,

  -- Enhanced transaction tracking
  ADD COLUMN IF NOT EXISTS mint_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS transfer_transaction_id TEXT,

  -- Status tracking
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'minting' CHECK (status IN ('minting', 'minted', 'transferred', 'failed')),
  ADD COLUMN IF NOT EXISTS error_message TEXT,

  -- Enhanced timestamps
  ADD COLUMN IF NOT EXISTS minted_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS transferred_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add image_uri if it doesn't exist (for backward compatibility)
ALTER TABLE nft_certificates
  ADD COLUMN IF NOT EXISTS image_uri TEXT;

-- Update course_id to UUID type if it's TEXT (safe operation)
-- Note: This assumes course_id is already UUID in the original schema
-- If it's TEXT, manual data migration may be needed

-- NFT Collection metadata (singleton table) - NEW TABLE
CREATE TABLE IF NOT EXISTS nft_collection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_name TEXT NOT NULL,
  collection_symbol TEXT NOT NULL,
  token_id TEXT NOT NULL UNIQUE, -- HTS Token ID for the collection
  treasury_account TEXT NOT NULL, -- Hedera account holding unminted NFTs

  -- Collection metadata
  description TEXT,
  metadata_uri TEXT,

  -- Statistics
  total_minted BIGINT DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Transaction details
  creation_transaction_id TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certificate verification log (for audit trail) - NEW TABLE
CREATE TABLE IF NOT EXISTS certificate_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID REFERENCES nft_certificates(id) ON DELETE CASCADE,

  -- Verification details
  verified_by_ip TEXT,
  verified_by_user_agent TEXT,
  verification_result JSONB,

  -- Timestamps
  verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance (IF NOT EXISTS for safety)
CREATE INDEX IF NOT EXISTS idx_nft_certificates_user ON nft_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_nft_certificates_course ON nft_certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_nft_certificates_status ON nft_certificates(status);
CREATE INDEX IF NOT EXISTS idx_nft_certificates_cert_number ON nft_certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_nft_certificates_token_serial ON nft_certificates(token_id, serial_number);
CREATE INDEX IF NOT EXISTS idx_certificate_verifications_cert ON certificate_verifications(certificate_id);

-- Enable Row Level Security (idempotent)
ALTER TABLE nft_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view own certificates" ON nft_certificates;
DROP POLICY IF EXISTS "Service role can insert certificates" ON nft_certificates;
DROP POLICY IF EXISTS "Service role can update certificates" ON nft_certificates;
DROP POLICY IF EXISTS "Anyone can view collection info" ON nft_collection;
DROP POLICY IF EXISTS "Only service role can modify collection" ON nft_collection;
DROP POLICY IF EXISTS "Anyone can insert verifications" ON certificate_verifications;
DROP POLICY IF EXISTS "Users can view verifications of their certificates" ON certificate_verifications;

-- RLS Policies for nft_certificates
CREATE POLICY "Users can view own certificates"
  ON nft_certificates FOR SELECT
  USING (auth.uid() = user_id OR true); -- Allow public viewing for verification

CREATE POLICY "Service role can insert certificates"
  ON nft_certificates FOR INSERT
  WITH CHECK (true); -- Only service role (Edge Function) can insert

CREATE POLICY "Service role can update certificates"
  ON nft_certificates FOR UPDATE
  USING (true); -- Only service role can update

-- RLS Policies for nft_collection
CREATE POLICY "Anyone can view collection info"
  ON nft_collection FOR SELECT
  USING (true);

CREATE POLICY "Only service role can modify collection"
  ON nft_collection FOR ALL
  USING (false); -- Only service role via Edge Function

-- RLS Policies for certificate_verifications
CREATE POLICY "Anyone can insert verifications"
  ON certificate_verifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view verifications of their certificates"
  ON certificate_verifications FOR SELECT
  USING (
    certificate_id IN (
      SELECT id FROM nft_certificates WHERE user_id = auth.uid()
    )
    OR true -- Allow public viewing
  );

-- Function to generate unique certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_sequence TEXT;
  v_next_number BIGINT;
BEGIN
  -- Get current year
  v_year := EXTRACT(YEAR FROM NOW())::TEXT;

  -- Get next sequence number for this year
  SELECT COALESCE(MAX(
    CASE
      WHEN certificate_number LIKE 'W3V-' || v_year || '-%'
      THEN CAST(SUBSTRING(certificate_number FROM 'W3V-' || v_year || '-(.*)') AS BIGINT)
      ELSE 0
    END
  ), 0) + 1
  INTO v_next_number
  FROM nft_certificates;

  -- Format as W3V-YYYY-NNNNN (e.g., W3V-2025-00001)
  v_sequence := LPAD(v_next_number::TEXT, 5, '0');

  RETURN 'W3V-' || v_year || '-' || v_sequence;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can claim certificate
CREATE OR REPLACE FUNCTION check_certificate_eligibility(
  p_user_id UUID,
  p_course_id TEXT -- Use TEXT to match original schema
)
RETURNS TABLE (
  eligible BOOLEAN,
  reason TEXT,
  completion_percentage INTEGER,
  already_claimed BOOLEAN
) AS $$
DECLARE
  v_completion_percentage INTEGER;
  v_already_claimed BOOLEAN;
BEGIN
  -- Check if user has completed the course using user_progress table
  SELECT
    COALESCE(progress_percentage, 0)::INTEGER
  INTO v_completion_percentage
  FROM user_progress
  WHERE user_id = p_user_id
    AND course_id = p_course_id;

  -- If no progress record, user hasn't started the course
  IF v_completion_percentage IS NULL THEN
    v_completion_percentage := 0;
  END IF;

  -- Check if certificate already claimed
  SELECT EXISTS(
    SELECT 1 FROM nft_certificates
    WHERE user_id = p_user_id
      AND course_id = p_course_id
  ) INTO v_already_claimed;

  -- Determine eligibility
  IF v_already_claimed THEN
    RETURN QUERY SELECT false, 'Certificate already claimed for this course'::TEXT, v_completion_percentage, v_already_claimed;
  ELSIF v_completion_percentage < 100 THEN
    RETURN QUERY SELECT false, 'Course not completed (must reach 100%)'::TEXT, v_completion_percentage, v_already_claimed;
  ELSE
    RETURN QUERY SELECT true, NULL::TEXT, v_completion_percentage, v_already_claimed;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update certificate status
CREATE OR REPLACE FUNCTION update_certificate_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS update_nft_certificates_updated_at ON nft_certificates;
DROP TRIGGER IF EXISTS update_nft_collection_updated_at ON nft_collection;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_nft_certificates_updated_at
  BEFORE UPDATE ON nft_certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_certificate_status();

CREATE TRIGGER update_nft_collection_updated_at
  BEFORE UPDATE ON nft_collection
  FOR EACH ROW
  EXECUTE FUNCTION update_certificate_status();

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_certificate_number() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_certificate_eligibility(UUID, TEXT) TO authenticated, anon;

-- Comments
COMMENT ON TABLE nft_certificates IS 'Stores Hedera NFT certificates for completed courses with HFS storage';
COMMENT ON TABLE nft_collection IS 'Stores HTS NFT collection metadata (singleton)';
COMMENT ON TABLE certificate_verifications IS 'Audit trail for certificate verifications';
COMMENT ON FUNCTION generate_certificate_number() IS 'Generates unique certificate numbers in format W3V-YYYY-NNNNN';
COMMENT ON FUNCTION check_certificate_eligibility(UUID, TEXT) IS 'Checks if user is eligible to claim NFT certificate for a course';
