import React, { useState } from 'react';
import { Course } from '../../lib/mockData';
import { CourseCard } from '../CourseCard';
import { Search, Filter } from 'lucide-react';

interface CourseCatalogProps {
  courses: Course[];
  onEnroll: (courseId: string) => void;
  enrolledCourseIds: string[];
}

export function CourseCatalog({ courses, onEnroll, enrolledCourseIds }: CourseCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<'all' | 'explorer' | 'developer'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTrack = selectedTrack === 'all' || course.track === selectedTrack;
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesTrack && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">Course Catalog</h1>
          <p className="text-gray-600">Explore our comprehensive Web3 courses</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-3xl p-6 mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border-0 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] focus:shadow-[inset_0_2px_8px_rgba(0,132,199,0.15)] focus:outline-none focus:ring-2 focus:ring-[#0084C7]/20 transition-all"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-gray-600 mb-2">Track</label>
              <div className="flex gap-2">
                <FilterButton
                  label="All"
                  active={selectedTrack === 'all'}
                  onClick={() => setSelectedTrack('all')}
                />
                <FilterButton
                  label="Explorer"
                  active={selectedTrack === 'explorer'}
                  onClick={() => setSelectedTrack('explorer')}
                  color="green"
                />
                <FilterButton
                  label="Developer"
                  active={selectedTrack === 'developer'}
                  onClick={() => setSelectedTrack('developer')}
                  color="purple"
                />
              </div>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-gray-600 mb-2">Difficulty</label>
              <div className="flex gap-2">
                <FilterButton
                  label="All"
                  active={selectedDifficulty === 'all'}
                  onClick={() => setSelectedDifficulty('all')}
                />
                <FilterButton
                  label="Beginner"
                  active={selectedDifficulty === 'beginner'}
                  onClick={() => setSelectedDifficulty('beginner')}
                  color="green"
                />
                <FilterButton
                  label="Intermediate"
                  active={selectedDifficulty === 'intermediate'}
                  onClick={() => setSelectedDifficulty('intermediate')}
                  color="orange"
                />
                <FilterButton
                  label="Advanced"
                  active={selectedDifficulty === 'advanced'}
                  onClick={() => setSelectedDifficulty('advanced')}
                  color="red"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-600">
          Showing {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
        </div>

        {/* Course Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={onEnroll}
                enrolled={enrolledCourseIds.includes(course.id)}
                progress={enrolledCourseIds.includes(course.id) ? Math.random() * 100 : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({ 
  label, 
  active, 
  onClick, 
  color = 'blue' 
}: { 
  label: string; 
  active: boolean; 
  onClick: () => void; 
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8]',
    green: 'bg-gradient-to-r from-green-500 to-emerald-500',
    purple: 'bg-gradient-to-r from-purple-500 to-violet-500',
    orange: 'bg-gradient-to-r from-orange-500 to-amber-500',
    red: 'bg-gradient-to-r from-red-500 to-rose-500'
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm transition-all ${
        active
          ? `${colorClasses[color]} text-white shadow-[0_4px_16px_rgba(0,0,0,0.15),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)]`
          : 'bg-gray-100 text-gray-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}
