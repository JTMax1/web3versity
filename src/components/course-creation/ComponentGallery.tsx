/**
 * Component Gallery
 *
 * Visual gallery for browsing and selecting interactive/practical components.
 * Features category filtering, search, difficulty badges, and preview modals.
 */

import React, { useState, useMemo } from 'react';
import { INTERACTIVE_TYPES, InteractiveType } from '../../lib/course-creation/interactive-types';
import { PRACTICAL_TYPES, PracticalType } from '../../lib/course-creation/practical-types';
import { Button } from '../ui/button';
import { Search, X, AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

type ComponentType = 'interactive' | 'practical';

interface ComponentGalleryProps {
  onSelect: (type: ComponentType, componentId: string) => void;
  onClose: () => void;
}

export function ComponentGallery({ onSelect, onClose }: ComponentGalleryProps) {
  const [componentType, setComponentType] = useState<ComponentType>('interactive');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [previewComponent, setPreviewComponent] = useState<InteractiveType | PracticalType | null>(null);

  // Get all components based on type
  const allComponents = componentType === 'interactive' ? INTERACTIVE_TYPES : PRACTICAL_TYPES;

  // Get unique categories
  const categories = useMemo(() => {
    if (componentType === 'interactive') {
      const cats = [...new Set(INTERACTIVE_TYPES.map(c => c.category))];
      return ['all', ...cats];
    }
    return ['all'];
  }, [componentType]);

  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  // Filter components
  const filteredComponents = useMemo(() => {
    return allComponents.filter((component) => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === 'all' ||
        ('category' in component && component.category === selectedCategory);

      // Difficulty filter
      const matchesDifficulty = selectedDifficulty === 'all' ||
        component.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [allComponents, searchQuery, selectedCategory, selectedDifficulty]);

  const handleSelect = (componentId: string) => {
    onSelect(componentType, componentId);
    onClose();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Component Gallery</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Type Selector */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                setComponentType('interactive');
                setSelectedCategory('all');
              }}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                componentType === 'interactive'
                  ? 'bg-[#0084C7] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🎮 Interactive ({INTERACTIVE_TYPES.length})
            </button>
            <button
              onClick={() => {
                setComponentType('practical');
                setSelectedCategory('all');
              }}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                componentType === 'practical'
                  ? 'bg-[#0084C7] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💸 Practical ({PRACTICAL_TYPES.length})
            </button>
          </div>

          {/* Search & Filters */}
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search components by name, description, or tags..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none transition-colors"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              {/* Category Filter (Interactive only) */}
              {componentType === 'interactive' && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none bg-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              )}

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-[#0084C7] focus:outline-none bg-white"
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>
                    {diff === 'all' ? 'All Difficulties' : diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredComponents.length} of {allComponents.length} components
          </div>
        </div>

        {/* Components Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {filteredComponents.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <p className="text-gray-600 mb-2">No components found</p>
              <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredComponents.map((component) => (
                <div
                  key={component.id}
                  className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-[#0084C7] transition-all cursor-pointer group hover:shadow-lg"
                  onClick={() => setPreviewComponent(component)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{component.emoji}</div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getDifficultyColor(component.difficulty)}`}>
                      {component.difficulty}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#0084C7] transition-colors">
                    {component.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {component.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{component.estimatedMinutes} min</span>
                    </div>
                    {'category' in component && (
                      <span className="bg-gray-100 px-2 py-1 rounded-full">
                        {component.category}
                      </span>
                    )}
                    {'requiresTestnet' in component && component.requiresTestnet && (
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Testnet
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {component.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Add Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(component.id);
                    }}
                    className="w-full bg-[#0084C7] text-white rounded-xl group-hover:shadow-md"
                    size="sm"
                  >
                    Add to Lesson
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewComponent && (
        <Dialog open={!!previewComponent} onOpenChange={() => setPreviewComponent(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{previewComponent.emoji}</span>
                <div className="flex-1">
                  <DialogTitle className="text-2xl">{previewComponent.name}</DialogTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getDifficultyColor(previewComponent.difficulty)}`}>
                      {previewComponent.difficulty}
                    </span>
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {previewComponent.estimatedMinutes} minutes
                    </span>
                  </div>
                </div>
              </div>
              <DialogDescription className="text-base text-gray-700">
                {previewComponent.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Category */}
              {'category' in previewComponent && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Category</h4>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {previewComponent.category}
                  </span>
                </div>
              )}

              {/* Tags */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {previewComponent.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Testnet Warning */}
              {'requiresTestnet' in previewComponent && previewComponent.requiresTestnet && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-900 mb-1">Testnet Required</p>
                      <p className="text-sm text-orange-800">{previewComponent.warning}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Prerequisites */}
              {'prerequisites' in previewComponent && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Prerequisites</h4>
                  <ul className="space-y-2">
                    {previewComponent.prerequisites.map((prereq, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Add Button */}
              <Button
                onClick={() => handleSelect(previewComponent.id)}
                className="w-full bg-[#0084C7] text-white rounded-xl py-6 text-lg"
              >
                Add to Lesson
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
