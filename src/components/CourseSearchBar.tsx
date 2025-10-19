/**
 * Course Search Bar Component
 *
 * A debounced search input for filtering courses by title and description.
 * Includes clear button and loading indicator.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface CourseSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  isLoading?: boolean;
}

// ============================================================================
// Course Search Bar Component
// ============================================================================

export function CourseSearchBar({
  value,
  onChange,
  placeholder = 'Search courses by title or description...',
  debounceMs = 300,
  isLoading = false,
}: CourseSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Debounce the onChange callback
  useEffect(() => {
    if (localValue === value) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      onChange(localValue);
      setIsDebouncing(false);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [localValue, value, onChange, debounceMs]);

  // Update local value when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange('');
  }, [onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const showClearButton = localValue.length > 0;
  const showLoadingSpinner = isLoading || isDebouncing;

  return (
    <div className="relative">
      {/* Search Icon */}
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

      {/* Search Input */}
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-4 bg-gray-50 rounded-2xl border-0 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:shadow-[inset_0_2px_8px_rgba(0,132,199,0.15)] focus:outline-none focus:ring-2 focus:ring-[#0084C7]/20 transition-all"
        aria-label="Search courses"
      />

      {/* Right Icons (Loading Spinner or Clear Button) */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {showLoadingSpinner && (
          <Loader2 className="w-5 h-5 text-[#0084C7] animate-spin" />
        )}
        {showClearButton && !showLoadingSpinner && (
          <button
            onClick={handleClear}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Clear search"
            type="button"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Hint Text */}
      {localValue.length > 0 && localValue.length < 3 && (
        <p className="mt-2 text-sm text-gray-500">
          Type at least 3 characters to search
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Debounce Hook (Alternative Implementation)
// ============================================================================

/**
 * Custom hook for debouncing a value
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 *
 * @example
 * ```tsx
 * function SearchComponent() {
 *   const [search, setSearch] = useState('');
 *   const debouncedSearch = useDebounce(search, 300);
 *
 *   useEffect(() => {
 *     // This will only run 300ms after the user stops typing
 *     fetchResults(debouncedSearch);
 *   }, [debouncedSearch]);
 *
 *   return <input value={search} onChange={(e) => setSearch(e.target.value)} />;
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
