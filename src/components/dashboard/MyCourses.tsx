/**
 * My Courses Component
 *
 * Displays user's created course drafts with filtering and management options
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import {
  BookOpen,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

interface CourseDraft {
  id: string;
  title: string;
  description: string;
  track: string;
  difficulty: string;
  estimated_hours: number;
  lessons: any[];
  learning_objectives: any[];
  draft_status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  review_notes?: string;
}

interface MyCoursesProps {
  userId: string;
}

export function MyCourses({ userId }: MyCoursesProps) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseDraft[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'pending_review' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (userId) {
      loadMyCourses();
    }
  }, [userId]);

  useEffect(() => {
    applyFilters();
  }, [courses, filterStatus, searchQuery]);

  const loadMyCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('course_drafts')
        .select('*')
        .eq('creator_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Parse course_data JSONB field
      const parsedCourses = (data || []).map((draft) => ({
        id: draft.id,
        title: draft.course_data?.title || 'Untitled Course',
        description: draft.course_data?.description || '',
        track: draft.course_data?.track || 'explorer',
        difficulty: draft.course_data?.difficulty || 'beginner',
        estimated_hours: draft.course_data?.estimated_hours || 1,
        lessons: draft.course_data?.lessons || [],
        learning_objectives: draft.course_data?.learning_objectives || [],
        draft_status: draft.draft_status,
        created_at: draft.created_at,
        updated_at: draft.updated_at,
        review_notes: draft.review_notes,
      }));

      setCourses(parsedCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...courses];

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((course) => course.draft_status === filterStatus);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query)
      );
    }

    setFilteredCourses(filtered);
  };

  const handleEdit = (draftId: string) => {
    navigate(`/create-course?draft=${draftId}`);
  };

  const handleDelete = async (draftId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase.from('course_drafts').delete().eq('id', draftId);

      if (error) throw error;

      toast.success('Course deleted successfully');
      loadMyCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <span className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            <Edit className="w-3 h-3" />
            Draft
          </span>
        );
      case 'pending_review':
        return (
          <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            <CheckCircle className="w-3 h-3" />
            Published
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-[#0084C7] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
          <p className="text-gray-600 mt-1">Manage your course drafts and published courses</p>
        </div>
        <Button
          onClick={() => navigate('/create-course')}
          className="bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white rounded-xl px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Course
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#0084C7] focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-xl transition-all ${
                filterStatus === 'all'
                  ? 'bg-[#0084C7] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('draft')}
              className={`px-4 py-2 rounded-xl transition-all ${
                filterStatus === 'draft'
                  ? 'bg-[#0084C7] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Drafts
            </button>
            <button
              onClick={() => setFilterStatus('pending_review')}
              className={`px-4 py-2 rounded-xl transition-all ${
                filterStatus === 'pending_review'
                  ? 'bg-[#0084C7] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-4 py-2 rounded-xl transition-all ${
                filterStatus === 'approved'
                  ? 'bg-[#0084C7] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-4 py-2 rounded-xl transition-all ${
                filterStatus === 'rejected'
                  ? 'bg-[#0084C7] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>
      </div>

      {/* Courses List */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {courses.length === 0 ? 'No Courses Yet' : 'No Matching Courses'}
          </h3>
          <p className="text-gray-600 mb-6">
            {courses.length === 0
              ? 'Start creating your first course to share knowledge with the Web3Versity community'
              : 'Try adjusting your filters or search query'}
          </p>
          {courses.length === 0 && (
            <Button
              onClick={() => navigate('/create-course')}
              className="bg-[#0084C7] text-white rounded-xl px-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Course
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-[#0084C7] transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-start gap-6">
                {/* Course Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-[#0084C7] to-[#00a8e8] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>

                {/* Course Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                    {getStatusBadge(course.draft_status)}
                  </div>

                  <p className="text-gray-700 mb-3 line-clamp-2">{course.description}</p>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                    <span className="bg-gray-100 px-3 py-1 rounded-full capitalize">{course.track}</span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full capitalize">{course.difficulty}</span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full">
                      {course.estimated_hours}h
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full">
                      {course.lessons.length} lessons
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full">
                      {course.learning_objectives.length} objectives
                    </span>
                  </div>

                  {/* Review Notes (if rejected) */}
                  {course.draft_status === 'rejected' && course.review_notes && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-3">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-800">
                        <strong>Admin Feedback:</strong> {course.review_notes}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date(course.updated_at).toLocaleString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {(course.draft_status === 'draft' || course.draft_status === 'rejected') && (
                    <>
                      <Button
                        onClick={() => handleEdit(course.id)}
                        className="bg-[#0084C7] text-white rounded-xl px-4 py-2"
                        size="sm"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(course.id, course.title)}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 rounded-xl px-4 py-2"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </>
                  )}
                  {course.draft_status === 'pending_review' && (
                    <div className="text-sm text-amber-600 text-center px-4 py-2">
                      Awaiting admin review
                    </div>
                  )}
                  {course.draft_status === 'approved' && (
                    <Button
                      onClick={() => navigate(`/course/${course.id}`)}
                      className="bg-green-600 text-white rounded-xl px-4 py-2"
                      size="sm"
                    >
                      View Published
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
