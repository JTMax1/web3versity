// Mock data for Web3versity platform

export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  track: 'explorer' | 'developer';
  category: string;
  estimatedHours: number;
  enrollmentCount: number;
  rating: number;
  thumbnail: string;
  lessons: number;
  prerequisites: string[];
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  contentType: 'video' | 'text' | 'quiz' | 'coding_challenge' | 'transaction_demo';
  duration: number;
  sequence: number;
  completed: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedAt?: string;
}

export interface User {
  id: string;
  username: string;
  walletAddress?: string;
  hederaAccountId?: string;
  walletBalance?: number;
  totalPoints: number;
  level: number;
  streakDays: number;
  profilePicture: string;
}

export const mockUser: User = {
  id: 'user_001',
  username: 'CryptoLearner',
  walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  hederaAccountId: '0.0.123456',
  walletBalance: 125.75,
  totalPoints: 1350,
  level: 14,
  streakDays: 7,
  profilePicture: '👨‍💻'
};

export const mockCourses: Course[] = [
  {
    id: 'course_001',
    title: 'Hedera Fundamentals',
    description: 'Learn the basics of Hedera Hashgraph, including its unique consensus algorithm and core services.',
    difficulty: 'beginner',
    track: 'explorer',
    category: 'Blockchain Basics',
    estimatedHours: 4,
    enrollmentCount: 2847,
    rating: 4.8,
    thumbnail: '🌐',
    lessons: 12,
    prerequisites: []
  },
  {
    id: 'course_002',
    title: 'Introduction to Hedera Token Service',
    description: 'Master creating and managing tokens on Hedera without writing smart contracts.',
    difficulty: 'beginner',
    track: 'developer',
    category: 'Token Development',
    estimatedHours: 6,
    enrollmentCount: 1923,
    rating: 4.9,
    thumbnail: '🪙',
    lessons: 15,
    prerequisites: ['course_001']
  },
  {
    id: 'course_003',
    title: 'Smart Contracts on Hedera',
    description: 'Deploy and interact with Solidity smart contracts on the Hedera EVM.',
    difficulty: 'intermediate',
    track: 'developer',
    category: 'Smart Contracts',
    estimatedHours: 10,
    enrollmentCount: 1456,
    rating: 4.7,
    thumbnail: '📜',
    lessons: 20,
    prerequisites: ['course_002']
  },
  {
    id: 'course_004',
    title: 'Wallet Security Best Practices',
    description: 'Learn how to secure your crypto wallets and protect your assets from common threats.',
    difficulty: 'beginner',
    track: 'explorer',
    category: 'Security',
    estimatedHours: 3,
    enrollmentCount: 3201,
    rating: 4.9,
    thumbnail: '🔒',
    lessons: 8,
    prerequisites: []
  },
  {
    id: 'course_005',
    title: 'Building DApps with Hedera',
    description: 'Create full-stack decentralized applications using Hedera services and modern web frameworks.',
    difficulty: 'advanced',
    track: 'developer',
    category: 'DApp Development',
    estimatedHours: 15,
    enrollmentCount: 892,
    rating: 4.8,
    thumbnail: '🚀',
    lessons: 25,
    prerequisites: ['course_003']
  },
  {
    id: 'course_006',
    title: 'Understanding NFTs on Hedera',
    description: 'Build and deploy NFT collections on Hedera. Learn to mint, transfer, and manage NFTs with code.',
    difficulty: 'intermediate',
    track: 'developer',
    category: 'NFTs',
    estimatedHours: 8,
    enrollmentCount: 2134,
    rating: 4.6,
    thumbnail: '🎨',
    lessons: 12,
    prerequisites: ['course_002']
  },
  {
    id: 'course_007',
    title: 'Hedera Consensus Service Deep Dive',
    description: 'Leverage HCS for immutable logging, auditing, and timestamping in your applications.',
    difficulty: 'advanced',
    track: 'developer',
    category: 'Advanced Topics',
    estimatedHours: 8,
    enrollmentCount: 674,
    rating: 4.9,
    thumbnail: '⏱️',
    lessons: 12,
    prerequisites: ['course_002']
  },
  {
    id: 'course_008',
    title: 'DeFi Basics',
    description: 'Master decentralized finance: build lending protocols, create liquidity pools, and implement staking on Hedera.',
    difficulty: 'intermediate',
    track: 'developer',
    category: 'DeFi',
    estimatedHours: 10,
    enrollmentCount: 1789,
    rating: 4.7,
    thumbnail: '💰',
    lessons: 16,
    prerequisites: ['course_003']
  },
  {
    id: 'course_009',
    title: 'Understanding Transactions',
    description: 'Learn how blockchain transactions work, from initiation to confirmation on the Hedera network.',
    difficulty: 'beginner',
    track: 'explorer',
    category: 'Blockchain Basics',
    estimatedHours: 3,
    enrollmentCount: 3456,
    rating: 4.8,
    thumbnail: '💸',
    lessons: 6,
    prerequisites: []
  },
  {
    id: 'course_010',
    title: 'Understanding NFTs - Beginner',
    description: 'Discover what NFTs are and how they represent digital ownership in the real world.',
    difficulty: 'beginner',
    track: 'explorer',
    category: 'NFTs',
    estimatedHours: 3,
    enrollmentCount: 4123,
    rating: 4.9,
    thumbnail: '🖼️',
    lessons: 7,
    prerequisites: []
  },
  {
    id: 'course_011',
    title: 'Understanding NFTs - Intermediate',
    description: 'Explore NFT marketplaces, royalties, and how to buy, sell, and trade digital assets safely.',
    difficulty: 'intermediate',
    track: 'explorer',
    category: 'NFTs',
    estimatedHours: 5,
    enrollmentCount: 2876,
    rating: 4.7,
    thumbnail: '🎭',
    lessons: 10,
    prerequisites: ['course_010']
  },
  {
    id: 'course_012',
    title: 'Understanding NFTs - Advanced',
    description: 'Deep dive into NFT standards, metadata, smart contracts, and advanced NFT use cases.',
    difficulty: 'advanced',
    track: 'explorer',
    category: 'NFTs',
    estimatedHours: 7,
    enrollmentCount: 1543,
    rating: 4.8,
    thumbnail: '🏛️',
    lessons: 12,
    prerequisites: ['course_011']
  },
  {
    id: 'course_013',
    title: 'Introduction to DApps',
    description: 'Learn what decentralized applications are and how they differ from traditional apps.',
    difficulty: 'beginner',
    track: 'explorer',
    category: 'DApp Basics',
    estimatedHours: 4,
    enrollmentCount: 3687,
    rating: 4.8,
    thumbnail: '📱',
    lessons: 9,
    prerequisites: ['course_001']
  },
  {
    id: 'course_014',
    title: 'Understanding Testnet on Hedera',
    description: 'Practice with test tokens and experiment safely on Hedera\'s testnet environment.',
    difficulty: 'beginner',
    track: 'explorer',
    category: 'Hedera Networks',
    estimatedHours: 3,
    enrollmentCount: 2945,
    rating: 4.9,
    thumbnail: '🧪',
    lessons: 5,
    prerequisites: ['course_001']
  },
  {
    id: 'course_015',
    title: 'Understanding PreviewNet on Hedera',
    description: 'Test upcoming Hedera features before they launch on mainnet using PreviewNet.',
    difficulty: 'intermediate',
    track: 'explorer',
    category: 'Hedera Networks',
    estimatedHours: 4,
    enrollmentCount: 1234,
    rating: 4.6,
    thumbnail: '👁️',
    lessons: 9,
    prerequisites: ['course_014']
  },
  {
    id: 'course_016',
    title: 'Understanding Mainnet',
    description: 'Learn about production blockchain networks and how to safely use real cryptocurrency.',
    difficulty: 'beginner',
    track: 'explorer',
    category: 'Hedera Networks',
    estimatedHours: 4,
    enrollmentCount: 3298,
    rating: 4.9,
    thumbnail: '🌐',
    lessons: 10,
    prerequisites: ['course_014']
  },
  {
    id: 'course_017',
    title: 'Understanding Devnet',
    description: 'Set up local development environments and understand developer-focused test networks.',
    difficulty: 'intermediate',
    track: 'explorer',
    category: 'Hedera Networks',
    estimatedHours: 5,
    enrollmentCount: 987,
    rating: 4.7,
    thumbnail: '⚙️',
    lessons: 11,
    prerequisites: ['course_014']
  },
  {
    id: 'course_018',
    title: 'DApp Interaction',
    description: 'Connect your wallet and interact with decentralized applications confidently and securely.',
    difficulty: 'intermediate',
    track: 'explorer',
    category: 'DApp Basics',
    estimatedHours: 5,
    enrollmentCount: 2156,
    rating: 4.8,
    thumbnail: '🔗',
    lessons: 11,
    prerequisites: ['course_013']
  },
  {
    id: 'course_019',
    title: 'Understanding Blockchain Explorers',
    description: 'Navigate HashScan and other explorers to track transactions and verify blockchain data.',
    difficulty: 'beginner',
    track: 'explorer',
    category: 'Tools',
    estimatedHours: 3,
    enrollmentCount: 3421,
    rating: 4.9,
    thumbnail: '🔍',
    lessons: 8,
    prerequisites: ['course_009']
  },
  // New Explorer Courses (020-044)
  {
    id: 'course_020',
    title: 'Cross-Border Payments with Crypto',
    description: 'Save 10%+ on remittances! Learn how crypto revolutionizes sending money across African borders.',
    difficulty: 'beginner',
    track: 'explorer',
    category: 'Payments',
    estimatedHours: 2,
    enrollmentCount: 2847,
    rating: 4.9,
    thumbnail: '💸',
    lessons: 5,
    prerequisites: []
  },
  {
    id: 'course_021',
    title: 'Avoiding Crypto Scams in Africa',
    description: 'Protect yourself! Identify and avoid common crypto scams targeting African users.',
    difficulty: 'beginner',
    track: 'explorer',
    category: 'Security',
    estimatedHours: 2,
    enrollmentCount: 3156,
    rating: 5.0,
    thumbnail: '🚨',
    lessons: 5,
    prerequisites: []
  },
  {
    id: 'course_022',
    title: 'Understanding Stablecoins',
    description: 'Beat inflation with dollar-pegged crypto. Perfect for savings and daily transactions.',
    difficulty: 'beginner',
    track: 'explorer',
    category: 'Crypto Basics',
    estimatedHours: 2,
    enrollmentCount: 2934,
    rating: 4.8,
    thumbnail: '💵',
    lessons: 5,
    prerequisites: []
  },
  {
    id: 'course_023',
    title: 'From Mobile Money to Crypto',
    description: 'Already use M-Pesa? You understand 80% of crypto! Learn the bridge to Web3.',
    difficulty: 'beginner',
    track: 'explorer',
    category: 'Crypto Basics',
    estimatedHours: 2,
    enrollmentCount: 3421,
    rating: 4.9,
    thumbnail: '📱',
    lessons: 5,
    prerequisites: []
  },
  {
    id: 'course_024',
    title: 'Understanding Private Keys & Ownership',
    description: 'Not your keys, not your coins! Master self-custody and protect your crypto.',
    difficulty: 'beginner',
    track: 'explorer',
    category: 'Security',
    estimatedHours: 2,
    enrollmentCount: 2765,
    rating: 4.9,
    thumbnail: '🔐',
    lessons: 5,
    prerequisites: []
  },
  {
    id: 'course_025',
    title: 'DeFi Basics for Beginners',
    description: 'Bank the unbanked! Access lending, borrowing, and earning without traditional banks.',
    difficulty: 'beginner',
    track: 'explorer',
    category: 'DeFi',
    estimatedHours: 3,
    enrollmentCount: 2543,
    rating: 4.7,
    thumbnail: '🏦',
    lessons: 5,
    prerequisites: []
  },
  {
    id: 'course_026',
    title: 'Understanding DEXs',
    description: 'Trade crypto without accounts or KYC on decentralized exchanges like SaucerSwap.',
    difficulty: 'intermediate',
    track: 'explorer',
    category: 'DeFi',
    estimatedHours: 2,
    enrollmentCount: 1987,
    rating: 4.8,
    thumbnail: '💱',
    lessons: 5,
    prerequisites: ['course_025']
  },
  {
    id: 'course_027',
    title: 'Crypto Taxes & Regulations in Africa',
    description: 'Navigate crypto regulations in Nigeria, Kenya, South Africa, and beyond.',
    difficulty: 'intermediate',
    track: 'explorer',
    category: 'Legal',
    estimatedHours: 2,
    enrollmentCount: 1654,
    rating: 4.6,
    thumbnail: '📋',
    lessons: 5,
    prerequisites: []
  },
  {
    id: 'course_028',
    title: 'Understanding Hedera Consensus',
    description: 'Why Hedera is 10,000x faster and 100,000x cheaper than Bitcoin. Learn hashgraph!',
    difficulty: 'intermediate',
    track: 'explorer',
    category: 'Hedera Advanced',
    estimatedHours: 3,
    enrollmentCount: 2134,
    rating: 4.9,
    thumbnail: '⚡',
    lessons: 5,
    prerequisites: ['course_001']
  },
  {
    id: 'course_029',
    title: 'Careers in Web3',
    description: 'Earn dollars remotely! From community manager to developer - find your Web3 career.',
    difficulty: 'beginner',
    track: 'explorer',
    category: 'Career',
    estimatedHours: 3,
    enrollmentCount: 4123,
    rating: 5.0,
    thumbnail: '💼',
    lessons: 6,
    prerequisites: []
  },
  {
    id: 'course_030',
    title: 'Understanding Cryptocurrency Basics',
    description: 'Bitcoin, Ethereum, HBAR explained. Learn what gives crypto value and how it works.',
    difficulty: 'beginner',
    track: 'explorer',
    category: 'Crypto Basics',
    estimatedHours: 2,
    enrollmentCount: 4567,
    rating: 4.8,
    thumbnail: '💎',
    lessons: 5,
    prerequisites: []
  },
  {
    id: 'course_031',
    title: 'Digital Identity on Blockchain',
    description: 'Own your identity! Create blockchain credentials that work globally.',
    difficulty: 'intermediate',
    track: 'explorer',
    category: 'Advanced Topics',
    estimatedHours: 2,
    enrollmentCount: 1543,
    rating: 4.7,
    thumbnail: '🆔',
    lessons: 5,
    prerequisites: []
  },
  {
    id: 'course_032',
    title: 'Understanding DAOs',
    description: 'Digital democracy! Learn how organizations run on code and community votes.',
    difficulty: 'intermediate',
    track: 'explorer',
    category: 'Governance',
    estimatedHours: 2,
    enrollmentCount: 1876,
    rating: 4.8,
    thumbnail: '🏛️',
    lessons: 5,
    prerequisites: []
  },
  {
    id: 'course_033',
    title: 'Blockchain Gaming & Play-to-Earn',
    description: 'Own your items, earn while playing! Explore the future of gaming.',
    difficulty: 'beginner',
    track: 'explorer',
    category: 'Gaming',
    estimatedHours: 2,
    enrollmentCount: 3298,
    rating: 4.6,
    thumbnail: '🎮',
    lessons: 5,
    prerequisites: []
  },
  {
    id: 'course_034',
    title: 'Reading Crypto Charts',
    description: 'Make informed decisions! Learn candlesticks, support/resistance, and chart patterns.',
    difficulty: 'intermediate',
    track: 'explorer',
    category: 'Trading',
    estimatedHours: 3,
    enrollmentCount: 2456,
    rating: 4.7,
    thumbnail: '📈',
    lessons: 5,
    prerequisites: []
  },
  {
    id: 'course_035',
    title: 'Understanding Crypto Exchanges',
    description: 'Master CEX, DEX, and P2P platforms. Trade safely on Binance, Luno, and beyond.',
    difficulty: 'beginner',
    track: 'explorer',
    category: 'Trading',
    estimatedHours: 2,
    enrollmentCount: 3187,
    rating: 4.8,
    thumbnail: '🔄',
    lessons: 5,
    prerequisites: []
  },
  {
    id: 'course_036',
    title: 'Hedera Governing Council',
    description: 'Google, IBM, Standard Bank... Learn who governs Hedera and why it matters.',
    difficulty: 'intermediate',
    track: 'explorer',
    category: 'Hedera Advanced',
    estimatedHours: 2,
    enrollmentCount: 1687,
    rating: 4.9,
    thumbnail: '🏢',
    lessons: 5,
    prerequisites: ['course_001']
  },
  {
    id: 'course_037',
    title: 'Building on Hedera: Use Cases',
    description: 'Real African projects! Supply chain, healthcare, land registry, and more.',
    difficulty: 'intermediate',
    track: 'explorer',
    category: 'Hedera Advanced',
    estimatedHours: 3,
    enrollmentCount: 1987,
    rating: 4.8,
    thumbnail: '🛠️',
    lessons: 5,
    prerequisites: ['course_001']
  },
  {
    id: 'course_038',
    title: 'Understanding Consensus Mechanisms',
    description: 'Proof of Work vs Proof of Stake vs Hashgraph. Compare Bitcoin, Ethereum, Hedera.',
    difficulty: 'intermediate',
    track: 'explorer',
    category: 'Blockchain Basics',
    estimatedHours: 2,
    enrollmentCount: 1765,
    rating: 4.7,
    thumbnail: '⚙️',
    lessons: 5,
    prerequisites: []
  },
  {
    id: 'course_039',
    title: 'Layer 1 vs Layer 2 Scaling',
    description: 'Understand blockchain scalability. Why Hedera doesn\'t need Layer 2.',
    difficulty: 'intermediate',
    track: 'explorer',
    category: 'Advanced Topics',
    estimatedHours: 2,
    enrollmentCount: 1432,
    rating: 4.6,
    thumbnail: '🔺',
    lessons: 5,
    prerequisites: []
  },
  {
    id: 'course_040',
    title: 'Smart Contract Basics (No Coding)',
    description: 'Understand smart contracts without programming. Vending machines on blockchain!',
    difficulty: 'beginner',
    track: 'explorer',
    category: 'Smart Contracts',
    estimatedHours: 2,
    enrollmentCount: 2876,
    rating: 4.8,
    thumbnail: '🤖',
    lessons: 5,
    prerequisites: []
  },
  {
    id: 'course_041',
    title: 'Understanding Tokenomics',
    description: 'Evaluate crypto projects! Learn supply, distribution, vesting, and token value.',
    difficulty: 'intermediate',
    track: 'explorer',
    category: 'Investment',
    estimatedHours: 3,
    enrollmentCount: 2234,
    rating: 4.7,
    thumbnail: '💰',
    lessons: 5,
    prerequisites: []
  },
  {
    id: 'course_042',
    title: 'Participating in Crypto Communities',
    description: 'Network, learn, earn! Join Discord, Twitter, meetups and build your Web3 network.',
    difficulty: 'beginner',
    track: 'explorer',
    category: 'Community',
    estimatedHours: 2,
    enrollmentCount: 2987,
    rating: 4.9,
    thumbnail: '🤝',
    lessons: 5,
    prerequisites: []
  },
  {
    id: 'course_043',
    title: 'Advanced Wallet Security',
    description: 'Multi-sig, cold storage, hardware wallets. Protect large amounts like a pro.',
    difficulty: 'advanced',
    track: 'explorer',
    category: 'Security',
    estimatedHours: 3,
    enrollmentCount: 1543,
    rating: 5.0,
    thumbnail: '🛡️',
    lessons: 5,
    prerequisites: ['course_004', 'course_024']
  },
  {
    id: 'course_044',
    title: 'Earning Yield with Crypto',
    description: 'Put your crypto to work! Learn staking, lending, and earning passive income.',
    difficulty: 'intermediate',
    track: 'explorer',
    category: 'DeFi',
    estimatedHours: 3,
    enrollmentCount: 2654,
    rating: 4.8,
    thumbnail: '💸',
    lessons: 5,
    prerequisites: ['course_025']
  }
];

export const mockBadges: Badge[] = [
  {
    id: 'badge_001',
    name: 'First Steps',
    description: 'Complete your first lesson',
    image: '🎯',
    rarity: 'common',
    earned: true,
    earnedAt: '2025-10-10'
  },
  {
    id: 'badge_002',
    name: 'Speed Learner',
    description: 'Complete 5 lessons in one day',
    image: '⚡',
    rarity: 'rare',
    earned: true,
    earnedAt: '2025-10-12'
  },
  {
    id: 'badge_003',
    name: 'Perfect Score',
    description: 'Get 100% on 10 quizzes',
    image: '🏆',
    rarity: 'epic',
    earned: false
  },
  {
    id: 'badge_004',
    name: 'First Transaction',
    description: 'Successfully send your first blockchain transaction',
    image: '💸',
    rarity: 'common',
    earned: false
  },
  {
    id: 'badge_009',
    name: 'Transaction Master',
    description: 'Submit 10 successful testnet transactions',
    image: '🔗',
    rarity: 'rare',
    earned: false
  },
  {
    id: 'badge_005',
    name: 'Chain Explorer',
    description: 'View 50 transactions on HashScan',
    image: '🔍',
    rarity: 'common',
    earned: false
  },
  {
    id: 'badge_006',
    name: 'Community Helper',
    description: 'Help 5 peers in discussions',
    image: '🤝',
    rarity: 'epic',
    earned: false
  },
  {
    id: 'badge_007',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    image: '🔥',
    rarity: 'rare',
    earned: true,
    earnedAt: '2025-10-18'
  },
  {
    id: 'badge_008',
    name: 'Token Creator',
    description: 'Create your first token on Hedera',
    image: '🪙',
    rarity: 'epic',
    earned: false
  },
  {
    id: 'badge_037',
    name: 'Hedera Builder',
    description: 'Complete Building on Hedera: Use Cases course',
    image: '🛠️',
    rarity: 'rare',
    earned: false
  },
  {
    id: 'badge_040',
    name: 'Smart Contract Explorer',
    description: 'Complete Smart Contract Basics (No Coding) course',
    image: '🤖',
    rarity: 'rare',
    earned: false
  },
  {
    id: 'badge_041',
    name: 'Tokenomics Master',
    description: 'Complete Understanding Tokenomics course',
    image: '💰',
    rarity: 'rare',
    earned: false
  },
  {
    id: 'badge_043',
    name: 'Security Expert',
    description: 'Complete Advanced Wallet Security course',
    image: '🛡️',
    rarity: 'epic',
    earned: false
  },
  {
    id: 'badge_044',
    name: 'Yield Farmer',
    description: 'Complete Earning Yield with Crypto course',
    image: '💸',
    rarity: 'rare',
    earned: false
  }
];

export interface LeaderboardEntry {
  rank: number;
  username: string;
  points: number;
  level: number;
  avatar: string;
}

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: 'BlockchainNinja', points: 5420, level: 54, avatar: '🥷' },
  { rank: 2, username: 'CryptoQueen', points: 4890, level: 49, avatar: '👑' },
  { rank: 3, username: 'HashMaster', points: 4235, level: 42, avatar: '🧙‍♂️' },
  { rank: 4, username: 'DeFiPro', points: 3876, level: 39, avatar: '💎' },
  { rank: 5, username: 'SmartContractor', points: 3654, level: 37, avatar: '🛠️' },
  { rank: 6, username: 'TokenWizard', points: 3201, level: 32, avatar: '🪄' },
  { rank: 7, username: 'Web3Explorer', points: 2987, level: 30, avatar: '🧭' },
  { rank: 8, username: 'HederaFan', points: 2743, level: 27, avatar: '⚡' },
  { rank: 9, username: 'CodeMaster', points: 2456, level: 25, avatar: '💻' },
  { rank: 10, username: 'NFTCollector', points: 2198, level: 22, avatar: '🎨' },
  { rank: 11, username: 'ChainBuilder', points: 1987, level: 20, avatar: '🏗️' },
  { rank: 12, username: 'CryptoNewbie', points: 1765, level: 18, avatar: '🌱' },
  { rank: 13, username: 'LearningDaily', points: 1543, level: 15, avatar: '📚' },
  { rank: 14, username: 'CryptoLearner', points: 1350, level: 14, avatar: '👨‍💻' },
];

export interface Discussion {
  id: string;
  courseId: string;
  title: string;
  author: string;
  authorAvatar: string;
  content: string;
  replies: number;
  upvotes: number;
  timestamp: string;
}

export const mockDiscussions: Discussion[] = [
  {
    id: 'disc_001',
    courseId: 'course_002',
    title: 'How do I associate a token with my account?',
    author: 'NewLearner',
    authorAvatar: '🌱',
    content: 'I\'m trying to associate a token but keep getting an error. Can someone help?',
    replies: 5,
    upvotes: 12,
    timestamp: '2 hours ago'
  },
  {
    id: 'disc_002',
    courseId: 'course_003',
    title: 'Best practices for gas optimization in Solidity',
    author: 'SmartDev',
    authorAvatar: '💻',
    content: 'What are some tips for reducing gas costs when deploying smart contracts on Hedera?',
    replies: 8,
    upvotes: 23,
    timestamp: '5 hours ago'
  },
  {
    id: 'disc_003',
    courseId: 'course_001',
    title: 'Difference between Hedera and traditional blockchain?',
    author: 'CuriousMind',
    authorAvatar: '🤔',
    content: 'Can someone explain how Hedera\'s hashgraph consensus differs from proof-of-work?',
    replies: 12,
    upvotes: 34,
    timestamp: '1 day ago'
  }
];
