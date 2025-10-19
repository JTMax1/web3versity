// New Explorer Track Courses - Part 7 (Courses 038-041)
// Final Explorer Courses
import { LessonContent } from './courseContent';

// ==================== COURSE 038: Understanding Consensus Mechanisms ====================
export const consensusMechanismsLessons: LessonContent[] = [
  {
    id: 'conmech_lesson_1',
    courseId: 'course_038',
    title: 'The Byzantine Generals Problem',
    type: 'text',
    sequence: 1,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'The Classic Problem',
          text: 'Byzantine army surrounding city. Generals must agree: Attack or retreat? But some generals are traitors! How do loyal generals reach consensus when they can\'t trust everyone?',
          emoji: '⚔️'
        },
        {
          heading: 'Blockchain\'s Version',
          text: 'Thousands of computers globally must agree on transaction order. Some might be hackers. Internet has delays. How do they agree on truth? This is consensus!',
          emoji: '🌐'
        },
        {
          heading: 'Why Consensus Matters',
          text: 'Without consensus: Double-spending (spend same coin twice), conflicting histories, no trust. With consensus: Everyone agrees on truth, network trustworthy.',
          emoji: '✅'
        }
      ]
    }
  },
  {
    id: 'conmech_lesson_2',
    courseId: 'course_038',
    title: 'Major Consensus Mechanisms',
    type: 'text',
    sequence: 2,
    duration: 8,
    content: {
      sections: [
        {
          heading: '1. Proof of Work (PoW) - Bitcoin',
          text: 'Miners compete solving math puzzles. First to solve gets to add block and earn rewards. Very secure but slow and energy-intensive.',
          list: [
            '**Security**: Extremely secure, 15+ years unbroken',
            '**Speed**: Slow (10 min blocks)',
            '**Energy**: Massive (like Argentina\'s electricity!)',
            '**Cost**: Mining equipment + electricity',
            '**Fairness**: Whoever has most hardware wins'
          ]
        },
        {
          heading: 'PoW African Impact',
          text: 'High electricity cost in Africa makes Bitcoin mining uneconomical. Mining profits go to China/US with cheap electricity. Africa excluded from participation.',
          emoji: '⚡'
        },
        {
          heading: '2. Proof of Stake (PoS) - Ethereum, Cardano',
          text: 'Validators "stake" (lock up) tokens. Randomly selected to propose blocks. Misbehave = lose staked tokens. Much more energy efficient!',
          list: [
            '**Security**: Very secure if enough stakers',
            '**Speed**: Faster (seconds to minutes)',
            '**Energy**: 99.95% less than PoW!',
            '**Cost**: Must own tokens to stake',
            '**Fairness**: Whoever has most tokens wins'
          ]
        },
        {
          heading: 'PoS African Advantage',
          text: 'No expensive hardware! If you have tokens, you can stake from a phone in rural Kenya. More inclusive than PoW.',
          emoji: '📱'
        },
        {
          heading: '3. Hashgraph - Hedera',
          text: 'Not PoW or PoS! Uses gossip protocol and virtual voting. Nodes gossip transactions, math determines consensus. Faster, fairer, more efficient than both!',
          list: [
            '**Security**: aBFT - strongest possible',
            '**Speed**: Fastest (3-5 seconds)',
            '**Energy**: Minimal (carbon negative!)',
            '**Cost**: Cheapest ($0.0001)',
            '**Fairness**: Timestamp-based, no frontrunning'
          ]
        }
      ]
    }
  },
  {
    id: 'conmech_lesson_3',
    courseId: 'course_038',
    title: 'Consensus Comparison Interactive',
    type: 'interactive',
    sequence: 3,
    duration: 12,
    content: {
      type: 'network_comparison'
    }
  },
  {
    id: 'conmech_lesson_4',
    courseId: 'course_038',
    title: 'Which Consensus for What?',
    type: 'text',
    sequence: 4,
    duration: 5,
    content: {
      sections: [
        {
          heading: 'Proof of Work: Store of Value',
          text: 'Bitcoin\'s PoW makes it extremely secure but slow/expensive. Perfect for store of value. Not for daily payments. Like gold - you don\'t buy coffee with gold bars!',
          emoji: '🏆'
        },
        {
          heading: 'Proof of Stake: Smart Contracts',
          text: 'Ethereum PoS balances security with speed. Good for DeFi, NFTs, dApps. Still expensive for micro-transactions but improving.',
          emoji: '⚖️'
        },
        {
          heading: 'Hashgraph: Everything Daily',
          text: 'Hedera perfect for payments, remittances, supply chain, gaming. Fast enough for real-time, cheap enough for micro-payments. Ideal for African use cases!',
          emoji: '⚡'
        },
        {
          heading: 'African Perspective',
          text: 'For African users: Speed + low cost > maximum decentralization. Better to have fast cheap system with 39 trusted governors than slow expensive system with 1000 anonymous miners.',
          emoji: '🌍'
        }
      ]
    }
  },
  {
    id: 'conmech_lesson_5',
    courseId: 'course_038',
    title: 'Consensus Mechanisms Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What is the main drawback of Proof of Work for Africa?',
          options: [
            'It\'s too secure',
            'High electricity costs make mining uneconomical',
            'It\'s too fast',
            'It requires internet'
          ],
          correctAnswer: 1,
          explanation: 'PoW requires massive electricity, making it uneconomical in Africa where electricity is expensive. Mining profits go to countries with cheap electricity.'
        },
        {
          question: 'What makes Proof of Stake more inclusive?',
          options: [
            'It\'s less secure',
            'No expensive mining hardware needed - can stake from a phone',
            'It\'s slower',
            'It uses more electricity'
          ],
          correctAnswer: 1,
          explanation: 'PoS doesn\'t require expensive mining equipment. Anyone with tokens can stake and earn rewards, even from a mobile phone in rural areas.'
        },
        {
          question: 'What does "aBFT" mean for Hedera?',
          options: [
            'It\'s less secure',
            'Strongest mathematically provable security level',
            'It requires mining',
            'It\'s centralized'
          ],
          correctAnswer: 1,
          explanation: 'aBFT (Asynchronous Byzantine Fault Tolerance) is the highest level of security achievable in distributed systems - mathematically proven to be secure.'
        },
        {
          question: 'Which consensus is best for micro-payments in Africa?',
          options: [
            'Proof of Work (slow, expensive)',
            'Any consensus works the same',
            'Hashgraph (fast, ultra-cheap)',
            'None of them work'
          ],
          correctAnswer: 2,
          explanation: 'Hashgraph\'s 3-second speed and $0.0001 fees make it perfect for micro-payments, while PoW\'s $1-50 fees make small transactions uneconomical.'
        }
      ]
    }
  }
];

// ==================== COURSE 039: Layer 1 vs Layer 2 Scaling ====================
export const layer1vs2Lessons: LessonContent[] = [
  {
    id: 'layers_lesson_1',
    courseId: 'course_039',
    title: 'The Scaling Problem',
    type: 'text',
    sequence: 1,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'Blockchain Traffic Jam',
          text: 'Bitcoin: 7 transactions/second. Ethereum: 15-30 tps. Visa: 65,000 tps. If billions use crypto, blockchains are too slow! This is the "scalability trilemma".',
          emoji: '🚦'
        },
        {
          heading: 'The Trilemma',
          text: 'Can only optimize 2 of 3: Decentralization, Security, Scalability. Bitcoin chose security + decentralization = slow. Need solutions for scale!',
          emoji: '🔺'
        },
        {
          heading: 'Two Approaches',
          text: 'Layer 1: Improve base blockchain itself. Layer 2: Build on top of blockchain. Like: Build better road (L1) vs Build highway over road (L2).',
          emoji: '🛣️'
        }
      ]
    }
  },
  {
    id: 'layers_lesson_2',
    courseId: 'course_039',
    title: 'Layer 1 Solutions',
    type: 'text',
    sequence: 2,
    duration: 7,
    content: {
      sections: [
        {
          heading: 'What is Layer 1?',
          text: 'The base blockchain itself. Bitcoin, Ethereum, Hedera, Solana are all Layer 1s. Foundation everything else builds on.',
          emoji: '🏗️'
        },
        {
          heading: 'L1 Scaling Methods',
          list: [
            '**Bigger blocks** - Bitcoin Cash tried, causes centralization',
            '**Faster blocks** - Reduces security',
            '**Sharding** - Split blockchain into pieces (Ethereum 2.0)',
            '**Better consensus** - Hedera\'s approach, new algorithm entirely',
            '**Parallel processing** - Solana\'s approach'
          ]
        },
        {
          heading: 'Hedera: Native L1 Speed',
          text: 'Hedera doesn\'t need L2! Does 10,000+ tps on Layer 1. Hashgraph consensus is inherently scalable. This is huge advantage - no complexity of layers!',
          emoji: '⚡'
        },
        {
          heading: 'Trade-offs',
          text: 'L1 improvements = Everyone benefits immediately, BUT changing L1 is slow/risky (like upgrading airplane engine mid-flight). Must be careful!',
          emoji: '⚖️'
        }
      ]
    }
  },
  {
    id: 'layers_lesson_3',
    courseId: 'course_039',
    title: 'Layer 2 Solutions',
    type: 'text',
    sequence: 3,
    duration: 7,
    content: {
      sections: [
        {
          heading: 'What is Layer 2?',
          text: 'Separate networks built on top of Layer 1. Process transactions off main chain, periodically settle to L1. Like WhatsApp voice call instead of actual phone call - cheaper!',
          emoji: '🔝'
        },
        {
          heading: 'Types of L2',
          list: [
            '**State Channels** - Lightning Network for Bitcoin. Open channel, transact many times, close channel.',
            '**Rollups** - Bundle many transactions, post summary to L1. Optimistic (assume valid) vs ZK (prove valid).',
            '**Sidechains** - Separate chain with bridge to main chain. Polygon for Ethereum.',
            '**Plasma** - Mini-blockchains anchored to main chain'
          ]
        },
        {
          heading: 'Example: Lightning Network',
          text: 'Bitcoin L2. Open channel with friend, transact 1000 times for coffee payments, close channel. Only 2 Bitcoin transactions recorded (open + close), but you made 1000 payments!',
          emoji: '⚡'
        },
        {
          heading: 'L2 Benefits',
          list: [
            'Much faster (thousands of tps)',
            'Much cheaper (pennies vs dollars)',
            'Reduces L1 congestion',
            'Can experiment without risking L1'
          ]
        },
        {
          heading: 'L2 Drawbacks',
          list: [
            'Added complexity for users',
            'Must bridge assets (can lose funds if mistake)',
            'Less secure than L1',
            'Fragmented liquidity',
            'Not all apps available'
          ]
        },
        {
          heading: 'African Context',
          text: 'L2 great in theory, but complexity barrier high. Most Africans struggle with L1! Adding L2 bridges = more confusion, more scam opportunities. Simpler = better.',
          emoji: '🌍'
        }
      ]
    }
  },
  {
    id: 'layers_lesson_4',
    courseId: 'course_039',
    title: 'Layer Comparison Interactive',
    type: 'interactive',
    sequence: 4,
    duration: 10,
    content: {
      type: 'layer_comparison'
    }
  },
  {
    id: 'layers_lesson_5',
    courseId: 'course_039',
    title: 'Layers Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What is the scalability trilemma?',
          options: [
            'Three types of blockchains',
            'Can only optimize 2 of 3: Decentralization, Security, Scalability',
            'Three consensus mechanisms',
            'Three layers of blockchain'
          ],
          correctAnswer: 1,
          explanation: 'The trilemma states you can only optimize 2 of 3 properties: decentralization, security, and scalability. This is why scaling is challenging.'
        },
        {
          question: 'What is a Layer 2 solution?',
          options: [
            'A separate blockchain',
            'Network built on top of L1 that processes transactions off-chain',
            'A second cryptocurrency',
            'A mining pool'
          ],
          correctAnswer: 1,
          explanation: 'Layer 2 solutions process transactions off the main chain (Layer 1) and periodically settle to L1, achieving higher speed and lower costs.'
        },
        {
          question: 'Why doesn\'t Hedera need Layer 2?',
          options: [
            'It\'s too old',
            'Native hashgraph consensus already achieves 10,000+ tps on L1',
            'L2 is banned',
            'It\'s centralized'
          ],
          correctAnswer: 1,
          explanation: 'Hedera\'s hashgraph consensus is inherently scalable, achieving 10,000+ tps with $0.0001 fees on Layer 1 - no need for L2 complexity.'
        },
        {
          question: 'What\'s a disadvantage of L2 for African users?',
          options: [
            'It\'s too cheap',
            'Added complexity and bridge risks create barriers',
            'It\'s too fast',
            'It uses too much data'
          ],
          correctAnswer: 1,
          explanation: 'L2 adds complexity - users must bridge assets and understand multiple layers. For new users, simpler L1 solutions like Hedera are more accessible.'
        }
      ]
    }
  }
];

// ==================== COURSE 040: Smart Contract Basics (No Coding) ====================
export const smartContractBasicsLessons: LessonContent[] = [
  {
    id: 'contract_lesson_1',
    courseId: 'course_040',
    title: 'What Are Smart Contracts?',
    type: 'text',
    sequence: 1,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'Code That Executes Automatically',
          text: 'Smart contract = "If X happens, then do Y" written in code on blockchain. No humans needed to execute. It runs automatically when conditions are met.',
          emoji: '🤖'
        },
        {
          heading: 'Vending Machine Analogy',
          text: 'Vending machine is a smart contract! IF you insert $2 AND press B3, THEN dispense chips. No cashier needed. Machine executes automatically. Smart contracts = digital vending machines!',
          emoji: '🏪'
        },
        {
          heading: 'Traditional Contract vs Smart Contract',
          text: 'Traditional: "I\'ll pay you $100 when work done" → Need lawyers, courts to enforce. Smart: "If work verified, transfer $100" → Code executes automatically, no court needed!',
          emoji: '📜'
        },
        {
          heading: 'Why "Smart"?',
          text: 'Not AI smart! Smart because self-executing. Once deployed, runs exactly as programmed. Can\'t be stopped, changed, or delayed. Unstoppable code.',
          emoji: '💡'
        },
        {
          heading: 'African Example: Crop Insurance',
          text: 'Traditional: Drought hits → File claim → Wait weeks → Maybe get paid. Smart: Sensors detect drought → Contract pays automatically in hours. No forms, no corruption!',
          emoji: '🌾'
        }
      ]
    }
  },
  {
    id: 'contract_lesson_2',
    courseId: 'course_040',
    title: 'How Smart Contracts Work',
    type: 'text',
    sequence: 2,
    duration: 7,
    content: {
      sections: [
        {
          heading: '1. Written in Code',
          text: 'Developers write contracts in Solidity (Ethereum), Java/JavaScript (Hedera), or other languages. Code defines all rules and conditions.',
          emoji: '👨‍💻'
        },
        {
          heading: '2. Deployed to Blockchain',
          text: 'Contract published to blockchain, gets unique address. Now lives on blockchain forever, can\'t be deleted. Anyone can interact with it!',
          emoji: '🚀'
        },
        {
          heading: '3. Interaction',
          text: 'Users send transactions to contract address. "Call this function with these parameters." Contract receives, checks conditions, executes if met.',
          emoji: '🔄'
        },
        {
          heading: '4. Execution',
          text: 'If conditions met, code runs automatically. Transfer tokens, update state, trigger other contracts. All transparent on blockchain.',
          emoji: '⚡'
        },
        {
          heading: 'Example: Token Swap',
          text: 'DEX smart contract: User calls "swap 10 HBAR for USDC" → Contract checks: User has 10 HBAR? Pool has USDC? → Executes swap → Done in 3 seconds!',
          emoji: '🔄'
        },
        {
          heading: 'The Magic',
          text: 'No company runs this! No CEO can stop it! Code is open-source - anyone can verify. Runs 24/7 forever. This is true automation.',
          emoji: '✨'
        }
      ]
    }
  },
  {
    id: 'contract_lesson_3',
    courseId: 'course_040',
    title: 'Smart Contract Use Cases',
    type: 'text',
    sequence: 3,
    duration: 6,
    content: {
      sections: [
        {
          heading: '💱 Decentralized Exchanges',
          text: 'Entire exchange is a smart contract! No company needed. SaucerSwap, Uniswap - just smart contracts anyone can use.',
          emoji: '💱'
        },
        {
          heading: '🏦 Lending/Borrowing',
          text: 'Deposit collateral → Smart contract lets you borrow. Don\'t repay? Contract automatically liquidates collateral. No bank, no credit check!',
          emoji: '🏦'
        },
        {
          heading: '🎨 NFT Minting',
          text: 'NFT marketplaces are smart contracts. Send payment → Contract mints NFT → Transfers to you. Automated art sales!',
          emoji: '🎨'
        },
        {
          heading: '🗳️ Voting/Governance',
          text: 'DAO governance through smart contracts. Vote recorded on-chain, results calculated automatically, execution triggered if passed. Transparent democracy!',
          emoji: '🗳️'
        },
        {
          heading: '💼 Escrow',
          text: 'Freelancer does work → Client deposits payment to contract → Work verified → Contract releases payment. No middleman taking fees!',
          emoji: '💼'
        },
        {
          heading: '🎮 Gaming',
          text: 'Game logic in smart contracts. Own items as NFTs. Game company can\'t change rules or take your items. Provably fair gaming.',
          emoji: '🎮'
        }
      ]
    }
  },
  {
    id: 'contract_lesson_4',
    courseId: 'course_040',
    title: 'Interact with a Smart Contract',
    type: 'practical',
    sequence: 4,
    duration: 10,
    content: {
      title: 'Experience Automated Execution',
      description: 'Interact with a real smart contract to see how code executes automatically without human intervention.',
      objective: 'Successfully call a smart contract function and see it execute on-chain.',
      steps: [
        'Connect wallet to smart contract interface',
        'View contract details and functions',
        'Call a simple contract function (like increment counter)',
        'Watch transaction execute automatically',
        'View updated contract state - changed without any human!'
      ],
      transactionAmount: 0.1,
      successMessage: 'You just interacted with unstoppable code! No human was involved in execution.',
      tips: [
        'The contract executed exactly as programmed',
        'Nobody could have stopped or modified this',
        'Contract will run forever, 24/7',
        'This is the foundation of DeFi, NFTs, and DAOs!'
      ]
    }
  },
  {
    id: 'contract_lesson_5',
    courseId: 'course_040',
    title: 'Smart Contracts Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What makes a smart contract "smart"?',
          options: [
            'It uses artificial intelligence',
            'It self-executes automatically when conditions are met',
            'It has high IQ',
            'It\'s written by smart people'
          ],
          correctAnswer: 1,
          explanation: 'Smart contracts are "smart" because they self-execute automatically when programmed conditions are met - no human intervention needed!'
        },
        {
          question: 'What\'s a good analogy for a smart contract?',
          options: [
            'A bank vault',
            'A vending machine (if money inserted, dispense item automatically)',
            'A smartphone',
            'A calculator'
          ],
          correctAnswer: 1,
          explanation: 'Vending machines are perfect analogy! Insert money → Select item → Machine dispenses automatically. No cashier needed, just like smart contracts.'
        },
        {
          question: 'Can a smart contract be stopped or changed after deployment?',
          options: [
            'Yes, by the developer',
            'Yes, by the government',
            'No, it runs forever as programmed (unless designed with upgrade)',
            'Yes, by vote'
          ],
          correctAnswer: 2,
          explanation: 'Once deployed, smart contracts typically can\'t be stopped or changed. They run forever as programmed. This is both their power (unstoppable) and risk (bugs permanent).'
        },
        {
          question: 'How can smart contracts help African farmers with crop insurance?',
          options: [
            'They cannot help',
            'Automatically pay out when drought detected, no claims process',
            'They grow crops',
            'They predict weather'
          ],
          correctAnswer: 1,
          explanation: 'Smart contracts can connect to weather sensors and automatically pay farmers when drought conditions are detected - no paperwork, no corruption, instant help!'
        }
      ]
    }
  }
];

// ==================== COURSE 041: Understanding Tokenomics ====================
export const tokenomicsLessons: LessonContent[] = [
  {
    id: 'tokenomics_lesson_1',
    courseId: 'course_041',
    title: 'What is Tokenomics?',
    type: 'text',
    sequence: 1,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'Token Economics',
          text: 'Tokenomics = Token + Economics. How cryptocurrency is designed economically: supply, distribution, incentives, utility. Understanding tokenomics helps you evaluate if project is sustainable!',
          emoji: '📊'
        },
        {
          heading: 'Why It Matters',
          text: 'Two coins, both "blockchain for payments". One has supply cap, other prints infinitely. Which keeps value better? Tokenomics determines success or failure!',
          emoji: '💡'
        },
        {
          heading: 'Like National Currency',
          text: 'Central banks manage Naira/Shilling supply, inflation, interest rates. Crypto tokenomics = monetary policy written in code, can\'t be changed by politicians!',
          emoji: '🏦'
        },
        {
          heading: 'Key Questions',
          list: [
            'How many tokens total?',
            'How are new tokens created?',
            'Who owns the tokens?',
            'What is the token used for?',
            'Does supply increase or decrease?'
          ]
        }
      ]
    }
  },
  {
    id: 'tokenomics_lesson_2',
    courseId: 'course_041',
    title: 'Token Supply Basics',
    type: 'text',
    sequence: 2,
    duration: 7,
    content: {
      sections: [
        {
          heading: 'Total Supply vs Circulating Supply',
          text: 'Total Supply = Maximum tokens that will ever exist. Circulating Supply = Tokens available now. Bitcoin: 21M total, 19.5M circulating (1.5M not mined yet).',
          emoji: '🔢'
        },
        {
          heading: 'Maximum Supply Types',
          list: [
            '**Fixed Cap** - Bitcoin (21M), definite scarcity',
            '**Decreasing** - Some burn tokens over time',
            '**Inflationary** - Ethereum (no cap), new tokens forever',
            '**Variable** - Algorithmically adjusted based on demand'
          ]
        },
        {
          heading: 'Why Fixed Supply?',
          text: 'Bitcoin capped at 21M creates scarcity. Like land or gold. Scarcity + demand = value. Governments print unlimited money → inflation. Bitcoin can\'t be inflated!',
          emoji: '💎'
        },
        {
          heading: 'Hedera (HBAR) Supply',
          text: 'Total: 50 billion HBAR. Circulating: ~37 billion. Remaining released gradually over time to fund ecosystem. All minted at genesis - no mining inflation.',
          emoji: 'ℏ'
        },
        {
          heading: 'African Parallel',
          text: 'Remember when Zimbabwe printed trillions of dollars? Hyperinflation! Cryptocurrencies with infinite supply risk same fate. Fixed supply = protection against currency debasement.',
          emoji: '🇿🇼'
        }
      ]
    }
  },
  {
    id: 'tokenomics_lesson_3',
    courseId: 'course_041',
    title: 'Token Distribution & Allocation',
    type: 'text',
    sequence: 3,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'Who Owns the Tokens?',
          text: 'Distribution matters! If team holds 90%, they control project and can dump on retail. If community owns 80%, more decentralized and fair.',
          emoji: '📊'
        },
        {
          heading: 'Typical Allocation',
          list: [
            '**Public Sale** - 20-40% sold to community',
            '**Team & Advisors** - 15-25% with vesting (locked for time)',
            '**Foundation/Treasury** - 20-30% for development',
            '**Ecosystem Incentives** - 10-20% for growth',
            '**Investors** - 10-20% early backers with vesting'
          ]
        },
        {
          heading: 'Vesting Schedules',
          text: 'Vesting = Tokens locked, released gradually. Team gets 10M tokens over 4 years = can\'t dump immediately. Protects investors! Always check vesting!',
          emoji: '🔒'
        },
        {
          heading: 'Red Flags',
          list: [
            '❌ Team owns >50% of supply',
            '❌ No vesting for team/investors',
            '❌ Anonymous team with large allocation',
            '❌ All tokens unlocking at once',
            '✅ Transparent allocation, long vesting, community-majority'
          ]
        },
        {
          heading: 'HBAR Distribution',
          text: 'Hedera Treasury: ~15B HBAR for ecosystem grants. Council: Minimal. Public: Majority through exchanges and ecosystem distribution. Transparent and gradual release.',
          emoji: 'ℏ'
        }
      ]
    }
  },
  {
    id: 'tokenomics_lesson_4',
    courseId: 'course_041',
    title: 'Analyze Token Economics',
    type: 'practical',
    sequence: 4,
    duration: 12,
    content: {
      title: 'Research Token Supply & Distribution',
      description: 'Learn to analyze tokenomics by querying real data about HBAR supply, circulation, and economics.',
      objective: 'Successfully query and understand Hedera tokenomics data on-chain.',
      steps: [
        'Connect to Hedera network',
        'Query total HBAR supply',
        'Check circulating supply',
        'View treasury balances',
        'Understand inflation rate and release schedule'
      ],
      transactionAmount: 0.1,
      successMessage: 'Great! Now you can evaluate any project\'s tokenomics before investing!',
      tips: [
        'Low circulating % of total supply = future inflation/selling pressure',
        'Check vesting schedules on project websites',
        'Compare market cap (price × circulating) not just price',
        'Transparent tokenomics = trustworthy project'
      ]
    }
  },
  {
    id: 'tokenomics_lesson_5',
    courseId: 'course_041',
    title: 'Tokenomics Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'Why does Bitcoin have a 21 million cap?',
          options: [
            'Random number',
            'Creates scarcity and prevents inflation',
            'It\'s too expensive to make more',
            'Government requirement'
          ],
          correctAnswer: 1,
          explanation: 'Bitcoin\'s 21 million cap creates digital scarcity, making it inflation-resistant unlike fiat currency that governments can print unlimited amounts of.'
        },
        {
          question: 'What is vesting?',
          options: [
            'Wearing a vest',
            'Tokens locked and released gradually over time',
            'Buying tokens',
            'Mining tokens'
          ],
          correctAnswer: 1,
          explanation: 'Vesting means tokens are locked and released gradually (e.g., over 4 years). This prevents team/investors from dumping all tokens immediately and crashing price.'
        },
        {
          question: 'What\'s a red flag in token distribution?',
          options: [
            'Community owns majority',
            'Team owns 90% with no vesting',
            'Tokens locked for 4 years',
            'Public sale happened'
          ],
          correctAnswer: 1,
          explanation: 'If team owns 90% with no vesting, they can dump tokens anytime and crash the price. Fair projects have majority community ownership with team vesting.'
        },
        {
          question: 'What should you compare when evaluating crypto value?',
          options: [
            'Price per coin only',
            'Market cap (price × circulating supply)',
            'Team headcount',
            'Twitter followers'
          ],
          correctAnswer: 1,
          explanation: 'Market cap (price × circulating supply) matters, not just price. A $0.01 coin with 1 trillion supply has higher market cap than $100 coin with 1 million supply!'
        }
      ]
    }
  }
];
