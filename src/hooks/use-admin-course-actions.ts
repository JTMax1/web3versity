/**
 * Admin Course Actions Hook
 *
 * Provides mutations for admin course management operations:
 * - Publish/unpublish courses
 * - Mark as coming soon
 * - Toggle featured status
 * - Delete courses
 * - Bulk operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase/client';
import { toast } from 'sonner';

interface CourseUpdateInput {
  courseId: string;
  updates: {
    is_published?: boolean;
    is_coming_soon?: boolean;
    is_featured?: boolean;
  };
}

interface BulkCourseAction {
  courseIds: string[];
  action: 'publish' | 'draft' | 'coming_soon' | 'delete';
}

export function useAdminCourseActions() {
  const queryClient = useQueryClient();

  // Update single course
  const updateCourseMutation = useMutation({
    mutationFn: async ({ courseId, updates }: CourseUpdateInput) => {
      const { data, error } = await supabase
        .from('courses')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', courseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'platform-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });

      // Show appropriate toast
      if (variables.updates.is_published === true) {
        toast.success('Course published successfully');
      } else if (variables.updates.is_published === false) {
        toast.success('Course moved to draft');
      } else if (variables.updates.is_coming_soon !== undefined) {
        toast.success(variables.updates.is_coming_soon ? 'Course marked as Coming Soon' : 'Coming Soon status removed');
      } else if (variables.updates.is_featured !== undefined) {
        toast.success(variables.updates.is_featured ? 'Course featured' : 'Course unfeatured');
      }
    },
    onError: (error: any) => {
      console.error('Course update error:', error);
      toast.error(error.message || 'Failed to update course');
    },
  });

  // Delete single course
  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      // First check if course has enrollments
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', courseId)
        .limit(1);

      if (enrollError) throw enrollError;

      if (enrollments && enrollments.length > 0) {
        throw new Error('Cannot delete course with active enrollments. Unpublish it instead.');
      }

      // Delete course
      const { error } = await supabase.from('courses').delete().eq('id', courseId);

      if (error) throw error;
      return courseId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'platform-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted successfully');
    },
    onError: (error: any) => {
      console.error('Course delete error:', error);
      toast.error(error.message || 'Failed to delete course');
    },
  });

  // Bulk actions
  const bulkActionMutation = useMutation({
    mutationFn: async ({ courseIds, action }: BulkCourseAction) => {
      if (action === 'delete') {
        // Check for enrollments first
        const { data: enrollments, error: enrollError } = await supabase
          .from('enrollments')
          .select('course_id')
          .in('course_id', courseIds);

        if (enrollError) throw enrollError;

        if (enrollments && enrollments.length > 0) {
          const coursesWithEnrollments = [...new Set(enrollments.map(e => e.course_id))];
          throw new Error(`Cannot delete ${coursesWithEnrollments.length} course(s) with active enrollments`);
        }

        const { error } = await supabase.from('courses').delete().in('id', courseIds);
        if (error) throw error;
        return { action, count: courseIds.length };
      }

      // For other actions, update courses
      const updates: any = { updated_at: new Date().toISOString() };

      switch (action) {
        case 'publish':
          updates.is_published = true;
          updates.is_coming_soon = false;
          break;
        case 'draft':
          updates.is_published = false;
          break;
        case 'coming_soon':
          updates.is_published = true;
          updates.is_coming_soon = true;
          break;
      }

      const { error } = await supabase.from('courses').update(updates).in('id', courseIds);

      if (error) throw error;
      return { action, count: courseIds.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'platform-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });

      const actionMessages = {
        publish: `${result.count} course(s) published`,
        draft: `${result.count} course(s) moved to draft`,
        coming_soon: `${result.count} course(s) marked as Coming Soon`,
        delete: `${result.count} course(s) deleted`,
      };

      toast.success(actionMessages[result.action]);
    },
    onError: (error: any) => {
      console.error('Bulk action error:', error);
      toast.error(error.message || 'Bulk operation failed');
    },
  });

  return {
    updateCourse: updateCourseMutation.mutateAsync,
    deleteCourse: deleteCourseMutation.mutateAsync,
    bulkAction: bulkActionMutation.mutateAsync,
    isUpdating: updateCourseMutation.isPending || deleteCourseMutation.isPending || bulkActionMutation.isPending,
  };
}
