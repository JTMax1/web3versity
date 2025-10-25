import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Compass, Code, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useEnroll } from '../../hooks/useEnrollment';
import { toast } from 'sonner';

interface StartLearningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Track = 'explorer' | 'developer' | null;

const trackCourses = {
  explorer: {
    id: 'course_012',
    title: 'Introduction to Blockchain',
    description: 'Perfect for complete beginners. Learn blockchain from zero with no technical background needed.',
    emoji: '📚',
    duration: '3 hours',
    lessons: 10,
    highlights: [
      'Start from absolute zero',
      'No coding required',
      'African-focused examples',
      'Scam awareness included'
    ]
  },
  developer: {
    id: 'course_008',
    title: 'Introduction to Programming for Web3',
    description: 'Learn JavaScript fundamentals and start your journey to becoming a blockchain developer.',
    emoji: '💻',
    duration: '8 hours',
    lessons: 15,
    highlights: [
      'JavaScript from scratch',
      'Hands-on coding practice',
      'Build real projects',
      'Web3 developer pathway'
    ]
  }
};

export const StartLearningModal: React.FC<StartLearningModalProps> = ({ isOpen, onClose }) => {
  const [selectedTrack, setSelectedTrack] = useState<Track>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enroll } = useEnroll();

  const handleTrackSelect = (track: Track) => {
    setSelectedTrack(track);
  };

  const handleStartCourse = async () => {
    if (!selectedTrack) return;

    if (!user?.id) {
      toast.error('Please connect your wallet first');
      navigate('/dashboard');
      onClose();
      return;
    }

    setIsNavigating(true);
    const courseId = trackCourses[selectedTrack].id;

    try {
      // Enroll user in the course
      await enroll(user.id, courseId);

      // Mark that user has started learning
      localStorage.setItem('hasStartedLearning', 'true');

      // Navigate to course
      setTimeout(() => {
        navigate(`/courses/${courseId}`);
        onClose();
        setIsNavigating(false);
      }, 500);
    } catch (error) {
      console.error('Error enrolling:', error);
      toast.error('Failed to start course. Please try again.');
      setIsNavigating(false);
    }
  };

  const handleExploreCourses = () => {
    localStorage.setItem('hasStartedLearning', 'true');
    navigate('/courses');
    onClose();
  };

  if (!isOpen) return null;

  const selectedCourse = selectedTrack ? trackCourses[selectedTrack] : null;

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
              <div className="bg-white rounded-3xl p-6 md:p-8 lg:p-10 shadow-[0_24px_96px_rgba(0,132,199,0.25),inset_0_1px_0_rgba(255,255,255,0.9)]">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                <div className="space-y-6 md:space-y-8">
                  {/* Header */}
                  <div className="text-center space-y-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                      className="flex justify-center"
                    >
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#0084C7] to-[#00a8e8] flex items-center justify-center shadow-[0_8px_32px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)]">
                        <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
                      </div>
                    </motion.div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl bg-gradient-to-r from-[#0084C7] to-[#00a8e8] bg-clip-text text-transparent">
                      New to Web3? Start Here 🚀
                    </h2>
                    <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
                      Choose your learning track and we'll recommend the perfect course to begin your Web3 journey
                    </p>
                  </div>

                  {/* Track Selector */}
                  <div>
                    <h3 className="text-base md:text-lg font-semibold mb-4 text-center text-gray-800">I'm a...</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      {/* Explorer Track */}
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          onClick={() => handleTrackSelect('explorer')}
                          className={`p-4 md:p-6 rounded-3xl cursor-pointer transition-all shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_12px_48px_rgba(16,185,129,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] ${
                            selectedTrack === 'explorer'
                              ? 'bg-gradient-to-br from-green-50 to-emerald-50'
                              : 'bg-white'
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)] ${
                                selectedTrack === 'explorer'
                                  ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                                  : 'bg-gradient-to-br from-green-100 to-emerald-100'
                              }`}>
                                <Compass className={`w-5 h-5 md:w-6 md:h-6 ${
                                  selectedTrack === 'explorer' ? 'text-white' : 'text-green-600'
                                }`} />
                              </div>
                              <div>
                                <h4 className="text-lg md:text-xl font-bold text-gray-900">Explorer</h4>
                                <p className="text-xs md:text-sm text-gray-600">Learn concepts, no coding</p>
                              </div>
                            </div>
                            {selectedTrack === 'explorer' && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-xs md:text-sm text-gray-700"
                              >
                                Perfect for understanding blockchain basics without writing code
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>

                      {/* Developer Track */}
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          onClick={() => handleTrackSelect('developer')}
                          className={`p-4 md:p-6 rounded-3xl cursor-pointer transition-all shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_12px_48px_rgba(139,92,246,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] ${
                            selectedTrack === 'developer'
                              ? 'bg-gradient-to-br from-purple-50 to-violet-50'
                              : 'bg-white'
                          }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)] ${
                                selectedTrack === 'developer'
                                  ? 'bg-gradient-to-br from-purple-500 to-violet-500'
                                  : 'bg-gradient-to-br from-purple-100 to-violet-100'
                              }`}>
                                <Code className={`w-5 h-5 md:w-6 md:h-6 ${
                                  selectedTrack === 'developer' ? 'text-white' : 'text-purple-600'
                                }`} />
                              </div>
                              <div>
                                <h4 className="text-lg md:text-xl font-bold text-gray-900">Developer</h4>
                                <p className="text-xs md:text-sm text-gray-600">Build with code</p>
                              </div>
                            </div>
                            {selectedTrack === 'developer' && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-xs md:text-sm text-gray-700"
                              >
                                Learn to build blockchain applications and smart contracts
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Course Recommendation */}
                  <AnimatePresence mode="wait">
                    {selectedCourse && (
                      <motion.div
                        key={selectedTrack}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-4 md:p-6 shadow-[0_8px_32px_rgba(0,132,199,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]">
                          <div className="space-y-4">
                            <div className="flex items-start gap-4">
                              <div className="text-4xl md:text-5xl">{selectedCourse.emoji}</div>
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h4 className="text-lg md:text-xl font-bold text-gray-900">{selectedCourse.title}</h4>
                                  <span className="px-2 py-1 text-xs rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] bg-green-500 text-white">
                                    Recommended
                                  </span>
                                </div>
                                <p className="text-xs md:text-sm text-gray-700 mb-3">
                                  {selectedCourse.description}
                                </p>
                                <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-gray-600">
                                  <span>⏱️ {selectedCourse.duration}</span>
                                  <span>📚 {selectedCourse.lessons} lessons</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {selectedCourse.highlights.map((highlight, index) => (
                                <div key={index} className="flex items-center gap-2 text-xs md:text-sm text-gray-800">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#0084C7]" />
                                  <span>{highlight}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={handleStartCourse}
                      disabled={!selectedTrack || isNavigating}
                      className="w-full py-6 md:py-7 text-base md:text-lg rounded-full bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:from-[#0074b7] hover:to-[#0098d8] disabled:from-gray-400 disabled:to-gray-500 shadow-[0_8px_32px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)] hover:shadow-[0_12px_48px_rgba(0,132,199,0.4),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)] transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:hover:scale-100 font-semibold flex items-center justify-center gap-2"
                    >
                      {isNavigating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Loading Course...
                        </>
                      ) : (
                        <>
                          Start Now
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleExploreCourses}
                      className="w-full py-4 md:py-5 text-sm md:text-base rounded-full bg-white text-gray-700 hover:bg-gray-50 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all font-semibold"
                    >
                      Not sure? Explore Other Courses
                    </button>
                  </div>

                  {/* Footer Note */}
                  <p className="text-xs md:text-sm text-center text-gray-600">
                    💡 You can always switch tracks later. Start with what interests you most!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
