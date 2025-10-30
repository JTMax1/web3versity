import React, { useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { Navigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { OverviewTab } from './tabs/OverviewTab';
import { UserRoleManagementTab } from './tabs/UserRoleManagementTab';
import { CourseManagementTab } from './tabs/CourseManagementTab';
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { BadgesTab } from './tabs/BadgesTab';
import { SettingsTab } from './tabs/SettingsTab';

type Tab = 'overview' | 'users' | 'courses' | 'analytics' | 'badges' | 'settings';

export function AdminDashboard() {
  const { user } = useWallet();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Check if user is admin
  if (!user?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] py-12">
      <div className="container mx-auto px-4">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-full flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="mb-1">Admin Dashboard</h1>
              <p className="text-gray-600">Platform management and analytics</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-white rounded-full p-1 shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_-2px_-2px_8px_rgba(0,0,0,0.02),inset_2px_2px_8px_rgba(255,255,255,0.9)] max-w-4xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-2 rounded-full transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white shadow-[0_2px_8px_rgba(0,132,199,0.3)]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 px-6 py-2 rounded-full transition-all ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white shadow-[0_2px_8px_rgba(0,132,199,0.3)]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex-1 px-6 py-2 rounded-full transition-all ${
              activeTab === 'courses'
                ? 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white shadow-[0_2px_8px_rgba(0,132,199,0.3)]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Courses
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 px-6 py-2 rounded-full transition-all ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white shadow-[0_2px_8px_rgba(0,132,199,0.3)]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 px-6 py-2 rounded-full transition-all ${
              activeTab === 'badges'
                ? 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white shadow-[0_2px_8px_rgba(0,132,199,0.3)]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Badges
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-6 py-2 rounded-full transition-all ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white shadow-[0_2px_8px_rgba(0,132,199,0.3)]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'users' && <UserRoleManagementTab />}
          {activeTab === 'courses' && <CourseManagementTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'badges' && <BadgesTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}
