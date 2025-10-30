import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase/client';
import { CourseReviewModal } from '../../modals/CourseReviewModal';
import { toast } from 'sonner';

export function PublishRequestsSubTab() {
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: pendingCourses, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'pending-courses'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_pending_course_reviews');
      if (error) throw error;
      return data;
    },
  });

  const handleApprove = async (notes: string) => {
    if (!selectedCourse) return;

    setIsProcessing(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const adminUserId = user.user_metadata?.user_id;
      if (!adminUserId) throw new Error('Admin user ID not found');

      // Call approve_and_publish_course RPC function
      // Note: Using named parameters to ensure correct order
      const { data, error } = await supabase.rpc('approve_and_publish_course', {
        p_admin_id: adminUserId,
        p_draft_id: selectedCourse.draft_id,
        p_review_notes: notes || null,
      });

      if (error) throw error;

      if (data && !data.success) {
        throw new Error(data.error || 'Failed to approve course');
      }

      toast.success('Course approved and published successfully! 🎉');
      setSelectedCourse(null);
      refetch();
    } catch (error: any) {
      console.error('Error approving course:', error);
      toast.error(error.message || 'Failed to approve course');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (notes: string) => {
    if (!selectedCourse) return;

    if (!notes.trim()) {
      toast.error('Please provide feedback for the rejection');
      return;
    }

    setIsProcessing(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const adminUserId = user.user_metadata?.user_id;
      if (!adminUserId) throw new Error('Admin user ID not found');

      // Call reject_course_draft RPC function
      // Note: Using named parameters to ensure correct order
      const { data, error } = await supabase.rpc('reject_course_draft', {
        p_admin_id: adminUserId,
        p_draft_id: selectedCourse.draft_id,
        p_review_notes: notes,
      });

      if (error) throw error;

      if (data && !data.success) {
        throw new Error(data.error || 'Failed to reject course');
      }

      toast.success('Course rejected with feedback sent to creator');
      setSelectedCourse(null);
      refetch();
    } catch (error: any) {
      console.error('Error rejecting course:', error);
      toast.error(error.message || 'Failed to reject course');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-[#0084C7] border-t-transparent rounded-full" />
        </div>
      ) : pendingCourses && pendingCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingCourses.map((course: any) => (
            <div key={course.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">{course.learning_objectives?.[0]?.emoji || '📚'}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-500">By {course.creator_username}</span>
                {course.quality_score && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                    Score: {course.quality_score}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedCourse(course)}
                className="w-full py-2 bg-[#0084C7] text-white rounded-xl hover:bg-[#0074b7] transition-colors font-medium"
              >
                Review Course
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <p className="text-gray-400">No pending course reviews</p>
        </div>
      )}

      {selectedCourse && (
        <CourseReviewModal
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          course={selectedCourse}
          onApprove={handleApprove}
          onReject={handleReject}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}
