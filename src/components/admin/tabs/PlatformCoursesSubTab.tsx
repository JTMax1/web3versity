/**
 * Platform Courses Sub-Tab
 *
 * Manages all published and draft courses with:
 * - Advanced filtering (search, status, track, difficulty)
 * - Bulk actions (publish, draft, delete, mark coming soon)
 * - View toggle (card/table)
 * - Course actions menu per course
 */

import React, { useState } from 'react';
import { Search, Grid, List } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase/client';
import { CourseActionsMenu } from '../CourseActionsMenu';
import { useAdminCourseActions } from '../../../hooks/use-admin-course-actions';
import { Button } from '../../ui/button';

type StatusFilter = 'all' | 'published' | 'draft' | 'coming_soon';
type TrackFilter = 'all' | 'explorer' | 'developer';
type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';
type ViewMode = 'card' | 'table';

export function PlatformCoursesSubTab() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [trackFilter, setTrackFilter] = useState<TrackFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());

  const { bulkAction } = useAdminCourseActions();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin', 'platform-courses', statusFilter, trackFilter, difficultyFilter, search],
    queryFn: async () => {
      let query = supabase.from('courses').select('*').order('created_at', { ascending: false });

      // Apply filters
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (statusFilter === 'published') {
        query = query.eq('is_published', true).eq('is_coming_soon', false);
      } else if (statusFilter === 'draft') {
        query = query.eq('is_published', false);
      } else if (statusFilter === 'coming_soon') {
        query = query.eq('is_coming_soon', true);
      }

      if (trackFilter !== 'all') {
        query = query.eq('track', trackFilter);
      }

      if (difficultyFilter !== 'all') {
        query = query.eq('difficulty', difficultyFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleSelectAll = () => {
    if (selectedCourses.size === courses?.length) {
      setSelectedCourses(new Set());
    } else {
      setSelectedCourses(new Set(courses?.map(c => c.id) || []));
    }
  };

  const handleSelectCourse = (courseId: string) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
    }
    setSelectedCourses(newSelected);
  };

  const handleBulkAction = async (action: 'publish' | 'draft' | 'coming_soon' | 'delete') => {
    if (selectedCourses.size === 0) return;

    const confirmed = action === 'delete'
      ? window.confirm(`Are you sure you want to delete ${selectedCourses.size} course(s)? This cannot be undone.`)
      : true;

    if (!confirmed) return;

    await bulkAction({
      courseIds: Array.from(selectedCourses),
      action,
    });

    setSelectedCourses(new Set());
  };

  const getStatusBadge = (course: any) => {
    if (!course.is_published) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">Draft</span>;
    }
    if (course.is_coming_soon) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium">Coming Soon</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">Published</span>;
  };

  return (
    <div className="space-y-6">
      {/* Filters - Single Line */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0084C7]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0084C7]"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="coming_soon">Coming Soon</option>
          </select>

          {/* Track Filter */}
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value as TrackFilter)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0084C7]"
          >
            <option value="all">All Tracks</option>
            <option value="explorer">Explorer</option>
            <option value="developer">Developer</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as DifficultyFilter)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0084C7]"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* View Toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'card' ? 'bg-white text-[#0084C7] shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Card view"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white text-[#0084C7] shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Table view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCourses.size > 0 && (
        <div className="bg-[#0084C7] text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <span className="font-medium">{selectedCourses.size} course(s) selected</span>
          <div className="flex gap-2">
            <Button
              onClick={() => handleBulkAction('publish')}
              variant="outline"
              className="bg-white text-[#0084C7] border-white hover:bg-gray-100 rounded-xl"
            >
              Publish Selected
            </Button>
            <Button
              onClick={() => handleBulkAction('draft')}
              variant="outline"
              className="bg-white text-[#0084C7] border-white hover:bg-gray-100 rounded-xl"
            >
              Move to Draft
            </Button>
            <Button
              onClick={() => handleBulkAction('coming_soon')}
              variant="outline"
              className="bg-white text-[#0084C7] border-white hover:bg-gray-100 rounded-xl"
            >
              Mark Coming Soon
            </Button>
            <Button
              onClick={() => handleBulkAction('delete')}
              variant="outline"
              className="bg-red-600 text-white border-red-600 hover:bg-red-700 rounded-xl"
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Courses Display */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-[#0084C7] border-t-transparent rounded-full" />
        </div>
      ) : !courses || courses.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No courses found</div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border-2 ${
                selectedCourses.has(course.id) ? 'border-[#0084C7]' : 'border-transparent'
              }`}
            >
              {/* Selection Checkbox */}
              <div className="flex items-start justify-between mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCourses.has(course.id)}
                    onChange={() => handleSelectCourse(course.id)}
                    className="w-4 h-4 rounded border-gray-300 text-[#0084C7] focus:ring-[#0084C7]"
                  />
                  <div className="text-4xl">{course.thumbnail_emoji}</div>
                </label>
                <CourseActionsMenu course={course} />
              </div>

              {/* Course Info */}
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

              {/* Metadata */}
              <div className="flex flex-wrap gap-2 mb-3">
                {getStatusBadge(course)}
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium capitalize">
                  {course.track}
                </span>
                <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium capitalize">
                  {course.difficulty}
                </span>
                {course.is_featured && (
                  <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-medium">
                    Featured
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{course.enrollment_count} enrolled</span>
                <span>{course.total_lessons} lessons</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCourses.size === courses.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#0084C7] focus:ring-[#0084C7]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Course</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Track</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Difficulty</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Enrollments</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedCourses.has(course.id)}
                      onChange={() => handleSelectCourse(course.id)}
                      className="w-4 h-4 rounded border-gray-300 text-[#0084C7] focus:ring-[#0084C7]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{course.thumbnail_emoji}</div>
                      <div>
                        <div className="font-semibold text-gray-900">{course.title}</div>
                        <div className="text-xs text-gray-600">{course.total_lessons} lessons</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(course)}</td>
                  <td className="px-4 py-3">
                    <span className="capitalize text-gray-700">{course.track}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="capitalize text-gray-700">{course.difficulty}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{course.enrollment_count}</td>
                  <td className="px-4 py-3">
                    <CourseActionsMenu course={course} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
