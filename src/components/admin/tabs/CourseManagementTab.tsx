import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PlatformCoursesSubTab } from './PlatformCoursesSubTab';
import { PublishRequestsSubTab } from './PublishRequestsSubTab';
import { Button } from '../../ui/button';

type SubTab = 'platform' | 'requests';

export function CourseManagementTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('platform');
  const navigate = useNavigate();

  const handleCreateCourse = () => {
    navigate('/create-course');
  };

  return (
    <div className="space-y-6">
      {/* Header with Sub-tab Navigation and Create Button */}
      <div className="flex items-center justify-between">
        <div className="bg-white rounded-2xl p-2 shadow-sm inline-flex gap-2">
          <button
            onClick={() => setActiveSubTab('platform')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
              activeSubTab === 'platform'
                ? 'bg-[#0084C7] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Platform Courses
          </button>
          <button
            onClick={() => setActiveSubTab('requests')}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
              activeSubTab === 'requests'
                ? 'bg-[#0084C7] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Publish Requests
          </button>
        </div>

        {/* Create Course Button */}
        <Button
          onClick={handleCreateCourse}
          className="bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white rounded-2xl px-6 py-2.5 shadow-[0_4px_16px_rgba(0,132,199,0.3)] hover:shadow-[0_6px_24px_rgba(0,132,199,0.4)] transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Platform Course
        </Button>
      </div>

      {/* Sub-tab Content */}
      {activeSubTab === 'platform' && <PlatformCoursesSubTab />}
      {activeSubTab === 'requests' && <PublishRequestsSubTab />}
    </div>
  );
}
