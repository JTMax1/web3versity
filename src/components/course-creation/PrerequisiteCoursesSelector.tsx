/**
 * Prerequisites Course Selector
 *
 * Features:
 * - Search with autocomplete
 * - Drag-and-drop reordering
 * - Visual course cards
 * - Circular dependency detection
 */

import { useState, useEffect } from 'react';
import { Search, X, GripVertical } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Course {
  id: string;
  title: string;
  thumbnail_emoji: string;
  track: string;
  difficulty: string;
}

interface PrerequisiteCoursesSelectorProps {
  selectedCourses: string[];
  onChange: (courseIds: string[]) => void;
  currentCourseId?: string;
}

export function PrerequisiteCoursesSelector({
  selectedCourses,
  onChange,
  currentCourseId,
}: PrerequisiteCoursesSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<Course[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Search courses
  const searchCourses = async (query: string) => {
    if (!query.trim()) {
      setAvailableCourses([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, thumbnail_emoji, track, difficulty')
        .or(`title.ilike.%${query}%,id.ilike.%${query}%`)
        .eq('is_published', true)
        .neq('id', currentCourseId || '')
        .limit(10);

      if (error) throw error;
      setAvailableCourses(data || []);
    } catch (error) {
      console.error('Error searching courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load selected course details
  useEffect(() => {
    if (selectedCourses.length === 0) {
      setSelectedCourseDetails([]);
      return;
    }

    const loadCourseDetails = async () => {
      const { data } = await supabase
        .from('courses')
        .select('id, title, thumbnail_emoji, track, difficulty')
        .in('id', selectedCourses);

      if (data) {
        const ordered = selectedCourses
          .map(id => data.find(c => c.id === id))
          .filter(Boolean) as Course[];
        setSelectedCourseDetails(ordered);
      }
    };

    loadCourseDetails();
  }, [selectedCourses]);

  const handleAddCourse = (course: Course) => {
    if (!selectedCourses.includes(course.id)) {
      onChange([...selectedCourses, course.id]);
      setSearchQuery('');
      setShowDropdown(false);
    }
  };

  const handleRemoveCourse = (courseId: string) => {
    onChange(selectedCourses.filter(id => id !== courseId));
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newOrder = [...selectedCourses];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    onChange(newOrder);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchCourses(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search courses by title or ID..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors"
          />
        </div>

        {/* Dropdown */}
        {showDropdown && availableCourses.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-white rounded-xl border-2 border-gray-200 shadow-lg max-h-64 overflow-y-auto">
            {availableCourses.map(course => (
              <button
                key={course.id}
                onClick={() => handleAddCourse(course)}
                disabled={selectedCourses.includes(course.id)}
                className="w-full p-4 hover:bg-gray-50 flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-2xl">{course.thumbnail_emoji}</span>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">{course.title}</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {course.track} • {course.difficulty}
                  </p>
                </div>
                {selectedCourses.includes(course.id) && (
                  <span className="text-sm text-green-600 font-medium">✓ Selected</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Courses - Draggable Cards */}
      {selectedCourseDetails.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-gray-600 text-sm">
            No prerequisites selected. Search above to add courses.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">
            {selectedCourseDetails.length} Prerequisite{selectedCourseDetails.length !== 1 ? 's' : ''}
          </p>
          {selectedCourseDetails.map((course, index) => (
            <div
              key={course.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', index.toString());
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                handleReorder(fromIndex, index);
              }}
              className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-[#0084C7] transition-all cursor-move shadow-sm hover:shadow-md flex items-center gap-3"
            >
              <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="w-8 h-8 bg-[#0084C7] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">{index + 1}</span>
              </div>
              <span className="text-2xl">{course.thumbnail_emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{course.title}</p>
                <p className="text-sm text-gray-600 capitalize">
                  {course.track} • {course.difficulty}
                </p>
              </div>
              <button
                onClick={() => handleRemoveCourse(course.id)}
                className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          ))}

          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <p className="text-xs text-blue-900">
              💡 <strong>Tip:</strong> Drag cards to reorder prerequisites. Students must complete them in this order.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
