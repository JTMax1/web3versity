# Hedera Faucet - Quick Start Guide

## 🚀 Deploy in 3 Steps

### Step 1: Run Database Migration (1 minute)

**Note**: Your main database schema already has `faucet_requests` and `transactions` tables. This migration only adds the `error_message` column and creates the eligibility function.

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor**
3. Open `supabase/migrations/015_faucet_requests.sql`
4. Copy all contents
5. Paste into SQL Editor
6. Click **Run**

**Verify**: Run this query:
```sql
-- Check error_message column was added
SELECT column_name FROM information_schema.columns
WHERE table_name = 'faucet_requests' AND column_name = 'error_message';

-- Check function was created
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'check_faucet_eligibility';
```
You should see both results.

---

### Step 2: Configure Secrets (2 minutes)

1. In Supabase Dashboard: **Project Settings** → **Edge Functions** → **Secrets**
2. Add THREE secrets:
   - **HEDERA_OPERATOR_ID**: `0.0.7045900`
   - **HEDERA_OPERATOR_KEY**: `[Your DER-encoded hex private key]`
   - **SUPABASE_SERVICE_ROLE_KEY**: `[Your service role key]`

**To get service role key:**
- Go to **Project Settings** → **API**
- Copy the **service_role** key (under "Project API keys")

**Or via CLI**:
```bash
supabase secrets set HEDERA_OPERATOR_ID=0.0.7045900
supabase secrets set HEDERA_OPERATOR_KEY=YOUR_KEY_HERE
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

---

### Step 3: Deploy Edge Function (2 minutes)

**Via Supabase Dashboard (Recommended):**

1. Go to **Edge Functions** in your Supabase Dashboard
2. Click **"New Edge Function"** (or **"Via Editor"** button)
3. In the editor:
   - **Name**: `request-faucet`
   - Copy the entire contents of `supabase/functions/request-faucet/index.ts` (196 lines)
   - Paste into the editor
4. Click **"Deploy"**

**Verify:**
- You'll see `request-faucet` in your Edge Functions list
- Status should show as "Active"
- URL will be: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/request-faucet`

**Alternative (Via CLI):**

If you prefer using the CLI:

```bash
# First-time setup
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Deploy
supabase functions deploy request-faucet
```

See [CLI Setup Guide](DOCUMENTATION/04-Implementation/SUPABASE-CLI-SETUP-GUIDE.md) for details.

---

## ✅ Test It

### Via Supabase Dashboard (Test Edge Function First)

Before testing in the UI, verify the Edge Function works:

**See:** [Edge Function Testing Guide](DOCUMENTATION/04-Implementation/EDGE-FUNCTION-TESTING-GUIDE.md) for detailed instructions.

**Quick test:**
1. Go to **Edge Functions** → `request-faucet` → **Invoke**
2. Add Authorization header: `Bearer YOUR_JWT_TOKEN`
3. Body: `{"hederaAccountId": "0.0.YOUR_ACCOUNT", "amount": 1}`
4. Click **Invoke**
5. Should return transaction ID and HashScan URL

---

### Via UI (Recommended)

1. Start dev server: `pnpm run dev`
2. Navigate to: `http://localhost:5173/faucet`
3. Connect your Hedera wallet
4. Select amount (1, 5, or 10 HBAR)
5. Click "Request HBAR"
6. Wait ~5 seconds
7. Click HashScan link to verify

### Via cURL

```bash
# Get your JWT from browser dev tools → Application → Local Storage
curl -X POST \
  'https://YOUR_PROJECT.supabase.co/functions/v1/request-faucet' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"hederaAccountId":"0.0.123456","amount":5}'
```

**Expected Response**:
```json
{
  "success": true,
  "transactionId": "0.0.7045900@1234567890.123",
  "hashScanUrl": "https://hashscan.io/testnet/transaction/..."
}
```

---

## 🔍 Verify Everything Works

- [ ] Migration added `error_message` column
- [ ] Migration created `check_faucet_eligibility()` function
- [ ] Secrets are set
- [ ] Edge Function deployed
- [ ] UI loads without errors
- [ ] Can select amount
- [ ] Request succeeds with 'completed' status
- [ ] Transaction ID appears
- [ ] HashScan link works
- [ ] Request appears in history
- [ ] Remaining amount updates (e.g., 5 HBAR remaining if requested 5)
- [ ] Can make multiple requests until 10 HBAR limit reached
- [ ] Cooldown timer only shows when daily limit (10 HBAR) reached

---

## 🛠️ Troubleshooting

### "Faucet service not configured"
→ Check secrets: `supabase secrets list`
→ Re-deploy: `supabase functions deploy request-faucet`

### "INSUFFICIENT_ACCOUNT_BALANCE"
→ Fund operator account: https://portal.hedera.com/faucet
→ Request 10,000 HBAR to account `0.0.7045900`

### "Not eligible"
→ User already requested in last 24h
→ Wait for cooldown timer to expire

### UI doesn't load
→ Check browser console for errors
→ Verify `.env.local` has correct `VITE_SUPABASE_URL`

---

## 📚 Full Documentation

- [Wallet Authentication Fix](DOCUMENTATION/04-Implementation/FAUCET-AUTH-FIX.md) - **How wallet auth works**
- [Edge Function Testing Guide](DOCUMENTATION/04-Implementation/EDGE-FUNCTION-TESTING-GUIDE.md) - Test your Edge Function
- [Supabase CLI Setup Guide](DOCUMENTATION/04-Implementation/SUPABASE-CLI-SETUP-GUIDE.md) - First-time CLI users
- [Schema Alignment Report](DOCUMENTATION/04-Implementation/FAUCET-SCHEMA-ALIGNMENT.md)
- [Detailed Deployment Guide](DOCUMENTATION/04-Implementation/FAUCET-DEPLOYMENT-GUIDE.md)
- [Implementation Complete Report](DOCUMENTATION/04-Implementation/TASK-3.1-FAUCET-COMPLETE.md)
- [Edge Function API Reference](supabase/functions/request-faucet/README.md)

---

## 🎯 What You Get

- ✅ Real HBAR distribution on Hedera Testnet
- ✅ Daily limit (10 HBAR per user per 24-hour rolling window)
- ✅ Multiple requests allowed until limit reached
- ✅ Request history with HashScan links
- ✅ Amount selector (1, 5, or 10 HBAR)
- ✅ Secure server-side execution
- ✅ Complete audit trail
- ✅ Demo-ready UI

---

## 🚦 Status

**Code**: ✅ Complete
**Deployment**: ⏳ Waiting for you
**Demo Ready**: ✅ Yes

---

**Questions?** Check the full guides in `DOCUMENTATION/04-Implementation/`
