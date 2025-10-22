/**
 * SVG Certificate Template Generator
 *
 * Generates optimized SVG certificates (< 4KB) with embedded QR codes
 * for storage on Hedera File Service (HFS)
 */

import QRCode from 'qrcode';

export interface CertificateData {
  userName: string;
  courseName: string;
  completionDate: string; // ISO 8601
  certificateNumber: string; // W3V-YYYY-NNNNN
  verificationUrl: string;
  platformSignature: string;
}

/**
 * Generate QR code as SVG path
 */
async function generateQRCodeSVG(url: string): Promise<string> {
  try {
    // Generate QR as SVG string
    const qrSvg = await QRCode.toString(url, {
      type: 'svg',
      width: 80,
      margin: 1,
      color: {
        dark: '#1e3a8a', // blue-900
        light: '#ffffff',
      },
    });

    // Extract the path from the SVG (remove svg wrapper, keep only path)
    const pathMatch = qrSvg.match(/<path[^>]*d="([^"]*)"[^>]*\/>/);
    if (pathMatch && pathMatch[1]) {
      return pathMatch[1];
    }

    // Fallback: return full SVG if path extraction fails
    return qrSvg;
  } catch (error) {
    console.error('QR code generation failed:', error);
    return '';
  }
}

/**
 * Generate optimized SVG certificate (< 4KB target)
 *
 * @returns SVG string
 */
export async function generateCertificateSVG(
  data: CertificateData
): Promise<string> {
  // Generate QR code SVG path
  const qrPath = await generateQRCodeSVG(data.verificationUrl);

  // Format date for display
  const dateObj = new Date(data.completionDate);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Truncate long names/titles to fit
  const truncate = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
  };

  const userName = truncate(data.userName, 30);
  const courseName = truncate(data.courseName, 40);

  // Generate optimized SVG (avoiding unnecessary whitespace, using short attribute names)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
<defs>
<linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1"/>
<stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1"/>
</linearGradient>
<linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="0%">
<stop offset="0%" style="stop-color:#0084C7;stop-opacity:1"/>
<stop offset="100%" style="stop-color:#00a8e8;stop-opacity:1"/>
</linearGradient>
</defs>
<rect width="1000" height="700" fill="url(#g1)"/>
<rect x="40" y="40" width="920" height="620" fill="#fefefe" opacity="0.95"/>
<rect x="50" y="50" width="900" height="600" fill="none" stroke="#3b82f6" stroke-width="4"/>
<rect x="60" y="60" width="880" height="580" fill="none" stroke="#60a5fa" stroke-width="2"/>
<text x="500" y="110" font-family="Arial,sans-serif" font-size="48" font-weight="bold" fill="#1e3a8a" text-anchor="middle">Web3Versity</text>
<text x="500" y="180" font-family="serif" font-size="32" font-weight="bold" fill="#374151" text-anchor="middle">Certificate of Completion</text>
<line x1="200" y1="200" x2="800" y2="200" stroke="#3b82f6" stroke-width="2"/>
<text x="500" y="250" font-family="Arial,sans-serif" font-size="18" fill="#6b7280" text-anchor="middle">This certifies that</text>
<text x="500" y="310" font-family="serif" font-size="36" font-weight="bold" fill="#1e3a8a" text-anchor="middle">${userName}</text>
<text x="500" y="360" font-family="Arial,sans-serif" font-size="18" fill="#6b7280" text-anchor="middle">has successfully completed</text>
<text x="500" y="415" font-family="Arial,sans-serif" font-size="28" font-weight="bold" fill="#374151" text-anchor="middle">${courseName}</text>
<text x="500" y="465" font-family="Arial,sans-serif" font-size="16" fill="#6b7280" text-anchor="middle">Completed on ${formattedDate}</text>
<text x="500" y="515" font-family="monospace" font-size="14" fill="#9ca3af" text-anchor="middle">Certificate No: ${data.certificateNumber}</text>
<g transform="translate(100,560)">
${qrPath.startsWith('<svg') ? qrPath.replace(/<svg[^>]*>|<\/svg>/g, '') : `<path d="${qrPath}" fill="#1e3a8a"/>`}
</g>
<text x="100" y="655" font-family="Arial,sans-serif" font-size="11" fill="#6b7280">Scan to verify</text>
<line x1="750" y1="580" x2="880" y2="580" stroke="#374151" stroke-width="1"/>
<text x="880" y="600" font-family="Arial,sans-serif" font-size="13" fill="#6b7280" text-anchor="end">Platform Administrator</text>
<text x="500" y="670" font-family="Arial,sans-serif" font-size="11" fill="#9ca3af" text-anchor="middle">Issued by Web3Versity on Hedera Network</text>
<text x="500" y="685" font-family="monospace" font-size="9" fill="#d1d5db" text-anchor="middle">Signature: ${data.platformSignature.substring(0, 16)}...</text>
</svg>`.replace(/\n\s*/g, ''); // Remove all newlines and extra whitespace

  return svg;
}

/**
 * Convert SVG string to Uint8Array for HFS upload
 */
export function svgToBytes(svg: string): Uint8Array {
  return new TextEncoder().encode(svg);
}

/**
 * Estimate SVG size in bytes
 */
export function estimateSVGSize(svg: string): number {
  return new TextEncoder().encode(svg).length;
}

/**
 * Validate SVG size is under target (4KB for single HFS chunk)
 */
export function validateSVGSize(svg: string, maxBytes: number = 4096): boolean {
  const size = estimateSVGSize(svg);
  if (size > maxBytes) {
    console.warn(`SVG size (${size} bytes) exceeds target (${maxBytes} bytes)`);
    return false;
  }
  console.log(`✅ SVG size: ${size} bytes (${((size / maxBytes) * 100).toFixed(1)}% of 4KB limit)`);
  return true;
}
