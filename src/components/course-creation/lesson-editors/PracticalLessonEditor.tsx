/**
 * Practical Lesson Editor
 *
 * Editor for practical lessons requiring real testnet interactions.
 */

import React from 'react';
import { useCourseCreationStore } from '../../../stores/course-creation-store';
import { Button } from '../../ui/button';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { getPracticalById } from '../../../lib/course-creation/practical-types';

interface PracticalLessonEditorProps {
  lessonId: string;
}

export function PracticalLessonEditor({ lessonId }: PracticalLessonEditorProps) {
  const { draft, updateLesson } = useCourseCreationStore();
  const lesson = draft.lessons.find(l => l.id === lessonId);

  if (!lesson || lesson.type !== 'practical') return null;

  const practicalInfo = lesson.practicalType ? getPracticalById(lesson.practicalType) : null;
  const config = lesson.practicalConfig || { objective: '', steps: [], tips: [] };

  const addStep = () => {
    updateLesson(lessonId, {
      practicalConfig: {
        ...config,
        steps: [...config.steps, ''],
      },
    });
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...config.steps];
    newSteps[index] = value;
    updateLesson(lessonId, {
      practicalConfig: {
        ...config,
        steps: newSteps,
      },
    });
  };

  const deleteStep = (index: number) => {
    updateLesson(lessonId, {
      practicalConfig: {
        ...config,
        steps: config.steps.filter((_, i) => i !== index),
      },
    });
  };

  const addTip = () => {
    updateLesson(lessonId, {
      practicalConfig: {
        ...config,
        tips: [...config.tips, ''],
      },
    });
  };

  const updateTip = (index: number, value: string) => {
    const newTips = [...config.tips];
    newTips[index] = value;
    updateLesson(lessonId, {
      practicalConfig: {
        ...config,
        tips: newTips,
      },
    });
  };

  const deleteTip = (index: number) => {
    updateLesson(lessonId, {
      practicalConfig: {
        ...config,
        tips: config.tips.filter((_, i) => i !== index),
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Practical Component Info */}
      {practicalInfo && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{practicalInfo.emoji}</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{practicalInfo.name}</h3>
              <p className="text-gray-700 mb-3">{practicalInfo.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {practicalInfo.difficulty}
                </span>
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                  {practicalInfo.estimatedMinutes} minutes
                </span>
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Requires Testnet
                </span>
              </div>

              {/* Prerequisites */}
              <div className="bg-white rounded-xl p-4 mb-3">
                <h4 className="font-semibold text-gray-900 mb-2">Student Prerequisites:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  {practicalInfo.prerequisites.map((prereq, index) => (
                    <li key={index}>• {prereq}</li>
                  ))}
                </ul>
              </div>

              {/* Warning */}
              <div className="bg-amber-100 rounded-xl p-4">
                <p className="text-sm text-amber-900">
                  <strong>⚠️ Important:</strong> {practicalInfo.warning}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Lesson Title *
        </label>
        <input
          type="text"
          value={lesson.title}
          onChange={(e) => updateLesson(lessonId, { title: e.target.value })}
          placeholder="e.g., Your First HBAR Transaction"
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
          value={lesson.estimatedMinutes || practicalInfo?.estimatedMinutes || 10}
          onChange={(e) => updateLesson(lessonId, { estimatedMinutes: parseInt(e.target.value) || 10 })}
          min="5"
          max="60"
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
          value={lesson.xpReward || 50}
          onChange={(e) => updateLesson(lessonId, { xpReward: parseInt(e.target.value) || 50 })}
          min="30"
          max="100"
          step="5"
          className="w-32 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors text-center"
        />
        <p className="text-sm text-gray-500 mt-2">
          Typically 50 XP for practical lessons (higher due to hands-on nature)
        </p>
      </div>

      {/* Learning Objective */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Learning Objective *
        </label>
        <textarea
          value={config.objective}
          onChange={(e) => updateLesson(lessonId, {
            practicalConfig: { ...config, objective: e.target.value }
          })}
          placeholder="What will students learn by completing this practical exercise?"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors resize-none"
        />
      </div>

      {/* Steps */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">
            Step-by-Step Instructions *
          </label>
          <Button
            onClick={addStep}
            size="sm"
            className="bg-[#0084C7] text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Step
          </Button>
        </div>

        {config.steps.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-gray-600 text-sm">No steps yet. Add instructions for students.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {config.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#0084C7] rounded-full flex items-center justify-center flex-shrink-0 mt-2">
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
                <input
                  type="text"
                  value={step}
                  onChange={(e) => updateStep(index, e.target.value)}
                  placeholder={`Step ${index + 1}: What should the student do?`}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors"
                />
                <button
                  onClick={() => deleteStep(index)}
                  className="w-10 h-10 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center transition-colors mt-2"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">
            Helpful Tips
          </label>
          <Button
            onClick={addTip}
            size="sm"
            variant="outline"
            className="rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Tip
          </Button>
        </div>

        {config.tips.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-gray-600 text-sm">No tips yet. Add helpful hints for students.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {config.tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-xl mt-1">💡</span>
                <input
                  type="text"
                  value={tip}
                  onChange={(e) => updateTip(index, e.target.value)}
                  placeholder={`Helpful tip ${index + 1}`}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors"
                />
                <button
                  onClick={() => deleteTip(index)}
                  className="w-10 h-10 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center transition-colors mt-1"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Sender Specific Config */}
      {lesson.practicalType === 'transaction_sender' && (
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-4">Optional Pre-filled Values</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Default Recipient (optional)
              </label>
              <input
                type="text"
                value={config.defaultRecipient || ''}
                onChange={(e) => updateLesson(lessonId, {
                  practicalConfig: { ...config, defaultRecipient: e.target.value }
                })}
                placeholder="0.0.xxxxx"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Default Amount (HBAR)
              </label>
              <input
                type="number"
                value={config.defaultAmount || ''}
                onChange={(e) => updateLesson(lessonId, {
                  practicalConfig: { ...config, defaultAmount: parseFloat(e.target.value) || undefined }
                })}
                placeholder="1.0"
                step="0.01"
                className="w-32 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none text-center"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Default Memo
              </label>
              <input
                type="text"
                value={config.defaultMemo || ''}
                onChange={(e) => updateLesson(lessonId, {
                  practicalConfig: { ...config, defaultMemo: e.target.value }
                })}
                placeholder="My first transaction"
                maxLength={100}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Guidelines */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <h4 className="font-bold text-gray-900 mb-3">💸 Practical Lesson Best Practices</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• <strong>Clear Instructions:</strong> Break down each step in detail</li>
          <li>• <strong>Safety First:</strong> Remind students they're using testnet HBAR</li>
          <li>• <strong>Troubleshooting:</strong> Add tips for common issues</li>
          <li>• <strong>Context:</strong> Explain why each action matters</li>
          <li>• <strong>Resources:</strong> Link to testnet faucets if needed</li>
        </ul>
      </div>
    </div>
  );
}
