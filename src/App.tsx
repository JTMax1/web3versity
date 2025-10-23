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
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/verify" element={<VerifyCertificate />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <CourseCatalog />
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
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
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
          path="/community"
          element={
            <ProtectedRoute>
              <Community discussions={mockDiscussions} />
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
