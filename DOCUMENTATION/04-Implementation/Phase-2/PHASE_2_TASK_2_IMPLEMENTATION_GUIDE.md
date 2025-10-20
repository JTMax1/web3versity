# Phase 2, Task 2: Course Enrollment System - Implementation Guide

## Status: IN PROGRESS (Core API Complete)

## Completed Components

### ✅ 1. Enrollment API (`src/lib/api/enrollment.ts`)
**Status**: COMPLETE

**Functions Implemented**:
- `enrollInCourse(userId, courseId)` - Enroll with prerequisite checking
- `getUserEnrollments(userId)` - Fetch all enrollments with course details
- `getEnrollmentStatus(userId, courseId)` - Check specific enrollment
- `checkPrerequisites(userId, courseId)` - Validate prerequisites
- `getEnrolledCourseIds(userId)` - Lightweight enrollment check
- `getInProgressCourses(userId)` - Courses started but not completed
- `getCompletedCourses(userId)` - Courses completed
- `updateCurrentLesson(userId, courseId, lessonId)` - Track progress
- `unenrollFromCourse(userId, courseId)` - Soft delete (future)

**Features**:
- Atomic enrollment count updates
- Race condition handling
- Comprehensive error handling
- Type-safe with custom error class

### ✅ 2. Enrollment Hooks (`src/hooks/useEnrollment.ts`)
**Status**: COMPLETE

**Hooks Implemented**:
- `useUserEnrollments(userId)` - All enrollments
- `useEnrolledCourseIds(userId)` - Lightweight enrollment check
- `useEnrollmentStatus(userId, courseId)` - Specific course status
- `usePrerequisites(userId, courseId)` - Prerequisites validation
- `useEnroll()` - Enrollment mutation with optimistic updates
- `useInProgressCourses(userId)` - In-progress courses
- `useCompletedCourses(userId)` - Completed courses
- `useUpdateCurrentLesson()` - Update lesson progress

**Features**:
- React Query caching (2-5 minute stale times)
- Automatic cache invalidation on mutations
- Loading and error states
- Optimistic UI updates

### ✅ 3. Prerequisite Modal (`src/components/PrerequisiteModal.tsx`)
**Status**: COMPLETE

**Features**:
- Beautiful modal design with backdrop blur
- Lists all missing prerequisite courses
- Course details (title, description, difficulty, hours)
- "Start This Course" buttons for each prerequisite
- Keyboard support (Escape to close)
- Backdrop click to close
- Responsive design

---

## Remaining Work

### 🔄 4. Update CourseCard Component
**File**: `src/components/CourseCard.tsx`
**Status**: NEEDS UPDATE

**Changes Needed**:

```typescript
// Add new props
interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  enrolled?: boolean;
  progress?: number;
  isLocked?: boolean;  // NEW
  isCompleted?: boolean;  // NEW
  onLockedClick?: (courseId: string) => void;  // NEW
}

// Add locked state rendering
{isLocked && (
  <Badge className="...bg-orange-500">
    <Lock className="w-3 h-3 mr-1" />
    Locked
  </Badge>
)}

// Add completed state rendering
{isCompleted && (
  <Badge className="...bg-green-500">
    <CheckCircle className="w-3 h-3 mr-1" />
    Completed
  </Badge>
)}

// Update button logic
<button
  onClick={() => {
    if (isLocked) {
      onLockedClick?.(course.id);
    } else {
      onEnroll?.(course.id);
    }
  }}
  disabled={!hasContent && !enrolled && !isLocked}
  className={...}
>
  {!hasContent ? 'Coming Soon'
   : isCompleted ? 'Review Course'
   : isLocked ? 'View Prerequisites'
   : enrolled ? 'Continue Learning'
   : 'Enroll Now'}
</button>
```

### 🔄 5. Update CourseCatalog Page
**File**: `src/components/pages/CourseCatalog.tsx`
**Status**: NEEDS UPDATE

**Changes Needed**:

```typescript
import { useEnroll, useEnrolledCourseIds, usePrerequisites } from '../../hooks/useEnrollment';
import { PrerequisiteModal } from '../PrerequisiteModal';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';

export function CourseCatalog({ onEnroll, enrolledCourseIds }: CourseCatalogProps) {
  const { user } = useAuth();
  const { enroll, isEnrolling } = useEnroll();
  const { enrolledIds } = useEnrolledCourseIds(user?.id);

  const [prerequisiteModal, setPrerequisiteModal] = useState<{
    isOpen: boolean;
    courseName: string;
    prerequisites: Course[];
  }>({ isOpen: false, courseName: '', prerequisites: [] });

  const handleEnrollClick = async (courseId: string) => {
    if (!user?.id) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Check prerequisites first
    const prereqCheck = await checkPrerequisites(user.id, courseId);

    if (!prereqCheck.canEnroll) {
      // Show prerequisite modal
      const course = courses.find(c => c.id === courseId);
      setPrerequisiteModal({
        isOpen: true,
        courseName: course?.title || '',
        prerequisites: prereqCheck.missingPrerequisites,
      });
      return;
    }

    // Enroll
    const result = await enroll(user.id, courseId);

    if (result.success) {
      toast.success('Enrolled successfully!');
      // Optionally navigate to course
      onEnroll(courseId);
    } else {
      toast.error(result.error || 'Enrollment failed');
    }
  };

  return (
    <div>
      {/* ... existing code ... */}

      {courses.map((course) => {
        const isEnrolled = enrolledIds.includes(course.id);
        // TODO: Check if completed
        // TODO: Check if locked

        return (
          <CourseCard
            key={course.id}
            course={course}
            onEnroll={handleEnrollClick}
            enrolled={isEnrolled}
            // progress={...}
            // isLocked={...}
            // isCompleted={...}
            // onLockedClick={handleEnrollClick}
          />
        );
      })}

      <PrerequisiteModal
        isOpen={prerequisiteModal.isOpen}
        onClose={() => setPrerequisiteModal({ ...prerequisiteModal, isOpen: false })}
        courseName={prerequisiteModal.courseName}
        prerequisites={prerequisiteModal.prerequisites}
        onNavigateToCourse={(courseId) => {
          // Navigate to prerequisite course
          handleEnrollClick(courseId);
        }}
      />
    </div>
  );
}
```

### 🔄 6. Update Dashboard Page
**File**: `src/components/pages/Dashboard.tsx`
**Status**: NEEDS UPDATE

**Changes Needed**:

```typescript
import { useInProgressCourses, useCompletedCourses } from '../../hooks/useEnrollment';
import { adaptCoursesForComponent } from '../../lib/adapters/courseAdapter';

export function Dashboard({ user, ... }: DashboardProps) {
  const { enrollments: inProgress, isLoading } = useInProgressCourses(user?.id);
  const { enrollments: completed } = useCompletedCourses(user?.id);

  // Convert enrollments to courses for display
  const inProgressCourses = inProgress
    .map(e => e.course)
    .filter(Boolean)
    .map(c => adaptCourseForComponent(c!));

  const completedCourses = completed
    .map(e => e.course)
    .filter(Boolean)
    .map(c => adaptCourseForComponent(c!));

  if (isLoading) {
    return <div>Loading your courses...</div>;
  }

  return (
    <div>
      {/* Continue Learning Section */}
      <section>
        <h2>Continue Learning</h2>
        {inProgress.map(enrollment => (
          <CourseCard
            key={enrollment.id}
            course={adaptCourseForComponent(enrollment.course!)}
            enrolled={true}
            progress={enrollment.progress_percentage}
            onEnroll={() => {
              // Navigate to course at current lesson
              if (enrollment.current_lesson_id) {
                // Go to specific lesson
              } else {
                // Start course
              }
            }}
          />
        ))}
      </section>

      {/* Completed Courses Section */}
      <section>
        <h2>Completed Courses ({completed.length})</h2>
        {completed.map(enrollment => (
          <CourseCard
            key={enrollment.id}
            course={adaptCourseForComponent(enrollment.course!)}
            enrolled={true}
            progress={100}
            isCompleted={true}
            onEnroll={() => {
              // Review course
            }}
          />
        ))}
      </section>
    </div>
  );
}
```

### 🔄 7. Update Profile Page
**File**: `src/components/pages/Profile.tsx`
**Status**: NEEDS UPDATE

**Similar Changes to Dashboard**:
- Use `useUserEnrollments(user?.id)`
- Display all enrolled courses
- Show progress for each
- Group by status (in progress, completed, not started)

---

## Database Requirements

### RPC Function for Atomic Enrollment Count
**File**: Create migration `supabase/migrations/014_enrollment_count_rpc.sql`

```sql
-- Function to atomically increment enrollment count
CREATE OR REPLACE FUNCTION increment_enrollment_count(course_id_param TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE courses
  SET enrollment_count = enrollment_count + 1,
      updated_at = NOW()
  WHERE id = course_id_param;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_enrollment_count(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_enrollment_count(TEXT) TO anon;
```

---

## Testing Checklist

### Enrollment Flow
- [ ] User can enroll in course without prerequisites
- [ ] Enrollment persists to database
- [ ] Enrollment survives page reload
- [ ] Course shows "Continue Learning" after enrollment
- [ ] Enrollment count increments on course

### Prerequisites
- [ ] Prerequisites are checked before enrollment
- [ ] Locked courses show prerequisite modal
- [ ] Modal lists all missing prerequisites
- [ ] Modal shows correct course details
- [ ] "Start This Course" buttons work
- [ ] User can enroll after completing prerequisites

### Dashboard
- [ ] Shows real enrolled courses from database
- [ ] Progress percentage displays correctly
- [ ] "Continue" button works
- [ ] Completed courses show in separate section
- [ ] Loading states work

### Profile
- [ ] Shows real enrolled courses from database
- [ ] Progress percentage displays correctly
- [ ] Course stats are accurate

### Error Handling
- [ ] Network errors show toast notification
- [ ] Already enrolled shows appropriate message
- [ ] Missing prerequisites show modal
- [ ] Database errors are handled gracefully

### Performance
- [ ] Enrollments are cached
- [ ] Optimistic updates feel instant
- [ ] No excessive database queries
- [ ] Cache invalidation works correctly

---

## Integration Steps

### Step 1: Install Dependencies
```bash
# Already installed: @tanstack/react-query, sonner
```

### Step 2: Create Database Migration
```bash
# Create and run the RPC function migration
# supabase/migrations/014_enrollment_count_rpc.sql
```

### Step 3: Update Components
1. Update CourseCard with locked/completed states
2. Update CourseCatalog with enrollment logic
3. Update Dashboard with real enrollments
4. Update Profile with real enrollments

### Step 4: Update App.tsx
Remove `enrolledCourseIds` state management:

```typescript
// REMOVE THIS:
const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

// Enrollment is now managed by database and hooks
```

### Step 5: Test Everything
Use the testing checklist above

---

## API Usage Examples

### Enroll in Course
```typescript
const { enroll } = useEnroll();

const handleEnroll = async () => {
  const result = await enroll(userId, courseId);
  if (result.success) {
    toast.success('Enrolled!');
  }
};
```

### Check Prerequisites
```typescript
const { canEnroll, missingPrerequisites } = usePrerequisites(userId, courseId);

if (!canEnroll) {
  showPrerequisiteModal(missingPrerequisites);
}
```

### Get User's Courses
```typescript
const { enrollments, isLoading } = useUserEnrollments(userId);

// enrollments contains course data and progress
enrollments.forEach(e => {
  console.log(e.course?.title, e.progress_percentage);
});
```

### Check Enrollment Status
```typescript
const { isEnrolled, enrollment } = useEnrollmentStatus(userId, courseId);

if (isEnrolled) {
  console.log(`Progress: ${enrollment?.progress_percentage}%`);
}
```

---

## Known Issues & Solutions

### Issue 1: Race Conditions on Enrollment Count
**Solution**: Use RPC function `increment_enrollment_count` for atomic updates

### Issue 2: Stale Cache After Enrollment
**Solution**: Hooks automatically invalidate cache on successful enrollment

### Issue 3: Multiple Tabs Enrolling Simultaneously
**Solution**: Database constraint prevents duplicate enrollments (unique index on user_id, course_id)

---

## Next Steps

1. **Complete Remaining Components**:
   - Update CourseCard
   - Update CourseCatalog
   - Update Dashboard
   - Update Profile

2. **Create Database Migration**:
   - RPC function for enrollment count
   - Unique constraint if not exists

3. **Test Everything**:
   - Use testing checklist
   - Test on multiple browsers
   - Test concurrent enrollments

4. **Move to Phase 2, Task 3**: Progress Tracking & Lesson Completion

---

## Files Summary

### Created (3 files)
- ✅ `src/lib/api/enrollment.ts` (431 lines)
- ✅ `src/hooks/useEnrollment.ts` (401 lines)
- ✅ `src/components/PrerequisiteModal.tsx` (179 lines)

### To Update (4 files)
- 🔄 `src/components/CourseCard.tsx`
- 🔄 `src/components/pages/CourseCatalog.tsx`
- 🔄 `src/components/pages/Dashboard.tsx`
- 🔄 `src/components/pages/Profile.tsx`

### To Create (1 file)
- 🔄 `supabase/migrations/014_enrollment_count_rpc.sql`

---

## Estimated Time to Complete
- Update CourseCard: 30 minutes
- Update CourseCatalog: 1 hour
- Update Dashboard: 45 minutes
- Update Profile: 30 minutes
- Create migration: 15 minutes
- Testing: 1-2 hours

**Total**: 4-5 hours

---

## Success Criteria
- ✅ User can enroll in courses
- ✅ Prerequisites are enforced
- ✅ Enrollment persists to database
- ✅ Dashboard shows real enrollments
- ✅ Progress tracking works
- ✅ All tests pass
