import React from 'react';
import { LessonContent } from '../../lib/courseContent';
import { TextLesson } from './lessons/TextLesson';
import { InteractiveLesson } from './lessons/InteractiveLesson';
import { QuizLesson } from './lessons/QuizLesson';
import { PracticalLesson } from './lessons/PracticalLesson';
import { CodeEditorLesson } from './lessons/CodeEditorLesson';

interface LessonViewerProps {
  lesson: LessonContent;
  onComplete: (score?: number) => void;
  isCompleted?: boolean;
  isCompleting?: boolean;
}

export function LessonViewer({ lesson, onComplete, isCompleted = false, isCompleting = false }: LessonViewerProps) {
  // Practical lessons have their own layout, don't wrap them
  if (lesson.type === 'practical') {
    return <PracticalLesson content={lesson.content} onComplete={onComplete} />;
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
      {/* Lesson Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#0084C7]/10 to-[#00a8e8]/20 rounded-2xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
            <span className="text-2xl">
              {lesson.type === 'text' ? '📖' : lesson.type === 'quiz' ? '✍️' : lesson.type === 'code_editor' ? '💻' : '🎮'}
            </span>
          </div>
          <div>
            <div className="text-sm text-gray-600">Lesson {lesson.sequence}</div>
            <h2>{lesson.title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>⏱️ {lesson.duration} min</span>
          <span>•</span>
          <span className="capitalize">{lesson.type === 'code_editor' ? 'Code Editor' : lesson.type}</span>
        </div>
      </div>

      {/* Lesson Content */}
      <div>
        {lesson.type === 'text' && (
          <TextLesson
            content={lesson.content}
            onComplete={onComplete}
            isCompleted={isCompleted}
            isCompleting={isCompleting}
          />
        )}
        {lesson.type === 'interactive' && (
          <InteractiveLesson
            content={lesson.content}
            onComplete={onComplete}
            isCompleted={isCompleted}
            isCompleting={isCompleting}
          />
        )}
        {lesson.type === 'quiz' && (
          <QuizLesson
            content={lesson.content}
            onComplete={onComplete}
            isCompleted={isCompleted}
            isCompleting={isCompleting}
          />
        )}
        {lesson.type === 'code_editor' && (
          <CodeEditorLesson
            content={lesson.content}
            onComplete={onComplete}
            isCompleted={isCompleted}
            isCompleting={isCompleting}
          />
        )}
      </div>
    </div>
  );
}
