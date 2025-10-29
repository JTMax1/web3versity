/**
 * Admin Review Dashboard
 *
 * Admin interface for reviewing and approving/rejecting course submissions.
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { CheckCircle, Clock, Eye, BookOpen, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { CourseReviewModal } from '../modals/CourseReviewModal';

interface CourseDraft {
  id: string;
  title: string;
  description: string;
  track: string;
  difficulty: string;
  estimated_hours: number;
  learning_objectives: any[];
  lessons: any[];
  creator_id: string;
  draft_status: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  creator_username?: string;
  creator_email?: string;
}

export function AdminReviewDashboard() {
  const [pendingCourses, setPendingCourses] = useState<CourseDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<CourseDraft | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadPendingCourses();
  }, []);

  const loadPendingCourses = async () => {
    try {
      const { data, error } = await supabase.rpc('get_pending_course_reviews');

      if (error) throw error;

      setPendingCourses(data || []);
    } catch (error) {
      console.error('Error loading pending courses:', error);
      toast.error('Failed to load pending reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedCourse) return;

    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Not authenticated');
        return;
      }

      // Get database user ID from JWT metadata (fix for auth issue)
      const dbUserId = user.user_metadata?.user_id;
      if (!dbUserId) {
        toast.error('User not properly registered');
        return;
      }

      const { error } = await supabase.rpc('approve_and_publish_course', {
        p_draft_id: selectedCourse.id,
        p_admin_id: dbUserId,
        p_review_notes: reviewNotes || null,
      });

      if (error) throw error;

      toast.success(`Course "${selectedCourse.title}" has been approved and published!`);
      setSelectedCourse(null);
      setReviewNotes('');
      loadPendingCourses();
    } catch (error) {
      console.error('Error approving course:', error);
      toast.error('Failed to approve course');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCourse) return;

    if (!reviewNotes.trim()) {
      toast.error('Please provide feedback for the rejection');
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Not authenticated');
        return;
      }

      // Get database user ID from JWT metadata (fix for auth issue)
      const dbUserId = user.user_metadata?.user_id;
      if (!dbUserId) {
        toast.error('User not properly registered');
        return;
      }

      const { error } = await supabase.rpc('reject_course_draft', {
        p_draft_id: selectedCourse.id,
        p_admin_id: dbUserId,
        p_review_notes: reviewNotes,
      });

      if (error) throw error;

      toast.success(`Course "${selectedCourse.title}" has been rejected with feedback`);
      setSelectedCourse(null);
      setReviewNotes('');
      loadPendingCourses();
    } catch (error) {
      console.error('Error rejecting course:', error);
      toast.error('Failed to reject course');
    } finally {
      setIsProcessing(false);
    }
  };

  const getLessonTypeCount = (lessons: any[], type: string) => {
    return lessons.filter((l: any) => l.type === type).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#0084C7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pending reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl p-8 mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Review Dashboard</h1>
              <p className="text-gray-600">Review and approve educator course submissions</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#0084C7]">{pendingCourses.length}</div>
              <div className="text-sm text-gray-600">Pending Reviews</div>
            </div>
          </div>
        </div>

        {/* Pending Courses List */}
        {pendingCourses.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">There are no courses pending review at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-[#0084C7] transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-start gap-6">
                  {/* Course Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-[#0084C7] to-[#00a8e8] rounded-2xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>

                  {/* Course Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-700 mb-3 line-clamp-2">{course.description}</p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{course.creator_username || course.creator_email || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Submitted {new Date(course.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{course.estimated_hours}h</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-2 mb-3">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm capitalize">
                        {course.track}
                      </span>
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm capitalize">
                        {course.difficulty}
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {course.lessons?.length || 0} lessons
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {course.learning_objectives?.length || 0} objectives
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    <Button
                      onClick={() => setSelectedCourse(course)}
                      className="bg-[#0084C7] text-white rounded-xl"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <CourseReviewModal
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        course={selectedCourse}
        onApprove={handleApprove}
        onReject={handleReject}
        isProcessing={isProcessing}
      />
    </div>
  );
}
