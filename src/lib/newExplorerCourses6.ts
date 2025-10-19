// New Explorer Track Courses - Part 6 (Courses 035-037)
// Remaining Explorer Courses Continued
import { LessonContent } from './courseContent';

// ==================== COURSE 035: Understanding Crypto Exchanges ====================
export const cryptoExchangesLessons: LessonContent[] = [
  {
    id: 'exchange_lesson_1',
    courseId: 'course_035',
    title: 'Types of Exchanges',
    type: 'text',
    sequence: 1,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'Centralized Exchanges (CEX)',
          text: 'Binance, Coinbase, Luno, Quidax - companies that facilitate crypto buying/selling. Like forex bureaus but for crypto. They custody your funds (you don\'t hold keys).',
          list: [
            '**Pros**: Easy to use, fiat on/off ramps, customer support, liquid markets',
            '**Cons**: Custody risk, KYC required, can freeze accounts, single point of failure',
            '**Best for**: Buying crypto with fiat, selling to fiat, beginners'
          ]
        },
        {
          heading: 'Decentralized Exchanges (DEX)',
          text: 'SaucerSwap, Uniswap, PancakeSwap - smart contracts that enable trading. No company, no custody, no KYC. You trade directly from your wallet.',
          list: [
            '**Pros**: You control funds, no KYC, censorship-resistant, transparent',
            '**Cons**: No fiat support, no customer service, slightly complex',
            '**Best for**: Crypto-to-crypto trading, maintaining custody'
          ]
        },
        {
          heading: 'P2P Platforms',
          text: 'Paxful, LocalBitcoins, Binance P2P - connect buyers and sellers directly. Escrow holds funds until payment confirmed. Popular in Africa!',
          list: [
            '**Pros**: Many payment options (M-Pesa, bank transfer, cash), competitive rates',
            '**Cons**: Slower, scam risk, need to verify counterparty reputation',
            '**Best for**: Nigeria during banking restrictions, rural areas'
          ]
        }
      ]
    }
  },
  {
    id: 'exchange_lesson_2',
    courseId: 'course_035',
    title: 'Using Exchanges in Africa',
    type: 'text',
    sequence: 2,
    duration: 7,
    content: {
      sections: [
        {
          heading: '🇳🇬 Nigeria',
          text: 'After CBN ban, international exchanges restricted. Solutions: Binance P2P, Luno, Quidax, Roqqu. Payment via bank transfer or P2P. Most Nigerians use P2P markets.',
          emoji: '🇳🇬'
        },
        {
          heading: '🇰🇪 Kenya',
          text: 'Binance, Paxful widely used. Can buy with M-Pesa! Local exchanges: BitPesa (now AZA Finance). Easy on-ramps but watch fees.',
          emoji: '🇰🇪'
        },
        {
          heading: '🇿🇦 South Africa',
          text: 'Most regulated: Luno, VALR, AltCoinTrader. Bank transfers work smoothly. Can set up recurring buys. Most mature market.',
          emoji: '🇿🇦'
        },
        {
          heading: '🇬🇭 Ghana',
          text: 'Binance dominant. Local startups emerging. Mobile money integration growing. Dartafrica, Coinprofile popular.',
          emoji: '🇬🇭'
        },
        {
          heading: 'Fees Comparison',
          list: [
            '**Binance**: 0.1% trading fee, withdrawal varies',
            '**Luno**: 0.5-1% trading, free withdrawals to wallet',
            '**P2P**: 0-1% platform fee + counterparty premium (2-5%)',
            '**DEX**: Network fees only ($0.0001 on Hedera, $5-50 on Ethereum)'
          ]
        },
        {
          heading: 'Choosing an Exchange',
          list: [
            'Is it available in your country?',
            'Does it support your payment method?',
            'What are the fees?',
            'Is it reputable? (Check reviews, time in operation)',
            'Does it have the coins you want?'
          ]
        }
      ]
    }
  },
  {
    id: 'exchange_lesson_3',
    courseId: 'course_035',
    title: 'Exchange Interface Demo',
    type: 'interactive',
    sequence: 3,
    duration: 12,
    content: {
      type: 'exchange_demo'
    }
  },
  {
    id: 'exchange_lesson_4',
    courseId: 'course_035',
    title: 'Exchange Security Best Practices',
    type: 'text',
    sequence: 4,
    duration: 6,
    content: {
      sections: [
        {
          heading: '1. Enable 2FA (Two-Factor Authentication)',
          text: 'ALWAYS use 2FA! Preferably Google Authenticator or Authy, NOT SMS (can be hijacked). This is your first defense against account takeover.',
          emoji: '🔐'
        },
        {
          heading: '2. Whitelist Withdrawal Addresses',
          text: 'Add your wallet address to whitelist with 24hr delay. If hacker gets in, they can\'t withdraw immediately. Gives you time to recover account!',
          emoji: '⏰'
        },
        {
          heading: '3. Use Strong, Unique Passwords',
          text: 'Never reuse passwords! Use password manager (Bitwarden, 1Password). Crypto accounts should have 20+ character random passwords.',
          emoji: '🔑'
        },
        {
          heading: '4. Beware of Phishing',
          text: 'Fake "Binance" emails, fake websites (binance-africa.com). ALWAYS check URL is exact. Bookmark real exchange site. Never click email links!',
          emoji: '🎣'
        },
        {
          heading: '5. Don\'t Keep Large Amounts on Exchanges',
          text: 'Exchanges get hacked. FTX collapsed. Mt. Gox lost 850,000 BTC. QuadrigaCX founder "died" with keys. History is clear: Buy → Withdraw to wallet.',
          emoji: '💼'
        },
        {
          heading: '6. Verify Before Withdrawing',
          text: 'Double-check withdrawal address! Send small test amount first. Wrong address = funds lost forever. Triple check network (HBAR to HBAR address, not ERC20!).',
          emoji: '✅'
        },
        {
          heading: 'Red Flags',
          list: [
            'Exchange promising guaranteed returns',
            'No KYC for large amounts (likely scam)',
            'Can\'t find team or company info',
            'Too-good-to-be-true rates',
            'Pressure to deposit quickly'
          ]
        }
      ]
    }
  },
  {
    id: 'exchange_lesson_5',
    courseId: 'course_035',
    title: 'Crypto Exchanges Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What is the main advantage of centralized exchanges?',
          options: [
            'You control your private keys',
            'Easy fiat on/off ramps and user-friendly interfaces',
            'No KYC required',
            'Cannot be shut down'
          ],
          correctAnswer: 1,
          explanation: 'Centralized exchanges make it easy to buy crypto with fiat currency (Naira, Shillings, etc.) and have user-friendly interfaces with customer support.'
        },
        {
          question: 'Why shouldn\'t you keep large amounts on exchanges?',
          options: [
            'Exchanges charge storage fees',
            'Exchanges can be hacked or collapse (FTX, Mt. Gox)',
            'It\'s illegal',
            'They don\'t allow it'
          ],
          correctAnswer: 1,
          explanation: 'History shows exchanges can be hacked (Mt. Gox, Coincheck) or collapse (FTX, QuadrigaCX). Only keep on exchanges what you\'re actively trading.'
        },
        {
          question: 'What is P2P crypto trading?',
          options: [
            'Trading with AI robots',
            'Direct trading between individuals with escrow protection',
            'Professional trading only',
            'Trading without internet'
          ],
          correctAnswer: 1,
          explanation: 'P2P (peer-to-peer) platforms connect buyers and sellers directly, with escrow protection. Popular in Africa for M-Pesa and bank transfer payments.'
        },
        {
          question: 'What is the MOST important security measure for exchange accounts?',
          options: [
            'Using a long email address',
            'Enabling 2FA (two-factor authentication)',
            'Trading daily',
            'Using multiple exchanges'
          ],
          correctAnswer: 1,
          explanation: '2FA is critical! Even if someone gets your password, they can\'t access your account without the 2FA code. Use Google Authenticator, not SMS.'
        }
      ]
    }
  }
];

// ==================== COURSE 036: Hedera Governing Council ====================
export const hederaCouncilLessons: LessonContent[] = [
  {
    id: 'council_lesson_1',
    courseId: 'course_036',
    title: 'Why Governance Matters',
    type: 'text',
    sequence: 1,
    duration: 5,
    content: {
      sections: [
        {
          heading: 'The Governance Problem',
          text: 'Bitcoin: Anonymous founder disappeared. Ethereum: Vitalik has huge influence. Many cryptos: Founders control everything. Who makes decisions? Who can you trust?',
          emoji: '🤔'
        },
        {
          heading: 'Hedera\'s Solution',
          text: 'Governing Council of 39 global organizations from different industries. Each gets ONE vote. Term limits. No single entity controls Hedera. True decentralized governance!',
          emoji: '🏛️'
        },
        {
          heading: 'Why This Matters for Africa',
          text: 'When real companies (Google, IBM, Boeing) govern, they have reputations to protect. They won\'t rug pull. They won\'t abandon project. Stability and trust.',
          emoji: '🌍'
        }
      ]
    }
  },
  {
    id: 'council_lesson_2',
    courseId: 'course_036',
    title: 'Current Council Members',
    type: 'text',
    sequence: 2,
    duration: 8,
    content: {
      sections: [
        {
          heading: 'Technology Giants',
          list: [
            '**Google** - Runs nodes, brings cloud expertise',
            '**IBM** - Enterprise blockchain experience',
            '**LG Electronics** - IoT and consumer electronics',
            '**Boeing** - Aerospace and security',
            '**Deutsche Telekom** - European telecom leader',
            '**Tata Communications** - Asian connectivity'
          ]
        },
        {
          heading: 'Financial Institutions',
          list: [
            '**Standard Bank** - Africa\'s largest bank group! (South Africa)',
            '**Nomura** - Japanese investment banking',
            '**DBS Bank** - Southeast Asian banking',
            '**Shinhan Bank** - Korean banking'
          ]
        },
        {
          heading: 'Universities & Research',
          list: [
            '**University College London (UCL)** - Research and education',
            '**Indian Institute of Technology (IIT)** - Technology education',
            'Brings academic rigor and neutrality'
          ]
        },
        {
          heading: 'Legal & Professional Services',
          list: [
            '**Dentons** - World\'s largest law firm',
            '**Avery Dennison** - Supply chain and RFID',
            '**Wipro** - Indian IT consulting'
          ]
        },
        {
          heading: 'Web3 & Crypto',
          list: [
            '**Ubisoft** - Gaming company',
            '**ServiceNow** - Enterprise cloud',
            '**Abrdn** - Investment management'
          ]
        },
        {
          heading: '🌍 African Representation: Standard Bank',
          text: 'Standard Bank Group represents Africa on council! Based in Johannesburg, operates across 20 African countries. This gives Africa direct voice in Hedera governance!',
          emoji: '🇿🇦'
        }
      ]
    }
  },
  {
    id: 'council_lesson_3',
    courseId: 'course_036',
    title: 'How Council Governance Works',
    type: 'text',
    sequence: 3,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'One Member, One Vote',
          text: 'Google has same voting power as a university. Prevents any single entity from controlling decisions. True democracy!',
          emoji: '🗳️'
        },
        {
          heading: 'Term Limits',
          text: 'Council members have term limits (initially up to 6 years, renewable). Prevents entrenchment. Fresh perspectives regularly.',
          emoji: '⏱️'
        },
        {
          heading: 'Diverse Industries',
          text: 'Tech, finance, legal, academic, gaming, telecom - diverse backgrounds prevent groupthink. Each brings unique expertise.',
          emoji: '🌈'
        },
        {
          heading: 'Geographic Diversity',
          text: 'Members from: North America, Europe, Asia, Africa, Australia. Global representation ensures global perspective, not US-centric.',
          emoji: '🌍'
        },
        {
          heading: 'What Council Decides',
          list: [
            'Network upgrades and features',
            'Token release schedule',
            'Fee structures',
            'Treasury spending',
            'New council member admission',
            'Protocol improvements'
          ]
        },
        {
          heading: 'What Council CANNOT Do',
          text: 'Cannot change transaction history, cannot censor transactions, cannot seize funds, cannot violate security model. Code protects against abuse!',
          emoji: '🛡️'
        }
      ]
    }
  },
  {
    id: 'council_lesson_4',
    courseId: 'course_036',
    title: 'Interactive Council Timeline',
    type: 'interactive',
    sequence: 4,
    duration: 10,
    content: {
      type: 'council_timeline'
    }
  },
  {
    id: 'council_lesson_5',
    courseId: 'course_036',
    title: 'Governing Council Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'How many organizations will eventually govern Hedera?',
          options: [
            'One (centralized)',
            'Five',
            '39 diverse global organizations',
            'Unlimited'
          ],
          correctAnswer: 2,
          explanation: 'Hedera is governed by a council of up to 39 diverse global organizations from different industries and geographies, each with equal voting power.'
        },
        {
          question: 'Which African bank is on the Hedera Governing Council?',
          options: [
            'Access Bank',
            'Standard Bank',
            'Equity Bank',
            'No African representation'
          ],
          correctAnswer: 1,
          explanation: 'Standard Bank Group, Africa\'s largest bank based in South Africa, represents Africa on the Hedera Governing Council.'
        },
        {
          question: 'What prevents any single council member from controlling Hedera?',
          options: [
            'They don\'t have passwords',
            'One member one vote system with term limits',
            'Google controls everything',
            'There are no rules'
          ],
          correctAnswer: 1,
          explanation: 'Each council member has equal voting power (one vote), term limits exist, and diverse industries are represented - preventing any single entity from controlling decisions.'
        },
        {
          question: 'Why is diverse governance important?',
          options: [
            'It\'s not important',
            'It prevents centralized control and brings varied expertise',
            'It makes decisions slower',
            'It\'s just for marketing'
          ],
          correctAnswer: 1,
          explanation: 'Diverse governance from tech, finance, academia, and multiple geographies prevents centralized control, brings varied expertise, and ensures global perspectives.'
        }
      ]
    }
  }
];

// ==================== COURSE 037: Building on Hedera: Use Cases ====================
export const hederaUseCasesLessons: LessonContent[] = [
  {
    id: 'usecase_lesson_1',
    courseId: 'course_037',
    title: 'Real-World Hedera Applications',
    type: 'text',
    sequence: 1,
    duration: 7,
    content: {
      sections: [
        {
          heading: 'Supply Chain: Tracking Goods',
          text: 'Avery Dennison uses Hedera to track products from factory to store. Each item gets unique ID on blockchain. Stops counterfeits, proves authenticity. Perfect for African exports!',
          emoji: '📦'
        },
        {
          heading: 'Example: Kenyan Coffee',
          text: 'Coffee beans from Kiambu → Recorded on Hedera → Track journey to London café → Customer scans QR code → Sees farmer name, harvest date, journey! Farmer gets fair credit.',
          emoji: '☕'
        },
        {
          heading: 'Carbon Credits',
          text: 'African renewable energy projects create carbon credits → Tokenized on Hedera → Sold globally → Funds flow back to African projects. Transparent, no middlemen taking cuts!',
          emoji: '🌱'
        },
        {
          heading: 'Healthcare Records',
          text: 'Nigerian startup pilots medical records on Hedera. Your records accessible across hospitals, you control access, records can\'t be lost/altered. Saves lives!',
          emoji: '🏥'
        },
        {
          heading: 'Land Registry',
          text: 'Kenyan pilot: Land titles on Hedera. Stops land grabbing fraud. Immutable proof of ownership. Can get mortgage without corrupt clerk demanding bribes!',
          emoji: '🏘️'
        },
        {
          heading: 'Gaming',
          text: 'Game developers use Hedera for NFTs and in-game economies. Fast + cheap = smooth gameplay. African game studios can compete globally!',
          emoji: '🎮'
        }
      ]
    }
  },
  {
    id: 'usecase_lesson_2',
    courseId: 'course_037',
    title: 'African Projects on Hedera',
    type: 'text',
    sequence: 2,
    duration: 6,
    content: {
      sections: [
        {
          heading: '1. Financial Inclusion',
          text: 'Projects building on Hedera to bring banking to unbanked. Micro-loans recorded on chain. Repayment history builds credit score without traditional banks.',
          emoji: '🏦'
        },
        {
          heading: '2. Remittances',
          text: 'African diaspora sending money home using HBAR/USDC on Hedera. Under $0.01 fees vs Western Union 8-12%. Billions saved annually!',
          emoji: '💸'
        },
        {
          heading: '3. Agriculture',
          text: 'Smart contracts for crop insurance. Sensors detect drought → Smart contract automatically pays farmer. No claims process, no corruption, instant help!',
          emoji: '🌾'
        },
        {
          heading: '4. Education Credentials',
          text: 'Universities issuing certificates on Hedera. Employers globally verify instantly. Stops fake degree fraud. Opens opportunities for African graduates.',
          emoji: '🎓'
        },
        {
          heading: '5. Energy Trading',
          text: 'Peer-to-peer solar energy trading. Excess solar power in your home → Tokenized → Sell to neighbor → All tracked on Hedera. Microgrids for Africa!',
          emoji: '☀️'
        },
        {
          heading: 'Why Hedera for These Use Cases?',
          list: [
            '**Low cost** - Affordable for developing markets',
            '**Fast** - Real-time applications possible',
            '**Predictable fees** - Can budget accurately',
            '**Enterprise-grade** - Meets compliance requirements',
            '**Eco-friendly** - Doesn\'t drain expensive electricity'
          ]
        }
      ]
    }
  },
  {
    id: 'usecase_lesson_3',
    courseId: 'course_037',
    title: 'Explore a Live Hedera DApp',
    type: 'practical',
    sequence: 3,
    duration: 12,
    content: {
      title: 'Experience Real Hedera Application',
      description: 'Interact with an actual decentralized application built on Hedera to see how blockchain solves real problems.',
      objective: 'Successfully use a Hedera dApp and understand how it provides value over traditional alternatives.',
      steps: [
        'Connect wallet to Hedera ecosystem dApp',
        'Explore a use case (supply chain tracking, NFT marketplace, or DeFi)',
        'Perform an interaction (query data, mint NFT, or swap)',
        'View transaction on HashScan explorer',
        'Understand how this creates value over centralized alternative'
      ],
      transactionAmount: 0.5,
      successMessage: 'You just used a real Hedera application! This is the future being built on Hedera.',
      tips: [
        'Notice the speed - transactions confirmed in seconds',
        'Check the fee - likely under $0.01',
        'This same action on Ethereum might cost $10-100',
        'Imagine this scaled across Africa!'
      ]
    }
  },
  {
    id: 'usecase_lesson_4',
    courseId: 'course_037',
    title: 'Building on Hedera: Opportunities',
    type: 'text',
    sequence: 4,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'Developer Opportunities',
          text: 'Hedera offers grants for builders! African developers can get funding to build solutions for African problems. Low competition currently - first mover advantage!',
          emoji: '👨‍💻'
        },
        {
          heading: 'Business Opportunities',
          list: [
            '**Payment solutions** - HBAR/USDC payment processors for merchants',
            '**Remittance services** - Cheaper than Western Union',
            '**Supply chain** - Track African exports (coffee, cocoa, minerals)',
            '**Gaming** - Low fees perfect for play-to-earn',
            '**NFT marketplaces** - African art and culture',
            '**DeFi** - Lending/borrowing for underserved markets'
          ]
        },
        {
          heading: 'Social Impact',
          text: 'Solve real African problems! Land fraud, fake products, expensive remittances, lack of credit history, crop insurance. Blockchain + African ingenuity = massive impact!',
          emoji: '💡'
        },
        {
          heading: 'Resources to Start',
          list: [
            '**Hedera documentation** - docs.hedera.com',
            '**Developer Discord** - Active community helping builders',
            '**Hedera grants** - Apply for funding',
            '**Hackathons** - Hedera Africa Hackathon (like this one!)',
            '**SDKs available** - Java, JavaScript, Go, Python'
          ]
        }
      ]
    }
  },
  {
    id: 'usecase_lesson_5',
    courseId: 'course_037',
    title: 'Hedera Use Cases Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'How can Hedera help with supply chain tracking?',
          options: [
            'It cannot help',
            'Records product journey immutably, proving authenticity',
            'Makes shipping faster',
            'Reduces product weight'
          ],
          correctAnswer: 1,
          explanation: 'Hedera enables immutable tracking of products from origin to destination, proving authenticity and stopping counterfeits - perfect for African exports.'
        },
        {
          question: 'Why is Hedera good for African remittances?',
          options: [
            'It\'s not suitable',
            'Ultra-low fees ($0.0001) vs traditional 8-12%',
            'It requires banks',
            'It\'s slower'
          ],
          correctAnswer: 1,
          explanation: 'Hedera charges ~$0.0001 per transaction vs 8-12% for traditional remittances. On a $500 transfer, that\'s saving $40-60 for African families!'
        },
        {
          question: 'How can blockchain help with land fraud in Africa?',
          options: [
            'It cannot help',
            'Immutable land titles prevent fraudulent changes',
            'It makes land cheaper',
            'It creates more land'
          ],
          correctAnswer: 1,
          explanation: 'Blockchain land registries create immutable proof of ownership. Corrupt officials can\'t alter records, stopping land grabbing and fraud.'
        },
        {
          question: 'What opportunity exists for African developers on Hedera?',
          options: [
            'No opportunities',
            'Building solutions for African problems with grant funding',
            'Only for US developers',
            'Must work for Google'
          ],
          correctAnswer: 1,
          explanation: 'Hedera offers grants for developers building solutions. African developers can solve African problems with funding support and low competition currently.'
        }
      ]
    }
  }
];
