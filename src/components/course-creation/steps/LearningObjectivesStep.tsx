/**
 * Step 2: Learning Objectives
 *
 * Editor for course learning objectives with drag-and-drop reordering.
 */

import React, { useState } from 'react';
import { useCourseCreationStore } from '../../../stores/course-creation-store';
import { Button } from '../../ui/button';
import { Plus, GripVertical, Trash2, Check } from 'lucide-react';

export function LearningObjectivesStep() {
  const {
    draft,
    addObjective,
    updateObjective,
    deleteObjective,
    reorderObjectives,
  } = useCourseCreationStore();

  const [newObjectiveText, setNewObjectiveText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleAddObjective = () => {
    if (newObjectiveText.trim()) {
      addObjective(newObjectiveText.trim());
      setNewObjectiveText('');
    }
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const saveEdit = () => {
    if (editingId && editingText.trim()) {
      updateObjective(editingId, editingText.trim());
      setEditingId(null);
      setEditingText('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
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

    const newObjectives = [...draft.learningObjectives];
    const [removed] = newObjectives.splice(sourceIndex, 1);
    newObjectives.splice(targetIndex, 0, removed);

    reorderObjectives(newObjectives);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Learning Objectives</h2>
        <p className="text-gray-600">
          Define what students will be able to do after completing this course. Aim for 4-10 clear, measurable objectives.
        </p>
      </div>

      {/* Add New Objective */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Add Learning Objective
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={newObjectiveText}
            onChange={(e) => setNewObjectiveText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddObjective()}
            placeholder="e.g., Understand how consensus mechanisms secure blockchain networks"
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors"
            maxLength={200}
          />
          <Button
            onClick={handleAddObjective}
            disabled={!newObjectiveText.trim() || draft.learningObjectives.length >= 10}
            className="bg-[#0084C7] text-white rounded-xl px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Start with action verbs like "Understand", "Create", "Analyze", "Demonstrate"
        </p>
      </div>

      {/* Objectives Count */}
      <div className="flex items-center justify-between px-4">
        <span className="text-sm font-semibold text-gray-700">
          Current Objectives: {draft.learningObjectives.length}
        </span>
        <span className={`text-sm font-semibold ${
          draft.learningObjectives.length >= 4 && draft.learningObjectives.length <= 10
            ? 'text-green-600'
            : 'text-yellow-600'
        }`}>
          {draft.learningObjectives.length < 4 && `Need ${4 - draft.learningObjectives.length} more`}
          {draft.learningObjectives.length >= 4 && draft.learningObjectives.length <= 10 && '✓ Good'}
          {draft.learningObjectives.length > 10 && `${draft.learningObjectives.length - 10} too many`}
        </span>
      </div>

      {/* Objectives List */}
      {draft.learningObjectives.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-2">No learning objectives yet</p>
          <p className="text-sm text-gray-500">Add your first objective above to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {draft.learningObjectives.map((objective, index) => (
            <div
              key={objective.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className="bg-white rounded-2xl p-4 border-2 border-gray-200 hover:border-[#0084C7] transition-all cursor-move shadow-sm hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                {/* Drag Handle */}
                <div className="mt-1 text-gray-400 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Number Badge */}
                <div className="w-8 h-8 bg-[#0084C7] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  {editingId === objective.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                        className="w-full px-3 py-2 rounded-lg border-2 border-[#0084C7] focus:outline-none"
                        maxLength={200}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={saveEdit}
                          size="sm"
                          className="bg-green-500 text-white rounded-lg"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          onClick={cancelEdit}
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p
                      onClick={() => startEdit(objective.id, objective.text)}
                      className="text-gray-900 cursor-pointer hover:text-[#0084C7] transition-colors"
                    >
                      {objective.text}
                    </p>
                  )}
                </div>

                {/* Delete Button */}
                {editingId !== objective.id && (
                  <button
                    onClick={() => deleteObjective(objective.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Guidelines */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <h4 className="font-bold text-gray-900 mb-3">✍️ Writing Great Learning Objectives</h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-green-500 font-bold flex-shrink-0">✓</span>
            <div>
              <p className="font-semibold text-gray-900">Good Example:</p>
              <p className="text-gray-700">"Demonstrate how to send HBAR transactions using Hedera SDK"</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-red-500 font-bold flex-shrink-0">✗</span>
            <div>
              <p className="font-semibold text-gray-900">Avoid:</p>
              <p className="text-gray-700">"Learn about Hedera" (too vague)</p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Pro Tip:</strong> Use Bloom's Taxonomy action verbs: Remember, Understand, Apply, Analyze, Evaluate, Create
          </p>
        </div>
      </div>

      {/* Drag & Drop Hint */}
      {draft.learningObjectives.length > 1 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
          <p className="text-sm text-purple-900">
            💡 <strong>Tip:</strong> Drag and drop objectives to reorder them. Start with foundational concepts and progress to advanced topics.
          </p>
        </div>
      )}
    </div>
  );
}
