/**
 * Practical Component Registry
 *
 * Defines all available practical lesson components for course creators.
 * These components involve REAL testnet interactions (transactions, DeFi, DEX).
 */

export interface PracticalType {
  id: string;
  name: string;
  description: string;
  emoji: string;
  requiresTestnet: true;
  difficulty: 'intermediate' | 'advanced';
  estimatedMinutes: number;
  component: string; // Component name for dynamic import
  warning: string;
  prerequisites: string[];
  tags: string[];
}

export const PRACTICAL_TYPES: PracticalType[] = [
  {
    id: 'transaction',
    name: 'Send HBAR Transaction',
    description: 'Send real HBAR transactions on Hedera testnet. Students will learn to transfer tokens, add memos, and verify transactions on HashScan.',
    emoji: '💸',
    requiresTestnet: true,
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    component: 'TransactionSender',
    warning: 'Students will need testnet HBAR to complete this lesson. Recommend providing faucet link or pre-funding instructions.',
    prerequisites: [
      'Connected wallet',
      'Testnet HBAR balance',
      'Understanding of blockchain transactions'
    ],
    tags: ['transactions', 'hbar', 'testnet', 'hands-on']
  },
  {
    id: 'defi',
    name: 'DeFi Protocol Interaction',
    description: 'Interact with real DeFi protocols on testnet. Students deposit liquidity, earn rewards, and learn about impermanent loss.',
    emoji: '🏦',
    requiresTestnet: true,
    difficulty: 'advanced',
    estimatedMinutes: 15,
    component: 'DeFiSimulator',
    warning: 'Students need testnet tokens and basic DeFi knowledge. This lesson involves complex smart contract interactions.',
    prerequisites: [
      'Connected wallet',
      'Testnet tokens',
      'Understanding of DeFi concepts',
      'Basic smart contract knowledge'
    ],
    tags: ['defi', 'liquidity', 'yield', 'advanced']
  },
  {
    id: 'dex_swap',
    name: 'DEX Token Swap',
    description: 'Execute real token swaps on decentralized exchanges. Learn about slippage, price impact, and liquidity pools through hands-on practice.',
    emoji: '🔄',
    requiresTestnet: true,
    difficulty: 'advanced',
    estimatedMinutes: 12,
    component: 'DEXSwapper',
    warning: 'Students need multiple testnet tokens to practice swaps. Explain price impact and slippage before this lesson.',
    prerequisites: [
      'Connected wallet',
      'Multiple testnet tokens',
      'Understanding of DEX mechanics',
      'Knowledge of slippage tolerance'
    ],
    tags: ['dex', 'swap', 'tokens', 'liquidity']
  },
  {
    id: 'hcs_message',
    name: 'HCS Message Board',
    description: 'Post real messages to Hedera Consensus Service and experience sub-3-second consensus. Learn about immutable message ordering and timestamping.',
    emoji: '📨',
    requiresTestnet: true,
    difficulty: 'intermediate',
    estimatedMinutes: 8,
    component: 'HCSMessageBoard',
    warning: 'Students need testnet HBAR for message submission fees (very low cost).',
    prerequisites: [
      'Connected wallet',
      'Small amount of testnet HBAR',
      'Understanding of consensus mechanisms'
    ],
    tags: ['hcs', 'consensus', 'messaging', 'testnet']
  },
  {
    id: 'nft_minting',
    name: 'NFT Minter Studio',
    description: 'Create and mint real NFTs on Hedera testnet. Design artwork, set metadata, and experience the full NFT creation process.',
    emoji: '🎨',
    requiresTestnet: true,
    difficulty: 'intermediate',
    estimatedMinutes: 15,
    component: 'NFTMinterStudio',
    warning: 'Students need testnet HBAR for token creation and minting fees.',
    prerequisites: [
      'Connected wallet',
      'Testnet HBAR balance',
      'Understanding of NFT concepts'
    ],
    tags: ['nft', 'minting', 'token-service', 'art']
  },
  {
    id: 'contract',
    name: 'Smart Contract Playground',
    description: 'Deploy and interact with Solidity smart contracts on Hedera testnet. Write, compile, deploy, and execute contract functions.',
    emoji: '📜',
    requiresTestnet: true,
    difficulty: 'advanced',
    estimatedMinutes: 20,
    component: 'SmartContractPlayground',
    warning: 'Students need testnet HBAR for contract deployment. Basic Solidity knowledge recommended.',
    prerequisites: [
      'Connected wallet',
      'Testnet HBAR balance',
      'Basic Solidity knowledge',
      'Understanding of smart contracts'
    ],
    tags: ['contracts', 'solidity', 'deployment', 'evm']
  },
  {
    id: 'wallet_creation',
    name: 'Wallet Creation',
    description: 'Create a real Hedera wallet on testnet. Generate keys, secure seed phrases, and receive test HBAR.',
    emoji: '👛',
    requiresTestnet: true,
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    component: 'WalletCreator',
    warning: 'Students will create real testnet wallets. Emphasize seed phrase security.',
    prerequisites: [
      'Understanding of private/public keys',
      'Knowledge of wallet security'
    ],
    tags: ['wallet', 'security', 'keys', 'testnet']
  },
  {
    id: 'wallet_investigation',
    name: 'Wallet Investigation',
    description: 'Investigate wallet activities using blockchain explorer. Analyze transaction history, token holdings, and account details.',
    emoji: '🔍',
    requiresTestnet: true,
    difficulty: 'intermediate',
    estimatedMinutes: 12,
    component: 'WalletInvestigation',
    warning: 'Students will analyze real testnet wallet data.',
    prerequisites: [
      'Understanding of blockchain explorers',
      'Knowledge of transaction structure'
    ],
    tags: ['explorer', 'analysis', 'investigation', 'forensics']
  },
  {
    id: 'explorer_navigation',
    name: 'Explorer Navigation',
    description: 'Learn to navigate HashScan blockchain explorer. Search transactions, accounts, and tokens. Understand explorer data.',
    emoji: '🧭',
    requiresTestnet: true,
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    component: 'ExplorerNavigation',
    warning: 'Students will use real testnet explorer.',
    prerequisites: [
      'Basic blockchain knowledge'
    ],
    tags: ['explorer', 'hashscan', 'navigation', 'tools']
  },
  {
    id: 'transaction_detective',
    name: 'Transaction Detective',
    description: 'Become a blockchain detective! Trace transactions, analyze patterns, and solve transaction puzzles using real testnet data.',
    emoji: '🕵️',
    requiresTestnet: true,
    difficulty: 'advanced',
    estimatedMinutes: 15,
    component: 'TransactionDetective',
    warning: 'Students will analyze complex transaction patterns.',
    prerequisites: [
      'Strong blockchain knowledge',
      'Experience with explorers',
      'Analytical thinking'
    ],
    tags: ['detective', 'analysis', 'forensics', 'advanced']
  }
];

/**
 * Get practical types by difficulty
 */
export function getPracticalsByDifficulty(difficulty: PracticalType['difficulty']): PracticalType[] {
  return PRACTICAL_TYPES.filter(type => type.difficulty === difficulty);
}

/**
 * Get practical type by ID
 */
export function getPracticalById(id: string): PracticalType | undefined {
  return PRACTICAL_TYPES.find(type => type.id === id);
}

/**
 * Search practical types
 */
export function searchPracticals(query: string): PracticalType[] {
  const lowerQuery = query.toLowerCase();
  return PRACTICAL_TYPES.filter(type =>
    type.name.toLowerCase().includes(lowerQuery) ||
    type.description.toLowerCase().includes(lowerQuery) ||
    type.tags.some(tag => tag.includes(lowerQuery))
  );
}

/**
 * Practical lesson default configuration
 */
export interface PracticalLessonDefaults {
  completionXP: number;
  requiresWalletConnection: boolean;
  requiresTestnetHBAR: boolean;
  showPrerequisiteWarning: boolean;
}

export const PRACTICAL_DEFAULTS: PracticalLessonDefaults = {
  completionXP: 50, // Higher XP for practical lessons
  requiresWalletConnection: true,
  requiresTestnetHBAR: true,
  showPrerequisiteWarning: true
};
