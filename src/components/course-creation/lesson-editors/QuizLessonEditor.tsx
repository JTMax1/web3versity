/**
 * Quiz Lesson Editor
 *
 * Editor for creating multiple-choice quiz lessons.
 */

import React, { useState } from 'react';
import { useCourseCreationStore } from '../../../stores/course-creation-store';
import { Button } from '../../ui/button';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

interface QuizLessonEditorProps {
  lessonId: string;
}

export function QuizLessonEditor({ lessonId }: QuizLessonEditorProps) {
  const { draft, updateLesson } = useCourseCreationStore();
  const lesson = draft.lessons.find(l => l.id === lessonId);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  if (!lesson || lesson.type !== 'quiz') return null;

  const questions = lesson.questions || [];

  const addQuestion = () => {
    const newQuestion = {
      id: crypto.randomUUID(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    };
    updateLesson(lessonId, {
      questions: [...questions, newQuestion],
    });
  };

  const updateQuestion = (questionId: string, updates: Partial<typeof questions[0]>) => {
    updateLesson(lessonId, {
      questions: questions.map(q => q.id === questionId ? { ...q, ...updates } : q),
    });
  };

  const deleteQuestion = (questionId: string) => {
    updateLesson(lessonId, {
      questions: questions.filter(q => q.id !== questionId),
    });
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const newOptions = [...question.options];
    newOptions[optionIndex] = value;

    updateQuestion(questionId, { options: newOptions });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Quiz Title *
        </label>
        <input
          type="text"
          value={lesson.title}
          onChange={(e) => updateLesson(lessonId, { title: e.target.value })}
          placeholder="e.g., Blockchain Fundamentals Quiz"
          maxLength={100}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors text-lg"
        />
      </div>

      {/* Estimated Minutes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Estimated Time (minutes)
        </label>
        <input
          type="number"
          value={lesson.estimatedMinutes || 5}
          onChange={(e) => updateLesson(lessonId, { estimatedMinutes: parseInt(e.target.value) || 5 })}
          min="1"
          max="30"
          className="w-32 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors text-center"
        />
      </div>

      {/* XP Reward */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          XP Reward
        </label>
        <input
          type="number"
          value={lesson.xpReward || 20}
          onChange={(e) => updateLesson(lessonId, { xpReward: parseInt(e.target.value) || 20 })}
          min="10"
          max="100"
          step="5"
          className="w-32 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors text-center"
        />
        <p className="text-sm text-gray-500 mt-2">
          Typically 20 XP for quiz lessons
        </p>
      </div>

      {/* Questions Count */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">
          Questions: {questions.length}
        </span>
        <Button
          onClick={addQuestion}
          className="bg-[#0084C7] text-white rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-2">No questions yet</p>
          <p className="text-sm text-gray-500">Click "Add Question" to create your first quiz question</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question, qIndex) => (
            <div
              key={question.id}
              className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-[#0084C7] transition-all"
            >
              {/* Question Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-8 h-8 bg-[#0084C7] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">{qIndex + 1}</span>
                </div>
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                  placeholder="Enter your question..."
                  className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors"
                />
                <button
                  onClick={() => deleteQuestion(question.id)}
                  className="w-10 h-10 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>

              {/* Options */}
              <div className="space-y-2 ml-12">
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuestion(question.id, { correctAnswer: oIndex })}
                      className={`flex-shrink-0 ${
                        question.correctAnswer === oIndex
                          ? 'text-green-600'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {question.correctAnswer === oIndex ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <span className="w-8 text-sm font-semibold text-gray-700">
                      {String.fromCharCode(65 + oIndex)}.
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(question.id, oIndex, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                      className={`flex-1 px-4 py-2 rounded-xl border-2 transition-colors ${
                        question.correctAnswer === oIndex
                          ? 'border-green-300 bg-green-50 focus:border-green-500'
                          : 'border-gray-200 focus:border-[#0084C7]'
                      } focus:outline-none`}
                    />
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div className="mt-4 ml-12">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Explanation (shown after answering)
                </label>
                <textarea
                  value={question.explanation}
                  onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                  placeholder="Explain why this is the correct answer..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quiz Guidelines */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
        <h4 className="font-bold text-gray-900 mb-3">❓ Writing Effective Quiz Questions</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• <strong>Clear Questions:</strong> Make sure each question is unambiguous</li>
          <li>• <strong>Realistic Distractors:</strong> Wrong answers should be plausible but clearly incorrect</li>
          <li>• <strong>One Correct Answer:</strong> Only one option should be completely correct</li>
          <li>• <strong>Helpful Explanations:</strong> Provide context and reasoning in explanations</li>
          <li>• <strong>Test Understanding:</strong> Focus on concepts, not memorization</li>
        </ul>
      </div>

      {/* Tips */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <h4 className="font-bold text-gray-900 mb-3">💡 Quiz Best Practices</h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-green-500 font-bold flex-shrink-0">✓</span>
            <div>
              <p className="font-semibold text-gray-900">Good Question:</p>
              <p className="text-gray-700">"Which consensus mechanism does Hedera use?"</p>
              <p className="text-gray-600 italic mt-1">Clear, specific, tests knowledge</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-red-500 font-bold flex-shrink-0">✗</span>
            <div>
              <p className="font-semibold text-gray-900">Avoid:</p>
              <p className="text-gray-700">"Is Hedera good?"</p>
              <p className="text-gray-600 italic mt-1">Too subjective, vague</p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Tip:</strong> Click the circle next to an option to mark it as the correct answer (shows as green)
          </p>
        </div>
      </div>
    </div>
  );
}
