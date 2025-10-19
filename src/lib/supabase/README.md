# Supabase Client Library

Type-safe Supabase client for Web3Versity with comprehensive error handling and API functions.

## Files

- **client.ts** - Supabase client initialization and configuration
- **types.ts** - TypeScript interfaces for all database tables
- **errors.ts** - Error handling utilities
- **api.ts** - High-level API functions for database operations
- **index.ts** - Re-exports for easy importing

## Quick Start

```typescript
import { supabase, getUserByWallet, createUser } from '@/lib/supabase';

// Get user by wallet address
const user = await getUserByWallet('0x1234...');

// Create a new user
const newUser = await createUser({
  evm_address: '0x1234...',
  username: 'Alice',
});
```

## Client Usage

### Basic Queries

```typescript
import { supabase, table } from '@/lib/supabase';

// Using the table helper
const { data, error } = await table('users')
  .select('*')
  .eq('evm_address', '0x1234...')
  .single();

// Direct supabase client
const { data, error } = await supabase
  .from('courses')
  .select('*')
  .order('created_at', { ascending: false });
```

### Helper Functions

```typescript
import { getSession, getCurrentUser, checkConnection } from '@/lib/supabase';

// Get current auth session
const session = await getSession();

// Get current authenticated user
const user = await getCurrentUser();

// Check database connection
const isConnected = await checkConnection();
```

### Development Utilities

```typescript
import { supabaseUtils } from '@/lib/supabase';

// Log configuration (development only)
supabaseUtils.logConfig();

// Test connection
await supabaseUtils.testConnection();

// Get table row count
const userCount = await supabaseUtils.getTableCount('users');

// Get all table statistics
const stats = await supabaseUtils.getStats();
```

## API Functions

### User Operations

```typescript
import {
  getUserByWallet,
  getUserByHederaId,
  createUser,
  updateUser,
  getLeaderboard,
} from '@/lib/supabase';

// Get user by EVM address
const user = await getUserByWallet('0x1234...');

// Get user by Hedera account ID
const user = await getUserByHederaId('0.0.7045900');

// Create new user
const newUser = await createUser({
  evm_address: '0x1234...',
  username: 'Alice',
  hedera_account_id: '0.0.12345',
});

// Update user
const updated = await updateUser(userId, {
  username: 'Alice Smith',
  total_xp: 1000,
});

// Get leaderboard
const topUsers = await getLeaderboard(100);
```

### Course Operations

```typescript
import {
  getCourses,
  getCourseById,
  getCoursePrerequisites,
} from '@/lib/supabase';

// Get all courses
const courses = await getCourses();

// Filter courses
const explorerCourses = await getCourses({
  track: 'explorer',
  difficulty: 'beginner',
});

// Search courses
const searchResults = await getCourses({
  search: 'blockchain',
});

// Get single course
const course = await getCourseById('hedera-basics-101');

// Get course prerequisites
const prereqs = await getCoursePrerequisites('hedera-advanced-201');
```

### Lesson Operations

```typescript
import { getLessonsByCourse, getLessonById } from '@/lib/supabase';

// Get all lessons for a course
const lessons = await getLessonsByCourse('hedera-basics-101');

// Get single lesson
const lesson = await getLessonById(lessonId);
```

### User Progress Operations

```typescript
import {
  getUserProgress,
  getUserCourseProgress,
  startCourse,
  getUserLessonCompletions,
  completLesson,
} from '@/lib/supabase';

// Get user's progress across all courses
const allProgress = await getUserProgress(userId);

// Get progress for specific course
const courseProgress = await getUserCourseProgress(userId, 'hedera-basics-101');

// Start a new course
const progress = await startCourse(userId, 'hedera-basics-101');

// Get completed lessons
const completions = await getUserLessonCompletions(userId, 'hedera-basics-101');

// Mark lesson as completed
const completion = await completLesson(userId, lessonId, 'hedera-basics-101', 85);
```

### Achievement Operations

```typescript
import { getAchievements, getUserAchievements } from '@/lib/supabase';

// Get all available achievements
const achievements = await getAchievements();

// Get user's unlocked achievements
const userAchievements = await getUserAchievements(userId);
```

### Streak Operations

```typescript
import { getUserStreak } from '@/lib/supabase';

// Get user's current streak
const streak = await getUserStreak(userId);
```

### Discussion Operations

```typescript
import { getDiscussions, getDiscussionReplies } from '@/lib/supabase';

// Get all discussions
const discussions = await getDiscussions();

// Filter discussions by course
const courseDiscussions = await getDiscussions({
  courseId: 'hedera-basics-101',
});

// Search discussions
const searchResults = await getDiscussions({
  search: 'smart contracts',
});

// Get replies
const replies = await getDiscussionReplies(discussionId);
```

### Faucet Operations

```typescript
import { getUserFaucetRequests, getLastFaucetRequest } from '@/lib/supabase';

// Get all faucet requests
const requests = await getUserFaucetRequests(userId);

// Get last faucet request
const lastRequest = await getLastFaucetRequest(userId);
```

### Transaction Operations

```typescript
import { getUserTransactions } from '@/lib/supabase';

// Get user's transaction history
const transactions = await getUserTransactions(userId);
```

### NFT Certificate Operations

```typescript
import { getUserNFTCertificates } from '@/lib/supabase';

// Get user's NFT certificates
const certificates = await getUserNFTCertificates(userId);
```

### Platform Settings Operations

```typescript
import { getPlatformSetting, getAllPlatformSettings } from '@/lib/supabase';

// Get single setting
const faucetAmount = await getPlatformSetting('faucet_amount_hbar');

// Get all settings
const allSettings = await getAllPlatformSettings();
```

### Helper Functions

```typescript
import {
  hasCompletedCourse,
  canAccessCourse,
  getCourseCompletionPercentage,
} from '@/lib/supabase';

// Check if user completed a course
const completed = await hasCompletedCourse(userId, 'hedera-basics-101');

// Check if user can access a course (prerequisites met)
const canAccess = await canAccessCourse(userId, 'hedera-advanced-201');

// Get course completion percentage
const percentage = await getCourseCompletionPercentage(userId, 'hedera-basics-101');
// Returns: 75 (meaning 75% complete)
```

## Error Handling

### Using Error Utilities

```typescript
import {
  handleSupabaseError,
  getErrorMessage,
  isErrorType,
  ERROR_CODES,
} from '@/lib/supabase';

try {
  const user = await getUserByWallet('0x1234...');
} catch (error) {
  // Convert to SupabaseError
  const supabaseError = handleSupabaseError(error);

  // Get user-friendly message
  const message = getErrorMessage(error);

  // Check error type
  if (isErrorType(error, ERROR_CODES.NOT_FOUND)) {
    console.log('User not found');
  }
}
```

### Available Error Codes

```typescript
ERROR_CODES.CONNECTION_ERROR  // Database connection failed
ERROR_CODES.TIMEOUT           // Operation timed out
ERROR_CODES.UNAUTHORIZED      // User not authenticated
ERROR_CODES.FORBIDDEN         // No permission
ERROR_CODES.SESSION_EXPIRED   // Auth session expired
ERROR_CODES.NOT_FOUND         // Resource not found
ERROR_CODES.DUPLICATE         // Unique constraint violation
ERROR_CODES.CONSTRAINT_VIOLATION // Data constraint violated
ERROR_CODES.INVALID_DATA      // Invalid input data
ERROR_CODES.QUERY_ERROR       // Database query failed
ERROR_CODES.TRANSACTION_ERROR // Transaction failed
ERROR_CODES.UNKNOWN           // Unknown error
```

### Retry Logic

```typescript
import { retryOnError } from '@/lib/supabase';

// Retry operation up to 3 times with exponential backoff
const result = await retryOnError(
  async () => {
    return await getUserByWallet('0x1234...');
  },
  3,  // max retries
  1000 // initial delay (ms)
);
```

### Safe Query Wrapper

```typescript
import { safeQuery } from '@/lib/supabase';

// Automatically handles errors and logs them
const users = await safeQuery(
  () => table('users').select('*'),
  'Fetching users' // context for logging
);
```

### Error Boundary Helper

```typescript
import { getErrorInfo } from '@/lib/supabase';

// In React error boundary
const errorInfo = getErrorInfo(error);

console.log(errorInfo.message);  // User-friendly message
console.log(errorInfo.code);     // Error code
console.log(errorInfo.details);  // Technical details
console.log(errorInfo.canRetry); // Whether retry makes sense
```

## TypeScript Types

All database types are fully typed:

```typescript
import type {
  User,
  UserInsert,
  UserUpdate,
  Course,
  Lesson,
  UserProgress,
  Achievement,
  // ... all other types
} from '@/lib/supabase';

// Insert type (for creating new records)
const newUser: UserInsert = {
  evm_address: '0x1234...',
  username: 'Alice',
};

// Update type (for updating existing records)
const updates: UserUpdate = {
  username: 'Alice Smith',
  total_xp: 1000,
};

// Full table type
const user: User = await getUserByWallet('0x1234...');
```

## Database Schema

See [Database-Schema.md](../../../DOCUMENTATION/03-Database/Database-Schema.md) for the complete database schema documentation.

## Best Practices

1. **Always use API functions** instead of direct queries when available:
   ```typescript
   // Good
   const user = await getUserByWallet('0x1234...');

   // Avoid (unless no API function exists)
   const { data } = await table('users').select('*').eq('evm_address', '0x1234...');
   ```

2. **Handle errors properly**:
   ```typescript
   try {
     const user = await getUserByWallet('0x1234...');
   } catch (error) {
     const message = getErrorMessage(error);
     console.error('Failed to get user:', message);
   }
   ```

3. **Use type-safe queries**:
   ```typescript
   // TypeScript will catch errors at compile time
   const user: User = await getUserByWallet('0x1234...');
   ```

4. **Check connection before critical operations**:
   ```typescript
   const isConnected = await checkConnection();
   if (!isConnected) {
     throw new Error('Database connection failed');
   }
   ```

5. **Use development utilities for debugging**:
   ```typescript
   if (env.IS_DEVELOPMENT) {
     await supabaseUtils.testConnection();
     const stats = await supabaseUtils.getStats();
     console.table(stats);
   }
   ```

## Testing

### Test Connection

```typescript
import { checkConnection, supabaseUtils } from '@/lib/supabase';

// Quick connection check
const isConnected = await checkConnection();

// Detailed connection test (development only)
await supabaseUtils.testConnection();
```

### Test Queries

```typescript
// Test creating a user
const testUser = await createUser({
  evm_address: '0xtest123...',
  username: 'TestUser',
});

// Test getting courses
const courses = await getCourses();
console.log(`Found ${courses.length} courses`);

// Test user progress
const progress = await startCourse(testUser.id, 'hedera-basics-101');
console.log('Started course:', progress);
```

## Environment Variables

Required environment variables (from `.env.local`):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

See [src/config/README.md](../../config/README.md) for more details.

## Migration

The database schema is managed by migrations in `DOCUMENTATION/03-Database/Database-Migrations.sql`.

To apply migrations:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the migration SQL
4. Execute the query

## Related Documentation

- [Environment Configuration](../../config/README.md)
- [Database Schema](../../../DOCUMENTATION/03-Database/Database-Schema.md)
- [SRS Document](../../../DOCUMENTATION/01-Requirements/SRS-Software-Requirements-Specification.md)
- [Phase-by-Phase Implementation Plan](../../../DOCUMENTATION/04-Implementation/PHASE-BY-PHASE-IMPLEMENTATION-PLAN.md)
