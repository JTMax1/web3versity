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
    id: 'transaction_sender',
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
    id: 'defi_simulator',
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
    id: 'dex_swapper',
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
