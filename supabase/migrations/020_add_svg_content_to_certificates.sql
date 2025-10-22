-- Add SVG content storage to nft_certificates
-- This allows us to display certificates even if HFS Mirror Node has indexing delays

ALTER TABLE nft_certificates
  ADD COLUMN IF NOT EXISTS svg_content TEXT;

-- Add comment
COMMENT ON COLUMN nft_certificates.svg_content IS 'Base64 or raw SVG content for immediate display (backup to HFS)';
