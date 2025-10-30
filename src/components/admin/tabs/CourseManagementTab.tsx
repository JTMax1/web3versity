import React, { useState } from 'react';
import { PlatformCoursesSubTab } from './PlatformCoursesSubTab';
import { PublishRequestsSubTab } from './PublishRequestsSubTab';

type SubTab = 'platform' | 'requests';

export function CourseManagementTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('platform');

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
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

      {/* Sub-tab Content */}
      {activeSubTab === 'platform' && <PlatformCoursesSubTab />}
      {activeSubTab === 'requests' && <PublishRequestsSubTab />}
    </div>
  );
}
