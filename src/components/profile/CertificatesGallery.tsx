/**
 * Certificates Gallery Component
 *
 * Displays user's NFT certificates in a grid layout
 * Shows SVG previews, course names, and completion dates
 */

import { useState, useEffect } from 'react';
import { Award, ExternalLink, Download, Eye, Loader2 } from 'lucide-react';
import { getUserCertificates, fetchCertificateSVG, fetchCertificateSVGFromIPFS, type Certificate } from '../../lib/api/certificates';
import { useAuth } from '../../hooks/useAuth';

export function CertificatesGallery() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [svgData, setSvgData] = useState<Record<string, string>>({});
  const [loadingSvg, setLoadingSvg] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user?.id) {
      loadCertificates();
    }
  }, [user]);

  const loadCertificates = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const certs = await getUserCertificates(user.id);
      setCertificates(certs);

      // Preload SVGs for the first 3 certificates
      const certsToPreload = certs.slice(0, 3);
      for (const cert of certsToPreload) {
        loadSVG(cert.id, cert.image_hfs_file_id, cert.svg_content, cert.ipfs_image_hash);
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSVG = async (certId: string, imageHfsFileId: string, svgContent?: string, ipfsImageHash?: string) => {
    if (svgData[certId] || loadingSvg[certId]) return;

    // Priority 1: Use SVG content from database (instant)
    if (svgContent) {
      console.log(`✅ Using SVG from database for certificate ${certId}`);
      setSvgData((prev) => ({ ...prev, [certId]: svgContent }));
      return;
    }

    setLoadingSvg((prev) => ({ ...prev, [certId]: true }));

    try {
      // Priority 2: Try Pinata/IPFS (reliable, public)
      if (ipfsImageHash) {
        console.log(`📥 Fetching SVG from Pinata/IPFS for certificate ${certId}...`);
        try {
          const svg = await fetchCertificateSVGFromIPFS(ipfsImageHash);
          setSvgData((prev) => ({ ...prev, [certId]: svg }));
          return;
        } catch (ipfsError) {
          console.warn('IPFS fetch failed, trying HFS...', ipfsError);
        }
      }

      // Priority 3: Fallback to HFS (may have issues)
      console.log(`📥 Fetching SVG from HFS for certificate ${certId}...`);
      const svg = await fetchCertificateSVG(imageHfsFileId);
      setSvgData((prev) => ({ ...prev, [certId]: svg }));
    } catch (error) {
      console.error('Error loading SVG from all sources:', error);
    } finally {
      setLoadingSvg((prev) => ({ ...prev, [certId]: false }));
    }
  };

  const downloadCertificate = (cert: Certificate) => {
    const svg = svgData[cert.id];
    if (!svg) return;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cert.certificate_number}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openCertificate = (cert: Certificate) => {
    // Load SVG if not already loaded
    if (!svgData[cert.id]) {
      loadSVG(cert.id, cert.image_hfs_file_id, cert.svg_content, cert.ipfs_image_hash);
    }
    setSelectedCert(cert);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading certificates...</p>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl">
        <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Certificates Yet</h3>
        <p className="text-gray-600 mb-4">
          Complete courses to earn NFT certificates on Hedera blockchain
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden group cursor-pointer flex flex-col"
            onClick={() => openCertificate(cert)}
          >
            {/* Preview - Fixed width container */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden flex items-center justify-center p-4">
              {svgData[cert.id] ? (
                <div
                  className="w-full max-w-[340px] mx-auto transform group-hover:scale-105 transition-transform duration-300"
                  style={{ maxHeight: 'none' }}
                  dangerouslySetInnerHTML={{ __html: svgData[cert.id] }}
                />
              ) : loadingSvg[cert.id] ? (
                <div className="w-full max-w-[340px] aspect-[10/7] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : (
                <div className="w-full max-w-[340px] aspect-[10/7] flex items-center justify-center">
                  <Award className="w-16 h-16 text-blue-600/20" />
                </div>
              )}

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openCertificate(cert);
                  }}
                  className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadCertificate(cert);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                  disabled={!svgData[cert.id]}
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                {cert.courses?.title || cert.certificate_data.courseName}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {new Date(cert.certificate_data.completionDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-xs font-mono text-gray-500 mb-3">{cert.certificate_number}</p>

              <a
                href={`https://hashscan.io/testnet/token/${cert.token_id}/${cert.serial_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />
                View on HashScan
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Full View Modal */}
      {selectedCert && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedCert.courses?.title || selectedCert.certificate_data.courseName}
                  </h2>
                  <p className="text-gray-600">Certificate #{selectedCert.certificate_number}</p>
                </div>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* SVG */}
              {svgData[selectedCert.id] ? (
                <div
                  className="border-4 border-gray-200 rounded-xl overflow-hidden mb-6"
                  dangerouslySetInnerHTML={{ __html: svgData[selectedCert.id] }}
                />
              ) : loadingSvg[selectedCert.id] ? (
                <div className="aspect-[10/7] bg-gray-50 rounded-xl flex items-center justify-center mb-6">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
              ) : (
                <div className="aspect-[10/7] bg-gray-50 rounded-xl flex items-center justify-center mb-6">
                  <Award className="w-24 h-24 text-gray-300" />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => downloadCertificate(selectedCert)}
                  disabled={!svgData[selectedCert.id]}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Certificate
                </button>
                <a
                  href={`https://hashscan.io/testnet/token/${selectedCert.token_id}/${selectedCert.serial_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  View on HashScan
                </a>
              </div>

              {/* Details */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Token ID:</span>
                    <p className="font-mono text-gray-900">{selectedCert.token_id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Serial:</span>
                    <p className="font-mono text-gray-900">#{selectedCert.serial_number}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Image HFS ID:</span>
                    <p className="font-mono text-gray-900 text-xs">{selectedCert.image_hfs_file_id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Metadata HFS ID:</span>
                    <p className="font-mono text-gray-900 text-xs">{selectedCert.metadata_hfs_file_id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
