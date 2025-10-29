/**
 * Interactive Component Registry
 *
 * Defines all available interactive lesson components for course creators.
 * These are simulation-based components that don't require real testnet actions.
 */

export interface InteractiveType {
  id: string;
  name: string;
  description: string;
  category: 'basics' | 'defi' | 'nft' | 'security' | 'career' | 'consensus' | 'storage';
  emoji: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  component: string; // Component name for dynamic import
  tags: string[];
}

export const INTERACTIVE_TYPES: InteractiveType[] = [
  // Blockchain Basics
  {
    id: 'blockchain_animation',
    name: 'Blockchain Animation',
    description: 'Visual animation showing how blocks are linked in a chain',
    category: 'basics',
    emoji: '⛓️',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    component: 'BlockChainAnimation',
    tags: ['animation', 'visual', 'blockchain']
  },
  {
    id: 'blockchain_builder',
    name: 'Blockchain Builder',
    description: 'Interactive tool to build and visualize blockchain structure',
    category: 'basics',
    emoji: '🔨',
    difficulty: 'beginner',
    estimatedMinutes: 8,
    component: 'BlockChainBuilder',
    tags: ['interactive', 'hands-on', 'blockchain']
  },
  {
    id: 'centralized_vs_decentralized',
    name: 'Centralized vs Decentralized',
    description: 'Compare centralized and decentralized network models',
    category: 'basics',
    emoji: '🔄',
    difficulty: 'beginner',
    estimatedMinutes: 6,
    component: 'CentralizedVsDecentralized',
    tags: ['comparison', 'networks', 'architecture']
  },

  // Transaction & Network
  {
    id: 'transaction_simulator',
    name: 'Transaction Simulator',
    description: 'Simulate blockchain transactions with visual feedback',
    category: 'basics',
    emoji: '💸',
    difficulty: 'beginner',
    estimatedMinutes: 7,
    component: 'TransactionSimulator',
    tags: ['simulation', 'transactions', 'interactive']
  },
  {
    id: 'transaction_flow',
    name: 'Transaction Flow',
    description: 'Visualize how transactions flow through a network',
    category: 'basics',
    emoji: '🔄',
    difficulty: 'beginner',
    estimatedMinutes: 6,
    component: 'TransactionFlow',
    tags: ['visualization', 'transactions', 'network']
  },
  {
    id: 'network_comparison',
    name: 'Network Comparison',
    description: 'Compare different blockchain networks and their features',
    category: 'basics',
    emoji: '🌐',
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    component: 'NetworkComparison',
    tags: ['comparison', 'networks', 'features']
  },
  {
    id: 'market_transaction_demo',
    name: 'Market Transaction Demo',
    description: 'Demonstrate how market transactions work',
    category: 'basics',
    emoji: '🏪',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    component: 'MarketTransactionDemo',
    tags: ['demo', 'market', 'transactions']
  },

  // Consensus & Architecture
  {
    id: 'consensus_animation',
    name: 'Consensus Animation',
    description: 'Animated explanation of blockchain consensus mechanisms',
    category: 'consensus',
    emoji: '🤝',
    difficulty: 'intermediate',
    estimatedMinutes: 8,
    component: 'ConsensusAnimation',
    tags: ['animation', 'consensus', 'mechanism']
  },
  {
    id: 'consensus_comparison',
    name: 'Consensus Comparison',
    description: 'Compare PoW, PoS, and other consensus algorithms',
    category: 'consensus',
    emoji: '⚖️',
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    component: 'ConsensusComparison',
    tags: ['comparison', 'consensus', 'algorithms']
  },
  {
    id: 'layer_comparison',
    name: 'Layer Comparison',
    description: 'Compare Layer 1 vs Layer 2 blockchain solutions',
    category: 'basics',
    emoji: '🏗️',
    difficulty: 'advanced',
    estimatedMinutes: 12,
    component: 'LayerComparison',
    tags: ['comparison', 'layers', 'scaling']
  },

  // Storage & Data
  {
    id: 'storage_comparison',
    name: 'Storage Comparison',
    description: 'Compare different blockchain storage methods',
    category: 'storage',
    emoji: '💾',
    difficulty: 'intermediate',
    estimatedMinutes: 8,
    component: 'StorageComparison',
    tags: ['comparison', 'storage', 'data']
  },

  // Wallets & Security
  {
    id: 'seed_phrase_demo',
    name: 'Seed Phrase Demo',
    description: 'Interactive demonstration of seed phrase security',
    category: 'security',
    emoji: '🔐',
    difficulty: 'beginner',
    estimatedMinutes: 7,
    component: 'SeedPhraseDemo',
    tags: ['security', 'wallet', 'seed-phrase']
  },
  {
    id: 'wallet_connection',
    name: 'Wallet Connection Demo',
    description: 'Demonstrate wallet connection flow',
    category: 'basics',
    emoji: '👛',
    difficulty: 'beginner',
    estimatedMinutes: 5,
    component: 'WalletConnectionDemo',
    tags: ['wallet', 'connection', 'demo']
  },
  {
    id: 'scam_detector',
    name: 'Scam Detector',
    description: 'Learn to identify common crypto scams',
    category: 'security',
    emoji: '🚨',
    difficulty: 'beginner',
    estimatedMinutes: 8,
    component: 'ScamDetector',
    tags: ['security', 'scams', 'education']
  },
  {
    id: 'beginner_scam_or_legit',
    name: 'Scam or Legit Quiz',
    description: 'Quiz to test scam detection skills',
    category: 'security',
    emoji: '❓',
    difficulty: 'beginner',
    estimatedMinutes: 6,
    component: 'BeginnerScamOrLegit',
    tags: ['security', 'quiz', 'scams']
  },
  {
    id: 'phishing_simulator',
    name: 'Phishing Simulator',
    description: 'Practice identifying phishing attempts',
    category: 'security',
    emoji: '🎣',
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    component: 'PhishingSimulator',
    tags: ['security', 'phishing', 'simulation']
  },

  // DeFi
  {
    id: 'defi_protocol_explorer',
    name: 'DeFi Protocol Explorer',
    description: 'Explore different DeFi protocols and their features',
    category: 'defi',
    emoji: '🏦',
    difficulty: 'intermediate',
    estimatedMinutes: 12,
    component: 'DeFiProtocolExplorer',
    tags: ['defi', 'protocols', 'explorer']
  },
  {
    id: 'yield_calculator',
    name: 'Yield Calculator',
    description: 'Calculate potential yields from DeFi investments',
    category: 'defi',
    emoji: '📈',
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    component: 'YieldCalculator',
    tags: ['defi', 'calculator', 'yields']
  },

  // NFTs
  {
    id: 'nft_showcase',
    name: 'NFT Showcase',
    description: 'Display and explore NFT concepts',
    category: 'nft',
    emoji: '🎨',
    difficulty: 'beginner',
    estimatedMinutes: 6,
    component: 'NFTShowcase',
    tags: ['nft', 'showcase', 'art']
  },
  {
    id: 'nft_marketplace',
    name: 'NFT Marketplace Demo',
    description: 'Simulate NFT marketplace interactions',
    category: 'nft',
    emoji: '🛍️',
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    component: 'NFTMarketplace',
    tags: ['nft', 'marketplace', 'trading']
  },
  {
    id: 'nft_metadata',
    name: 'NFT Metadata Explorer',
    description: 'Understand NFT metadata structure',
    category: 'nft',
    emoji: '📋',
    difficulty: 'intermediate',
    estimatedMinutes: 8,
    component: 'NFTMetadata',
    tags: ['nft', 'metadata', 'technical']
  },

  // dApps & Use Cases
  {
    id: 'dapp_demo',
    name: 'dApp Demo',
    description: 'Interactive demonstration of decentralized applications',
    category: 'basics',
    emoji: '📱',
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    component: 'DAppDemo',
    tags: ['dapp', 'demo', 'applications']
  },
  {
    id: 'hcs_use_case_explorer',
    name: 'HCS Use Case Explorer',
    description: 'Explore Hedera Consensus Service use cases',
    category: 'basics',
    emoji: '🔗',
    difficulty: 'advanced',
    estimatedMinutes: 12,
    component: 'HCSUseCaseExplorer',
    tags: ['hedera', 'hcs', 'use-cases']
  },
  {
    id: 'explorer_guide',
    name: 'Blockchain Explorer Guide',
    description: 'Learn to use blockchain explorers',
    category: 'basics',
    emoji: '🔍',
    difficulty: 'beginner',
    estimatedMinutes: 8,
    component: 'ExplorerGuide',
    tags: ['explorer', 'tools', 'guide']
  },

  // Finance & Payments
  {
    id: 'payment_comparison',
    name: 'Payment Methods Comparison',
    description: 'Compare traditional vs crypto payment methods',
    category: 'basics',
    emoji: '💳',
    difficulty: 'beginner',
    estimatedMinutes: 7,
    component: 'PaymentComparison',
    tags: ['payments', 'comparison', 'finance']
  },
  {
    id: 'mobile_money_comparison',
    name: 'Mobile Money vs Crypto',
    description: 'Compare mobile money and cryptocurrency',
    category: 'basics',
    emoji: '📱',
    difficulty: 'beginner',
    estimatedMinutes: 8,
    component: 'MobileMoneyComparison',
    tags: ['payments', 'mobile', 'comparison']
  },
  {
    id: 'tax_calculator',
    name: 'Crypto Tax Calculator',
    description: 'Calculate crypto taxes and understand regulations',
    category: 'career',
    emoji: '🧮',
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    component: 'TaxCalculator',
    tags: ['tax', 'calculator', 'finance']
  },

  // Career & Future
  {
    id: 'career_explorer',
    name: 'Web3 Career Explorer',
    description: 'Explore career opportunities in Web3',
    category: 'career',
    emoji: '💼',
    difficulty: 'beginner',
    estimatedMinutes: 10,
    component: 'CareerExplorer',
    tags: ['career', 'jobs', 'opportunities']
  },
  {
    id: 'play_to_earn_demo',
    name: 'Play-to-Earn Demo',
    description: 'Experience play-to-earn game mechanics',
    category: 'nft',
    emoji: '🎮',
    difficulty: 'beginner',
    estimatedMinutes: 12,
    component: 'PlayToEarnGame',
    tags: ['gaming', 'play-to-earn', 'nft']
  }
];

/**
 * Get interactive types by category
 */
export function getInteractivesByCategory(category: InteractiveType['category']): InteractiveType[] {
  return INTERACTIVE_TYPES.filter(type => type.category === category);
}

/**
 * Get interactive types by difficulty
 */
export function getInteractivesByDifficulty(difficulty: InteractiveType['difficulty']): InteractiveType[] {
  return INTERACTIVE_TYPES.filter(type => type.difficulty === difficulty);
}

/**
 * Get interactive type by ID
 */
export function getInteractiveById(id: string): InteractiveType | undefined {
  return INTERACTIVE_TYPES.find(type => type.id === id);
}

/**
 * Search interactive types by name or description
 */
export function searchInteractives(query: string): InteractiveType[] {
  const lowerQuery = query.toLowerCase();
  return INTERACTIVE_TYPES.filter(type =>
    type.name.toLowerCase().includes(lowerQuery) ||
    type.description.toLowerCase().includes(lowerQuery) ||
    type.tags.some(tag => tag.includes(lowerQuery))
  );
}

/**
 * Get all categories
 */
export const INTERACTIVE_CATEGORIES = [
  { id: 'basics', name: 'Blockchain Basics', emoji: '🎓' },
  { id: 'defi', name: 'DeFi', emoji: '🏦' },
  { id: 'nft', name: 'NFTs', emoji: '🎨' },
  { id: 'security', name: 'Security', emoji: '🔐' },
  { id: 'career', name: 'Career', emoji: '💼' },
  { id: 'consensus', name: 'Consensus', emoji: '🤝' },
  { id: 'storage', name: 'Storage', emoji: '💾' }
] as const;
