# Web3Versity Database Migration Guide

**Complete Step-by-Step Instructions for Executing the Database Migration**

---

## 📋 Pre-Migration Checklist

Before you begin, ensure you have:

- [ ] Supabase project created (Project ID: `xlbnfetefknsqsdbngvp`)
- [ ] Supabase dashboard access
- [ ] Migration SQL file at `DOCUMENTATION/03-Database/Database-Migrations.sql`
- [ ] 10-15 minutes of uninterrupted time
- [ ] Stable internet connection

---

## 🎯 What This Migration Does

This comprehensive migration (1,235 lines) will create:

✅ **17 Tables** - Complete database schema for Web3Versity
✅ **45+ Indexes** - Performance optimization for fast queries
✅ **8 Triggers** - Automatic timestamp updates and progress tracking
✅ **7 Functions** - Business logic (XP calculation, achievements, streaks, etc.)
✅ **2 Views** - Convenient queries for user dashboard and course catalog
✅ **44 Courses** - All course data populated
✅ **25+ Achievements** - All badge definitions
✅ **28+ Lessons** - Sample lesson content for key courses
✅ **Platform Settings** - Initial configuration values

---

## 📖 Step-by-Step Migration Instructions

### Step 1: Access Supabase Dashboard

1. **Open your web browser** and navigate to:
   ```
   https://supabase.com/dashboard
   ```

2. **Sign in** with your Supabase credentials

3. **Select your project**:
   - Look for project: `xlbnfetefknsqsdbngvp`
   - Or look for the project named "Web3Versity" or your custom project name

### Step 2: Navigate to SQL Editor

```
Dashboard → [Your Project] → SQL Editor
```

**Visual Guide:**
```
┌─────────────────────────────────────────┐
│  Supabase Dashboard                     │
├─────────────────────────────────────────┤
│  📊 Home                                │
│  🗄️  Table Editor                       │
│  ✏️  SQL Editor  ← CLICK HERE          │
│  🔐 Authentication                      │
│  📦 Storage                             │
│  🔧 Database                            │
└─────────────────────────────────────────┘
```

You should see a blank SQL editor with a "Run" button.

### Step 3: Open the Migration File

1. **Open File Explorer** (Windows) or **Finder** (Mac)

2. **Navigate to**:
   ```
   Web3Versity_1.0/DOCUMENTATION/03-Database/Database-Migrations.sql
   ```

3. **Open the file** in a text editor (Notepad, VS Code, or any editor)

4. **Select all content** (Ctrl+A or Cmd+A)

5. **Copy** (Ctrl+C or Cmd+C)

### Step 4: Paste and Execute Migration

1. **Return to Supabase SQL Editor**

2. **Click in the editor area**

3. **Paste** the entire migration SQL (Ctrl+V or Cmd+V)

4. **Review** - You should see 1,235 lines of SQL starting with:
   ```sql
   -- ============================================================================
   -- WEB3VERSITY COMPLETE DATABASE MIGRATION
   -- ============================================================================
   ```

5. **Click the "Run" button** (or press Ctrl+Enter / Cmd+Enter)

### Step 5: Wait for Execution

⏱️ **Expected duration: 30-90 seconds**

You'll see:
- **Progress indicator** while the script runs
- **Success messages** for each section
- **Final verification query** results at the end

**What's Happening:**
```
[====>                    ] Creating extensions...
[=========>               ] Creating tables...
[==============>          ] Creating indexes...
[===================>     ] Creating triggers...
[========================>] Inserting data...
[=========================] Complete!
```

### Step 6: Verify Success

At the bottom of the output, you should see a verification table similar to:

```
┌─────────────────┬───────┐
│ metric          │ value │
├─────────────────┼───────┤
│ Total Courses   │ 44    │
│ Total Lessons   │ 28+   │
│ Total Achievements │ 25 │
│ Total Indexes   │ 45+   │
│ Total Functions │ 7     │
└─────────────────┴───────┘
```

✅ **Success Indicators:**
- No red error messages
- All tables created
- Verification query shows expected counts
- Query completed in 30-90 seconds

❌ **Failure Indicators:**
- Red error messages in output
- "ERROR:" prefix on any lines
- Query stops executing partway through
- Zero counts in verification table

---

## 🔍 Post-Migration Verification

### Method 1: Using Supabase Table Editor

1. **Go to Table Editor** in Supabase dashboard
2. **Check for these tables** in the left sidebar:
   ```
   ✓ users
   ✓ courses
   ✓ course_prerequisites
   ✓ lessons
   ✓ user_progress
   ✓ lesson_completions
   ✓ achievements
   ✓ user_achievements
   ✓ user_streaks
   ✓ leaderboard_cache
   ✓ discussions
   ✓ replies
   ✓ discussion_votes
   ✓ faucet_requests
   ✓ transactions
   ✓ nft_certificates
   ✓ platform_settings
   ```

3. **Click on "courses"** table
4. **Verify** you see 44 rows of course data

5. **Click on "achievements"** table
6. **Verify** you see 25+ rows of achievement data

### Method 2: Run Verification Script

1. **In SQL Editor**, paste the contents of `scripts/verify-migration.sql` (we'll create this next)
2. **Run the script**
3. **Check all green checkmarks** in the output

### Method 3: Test from Application

1. **Start your development server**:
   ```bash
   pnpm run dev
   ```

2. **Open the test page**:
   ```
   http://localhost:3000/test-supabase.html
   ```

3. **Click "Test Connection"**
4. **Verify** all tables show row counts

---

## 🚨 Common Issues & Solutions

### Issue 1: "Permission Denied" or "Insufficient Privileges"

**Cause:** Your Supabase user doesn't have admin permissions.

**Solution:**
- Make sure you're signed in as the project owner
- Check your project role in Settings → Team
- If using service role key, ensure it's configured correctly

### Issue 2: "Table Already Exists" Errors

**Cause:** Migration was run previously or partially completed.

**Solution:**
1. **Option A: Run Rollback Script First**
   - Execute `scripts/rollback-migration.sql`
   - Then run migration again

2. **Option B: Drop Tables Manually**
   ```sql
   -- In SQL Editor, run:
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   GRANT ALL ON SCHEMA public TO postgres;
   GRANT ALL ON SCHEMA public TO public;
   ```
   - Then run migration again

### Issue 3: Foreign Key Violations

**Cause:** Tables created in wrong order or previous data conflicts.

**Solution:**
- Run the rollback script completely
- Ensure no manual tables exist before migration
- Run migration fresh

### Issue 4: Query Timeout

**Cause:** Network issues or large dataset.

**Solution:**
- Check your internet connection
- Try running during off-peak hours
- Break migration into sections if necessary (see "Manual Section-by-Section Migration" below)

### Issue 5: "Function Already Exists"

**Cause:** Some functions created in previous run.

**Solution:**
- The migration uses `CREATE OR REPLACE FUNCTION` which should handle this
- If errors persist, run rollback script first

### Issue 6: Extension Not Available

**Error:** `ERROR: extension "uuid-ossp" is not available`

**Solution:**
- This should not occur on Supabase (extensions are pre-installed)
- Contact Supabase support if this error appears
- Temporary workaround: Comment out extension creation lines (not recommended)

---

## 📊 Migration Breakdown by Section

Understanding what each section does:

### Section 1: Utility Functions (Lines 16-36)
- `update_updated_at_column()` - Auto-update timestamps
- `calculate_user_level()` - XP to level conversion

### Section 2: Core Tables (Lines 38-528)
Creates all 17 tables in dependency order:
1. `users` - User accounts
2. `courses` - Course catalog
3. `course_prerequisites` - Course dependencies
4. `lessons` - Lesson content
5. `user_progress` - Enrollment & progress
6. `lesson_completions` - Completed lessons
7. `achievements` - Badge definitions
8. `user_achievements` - Earned badges
9. `user_streaks` - Daily streaks
10. `leaderboard_cache` - Rankings
11. `discussions` - Forum threads
12. `replies` - Discussion replies
13. `discussion_votes` - Upvotes/downvotes
14. `faucet_requests` - Test HBAR requests
15. `transactions` - Blockchain transactions
16. `nft_certificates` - Course certificates
17. `platform_settings` - Configuration

### Section 3: Indexes (Lines 530-628)
Performance optimization - 45+ indexes for fast queries

### Section 4: Triggers (Lines 630-680)
Automatic updates for modified records

### Section 5: Advanced Functions (Lines 682-878)
Business logic:
- `update_course_progress()` - Track course completion
- `award_xp()` - Give XP to users
- `check_achievements()` - Auto-award badges
- `update_streak()` - Track daily streaks
- `refresh_leaderboard()` - Update rankings

### Section 6: Platform Settings (Lines 880-894)
Initial configuration values

### Section 7: Achievements (Lines 896-935)
25+ badge definitions

### Section 8: Courses (Lines 937-987)
All 44 courses with metadata

### Section 9: Prerequisites (Lines 989-1018)
Course dependency relationships

### Section 10: Lessons (Lines 1020-1149)
Sample lesson content for key courses

### Section 11: Views (Lines 1154-1201)
Convenient query helpers

---

## 🔄 Manual Section-by-Section Migration

If the full migration times out or fails, you can run it in sections:

### Step 1: Extensions and Utility Functions (Lines 1-36)
```sql
-- Copy and run lines 1-36
```

### Step 2: Create Tables (Lines 38-528)
```sql
-- Copy and run lines 38-528
```

### Step 3: Create Indexes (Lines 530-628)
```sql
-- Copy and run lines 530-628
```

### Step 4: Create Triggers (Lines 630-680)
```sql
-- Copy and run lines 630-680
```

### Step 5: Create Functions (Lines 682-878)
```sql
-- Copy and run lines 682-878
```

### Step 6: Insert Data (Lines 880-1149)
```sql
-- Copy and run lines 880-1149
```

### Step 7: Create Views (Lines 1154-1201)
```sql
-- Copy and run lines 1154-1201
```

---

## 📸 Visual Walkthrough

### Screenshot Guide

**1. Supabase Dashboard:**
```
┌────────────────────────────────────────────────┐
│  🏠 xlbnfetefknsqsdbngvp                       │
├────────────────────────────────────────────────┤
│  📊 Home                                       │
│  🗄️  Table Editor                             │
│  ✏️  SQL Editor  ← YOU ARE HERE               │
└────────────────────────────────────────────────┘
```

**2. SQL Editor View:**
```
┌────────────────────────────────────────────────┐
│  + New query    [Run] [Format] [Share]         │
├────────────────────────────────────────────────┤
│                                                 │
│  -- ====================================        │
│  -- WEB3VERSITY DATABASE MIGRATION              │
│  -- ====================================        │
│  CREATE EXTENSION IF NOT EXISTS...              │
│                                                 │
│  (1,235 lines of SQL...)                        │
│                                                 │
└────────────────────────────────────────────────┘
```

**3. Success Output:**
```
┌────────────────────────────────────────────────┐
│  ✓ Success. Query executed in 45.2 seconds     │
├────────────────────────────────────────────────┤
│  metric               | value                  │
│  ─────────────────────┼────────────────────   │
│  Total Courses        | 44                     │
│  Total Lessons        | 28                     │
│  Total Achievements   | 25                     │
│  Total Indexes        | 47                     │
│  Total Functions      | 7                      │
└────────────────────────────────────────────────┘
```

---

## ✅ Post-Migration Checklist

After successful migration, verify:

- [ ] **All 17 tables exist** (check Table Editor sidebar)
- [ ] **44 courses populated** (view courses table)
- [ ] **25+ achievements created** (view achievements table)
- [ ] **28+ lessons inserted** (view lessons table)
- [ ] **9 platform settings** (view platform_settings table)
- [ ] **Functions working** (run `scripts/verify-migration.sql`)
- [ ] **Triggers active** (test by inserting/updating a record)
- [ ] **No errors in Supabase logs** (check Logs section)
- [ ] **Application connects successfully** (run `test-supabase.html`)
- [ ] **Sample queries work** (try getCourses, getAchievements from app)

---

## 🔄 Re-Running the Migration

If you need to re-run the migration (e.g., after updates):

1. **Run the rollback script first**:
   ```sql
   -- Execute scripts/rollback-migration.sql
   ```

2. **Verify all tables dropped**:
   - Check Table Editor - should show no Web3Versity tables

3. **Run the migration again**:
   - Follow Steps 3-6 above

---

## 🆘 Getting Help

If you encounter issues:

1. **Check this troubleshooting guide** first
2. **Review Supabase logs**:
   - Dashboard → Logs → Postgres Logs
3. **Check error messages** carefully - they usually indicate the exact problem
4. **Copy full error output** for support requests
5. **Contact**:
   - Supabase Support: https://supabase.com/support
   - Project Repository Issues
   - Community Discord

---

## 📚 Next Steps After Migration

Once migration is complete:

1. ✅ **Run verification script** (`scripts/verify-migration.sql`)
2. ✅ **Test database connection** (use `test-supabase.html`)
3. ✅ **Configure Row Level Security** (if using Supabase Auth)
4. ✅ **Set up automated backups** (Supabase dashboard)
5. ✅ **Continue to Phase 1, Task 1.4** (Metamask Wallet Integration)

---

## 📝 Migration Summary

**What You've Accomplished:**

✅ Complete database schema (17 tables)
✅ Performance optimization (45+ indexes)
✅ Business logic (7 functions, 8 triggers)
✅ Initial data (44 courses, 25+ achievements)
✅ Sample content (28+ lessons)
✅ Ready for development

**Your Web3Versity database is now fully configured and ready for the next phase!**

---

**Migration Guide Version:** 1.0.0
**Last Updated:** October 19, 2025
**Project:** Web3Versity - Hedera Africa Hackathon 2025
