/**
 * Unified Course Creation Page
 *
 * Single entry point for both AI and manual course creation
 * Workflow: Choose mode → Create course → Edit if needed → Submit
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sparkles, Edit3, ArrowRight, ArrowLeft, Zap, Target, Clock, Award } from 'lucide-react';
import { CourseGenerator } from '../components/ai/CourseGenerator';
import { CourseWizard } from '../components/course-creation/CourseWizard';

type CreationMode = 'choose' | 'ai' | 'manual';

export function CreateCoursePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = searchParams.get('mode') as CreationMode | null;
  const [mode, setMode] = useState<CreationMode>(initialMode || 'choose');

  // Update URL when mode changes
  useEffect(() => {
    if (mode === 'choose') {
      setSearchParams({});
    } else {
      setSearchParams({ mode });
    }
  }, [mode, setSearchParams]);

  // Handle back navigation
  const handleBackToChoose = () => {
    setMode('choose');
  };

  // Mode Selection Screen
  if (mode === 'choose') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <button
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin Dashboard
            </button>

            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Create a New Course
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose your preferred creation method. Both options support full editing and quality assurance.
            </p>
          </div>

          {/* Mode Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* AI-Assisted Creation */}
            <button
              onClick={() => setMode('ai')}
              className="group relative p-8 rounded-3xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-2xl transition-all duration-300 text-left bg-white overflow-hidden"
            >
              {/* Background Gradient on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">AI-Assisted</h2>
                    <p className="text-sm text-purple-600 font-semibold flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      Fast & Smart
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  Generate a complete course in minutes using AI. Perfect for getting started quickly with quality content tailored to African learners.
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs font-bold">✓</span>
                    </span>
                    <span className="text-sm text-gray-700">
                      <strong>AI generates lessons & quizzes</strong> with African context
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs font-bold">✓</span>
                    </span>
                    <span className="text-sm text-gray-700">
                      <strong>Automatic quality scoring</strong> (60-100 range)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs font-bold">✓</span>
                    </span>
                    <span className="text-sm text-gray-700">
                      <strong>Edit manually after generation</strong> with full control
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs font-bold">✓</span>
                    </span>
                    <span className="text-sm text-gray-700">
                      <strong>Category & prerequisites auto-filled</strong>
                    </span>
                  </li>
                </ul>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-purple-50 rounded-xl">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-semibold">TIME</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">5-10 min</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                      <Target className="w-4 h-4" />
                      <span className="text-xs font-semibold">EFFORT</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">Low</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                      <Award className="w-4 h-4" />
                      <span className="text-xs font-semibold">QUALITY</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">70-90</p>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all">
                    Start with AI
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Recommended
                  </div>
                </div>
              </div>
            </button>

            {/* Manual Creation */}
            <button
              onClick={() => setMode('manual')}
              className="group relative p-8 rounded-3xl border-2 border-gray-200 hover:border-green-500 hover:shadow-2xl transition-all duration-300 text-left bg-white overflow-hidden"
            >
              {/* Background Gradient on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Edit3 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Manual Creation</h2>
                    <p className="text-sm text-green-600 font-semibold flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      Full Control
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  Build your course from scratch with complete creative control. Ideal for experienced educators with specific vision.
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs font-bold">✓</span>
                    </span>
                    <span className="text-sm text-gray-700">
                      <strong>Design every lesson yourself</strong> with 5 lesson types
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs font-bold">✓</span>
                    </span>
                    <span className="text-sm text-gray-700">
                      <strong>Live quality monitoring</strong> as you create
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs font-bold">✓</span>
                    </span>
                    <span className="text-sm text-gray-700">
                      <strong>Drag-and-drop organization</strong> for lessons
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xs font-bold">✓</span>
                    </span>
                    <span className="text-sm text-gray-700">
                      <strong>Prerequisites search & selector</strong> with autocomplete
                    </span>
                  </li>
                </ul>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-green-50 rounded-xl">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-semibold">TIME</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">30-60 min</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                      <Target className="w-4 h-4" />
                      <span className="text-xs font-semibold">EFFORT</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">High</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                      <Award className="w-4 h-4" />
                      <span className="text-xs font-semibold">QUALITY</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">80-100</p>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 text-green-600 font-semibold group-hover:gap-3 transition-all">
                  Start from Scratch
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </button>
          </div>

          {/* Info Boxes */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tip Box */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="text-sm text-blue-900 font-semibold mb-1">Pro Tip</p>
                  <p className="text-sm text-blue-800">
                    You can switch between modes anytime! Generate with AI, then edit manually for the perfect blend of speed and control.
                  </p>
                </div>
              </div>
            </div>

            {/* Quality Box */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="text-sm text-amber-900 font-semibold mb-1">Quality Standards</p>
                  <p className="text-sm text-amber-800">
                    Both methods include live quality monitoring. Courses need a minimum score of 60 to submit for review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AI Mode
  if (mode === 'ai') {
    return (
      <div className="min-h-screen bg-gray-50">
        <CourseGenerator onBackToChoose={handleBackToChoose} />
      </div>
    );
  }

  // Manual Mode
  return (
    <div className="min-h-screen bg-gray-50">
      <CourseWizard onBackToChoose={handleBackToChoose} />
    </div>
  );
}
