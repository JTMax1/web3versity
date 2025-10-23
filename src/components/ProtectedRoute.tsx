/**
 * ProtectedRoute Component
 *
 * Wrapper component that ensures user is authenticated before rendering children.
 * Redirects to landing page if not authenticated.
 *
 * Phase 1, Task 1.5 - User Authentication System
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute component
 *
 * Usage:
 * ```tsx
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  redirectTo = '/',
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

  // If not authenticated, redirect to home
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // User is authenticated, render children
  return <>{children}</>;
}
