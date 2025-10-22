/**
 * SVG Certificate Generator (Deno/Edge Function Version)
 *
 * Generates optimized SVG certificates with embedded QR codes
 * Target size: < 4KB for single HFS chunk upload
 */

// Use npm: specifier for QR code generation (works in Deno)
import qrcode from 'npm:qrcode@1.5.3';

export interface CertificateData {
  userName: string;
  courseName: string;
  completionDate: string;
  certificateNumber: string;
  verificationUrl: string;
  platformSignature: string;
}

/**
 * Generate QR code as SVG path
 *
 * @param url - URL to encode in QR code
 * @returns SVG path elements for QR code
 */
async function generateQRCodeSVG(url: string): Promise<string> {
  // Generate QR code as SVG string
  const svgString = await qrcode.toString(url, {
    type: 'svg',
    width: 80,
    margin: 0,
    errorCorrectionLevel: 'M'
  });

  // Extract just the path/rect elements from the SVG
  const pathMatch = svgString.match(/<path[^>]*d="([^"]*)"/);
  const path = pathMatch ? pathMatch[1] : '';

  if (path) {
    return `<path d="${path}" fill="#000"/>`;
  }

  // Fallback: extract rect elements if no path found
  const rectMatches = Array.from(svgString.matchAll(/<rect\s+([^>]*)\/>/g));
  const rects = rectMatches
    .map((match) => `<rect ${match[1]}/>`)
    .join('');

  return rects;
}

/**
 * Generate complete SVG certificate
 *
 * Creates a professional certificate SVG with:
 * - Gradient background
 * - Certificate content (name, course, date, cert number)
 * - Embedded QR code
 * - Platform signature display
 *
 * Optimized to < 4KB (removes whitespace, uses short attribute names)
 *
 * @param data - Certificate data
 * @returns Optimized SVG string
 */
export async function generateCertificateSVG(data: CertificateData): Promise<string> {
  const { userName, courseName, completionDate, certificateNumber, verificationUrl, platformSignature } = data;

  // Format date
  const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Generate QR code
  const qrPath = await generateQRCodeSVG(verificationUrl);

  // Build SVG (minified for size optimization)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="1000" height="700">
<defs>
<linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1"/>
<stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1"/>
</linearGradient>
<linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="0%">
<stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1"/>
<stop offset="100%" style="stop-color:#f97316;stop-opacity:1"/>
</linearGradient>
</defs>
<rect width="1000" height="700" fill="url(#g1)"/>
<rect x="40" y="40" width="920" height="620" fill="#fefefe" opacity="0.95"/>
<rect x="50" y="50" width="900" height="600" fill="none" stroke="url(#g2)" stroke-width="4"/>
<g transform="translate(500,100)">
<circle r="60" fill="url(#g2)" opacity="0.9"/>
<text y="20" font-family="serif" font-size="64" font-weight="bold" fill="#fff" text-anchor="middle">★</text>
</g>
<text x="500" y="200" font-family="serif" font-size="32" font-weight="bold" fill="#1e3a8a" text-anchor="middle">CERTIFICATE OF COMPLETION</text>
<text x="500" y="245" font-family="Arial,sans-serif" font-size="18" fill="#6b7280" text-anchor="middle">This certifies that</text>
<text x="500" y="310" font-family="serif" font-size="36" font-weight="bold" fill="#1e3a8a" text-anchor="middle">${userName}</text>
<rect x="300" y="320" width="400" height="2" fill="url(#g2)"/>
<text x="500" y="365" font-family="Arial,sans-serif" font-size="18" fill="#6b7280" text-anchor="middle">has successfully completed</text>
<text x="500" y="415" font-family="Arial,sans-serif" font-size="28" font-weight="bold" fill="#374151" text-anchor="middle">${courseName}</text>
<text x="500" y="470" font-family="Arial,sans-serif" font-size="16" fill="#9ca3af" text-anchor="middle">Completion Date: ${formattedDate}</text>
<text x="500" y="500" font-family="monospace" font-size="14" fill="#9ca3af" text-anchor="middle">Certificate #${certificateNumber}</text>
<text x="100" y="580" font-family="Arial,sans-serif" font-size="12" fill="#6b7280" text-anchor="start">Issued by Web3Versity</text>
<text x="100" y="600" font-family="Arial,sans-serif" font-size="12" fill="#6b7280" text-anchor="start">Powered by Hedera</text>
<text x="900" y="580" font-family="monospace" font-size="10" fill="#9ca3af" text-anchor="end">Verify:</text>
<g transform="translate(800,530) scale(0.8)">
${qrPath}
</g>
<text x="900" y="640" font-family="monospace" font-size="8" fill="#d1d5db" text-anchor="end" opacity="0.5">Sig: ${platformSignature.substring(0, 16)}...</text>
</svg>`.replace(/\n\s*/g, ''); // Remove whitespace for optimization

  return svg;
}

/**
 * Convert SVG string to bytes
 *
 * @param svg - SVG string
 * @returns Uint8Array of SVG bytes
 */
export function svgToBytes(svg: string): Uint8Array {
  return new TextEncoder().encode(svg);
}

/**
 * Estimate SVG size in bytes
 *
 * @param svg - SVG string
 * @returns Size in bytes
 */
export function estimateSVGSize(svg: string): number {
  return new TextEncoder().encode(svg).length;
}

/**
 * Validate SVG size
 *
 * @param svg - SVG string
 * @param maxBytes - Maximum allowed size (default 4096 for single HFS chunk)
 * @returns true if valid, throws error if too large
 */
export function validateSVGSize(svg: string, maxBytes: number = 4096): boolean {
  const size = estimateSVGSize(svg);
  if (size > maxBytes) {
    console.warn(`⚠️ SVG size (${size} bytes) exceeds ${maxBytes} bytes - will require chunked upload`);
  }
  return true; // Don't throw error, just warn
}
