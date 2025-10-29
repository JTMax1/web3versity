/**
 * Create Course Page
 *
 * Main page for the course creation wizard.
 * Includes educator permission checks and navigation.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { CourseWizard } from '../course-creation/CourseWizard';
import { useCourseCreationStore } from '../../stores/course-creation-store';
import { Button } from '../ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function CreateCoursePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetStore, loadDraft } = useCourseCreationStore();
  const [isEducator, setIsEducator] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEducatorStatusAndInitialize();
  }, []);

  const checkEducatorStatusAndInitialize = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please log in to create courses');
        navigate('/');
        return;
      }

      // Get database user ID from JWT metadata (same fix as mint-certificate)
      const dbUserId = user.user_metadata?.user_id;

      if (!dbUserId) {
        toast.error('User not properly registered');
        navigate('/dashboard');
        return;
      }

      // Check if user is an educator using database user ID
      const { data, error } = await supabase
        .from('users')
        .select('is_educator')
        .eq('id', dbUserId)
        .single();

      if (error) throw error;

      setIsEducator(data?.is_educator || false);

      if (!data?.is_educator) {
        toast.error('You need educator permissions to create courses');
        return;
      }

      // Handle draft loading or reset
      const draftId = searchParams.get('draft');
      if (draftId) {
        // Load existing draft
        await loadDraft(draftId);
      } else {
        // Reset store for new course
        resetStore();
      }
    } catch (error) {
      console.error('Error checking educator status:', error);
      toast.error('Failed to verify educator status');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0084C7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isEducator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)] text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Educator Access Required</h2>
            <p className="text-gray-700 mb-6">
              You need educator permissions to create courses. Educators can contribute to the
              Web3Versity learning platform by creating high-quality educational content.
            </p>

            <div className="bg-blue-50 rounded-2xl p-6 mb-6 text-left">
              <h3 className="font-bold text-gray-900 mb-3">How to Become an Educator</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Complete at least 3 courses to demonstrate platform familiarity</li>
                <li>• Have an active account with verified email</li>
                <li>• Apply for educator status through your profile settings</li>
                <li>• Wait for admin approval (typically 1-2 business days)</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="rounded-full px-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button
                onClick={() => navigate('/profile')}
                className="bg-[#0084C7] text-white rounded-full px-6"
              >
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Wizard */}
      <CourseWizard />
    </div>
  );
}
