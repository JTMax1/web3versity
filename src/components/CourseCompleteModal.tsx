/**
 * Course Complete Modal Component
 *
 * Celebration modal that appears when user completes entire course.
 * Shows certificate preview and NFT minting option.
 */

import React, { useEffect, useState } from 'react';
import { Award, X, Sparkles, Share2, Download, Loader2, ExternalLink, CheckCircle, Link } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { checkCertificateEligibility, claimCertificate } from '../lib/api/certificates';
import { associateToken, isTokenAssociated } from '../lib/hederaUtils';
import { supabase } from '../lib/supabase/client';
import { env } from '../config';

interface CourseCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseName: string;
  courseId: string;
  onClaimCertificate?: () => void; // Legacy prop
}

export function CourseCompleteModal({
  isOpen,
  onClose,
  courseName,
  courseId,
  onClaimCertificate,
}: CourseCompleteModalProps) {
  const { user, session, connected, connect, account } = useWallet();
  const [showConfetti, setShowConfetti] = useState(false);

  // Certificate claiming state
  const [certificateClaiming, setCertificateClaiming] = useState(false);
  const [certificateClaimed, setCertificateClaimed] = useState(false);
  const [certificateError, setCertificateError] = useState<string | null>(null);
  const [certificateData, setCertificateData] = useState<any>(null);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);

  // Token association state
  const [tokenAssociated, setTokenAssociated] = useState(false);
  const [checkingAssociation, setCheckingAssociation] = useState(false);
  const [associating, setAssociating] = useState(false);

  // Get collection token ID from env
  const collectionTokenId = env.NFT_COLLECTION_TOKEN_ID;

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Confetti animation duration - reduced
      const timer = setTimeout(() => setShowConfetti(false), 2500);

      // Check if certificate already claimed
      if (user && courseId) {
        checkCertificateEligibility(user.id, courseId)
          .then((eligibility) => {
            setAlreadyClaimed(eligibility.already_claimed);
          })
          .catch(console.error);
      }

      // Check token association if wallet is connected
      if (connected && account && collectionTokenId) {
        setCheckingAssociation(true);
        isTokenAssociated(collectionTokenId, account)
          .then((associated) => {
            setTokenAssociated(associated);
            console.log(`Token ${collectionTokenId} associated:`, associated);
          })
          .catch((error) => {
            console.error('Error checking token association:', error);
            setTokenAssociated(false);
          })
          .finally(() => {
            setCheckingAssociation(false);
          });
      }

      return () => clearTimeout(timer);
    }
  }, [isOpen, user, courseId, connected, account, collectionTokenId]);

  const handleAssociateToken = async () => {
    if (!collectionTokenId) {
      setCertificateError('NFT collection not configured');
      return;
    }

    setAssociating(true);
    setCertificateError(null);

    try {
      console.log('🔗 Associating token with user account...');
      const result = await associateToken(collectionTokenId);

      if (result.status === 'success') {
        setTokenAssociated(true);
        setCertificateError(null);
        console.log('✅ Token associated successfully');
      } else {
        setCertificateError('Token association failed. Please try again.');
      }
    } catch (error) {
      console.error('Token association error:', error);
      setCertificateError(error instanceof Error ? error.message : 'Failed to associate token');
    } finally {
      setAssociating(false);
    }
  };

  const handleClaimCertificate = async () => {
    // Check if course ID exists
    if (!courseId) {
      setCertificateError('Course ID not provided');
      return;
    }

    setCertificateClaiming(true);
    setCertificateError(null);

    try {
      // Step 1: Check if wallet is connected AND session exists, if not connect it first
      if (!connected || !account || !session) {
        console.log('🔗 Connecting wallet for certificate claiming...');
        await connect();
        console.log('✅ Wallet connection initiated');

        // Wait a bit for state to update
        await new Promise(resolve => setTimeout(resolve, 500));

        // Verify session was established after connection by checking Supabase directly
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
          console.error('❌ No session after wallet connection');
          setCertificateError('Authentication failed. Please try connecting your wallet again.');
          setCertificateClaiming(false);
          return;
        }
        console.log('✅ Wallet connected and authenticated with session');
      }

      // Verify user exists after connection
      if (!user) {
        console.error('❌ No user after wallet connection');
        setCertificateError('User not authenticated. Please try connecting your wallet again.');
        setCertificateClaiming(false);
        return;
      }

      // Step 2: Check if token is associated, if not associate it first
      if (!tokenAssociated && collectionTokenId) {
        console.log('⚠️ Token not associated, associating now...');

        try {
          const result = await associateToken(collectionTokenId);

          if (result.status === 'success') {
            setTokenAssociated(true);
            console.log('✅ Token associated successfully');
          } else {
            setCertificateError('Token association failed. Please try again.');
            setCertificateClaiming(false);
            return;
          }
        } catch (error) {
          console.error('Token association error:', error);
          setCertificateError(error instanceof Error ? error.message : 'Failed to associate token');
          setCertificateClaiming(false);
          return;
        }
      }

      // Step 3: Proceed with claiming certificate
      console.log('🎓 Claiming certificate for course:', courseId);
      const result = await claimCertificate(user.id, courseId);

      if (result.success && result.certificate) {
        setCertificateClaimed(true);
        setCertificateData(result.certificate);
        setShowConfetti(true); // Show confetti again!

        // Call legacy callback if provided
        onClaimCertificate?.();
      } else {
        setCertificateError(result.error || 'Failed to claim certificate');
      }
    } catch (error) {
      console.error('Error claiming certificate:', error);

      // Better error messages
      if (error instanceof Error) {
        if (error.message.includes('User rejected') || error.message.includes('User denied')) {
          setCertificateError('Transaction cancelled. Please try again.');
        } else {
          setCertificateError(error.message);
        }
      } else {
        setCertificateError('Failed to claim certificate');
      }
    } finally {
      setCertificateClaiming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Confetti Effect */}
      {showConfetti && <ConfettiEffect />}

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-scale-in max-h-[90vh] overflow-y-auto relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-full transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Trophy Icon - Compact */}
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(251,191,36,0.4)]">
              <Award className="w-8 h-8 text-white fill-white" />
            </div>

            {/* Title - Compact */}
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Course Complete! 🎉
            </h2>

            {/* Course Name */}
            <p className="text-sm text-gray-700 mb-4 font-medium px-4">
              {courseName}
            </p>

            {/* XP Bonus - Inline */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-3 mb-4 border border-yellow-200 inline-flex items-center gap-2 mx-auto">
              <span className="text-xs text-gray-600">Bonus:</span>
              <span className="text-2xl font-bold text-yellow-600">+100 XP</span>
            </div>

            {/* NFT Certificate Section - Compact */}
            {!certificateClaimed && !alreadyClaimed && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4 border border-blue-200">
                <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Claim NFT Certificate
                </h4>
                <p className="text-xs text-gray-600 mb-3">
                  Mint on Hedera blockchain
                </p>
                <button
                  onClick={handleClaimCertificate}
                  disabled={certificateClaiming || associating || checkingAssociation}
                  className="w-full py-3 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white rounded-xl text-sm font-semibold shadow-[0_4px_16px_rgba(0,132,199,0.3)] hover:shadow-[0_6px_20px_rgba(0,132,199,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {certificateClaiming || associating || checkingAssociation ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {!connected ? 'Connecting...' : !tokenAssociated ? 'Associating...' : 'Minting...'}
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      {!connected ? 'Connect & Claim' : !tokenAssociated ? 'Associate & Claim' : 'Claim NFT'}
                    </>
                  )}
                </button>
                {certificateError && (
                  <p className="mt-2 text-xs text-red-600 text-center">
                    {certificateError}
                  </p>
                )}
              </div>
            )}

            {/* Success Message - Compact */}
            {(certificateClaimed || alreadyClaimed) && certificateData && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4 border border-green-200">
                <h4 className="font-semibold text-sm text-green-900 mb-2 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  NFT Certificate Claimed!
                </h4>
                <p className="text-xs text-green-700 mb-3">
                  Certificate #{certificateData.certificateNumber}
                </p>
                <a
                  href={certificateData.hashScanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on HashScan
                </a>
              </div>
            )}

            {alreadyClaimed && !certificateData && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 mb-4 border border-gray-200">
                <p className="text-xs text-gray-600 text-center">
                  ✅ Certificate already claimed
                </p>
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Continue Learning
            </button>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
        @keyframes scaleIn {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

/**
 * Confetti Effect for Course Completion - Reduced
 */
function ConfettiEffect() {
  const colors = ['#fbbf24', '#f97316', '#0084C7', '#00a8e8'];
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 800,
    duration: 2 + Math.random() * 1,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-3 h-3"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            backgroundColor: piece.color,
            animation: `fall ${piece.duration}s ease-in forwards`,
            animationDelay: `${piece.delay}ms`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
