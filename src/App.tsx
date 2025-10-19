import React, { useState, useMemo } from 'react';
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
import { ProtectedRoute } from './components/ProtectedRoute';
import { mockCourses, mockBadges, mockLeaderboard, mockDiscussions, type Course } from './lib/mockData';
import { adaptDatabaseUserToUI } from './lib/userAdapter';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { WalletProvider } from './contexts/WalletContext';
import { useAuth } from './hooks/useAuth';
import { MetamaskPrompt } from './components/MetamaskPrompt';

type Page = 'home' | 'dashboard' | 'courses' | 'course-viewer' | 'playground' | 'leaderboard' | 'faucet' | 'community' | 'profile';

function AppContent() {
  const { user: dbUser, isAuthenticated, balance } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>(['course_001', 'course_004']);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);

  // Convert database user to UI user format for components
  const user = useMemo(() => {
    if (!dbUser) return null;
    return adaptDatabaseUserToUI(dbUser, balance);
  }, [dbUser, balance]);

  const handleNavigate = (page: Page) => {
    if (page !== 'home' && !isAuthenticated) {
      toast.error('Please connect your wallet first');
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnroll = (courseId: string) => {
    const course = mockCourses.find(c => c.id === courseId);
    if (!course) return;
    
    // Courses with full content available
    const coursesWithContent = [
      'course_001', // Hedera Fundamentals
      'course_004', // Wallet Security Best Practices
      'course_006', // Understanding NFTs on Hedera (Developer)
      'course_008', // DeFi Basics
      'course_009', // Understanding Transactions (Explorer)
      'course_010', // Understanding NFTs - Beginner (Explorer)
      'course_011', // Understanding NFTs - Intermediate (Explorer)
      'course_012', // Understanding NFTs - Advanced (Explorer)
      'course_013', // Introduction to DApps (Explorer)
      'course_014', // Understanding Testnet on Hedera (Explorer)
      'course_015', // Understanding PreviewNet on Hedera (Explorer)
      'course_016', // Understanding Mainnet (Explorer)
      'course_017', // Understanding Devnet (Explorer)
      'course_018', // DApp Interaction (Explorer)
      'course_019', // Understanding Blockchain Explorers (Explorer)
      // New Explorer Courses (020-044)
      'course_020', // Cross-Border Payments with Crypto
      'course_021', // Avoiding Crypto Scams in Africa
      'course_022', // Understanding Stablecoins
      'course_023', // From Mobile Money to Crypto
      'course_024', // Understanding Private Keys & Ownership
      'course_025', // DeFi Basics for Beginners
      'course_026', // Understanding DEXs
      'course_027', // Crypto Taxes & Regulations in Africa
      'course_028', // Understanding Hedera Consensus
      'course_029', // Careers in Web3
      'course_030', // Understanding Cryptocurrency Basics
      'course_031', // Digital Identity on Blockchain
      'course_032', // Understanding DAOs
      'course_033', // Blockchain Gaming & Play-to-Earn
      'course_034', // Reading Crypto Charts
      'course_035', // Understanding Crypto Exchanges
      'course_036', // Hedera Governing Council
      'course_037', // Building on Hedera: Use Cases
      'course_038', // Understanding Consensus Mechanisms
      'course_039', // Layer 1 vs Layer 2 Scaling
      'course_040', // Smart Contract Basics (No Coding)
      'course_041', // Understanding Tokenomics
      'course_042', // Participating in Crypto Communities
      'course_043', // Advanced Wallet Security
      'course_044', // Earning Yield with Crypto
    ];
    
    // Check if course has content available
    if (!coursesWithContent.includes(courseId)) {
      toast.info('Coming Soon!', {
        description: 'This course is currently being developed.'
      });
      return;
    }
    
    if (!enrolledCourseIds.includes(courseId)) {
      setEnrolledCourseIds([...enrolledCourseIds, courseId]);
      toast.success('Enrolled successfully!', {
        description: 'Start learning now'
      });
    }
    
    // Open the course viewer
    setCurrentCourse(course);
    setCurrentPage('course-viewer');
  };

  const handleCourseComplete = () => {
    toast.success('🎉 Course Complete!', {
      description: 'You earned a certificate and +50 points!'
    });
  };

  const handleBackToCourses = () => {
    setCurrentCourse(null);
    setCurrentPage('courses');
  };

  const enrolledCourses = mockCourses.filter(c => enrolledCourseIds.includes(c.id));

  return (
    <div className="min-h-screen">
      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {currentPage === 'home' && (
        <LandingPage onGetStarted={() => isAuthenticated ? handleNavigate('dashboard') : handleNavigate('home')} />
      )}

      {currentPage === 'dashboard' && (
        <ProtectedRoute onNavigate={handleNavigate}>
          <Dashboard
            user={user!}
            enrolledCourses={enrolledCourses}
            badges={mockBadges}
            onCourseClick={handleEnroll}
            onNavigate={handleNavigate}
          />
        </ProtectedRoute>
      )}

      {currentPage === 'courses' && (
        <ProtectedRoute onNavigate={handleNavigate}>
          <CourseCatalog
            
            onEnroll={handleEnroll}
            enrolledCourseIds={enrolledCourseIds}
          />
        </ProtectedRoute>
      )}

      {currentPage === 'course-viewer' && currentCourse && (
        <ProtectedRoute onNavigate={handleNavigate}>
          <CourseViewer
            course={currentCourse}
            onBack={handleBackToCourses}
            onCourseComplete={handleCourseComplete}
          />
        </ProtectedRoute>
      )}

      {currentPage === 'playground' && (
        <ProtectedRoute onNavigate={handleNavigate}>
          <CodePlayground />
        </ProtectedRoute>
      )}

      {currentPage === 'leaderboard' && (
        <ProtectedRoute onNavigate={handleNavigate}>
          <Leaderboard
            leaderboard={mockLeaderboard}
            currentUserRank={14}
          />
        </ProtectedRoute>
      )}

      {currentPage === 'faucet' && (
        <ProtectedRoute onNavigate={handleNavigate}>
          <Faucet />
        </ProtectedRoute>
      )}

      {currentPage === 'community' && (
        <ProtectedRoute onNavigate={handleNavigate}>
          <Community discussions={mockDiscussions} />
        </ProtectedRoute>
      )}

      {currentPage === 'profile' && (
        <ProtectedRoute onNavigate={handleNavigate}>
          <Profile user={user!} badges={mockBadges} />
        </ProtectedRoute>
      )}

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
      <AppContent />
    </WalletProvider>
  );
}
