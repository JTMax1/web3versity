/**
 * Step 3: Lessons Editor
 *
 * Main interface for creating and managing course lessons.
 * Supports Text, Interactive, Quiz, and Practical lesson types.
 */

import React, { useState } from 'react';
import { useCourseCreationStore, LessonContent } from '../../../stores/course-creation-store';
import { Button } from '../../ui/button';
import { Plus, GripVertical, Trash2, Copy, Edit2 } from 'lucide-react';
import { ComponentGallery } from '../ComponentGallery';
import { TextLessonEditor } from '../lesson-editors/TextLessonEditor';
import { QuizLessonEditor } from '../lesson-editors/QuizLessonEditor';
import { PracticalLessonEditor } from '../lesson-editors/PracticalLessonEditor';

type LessonType = 'text' | 'interactive' | 'quiz' | 'practical';

export function LessonsStep() {
  const { draft, addLesson, deleteLesson, duplicateLesson, reorderLessons } = useCourseCreationStore();
  const [showGallery, setShowGallery] = useState(false);
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [selectedLessonType, setSelectedLessonType] = useState<LessonType | null>(null);

  const lessonTypes = [
    { type: 'text' as LessonType, label: 'Text Lesson', emoji: '📝', description: 'Written content with markdown support' },
    { type: 'interactive' as LessonType, label: 'Interactive', emoji: '🎮', description: 'Pre-built interactive components' },
    { type: 'quiz' as LessonType, label: 'Quiz', emoji: '❓', description: 'Multiple choice questions' },
    { type: 'practical' as LessonType, label: 'Practical', emoji: '💸', description: 'Real testnet blockchain interaction' },
  ];

  const handleAddLesson = (type: LessonType) => {
    if (type === 'interactive' || type === 'practical') {
      setSelectedLessonType(type);
      setShowGallery(true);
    } else {
      // For text and quiz, create an empty lesson
      const newLesson: Omit<LessonContent, 'id' | 'order'> = {
        type,
        title: type === 'text' ? 'New Text Lesson' : 'New Quiz',
        content: type === 'text' ? '' : undefined,
        questions: type === 'quiz' ? [] : undefined,
      };
      addLesson(newLesson);
    }
  };

  const handleComponentSelect = (componentType: 'interactive' | 'practical', componentId: string) => {
    const newLesson: Omit<LessonContent, 'id' | 'order'> = {
      type: componentType,
      title: `New ${componentType === 'interactive' ? 'Interactive' : 'Practical'} Lesson`,
      ...(componentType === 'interactive' ? {
        interactiveType: componentId,
        interactiveConfig: {},
      } : {
        practicalType: componentId,
        practicalConfig: {
          objective: '',
          steps: [],
          tips: [],
        },
      }),
    };
    addLesson(newLesson);
    setShowGallery(false);
    setSelectedLessonType(null);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));

    if (sourceIndex === targetIndex) return;

    const newLessons = [...draft.lessons];
    const [removed] = newLessons.splice(sourceIndex, 1);
    newLessons.splice(targetIndex, 0, removed);

    reorderLessons(newLessons);
  };

  const getLessonIcon = (type: LessonType) => {
    switch (type) {
      case 'text': return '📝';
      case 'interactive': return '🎮';
      case 'quiz': return '❓';
      case 'practical': return '💸';
    }
  };

  const getLessonTypeLabel = (lesson: LessonContent) => {
    if (lesson.type === 'interactive' && lesson.interactiveType) {
      return `Interactive: ${lesson.interactiveType.replace(/_/g, ' ')}`;
    }
    if (lesson.type === 'practical' && lesson.practicalType) {
      return `Practical: ${lesson.practicalType.replace(/_/g, ' ')}`;
    }
    return lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1);
  };

  // If editing a lesson, show the appropriate editor
  if (editingLesson) {
    const lesson = draft.lessons.find(l => l.id === editingLesson);
    if (!lesson) {
      setEditingLesson(null);
      return null;
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Edit Lesson</h2>
          <Button
            onClick={() => setEditingLesson(null)}
            variant="outline"
            className="rounded-xl"
          >
            Back to Lessons
          </Button>
        </div>

        {lesson.type === 'text' && <TextLessonEditor lessonId={lesson.id} />}
        {lesson.type === 'quiz' && <QuizLessonEditor lessonId={lesson.id} />}
        {lesson.type === 'practical' && <PracticalLessonEditor lessonId={lesson.id} />}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Lessons</h2>
        <p className="text-gray-600">
          Build your course content with a variety of lesson types. Aim for at least 5 lessons with a mix of formats.
        </p>
      </div>

      {/* Add Lesson Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {lessonTypes.map((lessonType) => (
          <button
            key={lessonType.type}
            onClick={() => handleAddLesson(lessonType.type)}
            className="relative p-6 rounded-2xl border-2 border-gray-200 hover:border-[#0084C7] hover:bg-blue-50 hover:shadow-lg transition-all text-center group bg-white"
          >
            {/* Green Plus Icon */}
            <div className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div className="text-4xl mb-2">{lessonType.emoji}</div>
            <h3 className="font-bold text-gray-900 mb-1">{lessonType.label}</h3>
            <p className="text-xs text-gray-600">{lessonType.description}</p>
          </button>
        ))}
      </div>

      {/* Lessons Count & Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold text-[#0084C7]">{draft.lessons.length}</div>
            <div className="text-sm text-gray-700">Total Lessons</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0084C7]">
              {draft.lessons.filter(l => l.type === 'text').length}
            </div>
            <div className="text-sm text-gray-700">Text Lessons</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0084C7]">
              {draft.lessons.filter(l => l.type === 'interactive' || l.type === 'practical').length}
            </div>
            <div className="text-sm text-gray-700">Interactive</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0084C7]">
              {draft.lessons.filter(l => l.type === 'quiz').length}
            </div>
            <div className="text-sm text-gray-700">Quizzes</div>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      {draft.lessons.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-2">No lessons yet</p>
          <p className="text-sm text-gray-500">Click a button above to add your first lesson</p>
        </div>
      ) : (
        <div className="space-y-3">
          {draft.lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className="bg-white rounded-2xl p-4 border-2 border-gray-200 hover:border-[#0084C7] transition-all cursor-move shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                {/* Drag Handle */}
                <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Number Badge */}
                <div className="w-10 h-10 bg-[#0084C7] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>

                {/* Lesson Icon */}
                <div className="text-2xl">{getLessonIcon(lesson.type)}</div>

                {/* Lesson Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{lesson.title}</h3>
                  <p className="text-sm text-gray-600">{getLessonTypeLabel(lesson)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingLesson(lesson.id)}
                    className="w-10 h-10 bg-blue-50 hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-[#0084C7]" />
                  </button>
                  <button
                    onClick={() => duplicateLesson(lesson.id)}
                    className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => deleteLesson(lesson.id)}
                    className="w-10 h-10 bg-red-50 hover:bg-red-100 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Guidelines */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <h4 className="font-bold text-gray-900 mb-3">📚 Lesson Structure Tips</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• <strong>Start Simple:</strong> Begin with text lessons to introduce concepts</li>
          <li>• <strong>Add Interaction:</strong> Use interactive components to demonstrate ideas</li>
          <li>• <strong>Test Knowledge:</strong> Include quizzes to reinforce learning</li>
          <li>• <strong>Hands-On Practice:</strong> Add practical lessons for real-world experience</li>
          <li>• <strong>Balance:</strong> Aim for less than 60% text-only lessons</li>
        </ul>
      </div>

      {/* Drag & Drop Hint */}
      {draft.lessons.length > 1 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
          <p className="text-sm text-purple-900">
            💡 <strong>Tip:</strong> Drag and drop lessons to reorder them. Structure your course from foundational to advanced topics.
          </p>
        </div>
      )}

      {/* Component Gallery Modal */}
      {showGallery && selectedLessonType && (
        <ComponentGallery
          initialType={selectedLessonType}
          onSelect={handleComponentSelect}
          onClose={() => {
            setShowGallery(false);
            setSelectedLessonType(null);
          }}
        />
      )}
    </div>
  );
}
