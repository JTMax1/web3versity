/**
 * ProtectedRoute Component
 *
 * Wrapper component that ensures user is authenticated before rendering children.
 * Redirects to landing page if not authenticated.
 *
 * Phase 1, Task 1.5 - User Authentication System
 */

import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onNavigate?: (page: string) => void;
  redirectTo?: string;
}

/**
 * ProtectedRoute component
 *
 * Usage:
 * ```tsx
 * <ProtectedRoute onNavigate={handleNavigate}>
 *   <Dashboard />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  onNavigate,
  redirectTo = 'home',
}: ProtectedRouteProps) {
  const { isAuthenticated, loading, authLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0084C7] via-[#00a8e8] to-[#0084C7]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Authenticating...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show message and redirect button
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0084C7] via-[#00a8e8] to-[#0084C7]">
        <div className="bg-white/90 rounded-3xl shadow-2xl p-12 max-w-md text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-3xl font-bold text-[#0084C7] mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-8">
            Please connect your wallet to access this page.
          </p>
          {onNavigate && (
            <button
              onClick={() => onNavigate(redirectTo)}
              className="bg-[#0084C7] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#006ba3] transition-colors shadow-lg"
            >
              Go to Home
            </button>
          )}
        </div>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}
