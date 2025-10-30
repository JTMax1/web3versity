import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase/client';

export function PlatformCoursesSubTab() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'coming_soon'>('all');

  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin', 'platform-courses', statusFilter, search],
    queryFn: async () => {
      let query = supabase.from('courses').select('*').order('created_at', { ascending: false });

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0084C7]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0084C7]"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="coming_soon">Coming Soon</option>
        </select>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-[#0084C7] border-t-transparent rounded-full" />
          </div>
        ) : courses && courses.length > 0 ? (
          courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">{course.thumbnail_emoji}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{course.enrollment_count} enrolled</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                  Published
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-400">No courses found</div>
        )}
      </div>
    </div>
  );
}
