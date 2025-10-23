-- Add IPFS/Pinata fields to nft_certificates
-- Allows storing IPFS hashes and URLs alongside HFS storage

ALTER TABLE nft_certificates
  -- IPFS image storage (from Pinata)
  ADD COLUMN IF NOT EXISTS ipfs_image_hash TEXT,
  ADD COLUMN IF NOT EXISTS ipfs_image_url TEXT,

  -- IPFS metadata storage (from Pinata)
  ADD COLUMN IF NOT EXISTS ipfs_metadata_hash TEXT,
  ADD COLUMN IF NOT EXISTS ipfs_metadata_url TEXT;

-- Add comments
COMMENT ON COLUMN nft_certificates.ipfs_image_hash IS 'IPFS hash for certificate SVG (from Pinata)';
COMMENT ON COLUMN nft_certificates.ipfs_image_url IS 'IPFS URL (ipfs://xxx) for certificate SVG';
COMMENT ON COLUMN nft_certificates.ipfs_metadata_hash IS 'IPFS hash for certificate metadata JSON';
COMMENT ON COLUMN nft_certificates.ipfs_metadata_url IS 'IPFS URL (ipfs://xxx) for metadata JSON';
