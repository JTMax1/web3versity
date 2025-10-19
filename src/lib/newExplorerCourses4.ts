// New Explorer Track Courses - Part 4 (Courses 028-030)
// Top 10 Priority Courses - Final 3
import { LessonContent } from './courseContent';

// ==================== COURSE 028: Understanding Hedera Consensus ====================
export const hederaConsensusLessons: LessonContent[] = [
  {
    id: 'consensus_lesson_1',
    courseId: 'course_028',
    title: 'What is Consensus?',
    type: 'text',
    sequence: 1,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'The Core Problem',
          text: 'Blockchain\'s challenge: How do thousands of computers around the world agree on the order of transactions when they don\'t trust each other and some might be trying to cheat?',
          emoji: '🤔'
        },
        {
          heading: 'Village Analogy',
          text: 'Imagine a Kenyan village where everyone writes transactions in a shared book. Who writes what first? How to prevent cheating? Consensus mechanisms solve this digitally for millions of people globally!',
          emoji: '📖'
        },
        {
          heading: 'Why It Matters',
          text: 'Consensus determines: Speed (how fast transactions confirm), Cost (fees), Security (how hard to attack), and Fairness (who gets to validate). Different blockchains make different trade-offs.',
          emoji: '⚖️'
        },
        {
          heading: 'Traditional Blockchains',
          text: 'Bitcoin uses Proof of Work (mining). Ethereum uses Proof of Stake. Both create blocks sequentially - slow and expensive. Transaction finality takes minutes.',
          emoji: '🐢'
        },
        {
          heading: 'Hedera\'s Innovation',
          text: 'Hedera doesn\'t use blockchain! It uses hashgraph - completely different technology. Result: 10,000+ transactions per second, 3-5 second finality, $0.0001 fees. Perfect for Africa!',
          emoji: '⚡'
        }
      ]
    }
  },
  {
    id: 'consensus_lesson_2',
    courseId: 'course_028',
    title: 'How Hashgraph Works',
    type: 'text',
    sequence: 2,
    duration: 8,
    content: {
      sections: [
        {
          heading: 'Gossip About Gossip',
          text: 'Imagine village market gossip: Amina tells Kwame a story. Kwame tells Fatima, mentioning he heard it from Amina. Fatima tells others, mentioning the chain. Everyone quickly knows everything + who told who!',
          emoji: '💬'
        },
        {
          heading: 'Hashgraph Protocol',
          text: 'Nodes "gossip" transactions to random other nodes. Each gossip includes hash of previous gossip (gossip about gossip!). This creates a graph of who-knew-what-when. Math determines consensus order.',
          emoji: '🕸️'
        },
        {
          heading: 'Virtual Voting',
          text: 'Unlike blockchain where miners vote, Hashgraph uses "virtual voting" - nodes mathematically calculate how others would vote without asking! Brilliant efficiency = speed.',
          emoji: '🗳️'
        },
        {
          heading: 'Asynchronous Byzantine Fault Tolerance (aBFT)',
          text: 'Fancy term meaning: Guaranteed secure even if 1/3 of network is malicious AND internet has delays. This is mathematically provable - strongest security level possible!',
          emoji: '🛡️'
        },
        {
          heading: 'Why So Fast?',
          list: [
            '**No Mining** - No proof-of-work waste',
            '**No Block Time** - Transactions processed continuously, not in 10-min blocks',
            '**Parallel Processing** - All transactions happen simultaneously',
            '**Efficient Gossip** - Only shares new info, not whole blockchain'
          ]
        },
        {
          heading: 'Fairness',
          text: 'Hashgraph is "fair" - transaction order determined by median timestamp of when majority of network learned about it. No miner can reorder transactions for profit (no frontrunning)!',
          emoji: '⚖️'
        }
      ]
    }
  },
  {
    id: 'consensus_lesson_3',
    courseId: 'course_028',
    title: 'Consensus Mechanisms Comparison',
    type: 'interactive',
    sequence: 3,
    duration: 12,
    content: {
      type: 'consensus_comparison'
    }
  },
  {
    id: 'consensus_lesson_4',
    courseId: 'course_028',
    title: 'Why Hedera Matters for Africa',
    type: 'text',
    sequence: 4,
    duration: 6,
    content: {
      sections: [
        {
          heading: '💸 Ultra-Low Fees',
          text: 'Sending money shouldn\'t cost money! Ethereum: $5-50 per transaction. Hedera: $0.0001. For African users making small payments, this difference is everything.',
          emoji: '💸'
        },
        {
          heading: '⚡ Speed = Usability',
          text: 'Bitcoin: 10-60 minutes. Ethereum: 1-5 minutes. Hedera: 3-5 seconds. Imagine waiting an hour to see if your shop payment went through! Hedera makes crypto actually usable.',
          emoji: '⚡'
        },
        {
          heading: '🌍 Energy Efficiency',
          text: 'Bitcoin mining uses as much electricity as Argentina. Hedera? Tiny fraction - carbon negative since 2021! Important when African electricity is expensive and unreliable.',
          emoji: '🌍'
        },
        {
          heading: '📱 Mobile-Friendly',
          text: 'Fast confirmations and low data usage perfect for African mobile connections. Transaction confirmed before you can put your phone away!',
          emoji: '📱'
        },
        {
          heading: '🏢 Enterprise Trust',
          text: 'Hedera governed by Google, IBM, Boeing, LG, Deutsche Telekom + African companies. Not anonymous founders who might disappear. Real companies with reputations at stake.',
          emoji: '🏢'
        },
        {
          heading: '🚀 Future-Proof',
          text: 'Can handle visa-scale throughput (65,000 TPS tested). As Africa grows crypto adoption, Hedera scales. No congestion = no fee spikes.',
          emoji: '🚀'
        }
      ]
    }
  },
  {
    id: 'consensus_lesson_5',
    courseId: 'course_028',
    title: 'Hedera Consensus Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What makes Hedera different from Bitcoin and Ethereum?',
          options: [
            'It uses Proof of Work mining',
            'It uses hashgraph, not blockchain',
            'It\'s slower',
            'It has higher fees'
          ],
          correctAnswer: 1,
          explanation: 'Hedera uses hashgraph consensus, a completely different technology from blockchain. This enables much faster speeds and lower fees.'
        },
        {
          question: 'How long does transaction finality take on Hedera?',
          options: [
            '10-60 minutes like Bitcoin',
            '1-5 minutes like Ethereum',
            '3-5 seconds',
            '1 hour minimum'
          ],
          correctAnswer: 2,
          explanation: 'Hedera achieves transaction finality in just 3-5 seconds, making it practical for real-world payments and applications.'
        },
        {
          question: 'Why are Hedera\'s fees important for African users?',
          options: [
            'They\'re not important',
            'At $0.0001 per transaction, small payments are economically viable',
            'African users prefer high fees',
            'Fees are the same as other networks'
          ],
          correctAnswer: 1,
          explanation: 'Ultra-low fees ($0.0001) mean African users can make small transactions economically. A $1 payment doesn\'t lose 20% to fees like on Ethereum.'
        },
        {
          question: 'What is "aBFT" security?',
          options: [
            'A type of mining',
            'The strongest mathematically provable security level',
            'A wallet type',
            'Less secure than other consensus'
          ],
          correctAnswer: 1,
          explanation: 'Asynchronous Byzantine Fault Tolerance (aBFT) is the highest level of distributed consensus security, mathematically proven to be secure.'
        }
      ]
    }
  }
];

// ==================== COURSE 029: Careers in Web3 ====================
export const web3CareersLessons: LessonContent[] = [
  {
    id: 'career_lesson_1',
    courseId: 'course_029',
    title: 'The Web3 Job Revolution',
    type: 'text',
    sequence: 1,
    duration: 7,
    content: {
      sections: [
        {
          heading: 'A New Industry is Born',
          text: 'Web3 is like the early internet in 1995. Companies are desperate for talent. African developers, designers, and marketers are getting jobs at global companies - earning dollars while living in Lagos or Nairobi!',
          emoji: '🚀'
        },
        {
          heading: 'The Opportunity for Africa',
          text: 'Web3 is remote-first, global, and merit-based. Your code/work matters, not your accent or location. Nigerians working for US companies. Kenyans leading global projects. Ghanaians earning 6-figures in crypto!',
          emoji: '🌍'
        },
        {
          heading: 'The Skills Gap',
          text: 'Demand far exceeds supply. Companies offering $100k-300k for blockchain developers. Even junior roles pay $50k+. Problem? Only thousands of qualified people, but millions of jobs coming!',
          emoji: '💰'
        },
        {
          heading: 'Not Just for Developers',
          text: 'Huge need for community managers, content writers, designers, marketers, legal/compliance, customer support, and more. If you can learn and communicate, there\'s a role for you!',
          emoji: '🎯'
        },
        {
          heading: 'Real African Success Stories',
          list: [
            '**Oluwatobi** - Lagos developer, learned Solidity in 6 months, now earning $120k at DeFi protocol',
            '**Amina** - Nairobi community manager, built following in crypto Twitter, hired by Hedera ecosystem project at $60k',
            '**Kwame** - Accra designer, created NFT collection that sold out, now does Web3 branding full-time',
            '**Fatima** - Kigali content writer, wrote about African crypto adoption, hired by exchange as content lead'
          ]
        }
      ]
    }
  },
  {
    id: 'career_lesson_2',
    courseId: 'course_029',
    title: 'Web3 Career Paths',
    type: 'interactive',
    sequence: 2,
    duration: 12,
    content: {
      type: 'career_explorer'
    }
  },
  {
    id: 'career_lesson_3',
    courseId: 'course_029',
    title: 'Technical Roles Deep Dive',
    type: 'text',
    sequence: 3,
    duration: 8,
    content: {
      sections: [
        {
          heading: '1. Blockchain Developer',
          text: 'Builds smart contracts and decentralized applications. Most in-demand role. Salary: $80k-250k.',
          list: [
            '**Skills**: Solidity (Ethereum), JavaScript, Rust, or Java',
            '**Hedera**: Java or JavaScript for smart contracts',
            '**Path**: Learn programming → Learn blockchain → Build projects → Get hired',
            '**Timeline**: 6-12 months from zero to junior role'
          ]
        },
        {
          heading: '2. Smart Contract Auditor',
          text: 'Reviews code for bugs and vulnerabilities. Critical role, extremely well-paid. Salary: $100k-300k.',
          list: [
            '**Skills**: Deep programming knowledge, security mindset, attention to detail',
            '**Path**: Developer experience → Security training → Audit practice',
            '**African firms**: QuillAudits has African auditors earning top dollar'
          ]
        },
        {
          heading: '3. Frontend Developer',
          text: 'Builds web interfaces for dApps. Easier entry than smart contracts. Salary: $60k-150k.',
          list: [
            '**Skills**: React, JavaScript, Web3.js, Ethers.js',
            '**Path**: Learn web development → Add Web3 library skills',
            '**Advantage**: Existing web developers can transition in 2-3 months!'
          ]
        },
        {
          heading: '4. Backend/Infrastructure',
          text: 'APIs, databases, node operations. Traditional skills + blockchain. Salary: $70k-180k.',
          list: [
            '**Skills**: Node.js, Python, Database, DevOps',
            '**Opportunity**: Many blockchain companies need traditional backend with blockchain integration'
          ]
        },
        {
          heading: '5. Mobile Developer',
          text: 'Mobile dApps, especially important for Africa! Salary: $60k-140k.',
          list: [
            '**Skills**: React Native or Flutter + Web3 integration',
            '**African advantage**: Understanding mobile-first needs',
            '**M-Pesa integration with crypto** - huge opportunity!'
          ]
        }
      ]
    }
  },
  {
    id: 'career_lesson_4',
    courseId: 'course_029',
    title: 'Non-Technical Roles Deep Dive',
    type: 'text',
    sequence: 4,
    duration: 8,
    content: {
      sections: [
        {
          heading: '1. Community Manager',
          text: 'Manages Discord, Telegram, Twitter. Builds engaged community. Salary: $40k-100k.',
          list: [
            '**Skills**: Communication, crypto knowledge, social media',
            '**Path**: Be active in communities → Moderate for free → Get hired',
            '**African strength**: Many time zones, multilingual (English, French, Swahili)',
            '**Entry**: Easiest role to break into, often remote'
          ]
        },
        {
          heading: '2. Content Writer/Marketing',
          text: 'Writes articles, documentation, marketing materials. Salary: $45k-110k.',
          list: [
            '**Skills**: Writing, understanding crypto concepts, SEO',
            '**Path**: Start a crypto blog/Twitter → Build portfolio → Apply',
            '**Opportunity**: Write about African crypto adoption - unique perspective valued globally!'
          ]
        },
        {
          heading: '3. Product Manager',
          text: 'Defines features, coordinates teams, talks to users. Salary: $80k-200k.',
          list: [
            '**Skills**: Technical understanding, communication, strategy',
            '**Path**: Experience in traditional tech → Learn Web3 → Transition',
            '**African advantage**: Understanding emerging market needs'
          ]
        },
        {
          heading: '4. Business Development',
          text: 'Partnerships, integrations, growth. Salary: $60k-150k + equity.',
          list: [
            '**Skills**: Networking, sales, understanding ecosystem',
            '**Opportunity**: Building bridges between African markets and Web3'
          ]
        },
        {
          heading: '5. Legal/Compliance',
          text: 'Navigating regulations, licensing, terms. Salary: $70k-180k.',
          list: [
            '**Skills**: Legal background, understanding crypto regulations',
            '**Needed**: African crypto regulations are evolving - local experts invaluable!'
          ]
        },
        {
          heading: '6. Designer (UI/UX)',
          text: 'Makes dApps beautiful and usable. Salary: $55k-130k.',
          list: [
            '**Skills**: Figma, UI/UX, understanding Web3 patterns',
            '**Path**: Traditional design → Learn Web3 UX patterns'
          ]
        }
      ]
    }
  },
  {
    id: 'career_lesson_5',
    courseId: 'course_029',
    title: 'Getting Your First Web3 Job',
    type: 'text',
    sequence: 5,
    duration: 7,
    content: {
      sections: [
        {
          heading: 'Step 1: Build Your Foundation',
          text: 'Complete courses like Web3versity! Understand basics deeply. Join communities. Follow Web3 Twitter. Read documentation. Immerse yourself for 2-3 months.',
          emoji: '📚'
        },
        {
          heading: 'Step 2: Create a Portfolio',
          list: [
            '**Developers**: Build 2-3 projects, deploy them, share on GitHub',
            '**Writers**: Start blog, write 10+ quality articles on Mirror or Medium',
            '**Designers**: Design mock-ups of Web3 apps, share on Dribbble',
            '**Community**: Be super active, help others, build reputation'
          ]
        },
        {
          heading: 'Step 3: Network Strategically',
          text: 'Join African Web3 communities: BUIDL Nairobi, Lagos Blockchain Week, Bitcoin Ekasi. Comment on Crypto Twitter. Message people doing what you want to do. Most got jobs through connections!',
          emoji: '🤝'
        },
        {
          heading: 'Step 4: Where to Find Jobs',
          list: [
            '**CryptoJobsList.com** - Best aggregator',
            '**Web3.career** - Tech roles',
            '**Hedera ecosystem** - careers.hedera.com and ecosystem project pages',
            '**Twitter** - Many jobs posted here first',
            '**Discord**: #jobs channels in protocol Discords',
            '**Direct applications**: Don\'t wait for postings - cold apply!'
          ]
        },
        {
          heading: 'Step 5: Application Tips',
          list: [
            'Tailor each application to company',
            'Show you understand their product',
            'Include your portfolio/work prominently',
            'Explain why you\'re excited about Web3 specifically',
            'Demonstrate learning ability (this matters more than current skills!)'
          ]
        },
        {
          heading: 'African Resources',
          text: 'AFRICARARE (metaverse jobs), BanklessAfrica (education + jobs), Nestcoin (African Web3 company), Jambo (mobile-first Web3). African ecosystem is growing - be part of building it!',
          emoji: '🌍'
        }
      ]
    }
  },
  {
    id: 'career_lesson_6',
    courseId: 'course_029',
    title: 'Web3 Careers Quiz',
    type: 'quiz',
    sequence: 6,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What is the easiest non-technical role to break into Web3?',
          options: [
            'Smart Contract Auditor',
            'Blockchain Developer',
            'Community Manager',
            'Product Manager'
          ],
          correctAnswer: 2,
          explanation: 'Community Manager is the easiest entry point. You can start by being active in communities, moderating for free, and building reputation before getting paid.'
        },
        {
          question: 'What salary range can junior blockchain developers expect?',
          options: [
            '$20k-30k',
            '$50k-80k',
            '$10k-20k',
            '$200k-300k'
          ],
          correctAnswer: 1,
          explanation: 'Junior blockchain developers typically earn $50k-80k, significantly higher than traditional junior developer roles, due to high demand and low supply.'
        },
        {
          question: 'Why is Web3 particularly opportunity-rich for Africans?',
          options: [
            'It requires living in Silicon Valley',
            'It\'s remote-first, global, and merit-based',
            'African developers are paid less',
            'There are fewer opportunities'
          ],
          correctAnswer: 1,
          explanation: 'Web3 is remote-first and global - your work quality matters, not your location. Africans earn global salaries while living in Africa, creating incredible economic opportunity.'
        },
        {
          question: 'How long does it typically take to learn enough to get a junior developer role?',
          options: [
            '2-4 weeks',
            '6-12 months',
            '5-10 years',
            '1 month'
          ],
          correctAnswer: 1,
          explanation: 'With dedicated learning, 6-12 months can take you from zero to a junior blockchain developer role, especially if you have some programming background.'
        }
      ]
    }
  }
];

// ==================== COURSE 030: Understanding Cryptocurrency Basics ====================
export const cryptocurrencyBasicsLessons: LessonContent[] = [
  {
    id: 'crypto101_lesson_1',
    courseId: 'course_030',
    title: 'What Is Cryptocurrency?',
    type: 'text',
    sequence: 1,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'Digital Money, Reimagined',
          text: 'Cryptocurrency is digital money that works without banks or governments. It exists only as numbers on a blockchain, secured by mathematics, controlled by you.',
          emoji: '💎'
        },
        {
          heading: 'Different from Digital Banking',
          text: 'Your Access Bank balance is digital, but Access Bank controls it. They can freeze your account. Cryptocurrency? YOU control it with your private key. No one can freeze or confiscate it.',
          emoji: '🔐'
        },
        {
          heading: 'How It Started: Bitcoin',
          text: '2008 financial crisis - banks failed, governments printed money, people lost savings. Satoshi Nakamoto created Bitcoin: money no government can devalue, no bank can freeze.',
          emoji: '₿'
        },
        {
          heading: 'Beyond Bitcoin',
          text: 'Now 20,000+ cryptocurrencies! Bitcoin is "digital gold" (store of value). Ethereum enables smart contracts. HBAR (Hedera) is ultra-fast for payments. USDC is stable for daily use.',
          emoji: '🌈'
        },
        {
          heading: 'Real World: Kenyan Example',
          text: 'Wanjiku in Nairobi uses: Bitcoin to save (inflation hedge), USDC for remittances (stable value), HBAR for micro-payments (fast & cheap). Each crypto has its purpose!',
          emoji: '🇰🇪'
        }
      ]
    }
  },
  {
    id: 'crypto101_lesson_2',
    courseId: 'course_030',
    title: 'Major Cryptocurrencies',
    type: 'text',
    sequence: 2,
    duration: 8,
    content: {
      sections: [
        {
          heading: '₿ Bitcoin (BTC)',
          text: 'The original! Created 2009. Digital gold. Maximum 21 million will ever exist. Used primarily as store of value and investment.',
          list: [
            '**Purpose**: Store of value, "digital gold"',
            '**Supply**: Limited to 21 million BTC',
            '**Speed**: Slow (10-60 min confirmations)',
            '**Fees**: High ($1-50 depending on congestion)',
            '**Use in Africa**: Long-term savings, remittances'
          ]
        },
        {
          heading: '◆ Ethereum (ETH)',
          text: 'Created 2015 by Vitalik Buterin. Introduced smart contracts. Platform for dApps and DeFi. Second-largest cryptocurrency.',
          list: [
            '**Purpose**: Smart contract platform',
            '**Supply**: Unlimited (but now deflationary after 2022 merge)',
            '**Speed**: Medium (1-5 min)',
            '**Fees**: Variable ($1-100)',
            '**Use in Africa**: DeFi, NFTs, dApp development'
          ]
        },
        {
          heading: 'ℏ Hedera (HBAR)',
          text: 'Uses hashgraph (not blockchain). Governed by Google, IBM, Boeing, etc. Fast, cheap, eco-friendly. Perfect for payments!',
          list: [
            '**Purpose**: Fast payments, enterprise use',
            '**Supply**: 50 billion max',
            '**Speed**: FAST (3-5 seconds)',
            '**Fees**: CHEAP ($0.0001)',
            '**Use in Africa**: Daily payments, remittances, micro-transactions'
          ]
        },
        {
          heading: '💵 Stablecoins (USDC, USDT)',
          text: 'Pegged to US Dollar. $1 = 1 USDC always. Best for daily transactions and savings in dollar value.',
          list: [
            '**Purpose**: Stable value for transactions',
            '**Backed by**: Real dollars in bank accounts',
            '**Speed**: Depends on blockchain',
            '**Use in Africa**: THE most practical for daily use!'
          ]
        },
        {
          heading: 'Other Notable Cryptos',
          list: [
            '**BNB (Binance Coin)** - Exchange token, widely used in Africa',
            '**Cardano (ADA)** - Academic approach, some African projects',
            '**Solana (SOL)** - Fast but less reliable',
            '**Polkadot (DOT)** - Interoperability between blockchains'
          ]
        }
      ]
    }
  },
  {
    id: 'crypto101_lesson_3',
    courseId: 'course_030',
    title: 'How Cryptocurrency Gets Value',
    type: 'text',
    sequence: 3,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'The Value Question',
          text: 'People ask: "But crypto is just code, why does it have value?" Same could be asked about paper money! Value comes from: utility, scarcity, network effects, and belief.',
          emoji: '💭'
        },
        {
          heading: '1. Utility (Usefulness)',
          text: 'Crypto solves problems! Bitcoin enables censorship-resistant payments. HBAR enables cheap fast transfers. USDC enables dollar savings without US bank. Utility = value.',
          emoji: '🔧'
        },
        {
          heading: '2. Scarcity',
          text: 'Only 21 million Bitcoin will exist, ever. Like gold or land - limited supply + growing demand = higher value. Governments print unlimited Naira - why it loses value!',
          emoji: '💎'
        },
        {
          heading: '3. Network Effects',
          text: 'Bitcoin is valuable partly because it\'s the most widely accepted crypto. More users = more utility = more value. Like how WhatsApp is valuable because everyone uses it.',
          emoji: '🌐'
        },
        {
          heading: '4. Security & Trust',
          text: 'Bitcoin\'s network has run perfectly for 15 years. Never hacked, never down. This reliability builds trust, trust creates value. Hedera backed by Google/IBM = trust.',
          emoji: '🛡️'
        },
        {
          heading: 'Comparing to Fiat',
          text: 'Naira value comes from: Government decree, faith in Nigerian economy, supply/demand. Crypto value comes from: Math, utility, network, supply/demand. Both require trust, just different sources!',
          emoji: '💰'
        },
        {
          heading: 'Why Volatility?',
          text: 'Crypto prices swing because it\'s new! Still discovering "true" value. As adoption grows and market matures, volatility decreases. This is why stablecoins exist - value NOW.',
          emoji: '📈'
        }
      ]
    }
  },
  {
    id: 'crypto101_lesson_4',
    courseId: 'course_030',
    title: 'Check Live Crypto Prices',
    type: 'practical',
    sequence: 4,
    duration: 8,
    content: {
      title: 'Explore Real-Time Crypto Markets',
      description: 'See how cryptocurrencies are traded globally with live prices, market caps, and 24-hour changes.',
      objective: 'Query and understand real-time cryptocurrency market data from Hedera network.',
      steps: [
        'Connect to Hedera network',
        'Query current HBAR price and market data',
        'View 24-hour price changes',
        'Compare market caps of different tokens',
        'Understand what factors influence these prices'
      ],
      transactionAmount: 0,
      successMessage: 'Now you can track crypto markets like a pro! Bookmark CoinGecko and CoinMarketCap.',
      tips: [
        'Market cap = Price × Total Supply (indicates overall value)',
        'Volume shows how much is actually traded (liquidity indicator)',
        'Prices update 24/7 - crypto never sleeps!',
        'Focus on long-term trends, not daily swings'
      ]
    }
  },
  {
    id: 'crypto101_lesson_5',
    courseId: 'course_030',
    title: 'Cryptocurrency Basics Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What makes cryptocurrency different from digital bank balances?',
          options: [
            'Cryptocurrency is slower',
            'You control cryptocurrency with your private key, banks control your balance',
            'Cryptocurrency requires internet',
            'There is no difference'
          ],
          correctAnswer: 1,
          explanation: 'The fundamental difference is control. Banks control your digital balance and can freeze it. With cryptocurrency, you control it via private key.'
        },
        {
          question: 'What is Bitcoin primarily used for?',
          options: [
            'Fast daily payments',
            'Smart contracts',
            'Store of value ("digital gold")',
            'Gaming'
          ],
          correctAnswer: 2,
          explanation: 'Bitcoin is primarily used as a store of value and investment, like digital gold. Its limited supply of 21 million makes it an inflation hedge.'
        },
        {
          question: 'Which crypto is BEST for daily transactions in Africa?',
          options: [
            'Bitcoin (slow and expensive)',
            'Ethereum (moderate speed, variable fees)',
            'Stablecoins on Hedera (fast, cheap, stable value)',
            'None of them work'
          ],
          correctAnswer: 2,
          explanation: 'Stablecoins (like USDC) on fast networks like Hedera are perfect for daily use: stable value, 3-second speed, $0.0001 fees.'
        },
        {
          question: 'Why does cryptocurrency have value?',
          options: [
            'Governments mandate it',
            'It\'s backed by gold',
            'Utility, scarcity, network effects, and trust',
            'It has no value'
          ],
          correctAnswer: 2,
          explanation: 'Cryptocurrency value comes from utility (solving problems), scarcity (limited supply), network effects (more users = more value), and trust in the system.'
        }
      ]
    }
  }
];
