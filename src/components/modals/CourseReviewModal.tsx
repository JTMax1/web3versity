import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Clock, User, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface CourseReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: any;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
  isProcessing: boolean;
}

export const CourseReviewModal: React.FC<CourseReviewModalProps> = ({
  isOpen,
  onClose,
  course,
  onApprove,
  onReject,
  isProcessing,
}) => {
  const [reviewNotes, setReviewNotes] = useState('');

  if (!isOpen || !course) return null;

  const getLessonTypeCount = (lessons: any[], type: string) => {
    return lessons.filter((lesson) => lesson.type === type).length;
  };

  const handleApprove = async () => {
    await onApprove();
    setReviewNotes('');
  };

  const handleReject = async () => {
    if (!reviewNotes.trim()) {
      alert('Please provide feedback for the rejection');
      return;
    }
    await onReject();
    setReviewNotes('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto pointer-events-auto"
            >
              <div className="bg-white rounded-3xl shadow-[0_24px_96px_rgba(0,132,199,0.25)]">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-[#0084C7] to-[#00a8e8] p-8 rounded-t-3xl">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-[#0084C7]" />
                    </div>
                    <div className="flex-1 text-white">
                      <h2 className="text-3xl font-bold mb-1">{course.title}</h2>
                      <p className="text-blue-100">Review Course Submission</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                  {/* Course Info */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Course Information</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <User className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="text-sm text-gray-600">Creator</div>
                          <div className="font-semibold text-gray-900">
                            {course.creator_username || course.creator_email || 'Unknown'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="text-sm text-gray-600">Submitted</div>
                          <div className="font-semibold text-gray-900">
                            {new Date(course.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="text-sm text-gray-600">Duration</div>
                          <div className="font-semibold text-gray-900">{course.estimated_hours}h</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <BookOpen className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="text-sm text-gray-600">Track</div>
                          <div className="font-semibold text-gray-900 capitalize">{course.track}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 leading-relaxed">{course.description}</p>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2">
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium capitalize">
                      {course.difficulty}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      {course.lessons?.length || 0} lessons
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      {course.learning_objectives?.length || 0} objectives
                    </span>
                  </div>

                  {/* Learning Objectives */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Learning Objectives ({course.learning_objectives?.length || 0})
                    </h4>
                    {course.learning_objectives && course.learning_objectives.length > 0 ? (
                      <ul className="space-y-1">
                        {course.learning_objectives.map((obj: any, index: number) => (
                          <li key={obj.id || `objective-${index}`} className="text-gray-700">
                            • {obj.text}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">No objectives defined</p>
                    )}
                  </div>

                  {/* Lessons Summary */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Course Content ({course.lessons?.length || 0} lessons)
                    </h4>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-blue-600">
                          {getLessonTypeCount(course.lessons || [], 'text')}
                        </div>
                        <div className="text-xs text-gray-700">Text</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-green-600">
                          {getLessonTypeCount(course.lessons || [], 'interactive')}
                        </div>
                        <div className="text-xs text-gray-700">Interactive</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-purple-600">
                          {getLessonTypeCount(course.lessons || [], 'quiz')}
                        </div>
                        <div className="text-xs text-gray-700">Quiz</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-orange-600">
                          {getLessonTypeCount(course.lessons || [], 'practical')}
                        </div>
                        <div className="text-xs text-gray-700">Practical</div>
                      </div>
                    </div>

                    {/* Lessons List */}
                    {course.lessons && course.lessons.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {course.lessons.map((lesson: any, index: number) => (
                          <div
                            key={lesson.id || `lesson-${index}`}
                            className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                          >
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
                    <label className="block font-semibold text-gray-900 mb-2">
                      Review Notes (Optional for approval, required for rejection)
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add feedback for the course creator..."
                      className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0084C7] focus:outline-none resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 text-lg rounded-xl"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Approve & Publish
                    </Button>
                    <Button
                      onClick={handleReject}
                      disabled={isProcessing}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-6 text-lg rounded-xl"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Reject
                    </Button>
                  </div>

                  {/* Warning */}
                  <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <strong>Note:</strong> Approving will publish this course and make it visible to all
                      users. Rejecting will send it back to the creator with your feedback.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
