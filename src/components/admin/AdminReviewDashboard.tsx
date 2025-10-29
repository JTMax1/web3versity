/**
 * Admin Review Dashboard
 *
 * Admin interface for reviewing and approving/rejecting course submissions.
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, Clock, Eye, BookOpen, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

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

      const { error } = await supabase.rpc('approve_and_publish_course', {
        p_draft_id: selectedCourse.id,
        p_admin_id: user.id,
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

      const { error } = await supabase.rpc('reject_course_draft', {
        p_draft_id: selectedCourse.id,
        p_admin_id: user.id,
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
      {selectedCourse && (
        <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedCourse.title}</DialogTitle>
              <DialogDescription>
                Review this course submission and provide feedback
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Course Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{selectedCourse.description}</p>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Track</h4>
                  <p className="text-gray-700 capitalize">{selectedCourse.track}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Difficulty</h4>
                  <p className="text-gray-700 capitalize">{selectedCourse.difficulty}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Estimated Hours</h4>
                  <p className="text-gray-700">{selectedCourse.estimated_hours}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Creator</h4>
                  <p className="text-gray-700">{selectedCourse.creator_username || selectedCourse.creator_email}</p>
                </div>
              </div>

              {/* Learning Objectives */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Learning Objectives ({selectedCourse.learning_objectives?.length || 0})
                </h4>
                {selectedCourse.learning_objectives && selectedCourse.learning_objectives.length > 0 ? (
                  <ul className="space-y-1">
                    {selectedCourse.learning_objectives.map((obj: any, index: number) => (
                      <li key={index} className="text-gray-700">• {obj.text}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No objectives defined</p>
                )}
              </div>

              {/* Lessons Summary */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Course Content ({selectedCourse.lessons?.length || 0} lessons)
                </h4>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {getLessonTypeCount(selectedCourse.lessons || [], 'text')}
                    </div>
                    <div className="text-xs text-gray-700">Text</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-green-600">
                      {getLessonTypeCount(selectedCourse.lessons || [], 'interactive')}
                    </div>
                    <div className="text-xs text-gray-700">Interactive</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {getLessonTypeCount(selectedCourse.lessons || [], 'quiz')}
                    </div>
                    <div className="text-xs text-gray-700">Quiz</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-orange-600">
                      {getLessonTypeCount(selectedCourse.lessons || [], 'practical')}
                    </div>
                    <div className="text-xs text-gray-700">Practical</div>
                  </div>
                </div>

                {/* Lessons List */}
                {selectedCourse.lessons && selectedCourse.lessons.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedCourse.lessons.map((lesson: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <span className="w-6 h-6 bg-[#0084C7] rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-xl">
                          {lesson.type === 'text' && '📝'}
                          {lesson.type === 'interactive' && '🎮'}
                          {lesson.type === 'quiz' && '❓'}
                          {lesson.type === 'practical' && '💸'}
                        </span>
                        <span className="flex-1 text-sm text-gray-900">{lesson.title}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No lessons created</p>
                )}
              </div>

              {/* Review Notes */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Admin Review Notes</h4>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add feedback for the educator (required for rejection, optional for approval)"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleReject}
                  disabled={isProcessing || !reviewNotes.trim()}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50 rounded-xl py-6"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  {isProcessing ? 'Processing...' : 'Reject Course'}
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1 bg-green-500 text-white hover:bg-green-600 rounded-xl py-6"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {isProcessing ? 'Processing...' : 'Approve & Publish'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
