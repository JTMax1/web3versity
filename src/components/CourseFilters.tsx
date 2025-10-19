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

  const handleSortChange = (sortBy: CourseSortBy) => {
    onFilterChange({ ...filters, sortBy });
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="px-3 py-1 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white text-sm rounded-full shadow-[0_4px_12px_rgba(0,132,199,0.3)]">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Track Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Track</label>
        <div className="flex flex-wrap gap-2">
          <FilterButton
            label="All Tracks"
            active={filters.track === 'all'}
            onClick={() => handleTrackChange('all')}
          />
          <FilterButton
            label="Explorer"
            active={filters.track === 'explorer'}
            onClick={() => handleTrackChange('explorer')}
            color="green"
          />
          <FilterButton
            label="Developer"
            active={filters.track === 'developer'}
            onClick={() => handleTrackChange('developer')}
            color="purple"
          />
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Difficulty</label>
        <div className="flex flex-wrap gap-2">
          <FilterButton
            label="All Levels"
            active={filters.difficulty === 'all'}
            onClick={() => handleDifficultyChange('all')}
          />
          <FilterButton
            label="Beginner"
            active={filters.difficulty === 'beginner'}
            onClick={() => handleDifficultyChange('beginner')}
            color="green"
          />
          <FilterButton
            label="Intermediate"
            active={filters.difficulty === 'intermediate'}
            onClick={() => handleDifficultyChange('intermediate')}
            color="orange"
          />
          <FilterButton
            label="Advanced"
            active={filters.difficulty === 'advanced'}
            onClick={() => handleDifficultyChange('advanced')}
            color="red"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
        <select
          value={filters.category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          disabled={categoriesLoading}
          className="w-full px-4 py-3 bg-gray-50 rounded-2xl border-0 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:shadow-[inset_0_2px_8px_rgba(0,132,199,0.15)] focus:outline-none focus:ring-2 focus:ring-[#0084C7]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Sort By</label>
        <div className="flex flex-wrap gap-2">
          <FilterButton
            label="Most Popular"
            active={filters.sortBy === 'enrollment_count'}
            onClick={() => handleSortChange('enrollment_count')}
            color="blue"
          />
          <FilterButton
            label="Highest Rated"
            active={filters.sortBy === 'average_rating'}
            onClick={() => handleSortChange('average_rating')}
            color="blue"
          />
          <FilterButton
            label="Newest"
            active={filters.sortBy === 'created_at'}
            onClick={() => handleSortChange('created_at')}
            color="blue"
          />
          <FilterButton
            label="Title (A-Z)"
            active={filters.sortBy === 'title'}
            onClick={() => handleSortChange('title')}
            color="blue"
          />
        </div>
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
}

function FilterButton({ label, active, onClick, color = 'blue' }: FilterButtonProps) {
  const colorClasses = {
    blue: 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8]',
    green: 'bg-gradient-to-r from-green-500 to-emerald-500',
    purple: 'bg-gradient-to-r from-purple-500 to-violet-500',
    orange: 'bg-gradient-to-r from-orange-500 to-amber-500',
    red: 'bg-gradient-to-r from-red-500 to-rose-500',
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
        active
          ? `${colorClasses[color]} text-white shadow-[0_4px_16px_rgba(0,0,0,0.15),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)]`
          : 'bg-gray-100 text-gray-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}
