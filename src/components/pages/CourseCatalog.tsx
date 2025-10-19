/**
 * Course Catalog Page Component
 *
 * Displays a filterable, searchable catalog of all courses.
 * Now fully database-driven with real-time filtering and caching.
 */

import React, { useState } from 'react';
import { CourseCard } from '../CourseCard';
import { CourseSearchBar } from '../CourseSearchBar';
import { CourseFilters, FilterState } from '../CourseFilters';
import { CourseGridSkeleton } from '../CourseCardSkeleton';
import { useCourses } from '../../hooks/useCourses';
import { Search, AlertCircle } from 'lucide-react';

// ============================================================================
// Props Interface
// ============================================================================

interface CourseCatalogProps {
  onEnroll: (courseId: string) => void;
  enrolledCourseIds: string[];
}

// ============================================================================
// Course Catalog Component
// ============================================================================

export function CourseCatalog({ onEnroll, enrolledCourseIds }: CourseCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    track: 'all',
    difficulty: 'all',
    category: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Fetch courses with current filters
  const { courses, isLoading, isError, error } = useCourses({
    track: filters.track === 'all' ? undefined : filters.track,
    difficulty: filters.difficulty === 'all' ? undefined : filters.difficulty,
    category: filters.category || undefined,
    search: searchQuery.trim() || undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });

  const handleClearFilters = () => {
    setFilters({
      track: 'all',
      difficulty: 'all',
      category: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">Course Catalog</h1>
          <p className="text-gray-600">Explore our comprehensive Web3 courses</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <CourseSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            isLoading={isLoading}
          />
        </div>

        {/* Filters */}
        <div className="mb-8">
          <CourseFilters
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Results Count */}
        {!isLoading && !isError && (
          <div className="mb-6 text-gray-600">
            Showing {courses.length} {courses.length === 1 ? 'course' : 'courses'}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div>
            <CourseGridSkeleton count={9} />
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="mb-2 text-red-900">Error Loading Courses</h3>
            <p className="text-red-600 mb-4">
              {error?.message || 'Failed to load courses. Please try again.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white rounded-2xl shadow-[0_4px_16px_rgba(0,132,199,0.3)] hover:shadow-[0_6px_24px_rgba(0,132,199,0.4)] transition-all"
            >
              Reload Page
            </button>
          </div>
        )}

        {/* Course Grid */}
        {!isLoading && !isError && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={onEnroll}
                enrolled={enrolledCourseIds.includes(course.id)}
                progress={enrolledCourseIds.includes(course.id) ? Math.random() * 100 : undefined}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && courses.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-3 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white rounded-2xl shadow-[0_4px_16px_rgba(0,132,199,0.3)] hover:shadow-[0_6px_24px_rgba(0,132,199,0.4)] transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
