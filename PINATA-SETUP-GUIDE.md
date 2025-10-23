# Pinata IPFS Integration Setup Guide

This guide walks you through setting up Pinata/IPFS storage for NFT certificates.

## What Was Implemented

### ✅ Architecture: Triple-Layer Storage
1. **Database (Supabase)** - Primary, instant display
2. **Pinata/IPFS** - Industry standard, reliable, public access
3. **Hedera HFS** - Blockchain backup, on-chain proof

### ✅ Code Changes Made
- Created Pinata upload utilities (`pinata-uploader.ts`)
- Updated certificate generator to upload to IPFS
- Added IPFS fields to database schema
- Updated frontend to fetch from Pinata (fallback)
- Enhanced edge function to use Pinata credentials

---

## Step-by-Step Setup

### 1. Get Pinata API Credentials

1. **Go to Pinata Dashboard**: https://app.pinata.cloud/
2. **Navigate to API Keys**:
   - Click your profile icon (top right)
   - Select "API Keys" from dropdown

3. **Create New API Key**:
   - Click "New Key" button
   - Toggle **Admin** permissions ON (required for uploads)
   - Name: `Web3Versity Certificates`
   - Click "Create Key"

4. **Copy Credentials** (IMPORTANT - secret shown only once):
   - `API Key`: Copy this
   - `API Secret`: Copy this
   - `JWT`: Copy this (optional, not currently used)

---

### 2. Add Credentials to Supabase Edge Functions

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to: **Settings** → **Edge Functions** → **Secrets**
3. Add two new secrets:
   - Key: `PINATA_API_KEY`, Value: [your API key]
   - Key: `PINATA_API_SECRET`, Value: [your API secret]

**Option B: Via Supabase CLI**

```bash
# Add Pinata API Key
supabase secrets set PINATA_API_KEY="your-api-key-here"

# Add Pinata API Secret
supabase secrets set PINATA_API_SECRET="your-api-secret-here"
```

---

### 3. Run Database Migration

Add IPFS fields to nft_certificates table:

```bash
npx supabase db push
```

This adds the following columns:
- `ipfs_image_hash` - IPFS hash for certificate SVG
- `ipfs_image_url` - IPFS URL (ipfs://xxx)
- `ipfs_metadata_hash` - IPFS hash for metadata JSON
- `ipfs_metadata_url` - IPFS URL for metadata

---

### 4. Deploy Edge Function

Deploy the updated mint-certificate function:

```bash
supabase functions deploy mint-certificate
```

---

### 5. Test Certificate Minting

1. **Complete a course** in your app
2. **Click "Claim Certificate"**
3. **Check the logs** - you should see:

```
✅ Pinata credentials found - will upload to IPFS
📤 Uploading to Pinata/IPFS...
✅ SVG uploaded to IPFS: QmXxx...
✅ Metadata uploaded to IPFS: QmYyy...
```

4. **Verify in Database** - Certificate should have:
   - `svg_content` - Direct SVG content
   - `ipfs_image_hash` - IPFS hash
   - `ipfs_image_url` - IPFS URL
   - `image_hfs_file_id` - HFS file ID

5. **Check Pinata Dashboard**:
   - Go to https://app.pinata.cloud/pinmanager
   - Your certificate files should appear there

---

## How It Works

### Certificate Minting Flow:

```
1. Generate SVG Certificate
   ↓
2. Upload to Hedera HFS → 0.0.XXXXX
   ↓
3. Upload to Pinata/IPFS → QmXXX...
   ↓
4. Create metadata JSON with IPFS URL
   ↓
5. Upload metadata to Pinata → QmYYY...
   ↓
6. Mint NFT on Hedera with metadata
   ↓
7. Store in Database with all URLs
```

### Certificate Display Priority:

```
1. Try Database (svg_content) → Instant ⚡
   ↓ (if empty)
2. Try Pinata/IPFS (ipfs_image_hash) → Reliable 🌐
   ↓ (if fails)
3. Try Hedera HFS (image_hfs_file_id) → Backup 📦
```

---

## Verification

### Check Pinata Upload:

Visit your certificate on Pinata gateway:
```
https://gateway.pinata.cloud/ipfs/[ipfs_image_hash]
```

### Check Database:

```sql
SELECT
  certificate_number,
  image_hfs_file_id,
  ipfs_image_hash,
  ipfs_image_url
FROM nft_certificates
ORDER BY created_at DESC
LIMIT 1;
```

---

## Troubleshooting

### "Pinata upload failed" in logs

**Problem**: Credentials not set or incorrect

**Solution**:
1. Verify secrets in Supabase dashboard
2. Redeploy edge function: `supabase functions deploy mint-certificate`
3. Check Pinata API keys are still valid

### "401 Unauthorized" from Pinata

**Problem**: API keys expired or incorrect

**Solution**:
1. Generate new API keys in Pinata dashboard
2. Update Supabase secrets
3. Redeploy edge function

### Certificates still show only HFS

**Problem**: Migration not run or edge function not deployed

**Solution**:
1. Run: `npx supabase db push`
2. Deploy: `supabase functions deploy mint-certificate`
3. Claim a NEW certificate (old ones won't have IPFS)

---

## Benefits Achieved

✅ **Reliability** - 3 storage layers ensure certificates always accessible
✅ **Speed** - Database provides instant display
✅ **Standard** - IPFS makes certificates compatible with NFT marketplaces
✅ **Proof** - HFS provides blockchain verification
✅ **Free Tier** - 1GB Pinata storage (≈400 certificates)

---

## Next Steps (Optional)

### For NFT Marketplace Listing:

Your certificates now have standard NFT metadata format:
```json
{
  "name": "Web3Versity Certificate - Course Name",
  "description": "Certificate of Completion...",
  "image": "ipfs://QmXXX.../certificate.svg",
  "attributes": [...]
}
```

This metadata is stored on IPFS and can be read by platforms like:
- OpenSea
- Rarible
- Magic Eden
- etc.

### Custom IPFS Gateway:

To use your own domain for IPFS access, set up a custom gateway:
1. Pinata offers dedicated gateways on paid plans
2. Or use Cloudflare IPFS gateway
3. Update frontend to use your gateway URL

---

## Cost Breakdown

**Pinata Free Tier:**
- 1 GB storage
- 100 GB bandwidth/month
- Unlimited pins

**Your Usage:**
- ~2.5 KB per certificate SVG
- ~1 KB per metadata JSON
- **Total**: ~3.5 KB per certificate
- **Capacity**: ~285 certificates per GB

**Upgrade Path:**
- **Picnic Plan**: $20/month - 5GB storage, 500GB bandwidth
- **Fiesta Plan**: $150/month - 50GB storage, 5TB bandwidth

---

## Support

If you encounter issues:
1. Check Supabase edge function logs
2. Verify Pinata dashboard shows uploads
3. Test with a fresh certificate claim
4. Review database for IPFS URLs

**Pinata Support**: support@pinata.cloud
**Pinata Docs**: https://docs.pinata.cloud/

---

**Setup Complete!** 🎉

Your NFT certificates now have triple-redundant storage with IPFS/Pinata integration!
