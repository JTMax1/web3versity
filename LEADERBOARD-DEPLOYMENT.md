# Leaderboard Deployment Guide

**Status**: Ready to Deploy
**Date**: 2025-10-21
**Task**: Phase 3, Task 3 - Real Leaderboard Implementation

---

## Deployment Steps

### Step 1: Deploy Database Migration

**Important**: The migration uses `ALTER TABLE ADD COLUMN IF NOT EXISTS` to safely enhance the existing `leaderboard_cache` table without conflicts. See [DOCUMENTATION/04-Implementation/SCHEMA-RECONCILIATION.md](DOCUMENTATION/04-Implementation/SCHEMA-RECONCILIATION.md) for details on schema compatibility.

Deploy via the **Supabase Dashboard**:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/018_leaderboard_functions.sql`
5. Paste into the SQL editor
6. Click **Run** to execute

**What this creates**:
- Adds columns to `leaderboard_cache`: `total_xp`, `lessons_completed`, `courses_completed`
- 5 PostgreSQL functions: `get_weekly_leaderboard`, `get_monthly_leaderboard`, `get_user_weekly_rank`, `get_user_monthly_rank`, `refresh_leaderboard`
- Performance indexes on `leaderboard_cache.total_xp` and `lesson_progress.completed_at`
- Grants execute permissions to authenticated and anonymous users

---

### Step 2: Verify Migration Success

**A) Verify New Columns Were Added**:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'leaderboard_cache'
AND column_name IN ('total_xp', 'lessons_completed', 'courses_completed')
ORDER BY column_name;
```

**Expected results** (3 rows):
- courses_completed (integer)
- lessons_completed (integer)
- total_xp (integer)

**B) Verify Functions Were Created**:
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_name LIKE '%leaderboard%'
AND routine_schema = 'public'
ORDER BY routine_name;
```

**Expected results** (5 functions):
- get_monthly_leaderboard
- get_user_monthly_rank
- get_user_weekly_rank
- get_weekly_leaderboard
- refresh_leaderboard

**C) Initialize Leaderboard Cache**:
```sql
-- Populate leaderboard cache with current user stats
SELECT refresh_leaderboard();
```

This will calculate all-time rankings for all users and populate the cache.

---

### Step 3: Test the Functions

Test each function to ensure they work correctly:

#### Test Weekly Leaderboard
```sql
SELECT * FROM get_weekly_leaderboard(10);
```

#### Test Monthly Leaderboard
```sql
SELECT * FROM get_monthly_leaderboard(10);
```

#### Test User Weekly Rank (replace with your actual user ID)
```sql
SELECT * FROM get_user_weekly_rank('YOUR_USER_ID_HERE');
```

#### Test User Monthly Rank
```sql
SELECT * FROM get_user_monthly_rank('YOUR_USER_ID_HERE');
```

**Expected behavior**:
- Weekly/monthly leaderboards return users who have completed lessons in the last 7/30 days
- If no users have recent activity, the result will be empty (this is correct)
- User rank functions return NULL if the user has no recent activity

---

### Step 4: Populate Leaderboard Cache (All-Time Rankings)

The all-time leaderboard uses the `leaderboard_cache` table. Check if it exists and has data:

```sql
SELECT COUNT(*) FROM leaderboard_cache;
```

If the table is empty or doesn't exist, populate it manually:

```sql
-- Clear existing cache (if any)
DELETE FROM leaderboard_cache;

-- Populate cache with current rankings
INSERT INTO leaderboard_cache (user_id, all_time_rank, total_xp, lessons_completed, courses_completed, last_refreshed)
SELECT
  u.id,
  ROW_NUMBER() OVER (ORDER BY u.total_xp DESC, u.created_at ASC) as rank,
  u.total_xp,
  COUNT(DISTINCT CASE WHEN lp.completed THEN lp.lesson_id END) as lessons,
  COUNT(DISTINCT CASE WHEN e.completed THEN e.course_id END) as courses,
  NOW()
FROM users u
LEFT JOIN lesson_progress lp ON lp.user_id = u.id
LEFT JOIN enrollments e ON e.user_id = u.id
GROUP BY u.id, u.total_xp, u.created_at
ON CONFLICT (user_id) DO UPDATE SET
  all_time_rank = EXCLUDED.all_time_rank,
  total_xp = EXCLUDED.total_xp,
  lessons_completed = EXCLUDED.lessons_completed,
  courses_completed = EXCLUDED.courses_completed,
  last_refreshed = NOW();
```

---

### Step 5: Test Frontend

1. Ensure dev server is running: `pnpm run dev`
2. Navigate to the Leaderboard page in your browser
3. Verify the following:

#### Visual Tests:
- [ ] All-time leaderboard displays
- [ ] Top 3 users appear in animated podium
- [ ] Podium order is [2nd, 1st, 3rd] (left to right)
- [ ] Crown icon on 1st place
- [ ] Trophy/Award icons on 2nd/3rd place
- [ ] Podium has correct colors (gold, silver, bronze)
- [ ] Slide-up animation plays on load

#### Timeframe Switching:
- [ ] Click "This Week" - shows weekly rankings
- [ ] Click "This Month" - shows monthly rankings
- [ ] Click "All Time" - shows all-time rankings
- [ ] Active button has blue background
- [ ] Data updates when switching

#### Current User Highlighting:
- [ ] Your row has blue background
- [ ] "YOU" badge displays next to your name
- [ ] Ring highlight around your avatar in podium (if top 3)

#### Context View (if rank > 100):
- [ ] Context card displays below main leaderboard
- [ ] Shows your rank, XP, percentile
- [ ] Shows ±5 users around your rank
- [ ] 4 metric cards display correctly

#### Stats Cards:
- [ ] Total Users displays
- [ ] Total XP Earned displays
- [ ] Most Completed Course displays
- [ ] Top Performer This Week displays

#### Auto-Refresh:
- [ ] Complete a lesson
- [ ] Wait 60 seconds OR click manual refresh button
- [ ] Verify rank/XP updates

#### Empty States:
- [ ] If no weekly activity, shows "No one has earned XP this week yet"
- [ ] If no monthly activity, shows "No one has earned XP this month yet"
- [ ] Messages are different per timeframe

---

### Step 6: Performance Verification

Open browser DevTools (F12) → Network tab:

1. **All-Time Load**:
   - Should be fast (< 500ms)
   - Queries `leaderboard_cache` table directly

2. **Weekly/Monthly Load**:
   - Should be acceptable (< 2 seconds)
   - Calls database functions for calculation

3. **Auto-Refresh**:
   - Verify it refreshes every 60 seconds
   - Check Network tab for periodic requests

---

## Troubleshooting

### No Data Showing

**Problem**: Leaderboard is empty

**Solutions**:
1. Check if users exist: `SELECT COUNT(*) FROM users;`
2. Check if lesson progress exists: `SELECT COUNT(*) FROM lesson_progress WHERE completed = true;`
3. Populate cache manually (see Step 4)
4. For weekly/monthly, ensure users have recent activity

### Functions Not Found

**Problem**: Error calling `get_weekly_leaderboard`

**Solutions**:
1. Verify migration ran successfully (Step 2)
2. Check for SQL errors in Supabase Dashboard → Database → Logs
3. Re-run migration SQL

### Performance Issues

**Problem**: Leaderboard loads slowly

**Solutions**:
1. Verify index exists: `\d lesson_progress` (should show `idx_lesson_progress_completed_at`)
2. Check query plan: `EXPLAIN ANALYZE SELECT * FROM get_weekly_leaderboard(100);`
3. Limit results to top 100 (already implemented)

### Context View Not Showing

**Problem**: Users outside top 100 don't see context card

**Solutions**:
1. Check console for errors
2. Verify `getLeaderboardContext()` API function
3. Ensure user has a rank (completed at least one lesson)

---

## Post-Deployment Tasks

### Optional: Set Up Leaderboard Cache Refresh

Currently, the all-time leaderboard cache must be manually refreshed. To automate:

**Option A: Create Edge Function + Cron**

1. Create `supabase/functions/refresh-leaderboard-cache/index.ts`:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );

  const { error } = await supabase.rpc('refresh_leaderboard');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ success: true }));
});
```

2. Deploy: `supabase functions deploy refresh-leaderboard-cache`

3. Schedule with pg_cron in SQL Editor:
```sql
SELECT cron.schedule(
  'refresh-leaderboard-cache',
  '0 * * * *', -- Every hour
  $$
  SELECT refresh_leaderboard();
  $$
);
```

**Option B: Manual Refresh**

Run the cache population SQL (Step 4) whenever rankings need updating (daily/weekly).

---

## Files Modified

| File | Description |
|------|-------------|
| `src/lib/api/leaderboard.ts` | NEW - API client for leaderboard data |
| `src/components/LeaderboardPodium.tsx` | NEW - Animated podium for top 3 |
| `src/components/pages/Leaderboard.tsx` | REWRITTEN - Real leaderboard page |
| `supabase/migrations/018_leaderboard_functions.sql` | NEW - Database functions |
| `src/App.tsx` | UPDATED - Removed mock data props |

---

## Success Criteria

Leaderboard deployment is successful when:

✅ Database functions execute without errors
✅ All-time leaderboard displays real data from cache
✅ Weekly/monthly leaderboards calculate correctly
✅ Top 3 podium animates and displays
✅ Current user is highlighted
✅ Context view works for users outside top 100
✅ Stats cards display accurate numbers
✅ Auto-refresh updates every 60 seconds
✅ Manual refresh button works
✅ Timeframe switching updates data
✅ Performance is acceptable (no lag)

---

## Next Steps After Deployment

1. **Monitor Performance**: Check Supabase Dashboard → Database → Query Performance
2. **Gather User Feedback**: Does the leaderboard motivate users?
3. **Consider Enhancements**:
   - Rank change indicators (↑↓)
   - Fastest climbers this week
   - Friends-only leaderboard
   - Challenge/follow buttons
   - Social sharing
4. **Set Up Automated Cache Refresh** (if not done already)

---

**Deployment Status**: ⏳ Awaiting manual SQL execution via Supabase Dashboard

Once you've completed Steps 1-5, the leaderboard will be fully functional! 🚀
