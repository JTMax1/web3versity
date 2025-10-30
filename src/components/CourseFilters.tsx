/**
 * Course Filters Component
 *
 * A comprehensive filter panel for the course catalog.
 * Includes track, difficulty, category, and sorting options.
 */

import React from 'react';
import { X } from 'lucide-react';
import type { CourseTrack, CourseDifficulty } from '../lib/supabase/types';
import type { CourseSortBy, SortOrder } from '../lib/api/courses';
import { useCourseCategories } from '../hooks/useCourses';

// ============================================================================
// Types
// ============================================================================

export interface FilterState {
  track: CourseTrack | 'all';
  difficulty: CourseDifficulty | 'all';
  category: string;
  sortBy: CourseSortBy;
  sortOrder: SortOrder;
}

interface CourseFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

// ============================================================================
// Course Filters Component
// ============================================================================

export function CourseFilters({ filters, onFilterChange, onClearFilters }: CourseFiltersProps) {
  const { categories, isLoading: categoriesLoading } = useCourseCategories();

  // Count active filters
  const activeFilterCount = [
    filters.track !== 'all',
    filters.difficulty !== 'all',
    filters.category !== '',
    filters.sortBy !== 'created_at' || filters.sortOrder !== 'desc',
  ].filter(Boolean).length;

  const handleTrackChange = (track: CourseTrack | 'all') => {
    onFilterChange({ ...filters, track });
  };

  const handleDifficultyChange = (difficulty: CourseDifficulty | 'all') => {
    onFilterChange({ ...filters, difficulty });
  };

  const handleCategoryChange = (category: string) => {
    onFilterChange({ ...filters, category });
  };

  // ✅ Updated: toggles asc/desc for same sort type
  const handleSortChange = (sortBy: CourseSortBy) => {
    if (filters.sortBy === sortBy) {
      // Toggle sort order when the same button is clicked
      onFilterChange({
        ...filters,
        sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
      });
    } else {
      // When switching sort type, reset order depending on type
      onFilterChange({
        ...filters,
        sortBy,
        sortOrder: sortBy === 'title' ? 'asc' : 'desc',
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 lg:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
      {/* Single Line Layout - Wraps responsively */}
      <div className="flex flex-wrap items-center gap-3 lg:gap-4">
        {/* Filters Label with Badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <h3 className="text-sm lg:text-base font-semibold text-gray-900">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white text-xs rounded-full shadow-[0_2px_8px_rgba(0,132,199,0.3)]">
              {activeFilterCount}
            </span>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="hidden lg:block h-8 w-px bg-gray-200"></div>

        {/* Track Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterButton
            label="All"
            active={filters.track === 'all'}
            onClick={() => handleTrackChange('all')}
            compact
          />
          <FilterButton
            label="Explorer"
            active={filters.track === 'explorer'}
            onClick={() => handleTrackChange('explorer')}
            color="green"
            compact
          />
          <FilterButton
            label="Developer"
            active={filters.track === 'developer'}
            onClick={() => handleTrackChange('developer')}
            color="purple"
            compact
          />
        </div>

        {/* Vertical Divider */}
        <div className="hidden lg:block h-8 w-px bg-gray-200"></div>

        {/* Difficulty Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterButton
            label="All Levels"
            active={filters.difficulty === 'all'}
            onClick={() => handleDifficultyChange('all')}
            compact
          />
          <FilterButton
            label="Beginner"
            active={filters.difficulty === 'beginner'}
            onClick={() => handleDifficultyChange('beginner')}
            color="green"
            compact
          />
          <FilterButton
            label="Intermediate"
            active={filters.difficulty === 'intermediate'}
            onClick={() => handleDifficultyChange('intermediate')}
            color="orange"
            compact
          />
          <FilterButton
            label="Advanced"
            active={filters.difficulty === 'advanced'}
            onClick={() => handleDifficultyChange('advanced')}
            color="red"
            compact
          />
        </div>

        {/* Vertical Divider */}
        <div className="hidden lg:block h-8 w-px bg-gray-200"></div>

        {/* Category Dropdown */}
        <select
          value={filters.category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          disabled={categoriesLoading}
          className="px-3 py-2 lg:px-4 lg:py-2 bg-gray-50 rounded-full border-0 text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:shadow-[inset_0_2px_4px_rgba(0,132,199,0.15)] focus:outline-none focus:ring-2 focus:ring-[#0084C7]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {/* Vertical Divider */}
        <div className="hidden lg:block h-8 w-px bg-gray-200"></div>

        {/* Sort Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterButton
            label="Popular"
            active={filters.sortBy === 'enrollment_count'}
            onClick={() => handleSortChange('enrollment_count')}
            color="blue"
            compact
          />
          <FilterButton
            label="Rated"
            active={filters.sortBy === 'average_rating'}
            onClick={() => handleSortChange('average_rating')}
            color="blue"
            compact
          />
          <FilterButton
            label="Newest"
            active={filters.sortBy === 'created_at'}
            onClick={() => handleSortChange('created_at')}
            color="blue"
            compact
          />
          <FilterButton
            label={
              filters.sortBy === 'title'
                ? filters.sortOrder === 'asc'
                  ? 'A-Z'
                  : 'Z-A'
                : 'A-Z'
            }
            active={filters.sortBy === 'title'}
            onClick={() => handleSortChange('title')}
            color="blue"
            compact
          />
        </div>

        {/* Clear All Button - Pushes to end on larger screens */}
        {activeFilterCount > 0 && (
          <>
            <div className="hidden lg:block flex-1"></div>
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1.5 px-3 py-2 lg:px-4 lg:py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-all"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}


// ============================================================================
// Filter Button Component
// ============================================================================

interface FilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  compact?: boolean;
}

function FilterButton({ label, active, onClick, color = 'blue', compact = false }: FilterButtonProps) {
  const colorClasses = {
    blue: 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8]',
    green: 'bg-gradient-to-r from-green-500 to-emerald-500',
    purple: 'bg-gradient-to-r from-purple-500 to-violet-500',
    orange: 'bg-gradient-to-r from-orange-500 to-amber-500',
    red: 'bg-gradient-to-r from-red-500 to-rose-500',
  };

  const sizeClasses = compact
    ? 'px-3 py-2 text-xs lg:text-sm'
    : 'px-4 py-2 text-sm';

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses} rounded-full font-medium transition-all whitespace-nowrap ${
        active
          ? `${colorClasses[color]} text-white shadow-[0_4px_12px_rgba(0,0,0,0.15),inset_-2px_-2px_6px_rgba(0,0,0,0.1),inset_2px_2px_6px_rgba(255,255,255,0.2)]`
          : 'bg-gray-100 text-gray-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}
