// New Explorer Track Courses - Part 2 (Courses 022-029)
// Top 10 Priority Courses Continued
import { LessonContent } from './courseContent';

// ==================== COURSE 022: Understanding Stablecoins ====================
export const stablecoinsLessons: LessonContent[] = [
  {
    id: 'stable_lesson_1',
    courseId: 'course_022',
    title: 'The Volatility Problem',
    type: 'text',
    sequence: 1,
    duration: 5,
    content: {
      sections: [
        {
          heading: 'Why Bitcoin Isn\'t for Daily Transactions',
          text: 'Imagine selling mangoes at Balogun Market. A customer wants to pay 5,000 Naira in Bitcoin. But Bitcoin\'s price swings 5-10% daily! By the time you want to use that money, it might be worth 4,500 or 5,500 Naira.',
          emoji: '📉'
        },
        {
          heading: 'The Merchant Dilemma',
          text: 'You can\'t price products in crypto when the value changes by the hour. A matatu ride can\'t cost \"0.001 BTC\" when that means 100 Shillings today and 120 tomorrow!',
          emoji: '🚌'
        },
        {
          heading: 'Enter Stablecoins',
          text: 'Stablecoins solve this by maintaining a stable value, usually pegged to US Dollar. 1 USDC = $1 today, tomorrow, and next month. Now you can do business!',
          emoji: '💵'
        },
        {
          heading: 'Perfect for Africa',
          text: 'Stablecoins give you dollar stability without needing a US bank account. For countries with weak currencies, this is revolutionary - protect your savings from inflation while keeping crypto benefits.',
          emoji: '🌍'
        }
      ]
    }
  },
  {
    id: 'stable_lesson_2',
    courseId: 'course_022',
    title: 'Types of Stablecoins',
    type: 'text',
    sequence: 2,
    duration: 7,
    content: {
      sections: [
        {
          heading: '1. Fiat-Backed Stablecoins (Most Common)',
          text: 'For every 1 USDC or USDT issued, there\'s $1 held in a bank account. Like the old days when currency was backed by gold.',
          list: [
            '**USDC (Circle)** - Fully audited, regulated, monthly transparency reports',
            '**USDT (Tether)** - Largest by volume, less transparent',
            '**BUSD** - Issued by Binance, regulated by NYDFS (discontinued)',
            '**How it works**: Company holds $1 million → Issues 1 million coins'
          ]
        },
        {
          heading: '2. Crypto-Backed Stablecoins',
          text: 'Backed by other cryptocurrencies with over-collateralization. Less common.',
          emoji: '🔗'
        },
        {
          heading: '3. Algorithmic Stablecoins',
          text: 'Use smart contracts and algorithms to maintain price. RISKY! Remember UST collapse in 2022 where $60 billion evaporated.',
          emoji: '⚠️'
        },
        {
          heading: 'Best for African Users',
          text: 'Stick with fiat-backed stablecoins (USDC, USDT) on reliable networks like Hedera. They\'re transparent, audited, and actually maintain their peg.',
          emoji: '✅'
        },
        {
          heading: 'On Hedera',
          text: 'Hedera supports USDC natively with $0.0001 transaction fees. Transfer stablecoins across Africa for essentially free!',
          emoji: '⚡'
        }
      ]
    }
  },
  {
    id: 'stable_lesson_3',
    courseId: 'course_022',
    title: 'Stablecoin Use Cases in Africa',
    type: 'text',
    sequence: 3,
    duration: 6,
    content: {
      sections: [
        {
          heading: '🛡️ Inflation Protection',
          text: 'Nigerian Naira lost 50% value in 2023. If Amaka kept 1 million Naira, it\'s now worth $650. If she converted to USDC in January, she\'d still have $1,200 worth!',
          emoji: '🛡️'
        },
        {
          heading: '💸 Remittances',
          text: 'Send USDC instead of dealing with forex bureaus. Recipient gets exact dollar amount. No surprise deductions.',
          emoji: '💸'
        },
        {
          heading: '🏪 Business Payments',
          text: 'Kwame imports from China. Paying in USDC is faster and cheaper than bank wires. Transaction in 3 seconds vs 3 days.',
          emoji: '🏪'
        },
        {
          heading: '💰 Savings',
          text: 'Can\'t open dollar account? Buy stablecoins! Many DeFi platforms offer 3-8% APY on stablecoin deposits - better than most African savings accounts.',
          emoji: '💰'
        },
        {
          heading: '🌍 Cross-Border Trade',
          text: 'African trader in Ghana selling to Nigerian buyer. Payment in USDC settles instantly, no forex hassle, both sides get fair rate.',
          emoji: '🌍'
        },
        {
          heading: '⚠️ Important Note',
          text: 'Stablecoins aren\'t bank deposits. Choose reputable ones (USDC, USDT), understand custody risks, don\'t invest more than you can afford to lose.',
          emoji: '⚠️'
        }
      ]
    }
  },
  {
    id: 'stable_lesson_4',
    courseId: 'course_022',
    title: 'Check Stablecoin Reserves',
    type: 'practical',
    sequence: 4,
    duration: 8,
    content: {
      title: 'Verify Stablecoin Backing',
      description: 'Learn how to check if a stablecoin is properly backed by real reserves. This protects you from stablecoin collapses!',
      objective: 'View USDC token information on Hedera and understand how to verify it\'s properly backed.',
      steps: [
        'Connect your wallet to Hedera testnet',
        'Query USDC token information on Hedera',
        'View total supply and circulation',
        'Check issuer information (should be Circle)',
        'Learn where to find Circle\'s monthly attestation reports'
      ],
      transactionAmount: 0,
      successMessage: 'Great! Now you know how to verify stablecoin reserves - protecting you from scams!',
      tips: [
        'USDC publishes monthly reports at circle.com/usdc',
        'Legitimate stablecoins are transparent about reserves',
        'If a stablecoin won\'t show reserves, avoid it!',
        'Hedera\'s native USDC has same security as Ethereum USDC'
      ]
    }
  },
  {
    id: 'stable_lesson_5',
    courseId: 'course_022',
    title: 'Stablecoins Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What keeps a stablecoin "stable"?',
          options: [
            'Government regulation',
            'It\'s pegged to a stable asset like USD',
            'Limited supply',
            'High trading volume'
          ],
          correctAnswer: 1,
          explanation: 'Stablecoins maintain value by being pegged to stable assets, usually US Dollar. For every stablecoin issued, there\'s equivalent value backing it.'
        },
        {
          question: 'Why are stablecoins useful in Africa?',
          options: [
            'They have higher fees',
            'They protect against local currency inflation',
            'They are harder to use',
            'They require a bank account'
          ],
          correctAnswer: 1,
          explanation: 'Stablecoins let Africans hold dollar-pegged value without US bank accounts, protecting against local currency inflation and devaluation.'
        },
        {
          question: 'Which type of stablecoin is safest?',
          options: [
            'Algorithmic stablecoins',
            'Unbacked stablecoins',
            'Fiat-backed with audited reserves (like USDC)',
            'Crypto-backed stablecoins'
          ],
          correctAnswer: 2,
          explanation: 'Fiat-backed stablecoins with regular audits (like USDC) are safest because they have real dollars backing them and transparent reporting.'
        },
        {
          question: 'What happened to UST, an algorithmic stablecoin, in 2022?',
          options: [
            'It became the #1 stablecoin',
            'It crashed, losing billions in value',
            'It was backed by banks',
            'It was too stable'
          ],
          correctAnswer: 1,
          explanation: 'UST, an algorithmic stablecoin, collapsed in 2022, losing its peg and wiping out $60 billion. This shows why fiat-backed stablecoins are safer.'
        }
      ]
    }
  }
];

// ==================== COURSE 023: From Mobile Money to Crypto ====================
export const mobileMoneyToCryptoLessons: LessonContent[] = [
  {
    id: 'mm_lesson_1',
    courseId: 'course_023',
    title: 'You Already Understand Crypto!',
    type: 'text',
    sequence: 1,
    duration: 5,
    content: {
      sections: [
        {
          heading: 'M-Pesa Was Revolutionary',
          text: 'In 2007, M-Pesa transformed Kenya by letting people send money via phone without banks. Now 96% of Kenyan households use mobile money. Crypto is the next evolution of this same idea!',
          emoji: '📱'
        },
        {
          heading: 'Mobile Money Across Africa',
          list: [
            '**M-Pesa** - Kenya, Tanzania (30M+ users)',
            '**MTN MoMo** - Ghana, Uganda, Cameroon (60M+ users)',
            '**Airtel Money** - Nigeria, Kenya, Zambia',
            '**Orange Money** - Francophone Africa',
            '**Total**: Over 500 million mobile money accounts in Africa!'
          ]
        },
        {
          heading: 'The Similarities',
          text: 'Mobile money and crypto both allow digital value transfer without banks. Both use accounts identified by numbers/codes. Both let you send money 24/7. You already understand 80% of crypto!',
          emoji: '💡'
        },
        {
          heading: 'Why Learn Crypto Then?',
          text: 'Crypto removes the middleman completely. MTN/Safaricom control mobile money. Blockchain? Nobody controls it. This means cheaper fees, no account freezes, and works across all borders!',
          emoji: '🌍'
        }
      ]
    }
  },
  {
    id: 'mm_lesson_2',
    courseId: 'course_023',
    title: 'Comparing Mobile Money and Crypto',
    type: 'interactive',
    sequence: 2,
    duration: 10,
    content: {
      type: 'mobile_money_comparison',
      explanation: 'See how mobile money and cryptocurrency compare across key aspects. Click each card to explore the differences and similarities.',
      comparison: [
        {
          aspect: '💰 Fees & Costs',
          mobileMoney: 'Sending 1000 KES via M-Pesa costs ~28 KES (2.8%). Withdrawing to bank adds more fees. International transfers very expensive (10-15%).',
          crypto: 'Sending HBAR costs ~$0.0001 regardless of amount. Same fee for 100 KES or 1 million KES. International transfers same cost as local.'
        },
        {
          aspect: '🌍 Cross-Border Transfers',
          mobileMoney: 'Limited to specific countries. M-Pesa Kenya to Tanzania works, but not to Nigeria. Often requires conversion and high fees.',
          crypto: 'Works everywhere identically. Send HBAR from Kenya to Nigeria, South Africa, USA - same speed, same fee. No borders on blockchain.'
        },
        {
          aspect: '⏰ Operating Hours',
          mobileMoney: 'Mostly 24/7, but some functions limited. Customer support only during business hours. System maintenance causes downtime.',
          crypto: 'True 24/7/365. Blockchain never sleeps. Send at 3 AM on Christmas? No problem. No downtime ever.'
        },
        {
          aspect: '🔒 Account Control',
          mobileMoney: 'Provider can freeze account anytime. Must comply with their rules. KYC required. Account tied to phone number and SIM card.',
          crypto: 'Only YOU control your wallet. No one can freeze it. No KYC for basic use. Account tied to private key you own.'
        },
        {
          aspect: '💵 Currency Options',
          mobileMoney: 'Only local currency (KES, NGN, UGX, etc.). If currency inflates, your balance loses value. No protection.',
          crypto: 'Access to stablecoins (dollar-pegged) and other cryptocurrencies. Protect against local currency inflation. Choose your store of value.'
        },
        {
          aspect: '📱 Setup & Access',
          mobileMoney: 'Need specific SIM card from provider. Physical registration required. Must be in supported country.',
          crypto: 'Download wallet app anywhere. No SIM needed. No physical presence required. Works on same phone as mobile money.'
        }
      ]
    }
  },
  {
    id: 'mm_lesson_3',
    courseId: 'course_023',
    title: 'Key Differences to Understand',
    type: 'text',
    sequence: 3,
    duration: 7,
    content: {
      sections: [
        {
          heading: 'Control and Ownership',
          text: 'M-Pesa: Safaricom controls your account. They can freeze it, limit it, or reverse transactions. Crypto Wallet: YOU control it with your private key. No company can freeze or reverse.',
          emoji: '🔐'
        },
        {
          heading: 'Geographic Limitations',
          text: 'M-Pesa only works in Kenya/Tanzania. MTN MoMo only in MTN countries. Sending across these networks? Expensive! Crypto: Works everywhere Earth has internet. Same wallet in Lagos or London.',
          emoji: '🌍'
        },
        {
          heading: 'Transaction Limits',
          text: 'Mobile money has daily limits (often $500-1000). Large transactions require multiple days or agents. Crypto: No limits. Send $10 or $10 million with the same ease.',
          emoji: '💸'
        },
        {
          heading: 'Privacy',
          text: 'Mobile money: Company knows every transaction you make. They can share with government. Crypto: Transactions are on public blockchain but not directly tied to your identity.',
          emoji: '🕵️'
        },
        {
          heading: 'Fees Comparison',
          list: [
            '**M-Pesa Sending 1000 KES**: ~30 KES (3%)',
            '**Sending 100,000 KES**: ~125 KES (0.125%)',
            '**Hedera HBAR**: ~$0.0001 regardless of amount',
            '**For large amounts, crypto is 100x cheaper!**'
          ]
        },
        {
          heading: 'Customer Support',
          text: 'Mobile Money: Call customer care if there\'s an issue. They can help. Crypto: No customer support. If you lose your seed phrase, your funds are gone forever. More freedom = more responsibility!',
          emoji: '⚠️'
        }
      ]
    }
  },
  {
    id: 'mm_lesson_4',
    courseId: 'course_023',
    title: 'The Best of Both Worlds',
    type: 'text',
    sequence: 4,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'They Can Work Together!',
          text: 'You don\'t have to choose. Use mobile money for daily expenses and local transactions. Use crypto for savings, remittances, and international payments. Each has its strengths!',
          emoji: '🤝'
        },
        {
          heading: 'Emerging Bridges',
          text: 'Companies are building bridges between mobile money and crypto. In Kenya, you can buy Bitcoin with M-Pesa. In Nigeria, withdraw crypto to bank linked with mobile money. The walls are coming down!',
          emoji: '🌉'
        },
        {
          heading: 'Perfect Use Cases',
          list: [
            '**Mobile Money**: Buying groceries, paying for matatu, paying rent to landlord',
            '**Crypto**: Receiving remittances from abroad, saving in dollars (stablecoins), freelance payments from international clients',
            '**Both**: The future is interoperability!'
          ]
        },
        {
          heading: 'Starting Your Journey',
          text: 'Your mobile money experience gives you a huge head start. You already understand digital money. Now you\'re learning global, permissionless digital money. Welcome to the future!',
          emoji: '🚀'
        }
      ]
    }
  },
  {
    id: 'mm_lesson_5',
    courseId: 'course_023',
    title: 'Mobile Money vs Crypto Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What\'s the main difference in control between M-Pesa and crypto wallets?',
          options: [
            'M-Pesa is faster',
            'M-Pesa is controlled by Safaricom, crypto wallet is controlled by you',
            'Crypto requires internet',
            'M-Pesa has better customer service'
          ],
          correctAnswer: 1,
          explanation: 'The fundamental difference is control: Safaricom controls M-Pesa accounts and can freeze them. With crypto, you control your wallet via private key.'
        },
        {
          question: 'Why is crypto better for cross-border payments than mobile money?',
          options: [
            'Crypto has customer support',
            'Mobile money is too expensive',
            'Crypto works globally without geographic restrictions',
            'Crypto is easier to use'
          ],
          correctAnswer: 2,
          explanation: 'Crypto works anywhere with internet, while mobile money is limited to specific countries/networks. Sending crypto from Nigeria to Kenya is as easy as sending across town.'
        },
        {
          question: 'Which scenario is BETTER for mobile money than crypto?',
          options: [
            'Saving money from inflation',
            'Buying groceries at local market',
            'Receiving money from USA',
            'Storing large amounts'
          ],
          correctAnswer: 1,
          explanation: 'Mobile money is better for daily local transactions like groceries because merchants accept it, no conversion needed, and customer support exists if issues arise.'
        },
        {
          question: 'How are mobile money and crypto similar?',
          options: [
            'Both require banks',
            'Both enable digital value transfer without traditional banks',
            'Both are controlled by governments',
            'Both have the same fees'
          ],
          correctAnswer: 1,
          explanation: 'Both mobile money and crypto enable financial transactions without requiring traditional bank accounts, bringing financial services to the unbanked.'
        }
      ]
    }
  }
];

// ==================== COURSE 024: Understanding Private Keys & Ownership ====================
export const privateKeysOwnershipLessons: LessonContent[] = [
  {
    id: 'keys_lesson_1',
    courseId: 'course_024',
    title: 'Not Your Keys, Not Your Crypto',
    type: 'text',
    sequence: 1,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'The Most Important Rule in Crypto',
          text: '"Not your keys, not your coins." This means if you don\'t control the private key, you don\'t truly own the cryptocurrency - someone else does!',
          emoji: '🔑'
        },
        {
          heading: 'What Are Private Keys?',
          text: 'A private key is like the master password to your crypto. It\'s a long string of random characters that mathematically controls your wallet. Whoever has this key owns the funds. Period.',
          emoji: '🔐'
        },
        {
          heading: 'Real-World Analogy',
          text: 'Traditional Bank: You prove identity with ID. Bank controls actual money. Crypto Wallet: Private key IS your identity. You control actual money. No bank needed!',
          emoji: '🏦'
        },
        {
          heading: 'Seed Phrase = Private Key',
          text: 'Your 12-24 word seed phrase is a human-readable version of your private key. Anyone with your seed phrase can recreate your private key and take ALL your crypto from any device!',
          emoji: '⚠️'
        },
        {
          heading: 'African Context: Like Land Title',
          text: 'In Kenya, your land title deed proves land ownership. Private key is your crypto title deed. Lose the deed? Problems. Show deed to scammer? They steal your land. Same with private keys!',
          emoji: '📜'
        }
      ]
    }
  },
  {
    id: 'keys_lesson_2',
    courseId: 'course_024',
    title: 'Exchanges vs Self-Custody',
    type: 'text',
    sequence: 2,
    duration: 7,
    content: {
      sections: [
        {
          heading: 'Keeping Crypto on Exchanges',
          text: 'When crypto sits on Binance, Luno, or Quidax, THEY hold the private keys, not you. It\'s like depositing money in a bank. They promise to give it back, but you\'re trusting them.',
          emoji: '🏛️'
        },
        {
          heading: 'Exchange Risks in Africa',
          list: [
            '**FTX Collapse (2022)** - $8 billion lost, many Africans affected',
            '**Local exchanges shutting down** - Nigerian users lost funds when some platforms closed',
            '**Account freezes** - Exchange can freeze your account anytime',
            '**Government seizure** - Governments can order exchanges to freeze assets',
            '**Hacks** - Exchanges are honeypots for hackers'
          ]
        },
        {
          heading: 'Self-Custody Wallets',
          text: 'With HashPack, MetaMask, or Blade - YOU hold the private keys. Your crypto is truly yours. Exchange collapses? Doesn\'t affect you. Government wants to freeze? Can\'t touch self-custody wallets!',
          emoji: '✅'
        },
        {
          heading: 'The Trade-Off',
          text: 'Exchanges: Easy to use, customer support, can recover password. Risk: They can lose/freeze your funds. Self-Custody: Total control, no one can freeze. Risk: If you lose seed phrase, money is GONE forever.',
          emoji: '⚖️'
        },
        {
          heading: 'Best Practice',
          text: 'Use exchanges for buying/selling (like forex bureau). Use self-custody wallet for storing (like home safe). Never keep large amounts on exchanges long-term!',
          emoji: '💡'
        },
        {
          heading: 'Real Story: Nigeria CBN Ban 2021',
          text: 'When Nigeria\'s Central Bank banned crypto, local exchanges froze accounts. Users with self-custody wallets? Unaffected. They could still transact freely. This is why self-custody matters!',
          emoji: '🇳🇬'
        }
      ]
    }
  },
  {
    id: 'keys_lesson_3',
    courseId: 'course_024',
    title: 'Simulating Exchange vs Self-Custody',
    type: 'practical',
    sequence: 3,
    duration: 12,
    content: {
      title: 'Experience True Ownership',
      description: 'Understand the difference between exchange custody and self-custody by controlling your own wallet.',
      objective: 'Successfully connect a self-custody wallet and perform a transaction where YOU control the keys.',
      steps: [
        'Connect your HashPack wallet (this is self-custody - you have the keys)',
        'View your wallet balance (only YOU can access this)',
        'Perform a test transaction',
        'See transaction on blockchain (no middleman involved)',
        'Understand: Only you could authorize this transaction'
      ],
      transactionAmount: 0.5,
      successMessage: 'Congratulations! You just used self-custody. Nobody but you could have done this transaction!',
      tips: [
        'Your private key never left your device',
        'No exchange could have blocked this transaction',
        'This is what "permissionless" means',
        'With great power comes great responsibility - backup that seed phrase!'
      ]
    }
  },
  {
    id: 'keys_lesson_4',
    courseId: 'course_024',
    title: 'Protecting Your Private Keys',
    type: 'text',
    sequence: 4,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'NEVER Share Your Private Key/Seed Phrase',
          list: [
            '❌ Not with "customer support" (scam)',
            '❌ Not in Telegram/WhatsApp groups',
            '❌ Not with your boyfriend/girlfriend (protect yourself)',
            '❌ Not typed on websites',
            '❌ Not photographed or screenshotted',
            '✅ ONLY written on paper, stored securely offline'
          ]
        },
        {
          heading: 'Backup Strategies',
          text: 'Write seed phrase on paper (or metal plate). Store in safe place - maybe split between two locations. Some Africans use: One copy at home, one with trusted family in village.',
          emoji: '📝'
        },
        {
          heading: 'What About Screenshots?',
          text: 'NEVER screenshot seed phrases! Your phone syncs to cloud (Google Photos, iCloud). Hackers breach clouds daily. Screenshots = giving hackers your keys!',
          emoji: '📸'
        },
        {
          heading: 'Physical Security',
          text: 'In Kenya, some use bank safety deposit boxes for seed phrases. In Nigeria, some use notarized sealed envelopes. Find what works for your situation, but keep it offline!',
          emoji: '🔒'
        },
        {
          heading: 'Estate Planning',
          text: 'Morbid but important: If something happens to you, can family access your crypto? Consider secure way to pass on seed phrase (lawyer, sealed will, trusted family member). Otherwise, funds lost forever.',
          emoji: '👨‍👩‍👧'
        }
      ]
    }
  },
  {
    id: 'keys_lesson_5',
    courseId: 'course_024',
    title: 'Private Keys Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What does "Not your keys, not your coins" mean?',
          options: [
            'You should buy more crypto',
            'If you don\'t control the private key, you don\'t truly own the crypto',
            'Exchanges are safer than wallets',
            'Private keys are not important'
          ],
          correctAnswer: 1,
          explanation: 'This fundamental principle means you only truly own crypto if you control the private key. Otherwise, someone else (like an exchange) controls it.'
        },
        {
          question: 'Where should you NEVER store your seed phrase?',
          options: [
            'Written on paper in a safe',
            'In a screenshot on your phone',
            'In a sealed envelope',
            'Split between two secure locations'
          ],
          correctAnswer: 1,
          explanation: 'NEVER screenshot seed phrases! Phones sync to cloud storage which can be hacked. Always store seed phrases offline, written on paper.'
        },
        {
          question: 'Why is self-custody important in Africa?',
          options: [
            'It\'s more convenient',
            'Exchanges offer better customer service',
            'It protects against exchange collapse and government freezes',
            'It has lower fees'
          ],
          correctAnswer: 2,
          explanation: 'Self-custody protected users during Nigeria\'s CBN crypto ban and various exchange collapses. Nobody can freeze or seize self-custody funds.'
        },
        {
          question: 'If someone messages you saying they\'re "Hedera Support" and need your seed phrase to fix an issue, you should:',
          options: [
            'Send it to them immediately',
            'Send half the words to verify',
            'Recognize it as a scam and report',
            'Ask for their ID first'
          ],
          correctAnswer: 2,
          explanation: 'This is ALWAYS a scam. Real support never asks for private keys or seed phrases. Anyone asking for these is trying to steal your crypto!'
        }
      ]
    }
  }
];

// Continue with Course 025: DeFi Basics...
