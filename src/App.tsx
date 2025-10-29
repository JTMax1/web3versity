import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { LandingPage } from './components/pages/LandingPage';
import { Dashboard } from './components/pages/Dashboard';
import { CourseCatalog } from './components/pages/CourseCatalog';
import { CourseViewer } from './components/pages/CourseViewer';
import { CodePlayground } from './components/pages/CodePlayground';
import { Leaderboard } from './components/pages/Leaderboard';
import { Faucet } from './components/pages/Faucet';
import { Community } from './components/pages/Community';
import { Profile } from './components/pages/Profile';
import VerifyCertificate from './components/pages/VerifyCertificate';
import { AIGenerator } from './components/pages/AIGenerator';
import { CreateCoursePage } from './components/pages/CreateCoursePage';
import { AdminReviewDashboard } from './components/admin/AdminReviewDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { mockDiscussions } from './lib/mockData';
import { Toaster } from './components/ui/sonner';
import { WalletProvider } from './contexts/WalletContext';
import { MetamaskPrompt } from './components/MetamaskPrompt';

function AppContent() {

  return (
    <div className="min-h-screen">
      <Navigation />

      <Routes>
        {/* Public Routes - No authentication required */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/verify" element={<VerifyCertificate />} />

        {/* Guest-Accessible Routes - Can view but actions require auth */}
        <Route path="/courses" element={<CourseCatalog />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/community" element={<Community discussions={mockDiscussions} />} />

        {/* Protected Routes - Require authentication */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses/:courseId"
          element={
            <ProtectedRoute>
              <CourseViewer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playground"
          element={
            <ProtectedRoute>
              <CodePlayground />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faucet"
          element={
            <ProtectedRoute>
              <Faucet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai/generate"
          element={
            <ProtectedRoute>
              <AIGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-course"
          element={
            <ProtectedRoute>
              <CreateCoursePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/review"
          element={
            <ProtectedRoute>
              <AdminReviewDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <MetamaskPrompt />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
          },
          success: {
            style: {
              background: '#10B981',
              color: '#fff',
              border: '2px solid #059669',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10B981',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: '#fff',
              border: '2px solid #DC2626',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#EF4444',
            },
          },
          loading: {
            style: {
              background: '#F59E0B',
              color: '#fff',
              border: '2px solid #D97706',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#F59E0B',
            },
          },
          // Warning uses same as loading (orange)
          warning: {
            style: {
              background: '#F59E0B',
              color: '#fff',
              border: '2px solid #D97706',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#F59E0B',
            },
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </WalletProvider>
  );
}
