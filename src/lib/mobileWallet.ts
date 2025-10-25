/**
 * Mobile Wallet Detection and Deep Linking
 *
 * Provides utilities for detecting mobile devices and creating deep links
 * to mobile wallet apps (Metamask Mobile, HashPack, Blade Wallet, etc.)
 *
 * REAL IMPLEMENTATION - Works on both desktop and mobile
 */

// ============================================================================
// MOBILE DETECTION
// ============================================================================

/**
 * Detect if user is on a mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  // Check user agent
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  // Mobile patterns
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

  // Check user agent
  if (mobileRegex.test(userAgent.toLowerCase())) {
    return true;
  }

  // Check touch support and screen size
  const isTouchDevice = (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );

  const isSmallScreen = window.innerWidth <= 768;

  return isTouchDevice && isSmallScreen;
}

/**
 * Detect if user is on iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
}

/**
 * Detect if user is on Android
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /android/i.test(userAgent);
}

// ============================================================================
// WALLET DETECTION
// ============================================================================

/**
 * Check if Metamask Mobile is installed (in-app browser)
 */
export function isMetamaskMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.ethereum && window.ethereum.isMetaMask && isMobileDevice());
}

/**
 * Check if user is in any wallet's in-app browser
 * Supports: Metamask, HashPack, Blade, Kabila, and ANY wallet with ethereum provider
 */
export function isInWalletBrowser(): boolean {
  if (typeof window === 'undefined') return false;

  // First check if there's any ethereum provider
  if (!window.ethereum) return false;

  // If on mobile with ethereum provider, likely in wallet browser
  if (isMobileDevice()) {
    return true;
  }

  // On desktop, check for specific wallet identifiers
  return !!(
    window.ethereum.isMetaMask ||
    (window.ethereum as any).isHashPack ||
    (window.ethereum as any).isBlade ||
    (window.ethereum as any).isKabila ||
    (window.ethereum as any).isWalletConnect ||
    (window.ethereum as any).isCoinbaseWallet ||
    (window.ethereum as any).isTrust ||
    (window.ethereum as any).isTokenPocket
  );
}

/**
 * Detect which wallet is currently active
 * Returns the wallet name or 'unknown' if can't determine
 */
export function detectActiveWallet(): string {
  if (typeof window === 'undefined' || !window.ethereum) return 'none';

  // Check for specific wallet identifiers
  if (window.ethereum.isMetaMask) return 'metamask';
  if ((window.ethereum as any).isHashPack) return 'hashpack';
  if ((window.ethereum as any).isBlade) return 'blade';
  if ((window.ethereum as any).isKabila) return 'kabila';
  if ((window.ethereum as any).isWalletConnect) return 'walletconnect';
  if ((window.ethereum as any).isCoinbaseWallet) return 'coinbase';
  if ((window.ethereum as any).isTrust) return 'trust';
  if ((window.ethereum as any).isTokenPocket) return 'tokenpocket';

  // Generic ethereum provider
  return 'unknown';
}

// ============================================================================
// DEEP LINK GENERATION
// ============================================================================

/**
 * Generate Metamask Mobile deep link
 * Opens the dApp in Metamask Mobile's in-app browser
 */
export function getMetamaskMobileDeepLink(): string {
  const currentUrl = window.location.href;

  // Metamask Mobile deep link format
  // metamask://dapp/[your-url]
  return `https://metamask.app.link/dapp/${encodeURIComponent(currentUrl)}`;
}

/**
 * Generate HashPack wallet deep link
 */
export function getHashPackDeepLink(): string {
  const currentUrl = window.location.href;

  // HashPack deep link format
  return `hashpack://dapp/${encodeURIComponent(currentUrl)}`;
}

/**
 * Generate Blade Wallet deep link
 */
export function getBladeWalletDeepLink(): string {
  const currentUrl = window.location.href;

  // Blade Wallet deep link format
  return `bladewallet://dapp/${encodeURIComponent(currentUrl)}`;
}

/**
 * Generate WalletConnect connection URI
 * Note: Requires WalletConnect library to be installed
 */
export function generateWalletConnectURI(): string {
  // This is a placeholder - real implementation requires @walletconnect/web3-provider
  // For now, return empty string
  console.warn('WalletConnect not yet implemented. Install @walletconnect/web3-provider');
  return '';
}

// ============================================================================
// WALLET CONNECTION HELPERS
// ============================================================================

/**
 * Open wallet app based on platform
 * Attempts to open the appropriate wallet app using deep links
 * If no wallet specified, tries to detect and open the best available one
 */
export function openMobileWallet(walletType?: 'metamask' | 'hashpack' | 'blade' | 'auto'): void {
  if (!isMobileDevice()) {
    console.warn('openMobileWallet called on desktop device');
    return;
  }

  // Auto-detect wallet if 'auto' or not specified
  if (!walletType || walletType === 'auto') {
    const detectedWallet = detectActiveWallet();
    if (detectedWallet !== 'none' && detectedWallet !== 'unknown') {
      walletType = detectedWallet as any;
      console.log('Auto-detected wallet:', walletType);
    } else {
      // Default to metamask if can't detect
      walletType = 'metamask';
      console.log('No wallet detected, defaulting to Metamask');
    }
  }

  let deepLink: string;

  switch (walletType) {
    case 'metamask':
      deepLink = getMetamaskMobileDeepLink();
      break;
    case 'hashpack':
      deepLink = getHashPackDeepLink();
      break;
    case 'blade':
      deepLink = getBladeWalletDeepLink();
      break;
    default:
      deepLink = getMetamaskMobileDeepLink();
  }

  console.log('Opening mobile wallet:', walletType);
  console.log('Deep link:', deepLink);

  // Open deep link
  window.location.href = deepLink;
}

/**
 * Get list of available wallets on current platform
 * Detects any wallet with ethereum provider
 */
export function getAvailableWallets(): Array<{
  name: string;
  id: string;
  installed: boolean;
  supported: boolean;
  deepLink?: string;
}> {
  const mobile = isMobileDevice();
  const hasEthereum = !!(window.ethereum);

  const wallets = [
    {
      name: 'Metamask',
      id: 'metamask',
      installed: !!(window.ethereum?.isMetaMask),
      supported: true,
      deepLink: mobile ? getMetamaskMobileDeepLink() : undefined,
    },
    {
      name: 'HashPack',
      id: 'hashpack',
      installed: !!(window.ethereum as any)?.isHashPack,
      supported: true,
      deepLink: mobile ? getHashPackDeepLink() : undefined,
    },
    {
      name: 'Blade Wallet',
      id: 'blade',
      installed: !!(window.ethereum as any)?.isBlade,
      supported: true,
      deepLink: mobile ? getBladeWalletDeepLink() : undefined,
    },
    {
      name: 'Kabila Wallet',
      id: 'kabila',
      installed: !!(window.ethereum as any)?.isKabila,
      supported: true,
      deepLink: undefined, // Add if deep link available
    },
    {
      name: 'Trust Wallet',
      id: 'trust',
      installed: !!(window.ethereum as any)?.isTrust,
      supported: true,
      deepLink: undefined, // Add if deep link available
    },
    {
      name: 'Coinbase Wallet',
      id: 'coinbase',
      installed: !!(window.ethereum as any)?.isCoinbaseWallet,
      supported: true,
      deepLink: undefined, // Add if deep link available
    },
  ];

  // If there's an ethereum provider but no specific wallet detected,
  // add generic option
  if (hasEthereum && !wallets.some(w => w.installed)) {
    wallets.push({
      name: 'Web3 Wallet (Detected)',
      id: 'unknown',
      installed: true,
      supported: true,
      deepLink: undefined,
    });
  }

  return wallets;
}

/**
 * Get recommended wallet for current platform
 * Auto-detects active wallet or recommends best option
 */
export function getRecommendedWallet(): string {
  // First, try to detect active wallet
  const activeWallet = detectActiveWallet();

  if (isInWalletBrowser()) {
    // Already in a wallet browser, use whatever is detected
    if (activeWallet !== 'none' && activeWallet !== 'unknown') {
      return activeWallet;
    }
    // Fallback: check specific identifiers
    if (window.ethereum?.isMetaMask) return 'metamask';
    if ((window.ethereum as any)?.isHashPack) return 'hashpack';
    if ((window.ethereum as any)?.isBlade) return 'blade';
    if ((window.ethereum as any)?.isKabila) return 'kabila';

    // Generic wallet detected
    if (window.ethereum) return 'unknown';
  }

  if (isMobileDevice()) {
    // On mobile, if there's any wallet, use it
    if (window.ethereum) {
      return activeWallet !== 'none' ? activeWallet : 'unknown';
    }
    // No wallet detected, recommend Metamask (most popular)
    return 'metamask';
  }

  // On desktop, recommend Metamask Browser Extension
  return 'metamask';
}

// ============================================================================
// INSTALLATION HELPERS
// ============================================================================

/**
 * Get wallet installation URL for current platform
 */
export function getWalletInstallUrl(walletType: 'metamask' | 'hashpack' | 'blade' = 'metamask'): string {
  const mobile = isMobileDevice();
  const ios = isIOS();
  const android = isAndroid();

  switch (walletType) {
    case 'metamask':
      if (ios) {
        return 'https://apps.apple.com/app/metamask/id1438144202';
      } else if (android) {
        return 'https://play.google.com/store/apps/details?id=io.metamask';
      } else {
        return 'https://metamask.io/download/';
      }

    case 'hashpack':
      if (ios) {
        return 'https://apps.apple.com/app/hashpack/id1579837156';
      } else if (android) {
        return 'https://play.google.com/store/apps/details?id=com.hashpack.mobile';
      } else {
        return 'https://www.hashpack.app/download';
      }

    case 'blade':
      if (ios) {
        return 'https://apps.apple.com/app/blade-hedera-wallet/id1548689102';
      } else if (android) {
        return 'https://play.google.com/store/apps/details?id=com.bladewallet.mobile';
      } else {
        return 'https://bladewallet.io/';
      }

    default:
      return 'https://metamask.io/download/';
  }
}

/**
 * Prompt user to install wallet
 * Opens appropriate app store or website
 */
export function promptWalletInstall(walletType: 'metamask' | 'hashpack' | 'blade' = 'metamask'): void {
  const installUrl = getWalletInstallUrl(walletType);
  console.log('Opening wallet install page:', installUrl);
  window.open(installUrl, '_blank');
}

// ============================================================================
// CONNECTION FLOW HELPERS
// ============================================================================

/**
 * Smart wallet connection flow
 * Handles both desktop and mobile scenarios
 *
 * @returns Connection method: 'browser' | 'deep-link' | 'install-required'
 */
export function determineConnectionMethod(): {
  method: 'browser' | 'deep-link' | 'install-required';
  wallet: string;
  action?: () => void;
} {
  // Case 1: Already in wallet browser
  if (isInWalletBrowser()) {
    return {
      method: 'browser',
      wallet: getRecommendedWallet(),
      action: undefined,
    };
  }

  // Case 2: Desktop with extension
  if (!isMobileDevice() && window.ethereum) {
    return {
      method: 'browser',
      wallet: 'metamask',
      action: undefined,
    };
  }

  // Case 3: Mobile - need to open wallet app
  if (isMobileDevice()) {
    return {
      method: 'deep-link',
      wallet: 'metamask',
      action: () => openMobileWallet('metamask'),
    };
  }

  // Case 4: Desktop without extension - need to install
  return {
    method: 'install-required',
    wallet: 'metamask',
    action: () => promptWalletInstall('metamask'),
  };
}

/**
 * Execute wallet connection with appropriate method
 */
export async function connectWithBestMethod(): Promise<boolean> {
  const { method, wallet, action } = determineConnectionMethod();

  console.log(`Connection method: ${method} (wallet: ${wallet})`);

  switch (method) {
    case 'browser':
      // Can connect directly
      return true;

    case 'deep-link':
      // Need to open wallet app first
      if (action) {
        action();
      }
      // User will return in wallet browser
      return false; // Don't attempt connection yet

    case 'install-required':
      // Need to install wallet first
      if (action) {
        action();
      }
      return false;

    default:
      return false;
  }
}
