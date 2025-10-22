/**
 * Course Complete Modal Component
 *
 * Celebration modal that appears when user completes entire course.
 * Shows certificate preview and NFT minting option.
 */

import React, { useEffect, useState } from 'react';
import { Award, X, Sparkles, Share2, Download, Loader2, ExternalLink, CheckCircle } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { checkCertificateEligibility, claimCertificate } from '../lib/api/certificates';

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
  const { user, connected, connect, account } = useWallet();
  const [showConfetti, setShowConfetti] = useState(false);

  // Certificate claiming state
  const [certificateClaiming, setCertificateClaiming] = useState(false);
  const [certificateClaimed, setCertificateClaimed] = useState(false);
  const [certificateError, setCertificateError] = useState<string | null>(null);
  const [certificateData, setCertificateData] = useState<any>(null);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Confetti animation duration
      const timer = setTimeout(() => setShowConfetti(false), 4000);

      // Check if certificate already claimed
      if (user && courseId) {
        checkCertificateEligibility(user.id, courseId)
          .then((eligibility) => {
            setAlreadyClaimed(eligibility.already_claimed);
          })
          .catch(console.error);
      }

      return () => clearTimeout(timer);
    }
  }, [isOpen, user, courseId]);

  const handleClaimCertificate = async () => {
    // Check if user exists
    if (!user || !courseId) {
      setCertificateError('User not authenticated');
      return;
    }

    setCertificateClaiming(true);
    setCertificateError(null);

    try {
      // Check if wallet is connected, if not connect it first
      if (!connected || !account) {
        console.log('🔗 Connecting wallet for certificate claiming...');
        await connect();
        console.log('✅ Wallet connected, proceeding with certificate claim');
      }

      // Proceed with claiming certificate
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
          setCertificateError('Wallet connection cancelled. Please try again.');
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
        <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-scale-in max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Content */}
          <div className="text-center">
            {/* Trophy Icon */}
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-[0_12px_48px_rgba(251,191,36,0.5)] animate-bounce-slow relative">
              <Award className="w-16 h-16 text-white fill-white" />
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-10 h-10 text-yellow-300 animate-pulse" />
              </div>
              <div className="absolute -bottom-2 -left-2">
                <Sparkles className="w-8 h-8 text-orange-300 animate-pulse" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              🎉 Course Complete! 🎉
            </h2>

            {/* Course Name */}
            <p className="text-xl text-gray-700 mb-6 font-medium">
              {courseName}
            </p>

            {/* XP Bonus */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6 border-2 border-yellow-200">
              <p className="text-sm text-gray-600 mb-2">Completion Bonus</p>
              <p className="text-5xl font-bold text-yellow-600 mb-2">+100 XP</p>
              <p className="text-sm text-gray-500">You're on fire! 🔥</p>
            </div>

            {/* Certificate Preview */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
              <div className="border-4 border-[#0084C7] rounded-xl p-6 bg-white">
                <div className="mb-4">
                  <Award className="w-12 h-12 mx-auto text-[#0084C7]" />
                </div>
                <p className="text-sm text-gray-600 mb-2">Certificate of Completion</p>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{courseName}</h3>
                <div className="h-1 w-24 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] mx-auto rounded-full" />
              </div>
            </div>

            {/* NFT Certificate Section */}
            {!certificateClaimed && !alreadyClaimed && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6 border-2 border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Claim Your NFT Certificate
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Mint your course completion as a verifiable NFT on Hedera blockchain
                </p>
                <button
                  onClick={handleClaimCertificate}
                  disabled={certificateClaiming}
                  className="w-full py-4 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white rounded-2xl text-lg font-semibold shadow-[0_8px_24px_rgba(0,132,199,0.4)] hover:shadow-[0_12px_32px_rgba(0,132,199,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {certificateClaiming ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {connected ? 'Minting NFT...' : 'Connecting Wallet...'}
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      {connected ? 'Claim Certificate NFT' : 'Connect Wallet & Claim NFT'}
                    </>
                  )}
                </button>
                {certificateError && (
                  <p className="mt-3 text-sm text-red-600 flex items-center gap-2">
                    <X className="w-4 h-4" />
                    {certificateError}
                  </p>
                )}
              </div>
            )}

            {/* Success Message */}
            {(certificateClaimed || alreadyClaimed) && certificateData && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-6 border-2 border-green-200">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  NFT Certificate Claimed!
                </h4>
                <p className="text-sm text-green-700 mb-4">
                  Certificate #{certificateData.certificateNumber} minted successfully with SVG certificate
                </p>
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex justify-between">
                    <span>Token ID:</span>
                    <span className="font-mono">{certificateData.tokenId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Serial:</span>
                    <span className="font-mono">#{certificateData.serialNumber}</span>
                  </div>
                  {certificateData.imageHfsFileId && (
                    <div className="flex justify-between">
                      <span>Image HFS ID:</span>
                      <span className="font-mono text-xs">{certificateData.imageHfsFileId}</span>
                    </div>
                  )}
                  {certificateData.metadataHfsFileId && (
                    <div className="flex justify-between">
                      <span>Metadata HFS ID:</span>
                      <span className="font-mono text-xs">{certificateData.metadataHfsFileId}</span>
                    </div>
                  )}
                </div>
                <a
                  href={certificateData.hashScanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on HashScan
                </a>
              </div>
            )}

            {alreadyClaimed && !certificateData && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-6 border-2 border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  ✅ Certificate already claimed for this course
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <button
                onClick={() => {
                  // Share functionality placeholder
                  alert('Share functionality coming soon!');
                }}
                className="flex-1 py-4 bg-white text-[#0084C7] border-2 border-[#0084C7] rounded-2xl text-lg font-semibold hover:bg-[#0084C7]/10 transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share Achievement
              </button>
            </div>

            {/* Continue Button */}
            <button
              onClick={onClose}
              className="w-full py-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes bounces {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        .animate-bounce-slow {
          animation: bounces 2s ease-in-out infinite;
        }
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out;
        }
        @keyframes scaleIn {
          0% {
            transform: scale(0.8);
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
 * Confetti Effect for Course Completion
 */
function ConfettiEffect() {
  const colors = ['#fbbf24', '#f97316', '#0084C7', '#00a8e8', '#8b5cf6', '#ec4899'];
  const pieces = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1500,
    duration: 3 + Math.random() * 2,
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
