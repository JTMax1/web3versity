# Quick Start Guide - Web3Versity

**Time to setup**: 5-10 minutes

---

## 1. Environment Setup ✅ DONE

```bash
# Files already created:
# ✅ .env.local (your configuration)
# ✅ .env.example (template)
# ✅ .gitignore (updated)
# ✅ src/config/ (environment module)
```

**Status**: ✅ Complete - Environment configured and validated

---

## 2. Install Dependencies

```bash
pnpm install
```

---

## 3. Start Development Server

```bash
pnpm run dev
```

The app will open at: http://localhost:3000

---

## 4. Verify Configuration

Open browser DevTools (F12) → Console

**Expected output**:
```
🚀 Web3Versity Starting...
📋 Environment Configuration:
✅ All environment checks passed!
```

---

## Next Steps

### Current Phase: Phase 1 - Foundation

**Completed**:
- [x] Task 1.1: Environment Configuration ✅

**Next Tasks**:
- [ ] Task 1.2: Supabase Client Setup
- [ ] Task 1.3: Database Migration
- [ ] Task 1.4: Metamask Integration
- [ ] Task 1.5: User Authentication

---

## Useful Commands

```bash
# Development
pnpm run dev              # Start dev server

# Building
pnpm run build           # Build for production

# Check environment
# Open http://localhost:3000 and check console
```

---

## File Structure

```
Web3Versity_1.0/
├── .env.local                    # ✅ Your config (DO NOT COMMIT)
├── .env.example                  # ✅ Template
├── ENVIRONMENT_SETUP.md          # ✅ Setup guide
├── PHASE1_TASK1_COMPLETE.md      # ✅ Task summary
├── src/
│   ├── config/
│   │   ├── env.ts               # ✅ Environment module
│   │   ├── index.ts             # ✅ Re-exports
│   │   └── README.md            # ✅ Config docs
│   └── main.tsx                 # ✅ Updated with validation
└── DOCUMENTATION/
    ├── 01-Requirements/
    │   └── SRS...               # Complete requirements
    ├── 03-Database/
    │   ├── Database-Migrations.sql  # Ready to execute
    │   └── QUICK-START.md           # 5-min DB setup
    └── 04-Implementation/
        └── PHASE-BY-PHASE...        # Implementation guide
```

---

## Import Examples

```typescript
// Import environment configuration
import { env } from '@/config';

// Use environment variables
console.log(env.SUPABASE_URL);      // https://xlbnfetefknsqsdbngvp.supabase.co
console.log(env.HEDERA_NETWORK);    // testnet
console.log(env.HEDERA_CHAIN_ID);   // 296
console.log(env.IS_DEVELOPMENT);    // true

// Use helper functions
import { getHederaRpcUrl, getHashScanUrl } from '@/config';

const rpcUrl = getHederaRpcUrl();
// Returns: https://testnet.hashio.io/api

const explorerUrl = getHashScanUrl('transaction', '0.0.123@456.789');
// Returns: https://hashscan.io/testnet/transaction/0.0.123@456.789
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Missing required env var" | Ensure `.env.local` exists with all variables |
| "Invalid format" | Check variable format in error message |
| Variables undefined | Restart dev server (`pnpm run dev`) |
| Module not found | Ensure file is in correct location |

---

## Support

**Documentation**:
- Full setup: `ENVIRONMENT_SETUP.md`
- Task details: `PHASE1_TASK1_COMPLETE.md`
- Config docs: `src/config/README.md`
- Full plan: `DOCUMENTATION/04-Implementation/PHASE-BY-PHASE-IMPLEMENTATION-PLAN.md`

**Ready to continue?**
See `DOCUMENTATION/04-Implementation/PHASE-BY-PHASE-IMPLEMENTATION-PLAN.md` for Task 1.2

---

**Status**: ✅ Phase 1, Task 1.1 Complete

**Ready for**: Task 1.2 - Supabase Client Setup

