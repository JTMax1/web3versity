/**
 * Public Certificate Verification Page
 *
 * Allows anyone to verify a Web3Versity certificate by:
 * - Certificate number (W3V-YYYY-NNNNN)
 * - Token ID + Serial number
 *
 * Displays:
 * - Certificate SVG image
 * - Student and course details
 * - Blockchain verification status
 * - Platform signature validation
 */

import { useState } from 'react';
import { Shield, CheckCircle, XCircle, ExternalLink, Award, User, Calendar, Hash } from 'lucide-react';
import { fetchCertificateSVG } from '../../lib/api/certificates';

interface VerificationResult {
  valid: boolean;
  blockchain_verified?: boolean;
  signature_valid?: boolean;
  certificate?: {
    certificateNumber: string;
    tokenId: string;
    serialNumber: number;
    imageHfsFileId: string;
    metadataHfsFileId: string;
    platformSignature: string;
    status: string;
    mintedAt: string;
    transferredAt?: string;
  };
  student?: {
    username: string;
    hederaAccountId?: string;
  };
  course?: {
    title: string;
  };
  completionDate?: string;
  blockchain?: {
    owner: string;
    createdTimestamp: string;
    modifiedTimestamp: string;
  };
  metadata?: any;
  hashScanUrl?: string;
  error?: string;
}

export default function VerifyCertificate() {
  const [certificateNumber, setCertificateNumber] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [svgImage, setSvgImage] = useState<string | null>(null);
  const [loadingSVG, setLoadingSVG] = useState(false);

  const handleVerify = async (certNum?: string) => {
    const numToVerify = certNum || certificateNumber;
    if (!numToVerify.trim()) return;

    setVerifying(true);
    setResult(null);
    setSvgImage(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-certificate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ certificateNumber: numToVerify }),
        }
      );

      const data = await response.json();
      setResult(data);

      // If valid, fetch SVG image
      if (data.valid && data.certificate?.imageHfsFileId) {
        setLoadingSVG(true);
        try {
          const svg = await fetchCertificateSVG(data.certificate.imageHfsFileId);
          setSvgImage(svg);
        } catch (error) {
          console.error('Error fetching SVG:', error);
        } finally {
          setLoadingSVG(false);
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      setResult({
        valid: false,
        error: 'Network error - please try again',
      });
    } finally {
      setVerifying(false);
    }
  };

  const downloadCertificate = () => {
    if (!svgImage || !result?.certificate) return;

    const blob = new Blob([svgImage], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.certificate.certificateNumber}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Verify Certificate</h1>
          <p className="text-lg text-gray-600">
            Verify the authenticity of Web3Versity certificates on Hedera blockchain
          </p>
        </div>

        {/* Verification Input */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Certificate Number
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
              placeholder="W3V-2025-00001"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
            <button
              onClick={() => handleVerify()}
              disabled={verifying || !certificateNumber.trim()}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {verifying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Verify
                </>
              )}
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Enter the certificate number (e.g., W3V-2025-00001) to verify its authenticity
          </p>
        </div>

        {/* Verification Result */}
        {result && (
          <div className="space-y-6">
            {/* Status Banner */}
            {result.valid ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-green-900">Certificate Verified!</h2>
                    <p className="text-green-700">This certificate is authentic and valid</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800 font-medium">Blockchain Verified</span>
                  </div>
                  {result.signature_valid && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-800 font-medium">Signature Valid</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800 font-medium">On Hedera Network</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-200">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-red-900">Certificate Not Found</h2>
                    <p className="text-red-700">{result.error || 'This certificate could not be verified'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Certificate Details */}
            {result.valid && result.certificate && (
              <>
                {/* SVG Image */}
                {svgImage && (
                  <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Certificate</h3>
                      <button
                        onClick={downloadCertificate}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Download SVG
                      </button>
                    </div>
                    <div
                      className="border-4 border-gray-200 rounded-xl overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: svgImage }}
                    />
                  </div>
                )}

                {loadingSVG && (
                  <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading certificate image from Hedera...</p>
                  </div>
                )}

                {/* Details Grid */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Certificate Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Award className="w-4 h-4" />
                        <span className="text-sm font-medium">Course</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{result.course?.title}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">Student</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{result.student?.username}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">Completion Date</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {result.completionDate
                          ? new Date(result.completionDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Hash className="w-4 h-4" />
                        <span className="text-sm font-medium">Certificate Number</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 font-mono">
                        {result.certificate.certificateNumber}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Blockchain Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Token ID:</span>
                        <p className="font-mono text-gray-900">{result.certificate.tokenId}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Serial Number:</span>
                        <p className="font-mono text-gray-900">#{result.certificate.serialNumber}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Owner:</span>
                        <p className="font-mono text-gray-900 text-xs">{result.blockchain?.owner}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Network:</span>
                        <p className="font-mono text-gray-900">Hedera Testnet</p>
                      </div>
                    </div>
                  </div>

                  {result.hashScanUrl && (
                    <a
                      href={result.hashScanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on HashScan
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Info Box */}
        {!result && (
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">How to Verify</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Enter the certificate number (e.g., W3V-2025-00001)</li>
              <li>• Click "Verify" to check the Hedera blockchain</li>
              <li>• View the certificate SVG image and details</li>
              <li>• Confirmation includes blockchain verification and platform signature validation</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
