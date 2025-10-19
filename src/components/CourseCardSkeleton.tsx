/**
 * Course Card Skeleton Component
 *
 * A loading skeleton placeholder for course cards.
 * Mimics the layout of the actual CourseCard component.
 */

import React from 'react';

// ============================================================================
// Course Card Skeleton
// ============================================================================

export function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="w-16 h-16 rounded-2xl bg-gray-200 mb-4" />

      {/* Badge Skeleton */}
      <div className="absolute top-6 right-6">
        <div className="w-20 h-6 rounded-full bg-gray-200" />
      </div>

      {/* Title Skeleton */}
      <div className="mb-2 space-y-2">
        <div className="h-6 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-6 bg-gray-200 rounded-lg w-1/2" />
      </div>

      {/* Description Skeleton */}
      <div className="mb-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>

      {/* Metadata Skeleton */}
      <div className="flex items-center gap-4 mb-4">
        <div className="h-4 w-12 bg-gray-200 rounded" />
        <div className="h-4 w-12 bg-gray-200 rounded" />
        <div className="h-4 w-16 bg-gray-200 rounded" />
      </div>

      {/* Difficulty Skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-gray-200" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>

      {/* Button Skeleton */}
      <div className="h-12 bg-gray-200 rounded-2xl w-full mb-3" />

      {/* Lessons Count Skeleton */}
      <div className="h-4 bg-gray-200 rounded w-24 mx-auto" />
    </div>
  );
}

// ============================================================================
// Course Grid Skeleton
// ============================================================================

interface CourseGridSkeletonProps {
  count?: number;
}

/**
 * Renders a grid of course card skeletons
 *
 * @param count - Number of skeleton cards to render (default: 6)
 *
 * @example
 * ```tsx
 * function CourseList() {
 *   const { courses, isLoading } = useCourses();
 *
 *   if (isLoading) {
 *     return <CourseGridSkeleton count={9} />;
 *   }
 *
 *   return <div>{courses.map(course => ...)}</div>;
 * }
 * ```
 */
export function CourseGridSkeleton({ count = 6 }: CourseGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </div>
  );
}

// ============================================================================
// Shimmer Effect (Optional Enhancement)
// ============================================================================

/**
 * A shimmer effect overlay for skeleton components
 * Add this to the parent container for a more polished loading animation
 *
 * @example
 * ```tsx
 * <div className="relative">
 *   <CourseCardSkeleton />
 *   <ShimmerOverlay />
 * </div>
 * ```
 */
export function ShimmerOverlay() {
  return (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  );
}

// Add this to your Tailwind config for the shimmer animation:
// animation: {
//   shimmer: 'shimmer 2s infinite',
// },
// keyframes: {
//   shimmer: {
//     '100%': { transform: 'translateX(100%)' },
//   },
// },
