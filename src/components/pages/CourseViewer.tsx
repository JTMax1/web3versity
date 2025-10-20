import React, { useState, useEffect } from 'react';
import { type Course } from '../../lib/mockData';
import { getLessonsForCourse } from '../../lib/courseContent';
import { LessonViewer } from '../course/LessonViewer';
import { Button } from '../ui/button';
import { ArrowLeft, CheckCircle, Lock, Award } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useCompletedLessons, useCompleteLesson, useCourseProgress, useUpdateCurrentLesson } from '../../hooks/useLessonProgress';
import { XPNotification } from '../XPNotification';
import { LevelUpModal } from '../LevelUpModal';
import { CourseCompleteModal } from '../CourseCompleteModal';
import { useWallet } from '../../contexts/WalletContext';

interface CourseViewerProps {
  course: Course;
  onBack: () => void;
  onCourseComplete: () => void;
}

export function CourseViewer({ course, onBack, onCourseComplete }: CourseViewerProps) {
  const { user } = useWallet();
  const lessons = getLessonsForCourse(course.id);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);

  // Lesson progress hooks
  const { completedLessonIds, isLoading: loadingCompleted } = useCompletedLessons(user?.id, course.id);
  const { complete, isCompleting } = useCompleteLesson();
  const { progress: courseProgress } = useCourseProgress(user?.id, course.id);
  const { updateLesson } = useUpdateCurrentLesson();

  // Local state for completed lessons (sync with database)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  // Notification and modal state
  const [xpNotification, setXPNotification] = useState<{ xp: number } | null>(null);
  const [levelUpModal, setLevelUpModal] = useState<{ show: boolean; level: number }>({
    show: false,
    level: 1
  });
  const [showCourseCompleteModal, setShowCourseCompleteModal] = useState(false);

  // Sync completed lessons from database
  useEffect(() => {
    if (completedLessonIds.length > 0) {
      setCompletedLessons(new Set(completedLessonIds));
    }
  }, [completedLessonIds]);

  // Update current lesson position when changed
  useEffect(() => {
    if (user?.id && lessons[currentLessonIndex]) {
      updateLesson(user.id, course.id, lessons[currentLessonIndex].id);
    }
  }, [currentLessonIndex, user?.id, course.id, lessons, updateLesson]);

  if (lessons.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-3xl p-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
              <span className="text-5xl">🚧</span>
            </div>
            <h2 className="mb-4">Coming Soon!</h2>
            <p className="text-gray-600 mb-8">
              This course is currently being developed. Check back soon to start learning!
            </p>
            <Button
              onClick={onBack}
              className="bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:from-[#0074b7] hover:to-[#0098d8] rounded-full px-8 py-4 shadow-[0_4px_16px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)]"
            >
              Back to Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentLesson = lessons[currentLessonIndex];
  const progress = (completedLessons.size / lessons.length) * 100;
  const allCompleted = completedLessons.size === lessons.length;

  const handleLessonComplete = async (score?: number) => {
    if (!user?.id || !currentLesson) {
      toast.error('Please connect your wallet to save progress');
      return;
    }

    // Check if already completed
    if (completedLessons.has(currentLesson.id)) {
      toast.info('Lesson already completed!');
      // Still advance to next lesson
      if (currentLessonIndex < lessons.length - 1) {
        setCurrentLessonIndex(currentLessonIndex + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    try {
      // Mark lesson complete in database
      const result = await complete(user.id, currentLesson.id, course.id, score);

      if (result.success) {
        // Update local state
        const newCompleted = new Set(completedLessons);
        newCompleted.add(currentLesson.id);
        setCompletedLessons(newCompleted);

        // Show XP notification
        if (result.xpEarned > 0) {
          setXPNotification({ xp: result.xpEarned });
          setTimeout(() => setXPNotification(null), 3000);
        }

        // Check for level up
        if (user.current_level && result.newLevel > user.current_level) {
          setTimeout(() => {
            setLevelUpModal({ show: true, level: result.newLevel });
          }, 500);
        }

        // Check for course complete
        if (result.courseComplete) {
          setTimeout(() => {
            setShowCourseCompleteModal(true);
          }, 1000);
        } else {
          // Auto-advance to next lesson
          if (currentLessonIndex < lessons.length - 1) {
            setTimeout(() => {
              setCurrentLessonIndex(currentLessonIndex + 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 1000);
          }
        }

        toast.success('Lesson completed!', {
          description: `+${result.xpEarned} XP earned`
        });
      } else {
        toast.error(result.error || 'Failed to complete lesson');
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast.error('Failed to save progress');
    }
  };

  const goToLesson = (index: number) => {
    // Can only go to completed lessons or the next uncompleted one
    const lesson = lessons[index];
    const isCompleted = completedLessons.has(lesson.id);
    const isPrevious = index < currentLessonIndex;
    const isNext = index === currentLessonIndex;
    
    // Allow if completed, is current, or is the next lesson after last completed
    const allPreviousCompleted = lessons.slice(0, index).every(l => completedLessons.has(l.id));
    
    if (isCompleted || isPrevious || (isNext && allPreviousCompleted) || index === 0) {
      setCurrentLessonIndex(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={onBack}
            className="mb-4 bg-white text-[#0084C7] hover:bg-gray-50 rounded-full px-6 shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>

          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0084C7]/10 to-[#00a8e8]/20 rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
                <span className="text-4xl">{course.thumbnail}</span>
              </div>
              <div className="flex-1">
                <h1 className="mb-1">{course.title}</h1>
                <p className="text-gray-600">{course.description}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {completedLessons.size} of {lessons.length} lessons completed
                </span>
                <span className="text-[#0084C7]">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                <div 
                  className="h-full bg-gradient-to-r from-[#0084C7] to-[#00a8e8] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,132,199,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Lessons Sidebar */}
          <div className={`lg:col-span-1 ${showSidebar ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] sticky top-24">
              <h3 className="mb-4">Lessons</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {lessons.map((lesson, index) => {
                  const isCompleted = completedLessons.has(lesson.id);
                  const isCurrent = index === currentLessonIndex;
                  const allPreviousCompleted = lessons.slice(0, index).every(l => completedLessons.has(l.id));
                  const isLocked = !isCompleted && !isCurrent && index > 0 && !allPreviousCompleted;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => goToLesson(index)}
                      disabled={isLocked}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white shadow-[0_4px_12px_rgba(0,132,199,0.3)]'
                          : isCompleted
                          ? 'bg-green-50 hover:bg-green-100'
                          : isLocked
                          ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCurrent
                            ? 'bg-white/20'
                            : isCompleted
                            ? 'bg-green-500'
                            : isLocked
                            ? 'bg-gray-300'
                            : 'bg-gray-200'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : isLocked ? (
                            <Lock className="w-3 h-3 text-gray-500" />
                          ) : (
                            <span className={`text-xs ${isCurrent ? 'text-white' : 'text-gray-600'}`}>
                              {index + 1}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm truncate ${
                            isCurrent ? 'text-white' : isCompleted ? 'text-green-900' : 'text-gray-900'
                          }`}>
                            {lesson.title}
                          </div>
                          <div className={`text-xs ${
                            isCurrent ? 'text-white/80' : isCompleted ? 'text-green-700' : 'text-gray-500'
                          }`}>
                            {lesson.duration} min
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="lg:col-span-3">
            {allCompleted ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[inset_-4px_-4px_16px_rgba(0,0,0,0.05),inset_4px_4px_16px_rgba(255,255,255,0.9)]">
                  <Award className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="mb-4">🎉 Course Complete!</h2>
                <p className="text-xl text-gray-700 mb-8">
                  Congratulations! You've completed all lessons in this course.
                </p>
                <div className="bg-gradient-to-br from-[#0084C7]/5 to-[#00a8e8]/10 rounded-3xl p-6 mb-8 shadow-[inset_0_2px_8px_rgba(0,132,199,0.1)]">
                  <h3 className="mb-3">Achievements Unlocked:</h3>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <div className="bg-white rounded-2xl px-6 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                      <div className="text-2xl mb-1">🏆</div>
                      <div className="text-sm text-gray-600">Course Complete</div>
                    </div>
                    <div className="bg-white rounded-2xl px-6 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                      <div className="text-2xl mb-1">⭐</div>
                      <div className="text-sm text-gray-600">+50 Points</div>
                    </div>
                    <div className="bg-white rounded-2xl px-6 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                      <div className="text-2xl mb-1">📜</div>
                      <div className="text-sm text-gray-600">Certificate</div>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={onBack}
                  className="bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:from-[#0074b7] hover:to-[#0098d8] rounded-full px-10 py-4 shadow-[0_4px_16px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)]"
                >
                  Back to Courses
                </Button>
              </div>
            ) : (
              <LessonViewer
                lesson={currentLesson}
                onComplete={handleLessonComplete}
                isCompleted={completedLessons.has(currentLesson.id)}
                isCompleting={isCompleting}
              />
            )}
          </div>
        </div>
      </div>

      {/* XP Notification */}
      {xpNotification && (
        <XPNotification
          xp={xpNotification.xp}
          onClose={() => setXPNotification(null)}
        />
      )}

      {/* Level Up Modal */}
      <LevelUpModal
        isOpen={levelUpModal.show}
        onClose={() => setLevelUpModal({ ...levelUpModal, show: false })}
        newLevel={levelUpModal.level}
      />

      {/* Course Complete Modal */}
      <CourseCompleteModal
        isOpen={showCourseCompleteModal}
        onClose={() => {
          setShowCourseCompleteModal(false);
          onCourseComplete();
        }}
        courseName={course.title}
      />
    </div>
  );
}
