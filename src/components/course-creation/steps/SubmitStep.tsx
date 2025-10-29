/**
 * Step 5: Submit for Review
 *
 * Final submission step where educators submit their course for admin review.
 */

import React, { useState } from 'react';
import { useCourseCreationStore } from '../../../stores/course-creation-store';
import { Button } from '../../ui/button';
import { Send, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SubmitStep() {
  const navigate = useNavigate();
  const { draft, isSubmitting, validateAll, submitForReview, saveDraft } = useCourseCreationStore();
  const [agreed, setAgreed] = useState(false);

  const validationErrors = validateAll();
  const errors = validationErrors.filter(e => e.severity === 'error');
  const hasErrors = errors.length > 0;

  const handleSubmit = async () => {
    // Save draft first
    const saved = await saveDraft();
    if (!saved) {
      return;
    }

    // Submit for review
    const success = await submitForReview();
    if (success) {
      // Navigate to dashboard or my courses page
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit for Review</h2>
        <p className="text-gray-600">
          Your course is ready to be submitted to our admin team for review.
        </p>
      </div>

      {/* Submission Requirements */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Submission Requirements</h3>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            {!hasErrors ? (
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`font-semibold ${!hasErrors ? 'text-green-900' : 'text-red-900'}`}>
                All Validation Checks Passed
              </p>
              {hasErrors && (
                <p className="text-sm text-red-700 mt-1">
                  {errors.length} error{errors.length !== 1 ? 's' : ''} must be fixed before submission
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            {draft.id ? (
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`font-semibold ${draft.id ? 'text-green-900' : 'text-yellow-900'}`}>
                Draft Saved
              </p>
              {!draft.id && (
                <p className="text-sm text-yellow-700 mt-1">
                  Your course will be saved automatically when you submit
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            {agreed ? (
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`font-semibold ${agreed ? 'text-green-900' : 'text-gray-900'}`}>
                Terms Accepted
              </p>
              {!agreed && (
                <p className="text-sm text-gray-600 mt-1">
                  Please agree to the submission terms below
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Timeline */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">What to Expect</h3>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-[#0084C7] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">1</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Submission</h4>
              <p className="text-sm text-gray-700">
                Your course enters the admin review queue immediately
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 bg-[#0084C7] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">2</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Admin Review</h4>
              <p className="text-sm text-gray-700">
                Typically completed within 2-3 business days
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 bg-[#0084C7] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">3</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Notification</h4>
              <p className="text-sm text-gray-700">
                You'll receive an email with the review decision and any feedback
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Publication</h4>
              <p className="text-sm text-gray-700">
                If approved, your course goes live and students can enroll
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Terms */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Submission Terms</h3>

        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Content Ownership & Licensing</h4>
            <ul className="space-y-1 ml-4">
              <li>• You retain ownership of your course content</li>
              <li>• By submitting, you grant Web3Versity a license to host and distribute your course</li>
              <li>• You confirm that all content is original or properly licensed</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Quality Standards</h4>
            <ul className="space-y-1 ml-4">
              <li>• Content must be accurate, educational, and free from errors</li>
              <li>• Language should be professional and appropriate for all ages</li>
              <li>• Courses must follow our content guidelines</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Review Process</h4>
            <ul className="space-y-1 ml-4">
              <li>• Admins may request revisions before approval</li>
              <li>• Courses may be rejected if they don't meet quality standards</li>
              <li>• You can resubmit after making requested changes</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Course Management</h4>
            <ul className="space-y-1 ml-4">
              <li>• You can update courses after publication (updates require re-review)</li>
              <li>• Published courses may be unpublished if they violate terms</li>
              <li>• Students enrolled before unpublishing retain access</li>
            </ul>
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-gray-300 text-[#0084C7] focus:ring-[#0084C7] mt-0.5"
            />
            <span className="text-sm text-gray-700">
              I have read and agree to the submission terms. I confirm that all course content is accurate,
              original or properly licensed, and complies with Web3Versity's content guidelines.
            </span>
          </label>
        </div>
      </div>

      {/* Error Display */}
      {hasErrors && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 mb-2">Cannot Submit - Errors Found</p>
              <ul className="space-y-1 text-sm text-red-800">
                {errors.map((error, index) => (
                  <li key={index}>• {error.message}</li>
                ))}
              </ul>
              <p className="text-sm text-red-800 mt-3">
                Please go back to previous steps and fix these issues before submitting.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-center">
        <Button
          onClick={handleSubmit}
          disabled={hasErrors || !agreed || isSubmitting}
          className={`px-12 py-6 rounded-2xl text-lg font-semibold transition-all ${
            hasErrors || !agreed
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-[0_6px_24px_rgba(34,197,94,0.4)]'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-3" />
              Submit Course for Review
            </>
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-center text-sm text-gray-600">
        <p>
          Need help? Contact us at <a href="mailto:support@web3versity.com" className="text-[#0084C7] hover:underline">support@web3versity.com</a>
        </p>
      </div>
    </div>
  );
}
