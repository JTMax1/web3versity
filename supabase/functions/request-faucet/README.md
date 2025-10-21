# Hedera Faucet Edge Function

This Supabase Edge Function handles HBAR distribution from the Web3Versity faucet.

## Setup

### 1. Configure Environment Variables in Supabase

Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets

Add these secrets:

```
HEDERA_OPERATOR_ID=0.0.7045900
HEDERA_OPERATOR_KEY=your-ecdsa-private-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important Notes:**
- `HEDERA_OPERATOR_KEY` must be ECDSA format (not ED25519)
- `SUPABASE_SERVICE_ROLE_KEY` is required for database writes (bypasses RLS)
- Get service role key from: Dashboard → Settings → API → "service_role" key

### 2. Deploy the Function

**Via Supabase CLI:**
```bash
cd "path/to/your/project"
supabase functions deploy request-faucet
```

**Via Supabase Dashboard:**
1. Go to Edge Functions → Create new function
2. Name: `request-faucet`
3. Click "Via Editor"
4. Copy/paste contents of `supabase/functions/request-faucet/index.ts`
5. Deploy

### 3. Test the Function

**Option A: With JWT Token (if user has Supabase Auth session)**
```bash
curl -i --location --request POST 'https://your-project.supabase.co/functions/v1/request-faucet' \
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \
  --header 'apikey: YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"hederaAccountId":"0.0.123456","amount":5}'
```

**Option B: With userId (wallet-based auth, no JWT)**
```bash
curl -i --location --request POST 'https://your-project.supabase.co/functions/v1/request-faucet' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'apikey: YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"hederaAccountId":"0.0.123456","amount":5,"userId":"user-uuid-here"}'
```

**Important:** The function requires BOTH `apikey` and `Authorization` headers!

## API Reference

### POST /request-faucet

Request HBAR from the faucet.

**Headers:**
- `Authorization`: Bearer token (JWT for auth users OR anon key for wallet-based users)
- `apikey`: Your Supabase anon key (REQUIRED)
- `Content-Type`: application/json

**Body:**
```json
{
  "hederaAccountId": "0.0.123456",
  "amount": 5,
  "userId": "optional-user-uuid-for-wallet-auth"
}
```

**Parameters:**
- `hederaAccountId` (string, required): Recipient's Hedera account ID (format: 0.0.xxxxx)
- `amount` (number, required): Amount of HBAR to request (1-10)
- `userId` (string, optional): User's database UUID (required if no JWT session)

---

### Response Examples

**Success (200 OK):**
```json
{
  "success": true,
  "transactionId": "0.0.7045900@1234567890.123456789",
  "hashScanUrl": "https://hashscan.io/testnet/transaction/0.0.7045900@1234567890.123456789"
}
```

**Daily Limit Reached (429 Too Many Requests):**
```json
{
  "error": "Daily limit of 10 HBAR reached. Wait for oldest request to expire.",
  "nextAvailableAt": "2025-10-22T10:00:00.123456Z",
  "remainingAmount": 0
}
```

**Invalid Amount (400 Bad Request):**
```json
{
  "error": "Amount must be between 1 and 10 HBAR"
}
```

**Unauthorized (401 Unauthorized):**
```json
{
  "error": "Unauthorized - No user ID provided"
}
```

**Exceeds Remaining Allowance (400 Bad Request):**
```json
{
  "error": "Requested amount exceeds remaining daily allowance (3 HBAR remaining)",
  "remainingAmount": 3
}
```

**Server Error (500 Internal Server Error):**
```json
{
  "error": "Transaction failed"
}
```

## Business Rules

- **Daily Limit:** 10 HBAR per user per 24-hour rolling window
- **Multiple Requests:** Users can request multiple times until 10 HBAR limit reached
- **Rolling Window:** Oldest request expires first (not last request + 24h)
- **Amount Range:** 1-10 HBAR per request
- **Rate Limiting:** Enforced by user_id via database function
- **Authentication:** Required (JWT token OR userId for wallet-based auth)

### How the Rolling Window Works

**Example Timeline:**
```
10:00 AM - Request 5 HBAR ✅ (5/10 used, 5 remaining)
10:05 AM - Request 3 HBAR ✅ (8/10 used, 2 remaining)
10:10 AM - Request 2 HBAR ✅ (10/10 used, 0 remaining)
10:15 AM - Request 1 HBAR ❌ "Daily limit reached, wait until 10:01 AM tomorrow"

Next Day:
10:01 AM - Request 5 HBAR ✅ (First 5 HBAR request expired, 5/10 used)
10:06 AM - Request 3 HBAR ✅ (Second 3 HBAR request expired, 3/10 used)
```

**Key Points:**
- No cooldown between requests (can request immediately)
- Only blocked when total in last 24h >= 10 HBAR
- When blocked, shows when **oldest** request expires (not latest)

## Security

- **Private Key Protection:** Stored in Supabase secrets (encrypted, never exposed to client)
- **Server-Side Execution:** All Hedera SDK operations happen in Edge Function only
- **Dual Authentication:** Supports both JWT tokens and wallet-based userId
- **Service Role Key:** Used for database writes (bypasses RLS policies)
- **Rate Limiting:** Enforced at database level via `check_faucet_eligibility()` function
- **Audit Trail:** All transactions logged to `faucet_requests` and `transactions` tables
- **CORS Configured:** Allows cross-origin requests from your frontend

## Monitoring

Check function logs in Supabase Dashboard → Edge Functions → Logs

Monitor for:
- Failed transactions
- Rate limit violations
- Low faucet balance
- Authentication errors

## Troubleshooting

### 401 Unauthorized - "No user ID provided"
**Causes:**
- Missing both `Authorization` header and `userId` in body
- JWT token is invalid or expired
- Missing `apikey` header

**Fix:**
- Ensure client sends BOTH `apikey` AND `Authorization` headers
- For wallet-based auth: include `userId` in request body
- For JWT auth: ensure user has valid session

### 400 Bad Request - "Amount must be between 1 and 10 HBAR"
**Causes:**
- Amount is less than 1 or greater than 10
- Amount is not a number

**Fix:**
- Only request amounts between 1-10 HBAR

### 400 Bad Request - "Requested amount exceeds remaining daily allowance"
**Causes:**
- User has already used some of their 10 HBAR limit
- Requested amount + used amount > 10 HBAR

**Fix:**
- Check `remainingAmount` in error response
- Request smaller amount

### 429 Too Many Requests - "Daily limit of 10 HBAR reached"
**Causes:**
- User has requested 10 or more HBAR in last 24 hours
- All requests in rolling window total >= 10 HBAR

**Fix:**
- Wait until oldest request expires (check `nextAvailableAt` timestamp)
- Rolling window means oldest request expires first

### 500 Internal Server Error - "Faucet service not configured"
**Causes:**
- `HEDERA_OPERATOR_ID` not set in Supabase secrets
- `HEDERA_OPERATOR_KEY` not set in Supabase secrets
- `SUPABASE_SERVICE_ROLE_KEY` not set in Supabase secrets

**Fix:**
- Go to Dashboard → Settings → Edge Functions → Secrets
- Add all required secrets

### 500 Internal Server Error - "Transaction failed"
**Causes:**
- Faucet account has insufficient balance
- Invalid Hedera account ID format
- Hedera testnet is down
- Private key is wrong format (needs ECDSA)

**Fix:**
- Check faucet balance: https://hashscan.io/testnet/account/0.0.7045900
- Verify recipient account exists
- Ensure `HEDERA_OPERATOR_KEY` is ECDSA format (not ED25519)

### Edge Function shows old code or logs missing
**Causes:**
- Function deployed via Dashboard editor may be corrupted
- Code didn't update properly

**Fix:**
- Deploy via CLI instead: `supabase functions deploy request-faucet`
- Delete function in Dashboard and recreate via CLI

## Database Tables

### faucet_requests
Tracks all faucet requests with rate limiting enforcement:

**Columns:**
- `id` (UUID, PRIMARY KEY)
- `user_id` (UUID, FOREIGN KEY → users.id)
- `hedera_account_id` (TEXT) - Recipient's Hedera account (0.0.xxxxx)
- `amount_hbar` (DECIMAL(10,2)) - Amount requested
- `transaction_id` (TEXT) - Hedera transaction ID (null if failed)
- `status` (TEXT) - 'pending' | 'completed' | 'failed'
- `requested_at` (TIMESTAMPTZ, DEFAULT NOW()) - Request timestamp
- `completed_at` (TIMESTAMPTZ) - When transaction completed
- `error_message` (TEXT) - Error details if failed

**Indexes:**
- `idx_faucet_user_time` on (user_id, requested_at)
- Used for efficient eligibility checks

### transactions
General transaction tracking for all Hedera operations:

**Columns:**
- `id` (UUID, PRIMARY KEY)
- `user_id` (UUID, FOREIGN KEY → users.id)
- `transaction_type` (TEXT) - 'faucet_request' | 'course_payment' | etc.
- `transaction_id` (TEXT) - Hedera transaction ID
- `amount_hbar` (DECIMAL(10,2))
- `status` (TEXT) - 'pending' | 'success' | 'failed'
- `from_account` (TEXT) - Source Hedera account
- `to_account` (TEXT) - Destination Hedera account
- `memo` (TEXT) - Transaction memo
- `consensus_timestamp` (TIMESTAMPTZ) - Hedera consensus time
- `hashscan_url` (TEXT) - Link to HashScan explorer
- `created_at` (TIMESTAMPTZ)

### check_faucet_eligibility(p_user_id UUID)
PostgreSQL function that enforces rate limiting:

**Logic:**
1. Sums total HBAR requested in last 24 hours (rolling window)
2. Finds oldest request timestamp in that window
3. Calculates remaining allowance (10 - total)
4. If total >= 10 HBAR, returns ineligible with next_available = oldest + 24h
5. Otherwise returns eligible with remaining amount

**Returns:**
```sql
TABLE (
  eligible BOOLEAN,
  remaining_amount DECIMAL,
  next_available_at TIMESTAMPTZ,
  reason TEXT
)
```

**Example:**
```sql
SELECT * FROM check_faucet_eligibility('user-uuid-here');
-- Result when 5 HBAR used:
-- eligible | remaining_amount | next_available_at | reason
-- true     | 5.00             | NULL              | NULL
```

## Future Enhancements (Post-Hackathon)

- [ ] **IP-based rate limiting** - Prevent multiple accounts from same IP
- [ ] **CAPTCHA integration** - Add hCaptcha or reCAPTCHA to prevent bots
- [ ] **Admin dashboard** - Monitor usage, balance, and statistics
- [ ] **Automated alerts** - Notify when faucet balance < 1,000 HBAR
- [ ] **Analytics** - Track daily usage, most active users, average request size
- [ ] **Multi-operator support** - Load balancing across multiple faucet accounts
- [ ] **Configurable limits** - Admin can adjust daily limit and amount range
- [ ] **Request throttling** - Minimum time between requests (e.g., 1 minute)

---

## Related Documentation

- **Quick Start Guide:** `/FAUCET-QUICK-START.md`
- **Complete Implementation Report:** `/DOCUMENTATION/04-Implementation/TASK-3.1-FAUCET-COMPLETE.md`
- **Implementation Summary:** `/FAUCET-IMPLEMENTATION-SUMMARY.md`

---

## Support & Issues

If you encounter issues:

1. **Check Edge Function logs:** Dashboard → Edge Functions → request-faucet → Logs
2. **Check browser console:** F12 → Console tab (look for 🔐, 📤, 📥 emoji logs)
3. **Test eligibility directly:** Run `SELECT * FROM check_faucet_eligibility('your-user-id')` in SQL Editor
4. **Verify secrets are set:** Dashboard → Settings → Edge Functions → Secrets
5. **Check faucet balance:** https://hashscan.io/testnet/account/0.0.7045900

**Common Issues & Fixes:**
- 401 errors → Missing `Authorization` or `apikey` headers
- Cooldown showing with remaining balance → Database function needs update (see FAUCET-DEPLOYMENT-FINAL.md)
- Old logs/behavior → Redeploy via CLI instead of Dashboard

---

**Status:** ✅ Production Ready
**Last Updated:** 2025-10-21
**Version:** 1.0.0 (Hackathon Demo)
