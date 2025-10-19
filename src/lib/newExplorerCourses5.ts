// New Explorer Track Courses - Part 5 (Courses 031-034)
// Remaining Explorer Courses
import { LessonContent } from './courseContent';

// ==================== COURSE 031: Digital Identity on Blockchain ====================
export const digitalIdentityLessons: LessonContent[] = [
  {
    id: 'did_lesson_1',
    courseId: 'course_031',
    title: 'The Identity Problem',
    type: 'text',
    sequence: 1,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'Who Are You Online?',
          text: 'You have different accounts everywhere: Facebook owns your social identity, Google owns your email identity, banks own your financial identity. What if YOU owned your identity?',
          emoji: '🆔'
        },
        {
          heading: 'African Identity Challenges',
          list: [
            '**Lack of documentation** - 500M+ Africans lack official ID',
            '**Corruption** - Fake IDs and documents common',
            '**Access** - Getting passport requires travel to capital cities',
            '**Refugees** - Displaced people lose identity documents',
            '**Cost** - ID registration fees exclude the poor'
          ]
        },
        {
          heading: 'The Blockchain Solution',
          text: 'Self-Sovereign Identity (SSI) - YOU control your identity on blockchain. No government or company gatekeepers. Can\'t be faked. Can\'t be taken away. Works across borders.',
          emoji: '🔐'
        },
        {
          heading: 'Real Example: Refugees',
          text: 'Syrian refugees in Jordan lost passports fleeing war. UNHCR piloted blockchain IDs. Now refugees prove identity for aid, banking, even jobs - all from blockchain credentials!',
          emoji: '🌍'
        },
        {
          heading: 'Use Cases in Africa',
          text: 'Birth certificates on blockchain (can\'t be lost). University degrees (employer can verify instantly). Medical records (you control access). Voting (prove eligibility without revealing identity).',
          emoji: '🎓'
        }
      ]
    }
  },
  {
    id: 'did_lesson_2',
    courseId: 'course_031',
    title: 'How Blockchain Identity Works',
    type: 'text',
    sequence: 2,
    duration: 7,
    content: {
      sections: [
        {
          heading: 'Decentralized Identifiers (DIDs)',
          text: 'Like email address, but you own it forever. Example: did:hedera:testnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm. Points to your public key on blockchain.',
          emoji: '🔑'
        },
        {
          heading: 'Verifiable Credentials',
          text: 'Digital certificates cryptographically signed. University issues degree credential → Written to blockchain → You hold in wallet → Show to employer → They verify signature → Instant trust!',
          emoji: '📜'
        },
        {
          heading: 'The Triangle of Trust',
          list: [
            '**Issuer** - University, government, bank (creates credential)',
            '**Holder** - YOU (store credential in wallet)',
            '**Verifier** - Employer, service (checks credential is valid)',
            'All interactions verified by blockchain, no middleman!'
          ]
        },
        {
          heading: 'Privacy-Preserving',
          text: 'Zero-Knowledge Proofs let you prove things without revealing everything. Prove you\'re over 18 without showing your birthday. Prove you have degree without showing your GPA!',
          emoji: '🕵️'
        },
        {
          heading: 'Portable Identity',
          text: 'Same identity across all platforms. Login to DeFi app, social network, job platform - same DID. Leave platform? Take your reputation and data with you!',
          emoji: '🚀'
        }
      ]
    }
  },
  {
    id: 'did_lesson_3',
    courseId: 'course_031',
    title: 'African Blockchain Identity Projects',
    type: 'text',
    sequence: 3,
    duration: 6,
    content: {
      sections: [
        {
          heading: '🇰🇪 Kenya: BenBen',
          text: 'Blockchain land registry in Kenya. Land titles on blockchain to prevent fraud and disputes. Corruption in land office can\'t change blockchain records!',
          emoji: '🏘️'
        },
        {
          heading: '🇿🇦 South Africa: AiWallet',
          text: 'Blockchain ID for financial services. Helps unbanked prove identity for bank accounts using blockchain credentials instead of traditional documents.',
          emoji: '💳'
        },
        {
          heading: '🇹🇿 Tanzania: Flexid',
          text: 'Digital ID system on blockchain. Rural Tanzanians can get verified identity via phone, enabling access to government services and financial services.',
          emoji: '📱'
        },
        {
          heading: '🇬🇭 Ghana: University Certificates',
          text: 'Blockchain degree verification pilots. Graduates get blockchain certificate. Employers anywhere globally can verify authenticity instantly. Stops fake degrees!',
          emoji: '🎓'
        },
        {
          heading: 'The Future',
          text: 'Imagine: Birth registered on blockchain. School records accumulate. Certificates earned. Work history verified. Medical records accessible. All controlled by YOU, portable across borders.',
          emoji: '🔮'
        }
      ]
    }
  },
  {
    id: 'did_lesson_4',
    courseId: 'course_031',
    title: 'Create Your Blockchain Identity',
    type: 'practical',
    sequence: 4,
    duration: 10,
    content: {
      title: 'Generate Your Decentralized ID',
      description: 'Create your own blockchain-based identity that you control, nobody else can revoke, and works across applications.',
      objective: 'Successfully generate a Decentralized Identifier (DID) on Hedera testnet.',
      steps: [
        'Connect your wallet to identity service',
        'Generate your unique DID on Hedera',
        'Create a simple verifiable credential (like a name badge)',
        'Store credential in your wallet',
        'Verify your own credential to see how verification works'
      ],
      transactionAmount: 0.1,
      successMessage: 'Congratulations! You now have a self-sovereign identity on blockchain!',
      tips: [
        'This DID belongs to you forever - nobody can take it away',
        'You can use this DID across any compatible application',
        'Credentials can be issued by anyone and verified by anyone',
        'This is the future of identity in Web3!'
      ]
    }
  },
  {
    id: 'did_lesson_5',
    courseId: 'course_031',
    title: 'Digital Identity Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What is Self-Sovereign Identity?',
          options: [
            'Identity controlled by the government',
            'Identity controlled by Facebook',
            'Identity controlled by YOU on blockchain',
            'Identity that changes frequently'
          ],
          correctAnswer: 2,
          explanation: 'Self-Sovereign Identity means YOU control your identity credentials on blockchain, not governments or companies. You decide who sees what.'
        },
        {
          question: 'How can blockchain identity help African refugees?',
          options: [
            'It cannot help them',
            'It provides verifiable identity even without physical documents',
            'It makes them return home',
            'It tracks their location'
          ],
          correctAnswer: 1,
          explanation: 'Blockchain credentials can\'t be lost or destroyed. Refugees who lose physical documents can still prove identity with blockchain-based credentials.'
        },
        {
          question: 'What is a Verifiable Credential?',
          options: [
            'A password',
            'A digital certificate cryptographically signed by an issuer',
            'A social media profile',
            'A bank account'
          ],
          correctAnswer: 1,
          explanation: 'Verifiable Credentials are digital certificates (like degrees, licenses) signed by issuers and stored on blockchain, allowing instant verification of authenticity.'
        },
        {
          question: 'Why is blockchain identity important for Africa?',
          options: [
            'It\'s not important',
            'It helps 500M+ undocumented Africans prove identity for services',
            'It makes identity more expensive',
            'It requires government permission'
          ],
          correctAnswer: 1,
          explanation: 'Over 500 million Africans lack official ID. Blockchain identity provides verifiable credentials without requiring traditional documentation infrastructure.'
        }
      ]
    }
  }
];

// ==================== COURSE 032: Understanding DAOs ====================
export const daoLessons: LessonContent[] = [
  {
    id: 'dao_lesson_1',
    courseId: 'course_032',
    title: 'What is a DAO?',
    type: 'text',
    sequence: 1,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'Decentralized Autonomous Organization',
          text: 'DAO = An organization run by code and community votes, not by CEO or board. Rules are in smart contracts. Decisions made by token holder votes. Truly democratic and transparent!',
          emoji: '🏛️'
        },
        {
          heading: 'Traditional Organization Problems',
          list: [
            '**Centralized power** - CEO makes all decisions',
            '**Corruption** - Leaders can embezzle funds',
            '**Lack of transparency** - Secret decisions',
            '**Barriers to entry** - Can\'t just "join" a company',
            '**Geographic limitations** - Must be local'
          ]
        },
        {
          heading: 'How DAOs Solve This',
          text: 'Everyone who holds DAO tokens gets voting power. Want new feature? Propose it. Community votes. If passes, smart contract executes automatically. No CEO can veto. Funds in multisig wallet.',
          emoji: '🗳️'
        },
        {
          heading: 'African Context: Village Co-ops',
          text: 'Think of Harambee in Kenya or Susu in Ghana - community pooling resources for shared goals. DAOs are digital versions, but global! Village co-op with members in Lagos, Nairobi, and New York!',
          emoji: '🌍'
        },
        {
          heading: 'Real DAOs',
          list: [
            '**MakerDAO** - Manages DAI stablecoin, $5B+ in assets',
            '**Uniswap DAO** - Governs Uniswap DEX',
            '**Hedera DAO** - Proposed Hedera community governance',
            '**PleasrDAO** - Buys culturally significant NFTs together'
          ]
        }
      ]
    }
  },
  {
    id: 'dao_lesson_2',
    courseId: 'course_032',
    title: 'How DAOs Work',
    type: 'text',
    sequence: 2,
    duration: 7,
    content: {
      sections: [
        {
          heading: '1. Token-Based Governance',
          text: 'DAO issues governance tokens. 1 token = 1 vote (usually). The more tokens you hold, the more voting power. Like company shares, but distributed to community!',
          emoji: '🪙'
        },
        {
          heading: '2. Proposals',
          text: 'Anyone can submit proposal: "Add new feature", "Spend $10k on marketing", "Change fee structure". Proposal posted on-chain or forum.',
          emoji: '📝'
        },
        {
          heading: '3. Discussion',
          text: 'Community discusses in Discord, Telegram, forums. Debate pros/cons. Refine proposal. This is important - rushed decisions fail!',
          emoji: '💬'
        },
        {
          heading: '4. Voting',
          text: 'Voting period opens (usually 3-7 days). Token holders vote YES or NO. Voting happens on-chain - transparent and immutable. No one can fake votes!',
          emoji: '✅'
        },
        {
          heading: '5. Execution',
          text: 'If proposal passes (often needs >50% or 67% approval + quorum), smart contract executes automatically! Approved spending? Funds transfer. Code change? Contract updates. No human can block it!',
          emoji: '⚡'
        },
        {
          heading: 'Example Flow: HBAR Community DAO',
          text: '1. Kofi proposes: "Fund African Web3 education with $50k". 2. Community discusses for 5 days. 3. Vote: 75% YES, 25% NO. 4. Smart contract transfers $50k to education wallet automatically.',
          emoji: '🎓'
        }
      ]
    }
  },
  {
    id: 'dao_lesson_3',
    courseId: 'course_032',
    title: 'Types of DAOs',
    type: 'text',
    sequence: 3,
    duration: 6,
    content: {
      sections: [
        {
          heading: '1. Protocol DAOs',
          text: 'Govern DeFi protocols. MakerDAO governs DAI stablecoin. Uniswap DAO governs DEX. Token holders vote on fees, features, treasury spending.',
          emoji: '🏦'
        },
        {
          heading: '2. Investment DAOs',
          text: 'Pool money to invest together. Members vote on what to buy. Like investment club, but global and transparent. Popular for NFTs, real estate, startups.',
          emoji: '💼'
        },
        {
          heading: '3. Social DAOs',
          text: 'Community clubs with token-gated access. Hold token = join community. Vote on events, partnerships, content. Like exclusive club, but provably fair membership.',
          emoji: '🎭'
        },
        {
          heading: '4. Service DAOs',
          text: 'Freelancer collectives. Members work together on projects, share revenue. Example: African developers forming DAO to bid on Web3 projects together!',
          emoji: '🛠️'
        },
        {
          heading: '5. Creator DAOs',
          text: 'Artists/creators share ownership with fans. Fans buy tokens, get voting rights on creator decisions. Creator gets funding, fans get upside if creator succeeds.',
          emoji: '🎨'
        },
        {
          heading: 'African DAO Ideas',
          list: [
            '**Farming Cooperative DAO** - Pooled purchasing, shared equipment',
            '**Community Development DAO** - Village decides on development priorities',
            '**Artist Collective DAO** - African artists collaborate and share revenues',
            '**Education DAO** - Community-funded scholarships'
          ]
        }
      ]
    }
  },
  {
    id: 'dao_lesson_4',
    courseId: 'course_032',
    title: 'Vote in a Test DAO',
    type: 'practical',
    sequence: 4,
    duration: 10,
    content: {
      title: 'Experience Democratic Governance',
      description: 'Participate in DAO governance by casting your vote on a community proposal.',
      objective: 'Successfully vote on a DAO proposal and see how decentralized governance works.',
      steps: [
        'Connect wallet to DAO governance interface',
        'Review active proposals',
        'Read proposal details and discussion',
        'Cast your vote (YES or NO)',
        'See vote recorded on-chain with other community votes'
      ],
      transactionAmount: 0.1,
      successMessage: 'You just participated in decentralized governance! This is democracy on blockchain.',
      tips: [
        'Your vote is publicly visible but tied to your address, not name',
        'In real DAOs, proposal outcomes execute automatically',
        'More tokens = more voting power in most DAOs',
        'Always read proposals carefully before voting!'
      ]
    }
  },
  {
    id: 'dao_lesson_5',
    courseId: 'course_032',
    title: 'DAO Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What makes a DAO "decentralized"?',
          options: [
            'It has many employees',
            'It\'s governed by token holder votes, not a CEO',
            'It uses blockchain',
            'It\'s cheaper to run'
          ],
          correctAnswer: 1,
          explanation: 'DAOs are decentralized because decisions are made by community votes, not centralized leadership. Token holders collectively govern the organization.'
        },
        {
          question: 'How do DAO proposals get executed?',
          options: [
            'CEO implements them',
            'Board of directors approves',
            'Smart contracts execute automatically when vote passes',
            'Proposals never actually execute'
          ],
          correctAnswer: 2,
          explanation: 'When a DAO proposal passes, smart contracts execute it automatically. No human can block or delay execution - code is law!'
        },
        {
          question: 'What African traditional system is similar to DAOs?',
          options: [
            'Military dictatorship',
            'Harambee/Susu community pooling and collective decisions',
            'Individual savings',
            'Government ministries'
          ],
          correctAnswer: 1,
          explanation: 'African community co-ops like Harambee (Kenya) and Susu (Ghana) are similar - pooled resources with collective decision-making. DAOs digitize this concept globally!'
        },
        {
          question: 'What determines your voting power in most DAOs?',
          options: [
            'Your age',
            'Your country',
            'Number of governance tokens you hold',
            'Your social media followers'
          ],
          correctAnswer: 2,
          explanation: 'In most DAOs, voting power is proportional to governance tokens held. More tokens = more votes. Like corporate shares but distributed to community.'
        }
      ]
    }
  }
];

// ==================== COURSE 033: Blockchain Gaming & Play-to-Earn ====================
export const blockchainGamingLessons: LessonContent[] = [
  {
    id: 'gaming_lesson_1',
    courseId: 'course_033',
    title: 'The Gaming Revolution',
    type: 'text',
    sequence: 1,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'Gaming Meets Blockchain',
          text: 'Imagine: You play FIFA mobile, earn a rare player card, then SELL it for real money. The player card is an NFT you truly own. This is blockchain gaming!',
          emoji: '🎮'
        },
        {
          heading: 'Traditional Gaming Problems',
          list: [
            '**No ownership** - Spend $500 on PUBG skins, can\'t resell them',
            '**Closed ecosystems** - FIFA items stay in FIFA',
            '**Account bans** - Lose everything if banned',
            '**No earning** - Play 1000 hours, earn nothing'
          ]
        },
        {
          heading: 'Blockchain Gaming Benefits',
          list: [
            '**True ownership** - Items are NFTs you own',
            '**Interoperability** - Use sword from one game in another (potentially)',
            '**Earning opportunity** - Play-to-Earn models',
            '**Transparent economy** - See all game economics on-chain'
          ]
        },
        {
          heading: 'Play-to-Earn Explosion',
          text: 'Philippines during COVID: People earning more playing Axie Infinity than their jobs! Some African gamers earning $500-1000/month playing blockchain games. Gaming becomes income!',
          emoji: '💰'
        },
        {
          heading: 'Why Africa?',
          text: 'Young population, mobile gaming culture, economic need. African youth can compete globally and earn dollars through gaming. No visa needed!',
          emoji: '🌍'
        }
      ]
    }
  },
  {
    id: 'gaming_lesson_2',
    courseId: 'course_033',
    title: 'How Blockchain Games Work',
    type: 'text',
    sequence: 2,
    duration: 7,
    content: {
      sections: [
        {
          heading: 'NFT Game Assets',
          text: 'Characters, weapons, land, skins - all NFTs on blockchain. Buy from other players, sell to other players. True marketplace, developers don\'t control resale!',
          emoji: '🗡️'
        },
        {
          heading: 'Play-to-Earn Mechanics',
          text: 'Play game → Complete quests/battles → Earn game tokens → Sell tokens for USDC/HBAR → Convert to local currency. Gaming as work!',
          emoji: '🎯'
        },
        {
          heading: 'Example: Monster Racing Game',
          text: '1. Buy monster NFT ($50). 2. Race against others. 3. Win races, earn tokens. 4. Breed monsters, sell offspring. 5. After 2 months, earned back $50 + profit. Monster still worth $50!',
          emoji: '🏁'
        },
        {
          heading: 'Token Economics',
          text: 'Most games have two tokens: Governance token (limited, valuable, for investment) and Utility token (earned playing, used in-game). Earning utility, saving governance.',
          emoji: '🪙'
        },
        {
          heading: 'Scholarships',
          text: 'Can\'t afford NFT to start? Some players "lend" their NFTs to others, split earnings 70/30. Like sharecropping but fair and transparent through smart contracts!',
          emoji: '🤝'
        }
      ]
    }
  },
  {
    id: 'gaming_lesson_3',
    courseId: 'course_033',
    title: 'Play-to-Earn Demo Game',
    type: 'interactive',
    sequence: 3,
    duration: 15,
    content: {
      type: 'play_to_earn_demo'
    }
  },
  {
    id: 'gaming_lesson_4',
    courseId: 'course_033',
    title: 'The Reality Check',
    type: 'text',
    sequence: 4,
    duration: 6,
    content: {
      sections: [
        {
          heading: '⚠️ Not All Games Are Sustainable',
          text: 'Many P2E games are Ponzi-like: Early players earn from new players\' money. When growth stops, economy collapses. Axie Infinity fell 95% from peak. Be cautious!',
          emoji: '⚠️'
        },
        {
          heading: 'Red Flags',
          list: [
            '**Unrealistic returns** - "Earn $100/day playing 2 hours!"',
            '**High entry cost** - Must buy $500 NFT to start',
            '**Unclear gameplay** - Focus on earning, not fun',
            '**Hyperinflation** - Game tokens losing value rapidly',
            '**No cap on supply** - Infinite tokens = worthless tokens'
          ]
        },
        {
          heading: 'Sustainable Gaming',
          text: 'Best blockchain games: Fun FIRST, earning second. Real gameplay, competitive elements, cap on token supply, diverse revenue sources (not just new players). Like real sports!',
          emoji: '✅'
        },
        {
          heading: 'The Future: Hedera Gaming',
          text: 'Fast transactions + low fees = perfect for gaming. No $10 gas fee to equip sword! Hedera games can have smooth experience like traditional games but with blockchain benefits.',
          emoji: '⚡'
        },
        {
          heading: 'African Gaming Opportunities',
          list: [
            '**Play-to-Earn** - But choose sustainable games',
            '**Trading** - Buy low, sell high on game NFT marketplaces',
            '**Scholarships** - Manage team of players',
            '**Content creation** - Stream gaming, build audience',
            '**Game development** - Build the next big African blockchain game!'
          ]
        }
      ]
    }
  },
  {
    id: 'gaming_lesson_5',
    courseId: 'course_033',
    title: 'Blockchain Gaming Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What makes blockchain gaming different from traditional gaming?',
          options: [
            'Better graphics',
            'True ownership of in-game assets as NFTs',
            'Cheaper games',
            'Faster loading times'
          ],
          correctAnswer: 1,
          explanation: 'Blockchain games give players true ownership of assets (characters, items) as NFTs that can be traded or sold outside the game.'
        },
        {
          question: 'What is Play-to-Earn?',
          options: [
            'Paying to play games',
            'Earning cryptocurrency by playing games',
            'Traditional gaming',
            'Watching game ads'
          ],
          correctAnswer: 1,
          explanation: 'Play-to-Earn lets players earn cryptocurrency or NFTs through gameplay, which can be sold for real money. Gaming becomes a potential income source.'
        },
        {
          question: 'What is a red flag in P2E games?',
          options: [
            'Good gameplay',
            'Promises of unrealistic returns like "$100/day guaranteed"',
            'Active community',
            'Regular updates'
          ],
          correctAnswer: 1,
          explanation: 'Guaranteed high returns are a red flag! Sustainable P2E games have realistic earnings tied to actual game value, not Ponzi schemes.'
        },
        {
          question: 'Why is Hedera good for blockchain gaming?',
          options: [
            'It has better graphics',
            'Low fees ($0.0001) and fast speed (3-5 sec) enable smooth gameplay',
            'It\'s more expensive',
            'It requires downloads'
          ],
          correctAnswer: 1,
          explanation: 'Hedera\'s ultra-low fees and fast transaction speed enable gaming experiences similar to traditional games, without expensive gas fees per action.'
        }
      ]
    }
  }
];

// ==================== COURSE 034: Reading Crypto Charts ====================
export const readingChartsLessons: LessonContent[] = [
  {
    id: 'charts_lesson_1',
    courseId: 'course_034',
    title: 'Why Learn Chart Reading?',
    type: 'text',
    sequence: 1,
    duration: 5,
    content: {
      sections: [
        {
          heading: 'Knowledge is Power',
          text: 'Should you buy HBAR now or wait? Is this dip temporary or crash? Charts tell stories. Learning to read them helps you make informed decisions, not emotional ones.',
          emoji: '📈'
        },
        {
          heading: '⚠️ Important Disclaimer',
          text: 'Charts help with timing, BUT: Past performance ≠ future results. Even experts are wrong 50% of the time. NEVER trade with money you can\'t lose. This is education, not financial advice!',
          emoji: '⚠️'
        },
        {
          heading: 'What We\'ll Learn',
          list: [
            'Reading candlestick charts',
            'Support and resistance levels',
            'Volume analysis',
            'Basic patterns',
            'When NOT to trade'
          ]
        },
        {
          heading: 'African Context',
          text: 'Many Africans trade crypto for income. But trading without knowledge = gambling. Even basic chart skills dramatically improve your odds. Protect your capital!',
          emoji: '🛡️'
        }
      ]
    }
  },
  {
    id: 'charts_lesson_2',
    courseId: 'course_034',
    title: 'Understanding Candlesticks',
    type: 'text',
    sequence: 2,
    duration: 7,
    content: {
      sections: [
        {
          heading: 'What is a Candlestick?',
          text: 'Each candle shows price movement over time period (1 min, 1 hour, 1 day). Contains 4 prices: Open, High, Low, Close. Invented by Japanese rice traders 300 years ago!',
          emoji: '🕯️'
        },
        {
          heading: 'Reading a Candle',
          text: 'GREEN/WHITE candle = Price went UP (close higher than open). RED/BLACK candle = Price went DOWN (close lower than open). Body = Open to Close. Wicks = High and Low.',
          emoji: '📊'
        },
        {
          heading: 'Example: Daily HBAR Candle',
          text: 'Open: $0.08, High: $0.09, Low: $0.075, Close: $0.088. This shows: Started at $0.08, rallied to $0.09, dipped to $0.075, closed at $0.088. Green candle = buyers won!',
          emoji: '💹'
        },
        {
          heading: 'Candle Patterns Basics',
          list: [
            '**Big green candle** = Strong buying pressure',
            '**Big red candle** = Strong selling pressure',
            '**Long wick on top** = Price rejected higher, sellers pushed down',
            '**Long wick on bottom** = Price rejected lower, buyers pushed up',
            '**Small body, long wicks** = Indecision, battle between buyers/sellers'
          ]
        },
        {
          heading: 'Time Frames Matter',
          text: '1-minute candles for day traders. 4-hour for swing traders. Daily candles for investors. Longer time frames = more reliable signals. Beginners should stick to daily charts!',
          emoji: '⏰'
        }
      ]
    }
  },
  {
    id: 'charts_lesson_3',
    courseId: 'course_034',
    title: 'Interactive Chart Analysis',
    type: 'interactive',
    sequence: 3,
    duration: 12,
    content: {
      type: 'chart_analysis'
    }
  },
  {
    id: 'charts_lesson_4',
    courseId: 'course_034',
    title: 'Support, Resistance, and Volume',
    type: 'text',
    sequence: 4,
    duration: 7,
    content: {
      sections: [
        {
          heading: 'Support Levels',
          text: 'Price level where buying pressure stops decline. Like floor under price. Example: HBAR keeps bouncing off $0.05 - that\'s support. Buyers think "$0.05 is cheap!" and buy.',
          emoji: '🏔️'
        },
        {
          heading: 'Resistance Levels',
          text: 'Price level where selling pressure stops rally. Like ceiling on price. Example: HBAR struggles to break $0.12 - that\'s resistance. Sellers think "$0.12 is expensive!" and sell.',
          emoji: '🚧'
        },
        {
          heading: 'Trading These Levels',
          text: 'Strategy: Buy near support, sell near resistance. If price breaks resistance (breakout), it becomes new support! This is basics of trading.',
          emoji: '💡'
        },
        {
          heading: 'Volume Analysis',
          text: 'Volume = How much traded. High volume = Strong move. Low volume = Weak move. Price increases with low volume? Probably will reverse. With high volume? Sustainable!',
          emoji: '📊'
        },
        {
          heading: 'Example: Bitcoin $40k',
          text: 'BTC approaches $40k resistance. Volume surges as it breaks through → Strong breakout! If volume was low → Fake breakout, likely to fall back.',
          emoji: '₿'
        },
        {
          heading: '⚠️ False Breakouts',
          text: 'Price briefly breaks resistance/support then reverses. Common trap! This is why volume confirmation matters. Wait for candle close + high volume before trading.',
          emoji: '⚠️'
        }
      ]
    }
  },
  {
    id: 'charts_lesson_5',
    courseId: 'course_034',
    title: 'Chart Reading Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What does a green candlestick indicate?',
          options: [
            'Price went down',
            'Price went up (close higher than open)',
            'Volume increased',
            'Market is closed'
          ],
          correctAnswer: 1,
          explanation: 'Green/white candlesticks show price increased during that period - the close price is higher than the open price.'
        },
        {
          question: 'What is a support level?',
          options: [
            'Maximum price',
            'Price level where buying pressure typically stops declines',
            'Current price',
            'Average price'
          ],
          correctAnswer: 1,
          explanation: 'Support is a price level where buyers tend to enter, creating a "floor" that prevents further price declines.'
        },
        {
          question: 'Why is volume important?',
          options: [
            'It determines price directly',
            'High volume confirms strength of price moves',
            'It\'s not important',
            'It shows the time'
          ],
          correctAnswer: 1,
          explanation: 'Volume confirms price moves. High volume with price movement = strong move likely to continue. Low volume = weak move likely to reverse.'
        },
        {
          question: 'What should beginners focus on?',
          options: [
            '1-minute charts',
            'Daily charts for more reliable signals',
            'Trading every day',
            'Complex indicators'
          ],
          correctAnswer: 1,
          explanation: 'Beginners should stick to daily charts. They filter out noise and provide more reliable signals than shorter timeframes which are for experienced day traders.'
        }
      ]
    }
  }
];
