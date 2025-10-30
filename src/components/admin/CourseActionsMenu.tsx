/**
 * Course Actions Menu Component
 *
 * Dropdown menu for admin course actions:
 * - Move to Published/Draft/Coming Soon
 * - Toggle Featured
 * - Edit Course
 * - View Analytics
 * - Delete Course
 */

import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreVertical, Eye, Edit, Trash2, Star, FileText, BarChart3, Zap, Clock } from 'lucide-react';
import { useAdminCourseActions } from '../../hooks/use-admin-course-actions';
import { useNavigate } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  is_published: boolean;
  is_coming_soon: boolean;
  is_featured: boolean;
}

interface CourseActionsMenuProps {
  course: Course;
}

export function CourseActionsMenu({ course }: CourseActionsMenuProps) {
  const navigate = useNavigate();
  const { updateCourse, deleteCourse } = useAdminCourseActions();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handlePublish = async () => {
    await updateCourse({
      courseId: course.id,
      updates: { is_published: true, is_coming_soon: false },
    });
  };

  const handleMoveToDraft = async () => {
    await updateCourse({
      courseId: course.id,
      updates: { is_published: false },
    });
  };

  const handleMarkComingSoon = async () => {
    await updateCourse({
      courseId: course.id,
      updates: { is_published: true, is_coming_soon: true },
    });
  };

  const handleRemoveComingSoon = async () => {
    await updateCourse({
      courseId: course.id,
      updates: { is_coming_soon: false },
    });
  };

  const handleToggleFeatured = async () => {
    await updateCourse({
      courseId: course.id,
      updates: { is_featured: !course.is_featured },
    });
  };

  const handleEdit = () => {
    // TODO: Navigate to course editor
    navigate(`/create-course?courseId=${course.id}`);
  };

  const handleDelete = async () => {
    try {
      await deleteCourse(course.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      // Error already handled by mutation
      setShowDeleteConfirm(false);
    }
  };

  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Delete Course?</h3>
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete "<strong>{course.title}</strong>"? This action cannot be undone.
          </p>
          <p className="text-sm text-gray-600 mb-6">
            Note: Courses with active enrollments cannot be deleted. Unpublish them instead.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
            >
              Delete Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors outline-none"
          title="Course actions"
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[220px] bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50"
          sideOffset={8}
          align="end"
        >
          {/* Status Actions */}
          <div className="py-1 border-b border-gray-100">
            <DropdownMenu.Label className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
              Status
            </DropdownMenu.Label>

            {!course.is_published && (
              <DropdownMenu.Item
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 transition-colors outline-none cursor-pointer"
                onSelect={handlePublish}
              >
                <Zap className="w-4 h-4 text-green-600" />
                Publish
              </DropdownMenu.Item>
            )}

            {course.is_published && !course.is_coming_soon && (
              <DropdownMenu.Item
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 transition-colors outline-none cursor-pointer"
                onSelect={handleMoveToDraft}
              >
                <FileText className="w-4 h-4 text-gray-600" />
                Move to Draft
              </DropdownMenu.Item>
            )}

            {course.is_published && !course.is_coming_soon ? (
              <DropdownMenu.Item
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 transition-colors outline-none cursor-pointer"
                onSelect={handleMarkComingSoon}
              >
                <Clock className="w-4 h-4 text-yellow-600" />
                Mark as Coming Soon
              </DropdownMenu.Item>
            ) : course.is_coming_soon ? (
              <DropdownMenu.Item
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 transition-colors outline-none cursor-pointer"
                onSelect={handleRemoveComingSoon}
              >
                <Zap className="w-4 h-4 text-green-600" />
                Remove Coming Soon
              </DropdownMenu.Item>
            ) : null}
          </div>

          {/* Feature Actions */}
          <div className="py-1 border-b border-gray-100">
            <DropdownMenu.Item
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 transition-colors outline-none cursor-pointer"
              onSelect={handleToggleFeatured}
            >
              <Star className={`w-4 h-4 ${course.is_featured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
              {course.is_featured ? 'Unfeature' : 'Feature'} Course
            </DropdownMenu.Item>
          </div>

          {/* Management Actions */}
          <div className="py-1 border-b border-gray-100">
            <DropdownMenu.Item
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 transition-colors outline-none cursor-pointer"
              onSelect={handleEdit}
            >
              <Edit className="w-4 h-4 text-blue-600" />
              Edit Course
            </DropdownMenu.Item>

            <DropdownMenu.Item
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 transition-colors outline-none cursor-pointer"
              onSelect={() => {
                // TODO: Navigate to analytics
                console.log('View analytics for', course.id);
              }}
            >
              <BarChart3 className="w-4 h-4 text-purple-600" />
              View Analytics
            </DropdownMenu.Item>
          </div>

          {/* Dangerous Actions */}
          <div className="py-1">
            <DropdownMenu.Item
              className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors outline-none cursor-pointer"
              onSelect={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4" />
              Delete Course
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
