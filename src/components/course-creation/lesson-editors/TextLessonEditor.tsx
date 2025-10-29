/**
 * Text Lesson Editor
 *
 * Editor for text-based lessons with markdown support.
 */

import React, { useState } from 'react';
import { useCourseCreationStore } from '../../../stores/course-creation-store';
import { Eye, Edit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface TextLessonEditorProps {
  lessonId: string;
}

export function TextLessonEditor({ lessonId }: TextLessonEditorProps) {
  const { draft, updateLesson } = useCourseCreationStore();
  const lesson = draft.lessons.find(l => l.id === lessonId);
  const [previewMode, setPreviewMode] = useState(false);

  if (!lesson || lesson.type !== 'text') return null;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Lesson Title *
        </label>
        <input
          type="text"
          value={lesson.title}
          onChange={(e) => updateLesson(lessonId, { title: e.target.value })}
          placeholder="e.g., Understanding Blockchain Consensus"
          maxLength={100}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors text-lg"
        />
      </div>

      {/* Estimated Minutes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Estimated Reading Time (minutes)
        </label>
        <input
          type="number"
          value={lesson.estimatedMinutes || 5}
          onChange={(e) => updateLesson(lessonId, { estimatedMinutes: parseInt(e.target.value) || 5 })}
          min="1"
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
          value={lesson.xpReward || 10}
          onChange={(e) => updateLesson(lessonId, { xpReward: parseInt(e.target.value) || 10 })}
          min="5"
          max="100"
          step="5"
          className="w-32 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors text-center"
        />
        <p className="text-sm text-gray-500 mt-2">
          Typically 10 XP for text lessons
        </p>
      </div>

      {/* Content Editor */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">
            Lesson Content * (Markdown Supported)
          </label>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-semibold"
          >
            {previewMode ? (
              <>
                <Edit className="w-4 h-4" />
                Edit
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Preview
              </>
            )}
          </button>
        </div>

        {previewMode ? (
          <div className="min-h-[400px] p-6 rounded-xl border-2 border-gray-200 bg-gray-50 prose prose-blue max-w-none">
            <ReactMarkdown>{lesson.content || '_No content yet_'}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={lesson.content || ''}
            onChange={(e) => updateLesson(lessonId, { content: e.target.value })}
            placeholder="Write your lesson content here. You can use markdown formatting:

# Heading 1
## Heading 2

**Bold text** and *italic text*

- Bullet point 1
- Bullet point 2

[Links](https://example.com)

`code snippets`

```
code blocks
```"
            rows={20}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors resize-none font-mono text-sm"
          />
        )}
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-500">
            Use markdown for formatting. Preview before saving.
          </p>
          <span className="text-sm text-gray-400">{(lesson.content || '').length} characters</span>
        </div>
      </div>

      {/* Markdown Guide */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
        <h4 className="font-bold text-gray-900 mb-3">📝 Markdown Quick Reference</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-900 mb-2">Basic Formatting:</p>
            <ul className="space-y-1 text-gray-700 font-mono text-xs">
              <li>**bold** → <strong>bold</strong></li>
              <li>*italic* → <em>italic</em></li>
              <li>`code` → <code>code</code></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-2">Structure:</p>
            <ul className="space-y-1 text-gray-700 font-mono text-xs">
              <li># Heading 1</li>
              <li>## Heading 2</li>
              <li>- Bullet point</li>
              <li>[Link](url)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <h4 className="font-bold text-gray-900 mb-3">💡 Writing Effective Text Lessons</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Break content into digestible sections with headings</li>
          <li>• Use bullet points and numbered lists for clarity</li>
          <li>• Include examples and analogies to explain complex concepts</li>
          <li>• Keep paragraphs short (2-4 sentences)</li>
          <li>• Use bold for key terms and concepts</li>
          <li>• Add links to additional resources when helpful</li>
        </ul>
      </div>
    </div>
  );
}
