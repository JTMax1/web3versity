# Web3Versity Database Schema Diagram

## Complete Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CORE USER & LEARNING                         │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│      users       │◄────────│  user_progress   │────────►│     courses      │
├──────────────────┤   1:M   ├──────────────────┤   M:1   ├──────────────────┤
│ • id (PK)        │         │ • id (PK)        │         │ • id (PK)        │
│ • evm_address    │         │ • user_id (FK)   │         │ • title          │
│ • hedera_acct_id │         │ • course_id (FK) │         │ • description    │
│ • username       │         │ • enrollment_dt  │         │ • track          │
│ • avatar_emoji   │         │ • completed_at   │         │ • category       │
│ • total_xp       │         │ • progress_%     │         │ • difficulty     │
│ • current_level  │         │ • lessons_done   │         │ • est_hours      │
│ • current_streak │         │ • total_lessons  │         │ • total_lessons  │
│ • longest_streak │         │ • cert_nft_id    │         │ • completion_xp  │
│ • courses_done   │         └──────────────────┘         │ • is_published   │
│ • lessons_done   │                  │                   │ • is_featured    │
│ • badges_earned  │                  │                   └──────────────────┘
└──────────────────┘                  │                            │
         │                            │                            │
         │                            │                            │
         │                            ▼                            │
         │                   ┌──────────────────┐                 │
         │                   │lesson_completions│                 │
         │                   ├──────────────────┤                 │
         │                   │ • id (PK)        │                 │
         │                   │ • user_id (FK)   │                 │
         │                   │ • lesson_id (FK) │                 │
         │                   │ • course_id (FK) │                 │
         │                   │ • completed_at   │                 │
         │                   │ • score_%        │                 │
         │                   │ • xp_earned      │                 │
         │                   └──────────────────┘                 │
         │                            │                            │
         │                            │                            │
         │                            ▼                            │
         │                   ┌──────────────────┐                 │
         └───────────────────│     lessons      │◄────────────────┘
                             ├──────────────────┤      M:1
                             │ • id (PK)        │
                             │ • course_id (FK) │
                             │ • title          │
                             │ • lesson_type    │
                             │ • content (JSON) │
                             │ • sequence_num   │
                             │ • duration_min   │
                             │ • completion_xp  │
                             └──────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    COURSE PREREQUISITES                              │
└─────────────────────────────────────────────────────────────────────┘

          ┌──────────────────────────┐
          │ course_prerequisites     │
          ├──────────────────────────┤
          │ • id (PK)                │
          │ • course_id (FK)         │───► courses.id
          │ • prereq_course_id (FK)  │───► courses.id
          │ • is_required            │
          └──────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         GAMIFICATION                                 │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│  achievements    │◄────────│user_achievements │
├──────────────────┤   1:M   ├──────────────────┤
│ • id (PK)        │         │ • id (PK)        │
│ • name           │         │ • user_id (FK)   │────► users.id
│ • description    │         │ • achiev_id (FK) │
│ • icon_emoji     │         │ • earned_at      │
│ • category       │         │ • nft_token_id   │
│ • rarity         │         │ • nft_minted_at  │
│ • criteria (JSON)│         └──────────────────┘
│ • xp_reward      │
│ • times_earned   │
└──────────────────┘

┌──────────────────┐         ┌──────────────────┐
│  user_streaks    │         │leaderboard_cache │
├──────────────────┤         ├──────────────────┤
│ • id (PK)        │         │ • id (PK)        │
│ • user_id (FK)   │────►    │ • user_id (FK)   │────► users.id
│ • streak_date    │  users  │ • all_time_rank  │
│ • streak_count   │         │ • all_time_xp    │
│ • activity_type  │         │ • weekly_rank    │
└──────────────────┘         │ • weekly_xp      │
                             │ • monthly_rank   │
                             │ • monthly_xp     │
                             │ • calculated_at  │
                             └──────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           COMMUNITY                                  │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│   discussions    │◄────────│     replies      │
├──────────────────┤   1:M   ├──────────────────┤
│ • id (PK)        │         │ • id (PK)        │
│ • author_id (FK) │────►    │ • discussion_id  │
│ • course_id (FK) │  users  │ • author_id (FK) │────► users.id
│ • title          │         │ • parent_id (FK) │────► replies.id
│ • content        │         │ • content        │     (nested)
│ • category       │         │ • is_solution    │
│ • tags[]         │         │ • upvote_count   │
│ • is_pinned      │         └──────────────────┘
│ • is_solved      │                  │
│ • view_count     │                  │
│ • reply_count    │                  │
│ • upvote_count   │                  │
└──────────────────┘                  │
         │                            │
         │                            │
         └────────────┬───────────────┘
                      │
                      ▼
              ┌──────────────────┐
              │ discussion_votes │
              ├──────────────────┤
              │ • id (PK)        │
              │ • user_id (FK)   │────► users.id
              │ • discussion_id  │────► discussions.id
              │ • reply_id (FK)  │────► replies.id
              │ • vote_type      │ (upvote/downvote)
              └──────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     BLOCKCHAIN INTEGRATION                           │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│ faucet_requests  │         │   transactions   │
├──────────────────┤         ├──────────────────┤
│ • id (PK)        │         │ • id (PK)        │
│ • user_id (FK)   │────►    │ • user_id (FK)   │────► users.id
│ • hedera_acct_id │  users  │ • tx_id          │
│ • amount_hbar    │         │ • tx_type        │
│ • tx_id          │         │ • amount_hbar    │
│ • status         │         │ • from_account   │
│ • requested_at   │         │ • to_account     │
│ • completed_at   │         │ • status         │
│ • request_ip     │         │ • course_id (FK) │
└──────────────────┘         │ • achiev_id (FK) │
                             │ • consensus_ts   │
                             │ • hashscan_url   │
                             └──────────────────┘

┌──────────────────┐
│ nft_certificates │
├──────────────────┤
│ • id (PK)        │
│ • user_id (FK)   │────► users.id
│ • course_id (FK) │────► courses.id
│ • token_id       │
│ • collection_id  │
│ • serial_number  │
│ • metadata_uri   │
│ • cert_number    │
│ • issued_at      │
│ • tx_id (FK)     │────► transactions.tx_id
│ • course_title   │
│ • completion_dt  │
│ • verify_code    │
└──────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        CONFIGURATION                                 │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  platform_settings   │
├──────────────────────┤
│ • id (PK)            │
│ • setting_key        │ (UNIQUE)
│ • setting_value      │ (JSONB)
│ • description        │
│ • created_at         │
│ • updated_at         │
└──────────────────────┘
```

---

## Table Groups by Domain

### 🎓 Learning Domain (6 tables)
- `users` - User accounts
- `courses` - Course catalog
- `lessons` - Lesson content
- `course_prerequisites` - Course dependencies
- `user_progress` - Enrollment tracking
- `lesson_completions` - Completion records

### 🏆 Gamification Domain (4 tables)
- `achievements` - Badge definitions
- `user_achievements` - Earned badges
- `user_streaks` - Daily streaks
- `leaderboard_cache` - Rankings

### 💬 Community Domain (3 tables)
- `discussions` - Forum threads
- `replies` - Thread responses
- `discussion_votes` - Voting system

### ⛓️ Blockchain Domain (3 tables)
- `faucet_requests` - Testnet faucet
- `transactions` - Transaction log
- `nft_certificates` - NFT registry

### ⚙️ Configuration Domain (1 table)
- `platform_settings` - Global config

---

## Key Relationships

### One-to-Many (1:M)
```
users ────< user_progress
users ────< user_achievements
users ────< user_streaks
users ────< discussions
users ────< replies
users ────< faucet_requests
users ────< transactions
users ────< nft_certificates

courses ────< lessons
courses ────< user_progress
courses ────< course_prerequisites (both FK)

discussions ────< replies
discussions ────< discussion_votes

achievements ────< user_achievements
```

### Many-to-One (M:1)
```
user_progress ────> courses
user_progress ────> users

lesson_completions ────> users
lesson_completions ────> lessons
lesson_completions ────> courses

lessons ────> courses
```

### Self-Referencing
```
replies ────> replies (parent_reply_id)
  └─ Enables nested comment threads
```

### Many-to-Many (via junction tables)
```
users <────> courses
  (through user_progress)

users <────> achievements
  (through user_achievements)

courses <────> courses
  (through course_prerequisites)
```

---

## Data Flow Examples

### User Completes a Lesson

```
1. User views lesson
   └─ SELECT * FROM lessons WHERE id = 'lesson_id'

2. User finishes lesson
   └─ INSERT INTO lesson_completions (user_id, lesson_id, ...)
      └─ TRIGGER: update_course_progress()
         ├─ UPDATE user_progress SET lessons_completed++
         └─ IF course complete: UPDATE users SET courses_completed++

3. Award XP
   └─ CALL award_xp(user_id, xp_amount)
      ├─ UPDATE users SET total_xp += amount
      └─ UPDATE users SET current_level = calculate_user_level(xp)

4. Check achievements
   └─ CALL check_achievements(user_id)
      └─ IF criteria met: INSERT INTO user_achievements
         └─ CALL award_xp(user_id, achievement_xp_reward)
```

### Course Enrollment Flow

```
1. User browses catalog
   └─ SELECT * FROM v_course_catalog
      WHERE track = 'explorer' AND difficulty = 'beginner'

2. Check prerequisites
   └─ SELECT prerequisite_course_id
      FROM course_prerequisites
      WHERE course_id = 'target_course'

3. Verify prerequisites met
   └─ SELECT course_id FROM user_progress
      WHERE user_id = ? AND completed_at IS NOT NULL

4. Enroll in course
   └─ INSERT INTO user_progress (user_id, course_id, total_lessons)
      SELECT ?, ?, total_lessons FROM courses WHERE id = ?

5. Load first lesson
   └─ SELECT * FROM lessons
      WHERE course_id = ? ORDER BY sequence_number LIMIT 1
```

### Leaderboard Update Flow

```
1. Scheduled job runs
   └─ CALL refresh_leaderboard()

2. Calculate rankings
   └─ WITH ranked_users AS (
        SELECT id, total_xp,
               ROW_NUMBER() OVER (ORDER BY total_xp DESC) as rank
        FROM users WHERE is_active AND show_on_leaderboard
      )
      INSERT INTO leaderboard_cache ... ON CONFLICT UPDATE

3. Frontend queries cached data
   └─ SELECT * FROM leaderboard_cache ORDER BY all_time_rank LIMIT 10
```

---

## Index Strategy

### Primary Lookups
```
users:
  - evm_address (wallet login)
  - hedera_account_id (Hedera integration)
  - username (display)

courses:
  - track + difficulty + category (browsing)
  - enrollment_count (popularity)
  - average_rating (quality)

lessons:
  - course_id + sequence_number (ordered access)
```

### Composite Indexes
```
user_progress:
  - (user_id, completed_at) - User's completed courses
  - (user_id, last_accessed_at) - Active courses

lesson_completions:
  - (user_id, completed_at DESC) - Recent completions
  - (course_id) - Course analytics

leaderboard_cache:
  - (all_time_rank) - Rankings
  - (weekly_rank, week_start_date) - Weekly boards
```

### JSONB Indexes (GIN)
```
lessons:
  - content (GIN) - Search within lesson content

achievements:
  - criteria (GIN) - Query achievement conditions
```

---

## Views

### v_user_dashboard
Aggregates user stats for dashboard display:
- User info (username, avatar, XP, level, streak)
- Course counts (enrolled, completed)
- Recent achievements (JSON array)
- Leaderboard rank

### v_course_catalog
Enhanced course listing with:
- All course details
- Prerequisites array (JSON)
- Actual lesson count
- Filtered to published courses only

---

## Constraints & Validations

### CHECK Constraints
```sql
users:
  ✓ total_xp >= 0
  ✓ current_level BETWEEN 1 AND 100
  ✓ current_streak >= 0

courses:
  ✓ track IN ('explorer', 'developer')
  ✓ difficulty IN ('beginner', 'intermediate', 'advanced')
  ✓ estimated_hours > 0

user_progress:
  ✓ progress_percentage BETWEEN 0 AND 100

course_prerequisites:
  ✓ course_id != prerequisite_course_id (no self-reference)

discussion_votes:
  ✓ (discussion_id NOT NULL XOR reply_id NOT NULL)
```

### UNIQUE Constraints
```sql
users: evm_address, hedera_account_id, username
courses: id (primary key)
lessons: (course_id, sequence_number)
user_progress: (user_id, course_id)
lesson_completions: (user_id, lesson_id)
user_achievements: (user_id, achievement_id)
user_streaks: (user_id, streak_date)
```

---

## Performance Characteristics

| Operation | Expected Time | Notes |
|-----------|--------------|-------|
| User login | < 10ms | Indexed by evm_address |
| Course browse | < 50ms | Indexed by track/difficulty |
| Lesson load | < 20ms | Direct PK lookup |
| Progress update | < 100ms | Includes trigger execution |
| Leaderboard query | < 30ms | Pre-calculated cache |
| Achievement check | < 200ms | Multiple condition checks |

**Total Tables:** 17
**Total Indexes:** 45+
**Total Functions:** 7
**Total Triggers:** 8
**Total Views:** 2

---

## Storage Estimates

Based on expected usage:

| Table | Rows (1 year) | Size Est. | Notes |
|-------|--------------|-----------|-------|
| users | 10,000 | 5 MB | User base |
| courses | 100 | < 1 MB | Relatively static |
| lessons | 2,000 | 50 MB | JSONB content |
| user_progress | 100,000 | 20 MB | Avg 10 courses/user |
| lesson_completions | 500,000 | 50 MB | High activity |
| achievements | 50 | < 1 MB | Fixed set |
| user_achievements | 50,000 | 5 MB | Avg 5/user |
| discussions | 5,000 | 10 MB | Forum activity |
| replies | 20,000 | 20 MB | 4:1 reply ratio |
| transactions | 100,000 | 30 MB | All blockchain tx |
| **Total** | | **~200 MB** | With indexes: ~400 MB |

---

## Scalability Considerations

### Partitioning Candidates (future)
- `lesson_completions` - by date
- `transactions` - by date
- `user_streaks` - by date

### Archive Candidates (after 1 year)
- Old discussions (> 1 year inactive)
- Completed faucet requests (> 6 months)
- Transaction logs (> 1 year, keep summary)

### Read Replicas
- Leaderboard queries
- Course catalog browsing
- Public profile views

---

**Last Updated:** 2025-10-19
**Schema Version:** 1.0.0
**Status:** Production Ready ✅
