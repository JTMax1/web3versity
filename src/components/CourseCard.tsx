import React from 'react';
import { Badge } from './ui/badge';
import { type ComponentCourse as Course } from '../lib/adapters/courseAdapter';
import { getDifficultyColor } from '../lib/utils';
import { Star, Clock, Users, Lock, CheckCircle, Loader2 } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  enrolled?: boolean;
  progress?: number;
  isLocked?: boolean;
  isCompleted?: boolean;
  isEnrolling?: boolean;
  onLockedClick?: (courseId: string) => void;
}

export function CourseCard({
  course,
  onEnroll,
  enrolled,
  progress,
  isLocked,
  isCompleted,
  isEnrolling = false,
  onLockedClick
}: CourseCardProps) {
  const difficultyColor = getDifficultyColor(course.difficulty);

  // Course is available if it's not marked as "coming soon"
  const hasContent = !course.isComingSoon;

  // Courses with practical blockchain lessons (all courses from 002-044 now have practicals)
  const coursesWithPractical = [
    'course_001', 'course_002', 'course_003', 'course_004', 'course_005', 'course_006', 
    'course_007', 'course_008', 'course_009', 'course_010', 'course_011', 
  ];
  const hasPractical = coursesWithPractical.includes(course.id);

  const handleClick = () => {
    if (isLocked) {
      onLockedClick?.(course.id);
    } else {
      onEnroll?.(course.id);
    }
  };

  return (
    <div className={`group relative bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_12px_48px_rgba(0,132,199,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-1 ${!hasContent ? 'opacity-75' : ''}`}>
      {/* Thumbnail Emoji */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0084C7]/10 to-[#00a8e8]/20 flex items-center justify-center mb-4 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)] group-hover:scale-110 transition-transform">
        <span className="text-4xl">{course.thumbnail}</span>
      </div>

      {/* Badges */}
      <div className="absolute top-6 right-6 flex gap-2 flex-wrap justify-end max-w-[50%]">
        {isLocked && (
          <Badge
            className="rounded-full px-3 py-1 text-xs shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-0 bg-orange-500 text-white flex items-center gap-1"
          >
            <Lock className="w-3 h-3" />
            Locked
          </Badge>
        )}
        {isCompleted && (
          <Badge
            className="rounded-full px-3 py-1 text-xs shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-0 bg-green-500 text-white flex items-center gap-1"
          >
            <CheckCircle className="w-3 h-3" />
            Completed
          </Badge>
        )}
        {!hasContent && !isLocked && (
          <Badge
            className="rounded-full px-3 py-1 text-xs shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-0 bg-orange-500 text-white"
          >
            Coming Soon
          </Badge>
        )}
        {hasPractical && (
          <Badge
            className="rounded-full px-3 py-1 text-xs shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            title="Includes hands-on blockchain transaction practice"
          >
            ⚡ Practical
          </Badge>
        )}
        <Badge
          className="rounded-full px-3 py-1 text-xs capitalize shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-0"
          style={{
            backgroundColor: course.track === 'developer' ? '#8b5cf6' : '#10b981',
            color: 'white'
          }}
        >
          {course.track}
        </Badge>
      </div>

      {/* Course Info */}
      <h3 className="mb-2 line-clamp-2 min-h-[3rem]">{course.title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-3 min-h-[4.5rem]">{course.description}</p>

      {/* Metadata */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span>{course.rating}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{course.estimatedHours}h</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{course.enrollmentCount.toLocaleString()}</span>
        </div>
      </div>

      {/* Difficulty */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-3 h-3 rounded-full shadow-[inset_-1px_-1px_4px_rgba(0,0,0,0.2),inset_1px_1px_4px_rgba(255,255,255,0.9)]"
          style={{ backgroundColor: difficultyColor }}
        />
        <span className="text-sm capitalize" style={{ color: difficultyColor }}>
          {course.difficulty}
        </span>
      </div>

      {/* Progress Bar (if enrolled) */}
      {enrolled && progress !== undefined && !isCompleted && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="text-[#0084C7]">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
            <div
              className="h-full bg-gradient-to-r from-[#0084C7] to-[#00a8e8] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,132,199,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleClick}
        disabled={(!hasContent && !enrolled && !isLocked) || isEnrolling}
        className={`w-full py-3 rounded-2xl text-center transition-all duration-200 flex items-center justify-center gap-2 ${
          !hasContent && !enrolled && !isLocked
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : isEnrolling
            ? 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white shadow-[0_4px_16px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)] cursor-wait'
            : isCompleted
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-[0_4px_16px_rgba(34,197,94,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_24px_rgba(34,197,94,0.4)] active:translate-y-[2px] active:shadow-[0_2px_8px_rgba(34,197,94,0.3),inset_2px_2px_8px_rgba(0,0,0,0.2)]'
            : isLocked
            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_4px_16px_rgba(249,115,22,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_24px_rgba(249,115,22,0.4)] active:translate-y-[2px] active:shadow-[0_2px_8px_rgba(249,115,22,0.3),inset_2px_2px_8px_rgba(0,0,0,0.2)]'
            : enrolled
            ? 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white shadow-[0_4px_16px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_24px_rgba(0,132,199,0.4)] active:translate-y-[2px] active:shadow-[0_2px_8px_rgba(0,132,199,0.3),inset_2px_2px_8px_rgba(0,0,0,0.2)]'
            : 'bg-white text-[#0084C7] shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)] hover:shadow-[0_6px_24px_rgba(0,132,199,0.15)] active:translate-y-[2px] active:shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_2px_2px_8px_rgba(0,0,0,0.1)]'
        }`}
      >
        {isEnrolling && <Loader2 className="w-4 h-4 animate-spin" />}
        {isEnrolling ? 'Enrolling...'
         : !hasContent && !isLocked && !enrolled ? 'Coming Soon'
         : isCompleted ? 'Review Course'
         : isLocked ? 'View Prerequisites'
         : enrolled ? 'Continue Learning'
         : 'Enroll Now'}
      </button>

      {/* Lessons Count */}
      <div className="mt-3 text-center text-sm text-gray-500">
        {course.lessons} lessons
      </div>
    </div>
  );
}
