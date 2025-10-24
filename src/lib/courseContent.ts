// Course content for available courses
import { 
  nftBeginnerLessons, 
  nftIntermediateLessons,
  nftAdvancedLessons,
  introDAppsLessons,
  testnetLessons
} from './additionalCourseContent';

import {
  previewnetLessons,
  mainnetLessons,
  devnetLessons,
  dappInteractionLessons,
  blockchainExplorersLessons
} from './explorerCourseContent';

import {
  crossBorderPaymentsLessons,
  avoidingScamsLessons,
  stablecoinsLessons,
  mobileMoneyToCryptoLessons,
  privateKeysOwnershipLessons,
  defiBasicsLessons,
  dexLessons,
  cryptoTaxesLessons,
  hederaConsensusLessons,
  web3CareersLessons,
  cryptocurrencyBasicsLessons,
  digitalIdentityLessons,
  daoLessons,
  blockchainGamingLessons,
  readingChartsLessons,
  cryptoExchangesLessons,
  hederaCouncilLessons,
  hederaUseCasesLessons,
  consensusMechanismsLessons,
  layer1vs2Lessons,
  smartContractBasicsLessons,
  tokenomicsLessons,
  cryptoCommunitiesLessons,
  advancedSecurityLessons,
  earningYieldLessons
} from './newExplorerCoursesIndex';

export interface LessonContent {
  id: string;
  courseId: string;
  title: string;
  type: 'text' | 'interactive' | 'quiz' | 'practical';
  content: any;
  duration: number;
  sequence: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// Wallet Security Best Practices Course
export const walletSecurityLessons: LessonContent[] = [
  {
    id: 'ws_lesson_1',
    courseId: 'course_004',
    title: 'Introduction to Crypto Wallets',
    type: 'text',
    sequence: 1,
    duration: 5,
    content: {
      sections: [
        {
          heading: 'What is a Crypto Wallet?',
          text: 'A crypto wallet is like a digital version of your physical wallet or mobile money account. Just as you keep cash or use M-Pesa to store and send money, a crypto wallet lets you store and send cryptocurrency.',
          emoji: '👛'
        },
        {
          heading: 'Types of Wallets',
          text: 'There are different types of wallets, just like you might have both a physical wallet and a mobile money account:',
          list: [
            '**Hot Wallets** - Connected to the internet (like mobile money on your phone)',
            '**Cold Wallets** - Offline storage (like cash hidden safely at home)',
            '**Hardware Wallets** - Physical devices (like a locked safe)',
            '**Software Wallets** - Apps on your phone or computer'
          ]
        },
        {
          heading: 'Why Security Matters',
          text: 'Unlike a bank that can reverse fraudulent transactions, cryptocurrency transactions are permanent. Once sent, you cannot get it back. This is why securing your wallet is crucial - think of it as being your own bank manager.',
          emoji: '🔐'
        }
      ]
    }
  },
  {
    id: 'ws_lesson_2',
    courseId: 'course_004',
    title: 'Understanding Seed Phrases',
    type: 'interactive',
    sequence: 2,
    duration: 7,
    content: {
      type: 'seed_phrase_demo',
      explanation: 'A seed phrase is like the master key to your crypto wallet. It\'s usually 12 or 24 random words that can recover your wallet if you lose access.',
      analogy: 'Think of it like the master password to reset your mobile money PIN. Anyone with this password can access ALL your money.',
      demoWords: ['market', 'village', 'harvest', 'river', 'mountain', 'sunset', 'maize', 'cattle', 'rainbow', 'thunder', 'wisdom', 'ubuntu']
    }
  },
  {
    id: 'ws_lesson_3',
    courseId: 'course_004',
    title: 'Never Share Your Seed Phrase',
    type: 'text',
    sequence: 3,
    duration: 5,
    content: {
      sections: [
        {
          heading: '⚠️ Critical Security Rule #1',
          text: 'NEVER share your seed phrase with anyone. Not your family, not your friends, not "customer support", not anyone claiming to help you.',
          emoji: '🚫'
        },
        {
          heading: 'Common Scams to Watch For',
          list: [
            'Fake customer support asking for your seed phrase',
            'Emails or messages claiming you won crypto (you need to "verify" with seed phrase)',
            'Websites asking you to "validate" your wallet',
            'People offering to "help" you recover lost funds',
            'QR codes that claim to give you free crypto'
          ]
        },
        {
          heading: 'Real Support Will Never Ask',
          text: 'Legitimate wallet providers, exchanges, or support teams will NEVER ask for your seed phrase. It\'s like a bank asking for your PIN - they simply don\'t need it and would never ask.',
          emoji: '✅'
        },
        {
          heading: 'African Context Alert',
          text: 'Scammers often target African users through WhatsApp, Telegram, and SMS. They may pretend to be from popular services or claim you won a prize. Always verify before sharing any information.',
          emoji: '📱'
        }
      ]
    }
  },
  {
    id: 'ws_lesson_4',
    courseId: 'course_004',
    title: 'Storing Your Seed Phrase Safely',
    type: 'interactive',
    sequence: 4,
    duration: 8,
    content: {
      type: 'storage_comparison',
      methods: [
        {
          method: 'Write on Paper',
          safety: 'high',
          pros: ['Offline - can\'t be hacked', 'Simple and accessible', 'No technical knowledge needed'],
          cons: ['Can be damaged by fire/water', 'Can be lost', 'Someone might find it'],
          recommendation: 'Good! Store in a safe place like a locked drawer or safe.'
        },
        {
          method: 'Metal Backup',
          safety: 'very-high',
          pros: ['Fireproof and waterproof', 'Very durable', 'Offline security'],
          cons: ['Costs money', 'Not easily available in all areas'],
          recommendation: 'Excellent for large amounts of crypto!'
        },
        {
          method: 'Phone Screenshot',
          safety: 'very-low',
          pros: ['Quick and easy'],
          cons: ['Can be hacked', 'Cloud backup might expose it', 'Phone can be stolen', 'Very dangerous!'],
          recommendation: '❌ NEVER DO THIS - Very unsafe!'
        },
        {
          method: 'Digital Note/Email',
          safety: 'very-low',
          pros: ['Easy to access'],
          cons: ['Can be hacked', 'Email/cloud accounts get compromised', 'Extremely risky'],
          recommendation: '❌ NEVER DO THIS - Your crypto will likely be stolen!'
        }
      ]
    }
  },
  {
    id: 'ws_lesson_5',
    courseId: 'course_004',
    title: 'Security Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'Someone on WhatsApp says they\'re from your wallet support team and need your seed phrase to fix an issue. What should you do?',
          options: [
            'Share it - they\'re trying to help',
            'Ask them to verify their identity first',
            'Never share it - this is definitely a scam',
            'Share only half of the words'
          ],
          correctAnswer: 2,
          explanation: 'This is a scam! Real support teams NEVER ask for your seed phrase. Anyone asking for it is trying to steal your crypto.'
        },
        {
          question: 'What\'s the safest way to store your seed phrase?',
          options: [
            'Take a screenshot and save to Google Photos',
            'Write it on paper and store in a safe place',
            'Email it to yourself',
            'Save it in WhatsApp "Saved Messages"'
          ],
          correctAnswer: 1,
          explanation: 'Writing on paper and storing it safely offline is the best method. Digital storage can be hacked or accessed by others.'
        },
        {
          question: 'Your seed phrase is like:',
          options: [
            'Your email address - okay to share',
            'Your phone number - only share with trusted people',
            'Your mobile money PIN - never share with anyone',
            'Your username - everyone should know it'
          ],
          correctAnswer: 2,
          explanation: 'Your seed phrase is like your mobile money PIN - it gives complete access to your funds and should NEVER be shared with anyone.'
        },
        {
          question: 'You receive an SMS saying you won 1 Bitcoin and need to enter your seed phrase to claim it. What should you do?',
          options: [
            'Claim it immediately!',
            'Enter the seed phrase to see if it\'s real',
            'Delete the message - it\'s a scam',
            'Forward to friends so they can win too'
          ],
          correctAnswer: 2,
          explanation: 'This is a classic scam! Delete the message immediately. You never need to enter your seed phrase to receive crypto.'
        }
      ]
    }
  },
  {
    id: 'ws_lesson_6',
    courseId: 'course_004',
    title: 'Additional Security Tips',
    type: 'text',
    sequence: 6,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'Use Strong Passwords',
          text: 'Create unique, strong passwords for your wallet apps and exchanges. Don\'t reuse passwords from other accounts.',
          emoji: '🔑'
        },
        {
          heading: 'Enable Two-Factor Authentication (2FA)',
          text: 'Always enable 2FA on exchanges and wallet apps when available. This adds an extra layer of security, like needing both your ID and password.',
          emoji: '📱'
        },
        {
          heading: 'Verify Addresses Carefully',
          text: 'Before sending crypto, always double-check the receiving address. Send a small test amount first for large transactions. Crypto transactions cannot be reversed!',
          emoji: '✔️'
        },
        {
          heading: 'Beware of Public WiFi',
          text: 'Avoid accessing your crypto wallet on public WiFi (cafes, airports, etc.). Use mobile data or a trusted home network instead.',
          emoji: '📡'
        },
        {
          heading: 'Keep Software Updated',
          text: 'Regularly update your wallet apps and phone operating system. Updates often include important security fixes.',
          emoji: '🔄'
        },
        {
          heading: 'Start Small',
          text: 'When you\'re new to crypto, start with small amounts you can afford to lose while you learn. Don\'t invest money you need for rent, food, or emergencies.',
          emoji: '💡'
        }
      ]
    }
  }
];

// Blockchain Fundamentals Course
export const blockchainFundamentalsLessons: LessonContent[] = [
  {
    id: 'bf_lesson_1',
    courseId: 'course_001',
    title: 'What is Blockchain?',
    type: 'text',
    sequence: 1,
    duration: 5,
    content: {
      sections: [
        {
          heading: 'Understanding Blockchain with Familiar Concepts',
          text: 'Imagine a village ledger where everyone writes down transactions - who sold maize to whom, who borrowed money from whom. Everyone in the village has a copy of this ledger, so no one can cheat or erase records.',
          emoji: '📖'
        },
        {
          heading: 'The Digital Version',
          text: 'Blockchain is exactly this, but digital! It\'s a shared record book that everyone can see, but no single person controls. Once something is written, it stays there forever.',
          emoji: '⛓️'
        },
        {
          heading: 'Why It Matters',
          text: 'In many African countries, we struggle with trust in institutions, corruption, and lack of financial services. Blockchain provides a system where trust is built into the technology, not dependent on any single authority.',
          list: [
            'No one can change past records',
            'Everyone can verify transactions',
            'No middleman taking fees',
            'Works even if you don\'t have a bank account'
          ]
        }
      ]
    }
  },
  {
    id: 'bf_lesson_2',
    courseId: 'course_001',
    title: 'How Blockchain Works - The Market Analogy',
    type: 'interactive',
    sequence: 2,
    duration: 10,
    content: {
      type: 'market_transaction_demo',
      scenario: 'Let\'s see how blockchain works using a familiar African market scenario',
      steps: [
        {
          title: 'Traditional Market Transaction',
          description: 'Amina sells vegetables to Kwame for 500 Naira',
          traditional: 'Only Amina and Kwame know about this transaction. They might write it in personal notebooks that can be lost or changed.',
          problem: 'What if there\'s a dispute? What if someone\'s notebook is lost?'
        },
        {
          title: 'Blockchain Transaction',
          description: 'Same transaction, but recorded on blockchain',
          blockchain: 'The transaction is announced to everyone in the market. Multiple people verify it\'s valid (Amina has vegetables, Kwame has money). Then it\'s written in everyone\'s permanent record book.',
          benefit: 'Now the transaction is permanent, verified, and can\'t be disputed!'
        }
      ]
    }
  },
  {
    id: 'bf_lesson_3',
    courseId: 'course_001',
    title: 'Blocks and Chains - Visual Explanation',
    type: 'interactive',
    sequence: 3,
    duration: 8,
    content: {
      type: 'block_chain_animation',
      explanation: 'Think of blockchain like connecting beads on a string. Each bead (block) contains multiple transactions and is permanently connected to the previous bead.',
      concept: 'blocks_visual'
    }
  },
  {
    id: 'bf_lesson_4',
    courseId: 'course_001',
    title: 'Decentralization - Power to the People',
    type: 'text',
    sequence: 4,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'What is Decentralization?',
          text: 'In traditional systems, one organization controls everything - like a bank controlling all your money. In blockchain, no single person or organization is in charge.',
          emoji: '🌍'
        },
        {
          heading: 'The Ubuntu Philosophy',
          text: 'There\'s an African philosophy called Ubuntu - "I am because we are." Blockchain embodies this - the network exists because many people participate and verify transactions together.',
          emoji: '🤝'
        },
        {
          heading: 'Real-World Benefits for Africa',
          list: [
            '**Send money across borders** - Without expensive Western Union fees',
            '**Prove ownership** - Land titles that can\'t be forged or "lost"',
            '**Access finance** - Even without a bank account or government ID',
            '**Transparent elections** - Voting records that can\'t be manipulated',
            '**Aid distribution** - Track donations to ensure they reach the right people'
          ]
        },
        {
          heading: 'Breaking Down Barriers',
          text: 'For too long, Africans have been excluded from global financial systems. Blockchain technology gives us direct access - all you need is a smartphone and internet connection.',
          emoji: '📱'
        }
      ]
    }
  },
  {
    id: 'bf_lesson_5',
    courseId: 'course_001',
    title: 'Understanding Cryptocurrency',
    type: 'interactive',
    sequence: 5,
    duration: 7,
    content: {
      type: 'mobile_money_comparison',
      explanation: 'Cryptocurrency is digital money that runs on blockchain. Let\'s compare it to mobile money you might already use.',
      comparison: [
        {
          aspect: 'Who Controls It',
          mobileMoney: 'Safaricom, MTN, Airtel - they can freeze accounts',
          crypto: 'No one - only you control your wallet'
        },
        {
          aspect: 'Transaction Fees',
          mobileMoney: '1-5% per transaction',
          crypto: 'Much lower, sometimes less than $0.01'
        },
        {
          aspect: 'Cross-Border Transfers',
          mobileMoney: 'Expensive, slow, often impossible',
          crypto: 'Same cost anywhere, arrives in minutes'
        },
        {
          aspect: 'Account Requirements',
          mobileMoney: 'Need SIM card, ID, registration',
          crypto: 'Just download a wallet app'
        },
        {
          aspect: 'Transparency',
          mobileMoney: 'Only you and company see transactions',
          crypto: 'All transactions publicly viewable (but anonymous)'
        }
      ]
    }
  },
  {
    id: 'bf_lesson_6',
    courseId: 'course_001',
    title: 'Blockchain Knowledge Quiz',
    type: 'quiz',
    sequence: 7,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What makes blockchain different from a traditional bank database?',
          options: [
            'It\'s faster',
            'It\'s controlled by one company',
            'Everyone has a copy and no one can change past records',
            'It\'s only for rich people'
          ],
          correctAnswer: 2,
          explanation: 'Blockchain is distributed - everyone has a copy of the records, and once written, they can\'t be changed. This is different from a bank where only they control the database.'
        },
        {
          question: 'Why is blockchain compared to a village ledger?',
          options: [
            'Because it\'s old-fashioned',
            'Because everyone can see and verify transactions',
            'Because it\'s only for villages',
            'Because it\'s written on paper'
          ],
          correctAnswer: 1,
          explanation: 'Like a village ledger that everyone keeps a copy of, blockchain is a shared record that everyone can see and verify, making it trustworthy.'
        },
        {
          question: 'What does "decentralized" mean?',
          options: [
            'Everything is in the center',
            'Only one person is in charge',
            'No single person or organization controls it',
            'It\'s very complicated'
          ],
          correctAnswer: 2,
          explanation: 'Decentralized means there\'s no central authority - the network is maintained by many participants working together.'
        },
        {
          question: 'How can blockchain help Africans specifically?',
          options: [
            'It can\'t - it\'s only for developed countries',
            'Send money cheaply, prove ownership, access finance without banks',
            'Only by making people rich quickly',
            'It replaces mobile money completely'
          ],
          correctAnswer: 1,
          explanation: 'Blockchain provides financial inclusion, cheaper cross-border payments, proof of ownership, and access to global financial systems - especially important in areas with limited banking infrastructure.'
        }
      ]
    }
  },
  {
    id: 'bf_lesson_7',
    courseId: 'course_001',
    title: 'Introduction to Hedera',
    type: 'text',
    sequence: 6,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'What is Hedera?',
          text: 'Hedera is a modern blockchain network that\'s faster, cheaper, and more energy-efficient than older blockchains like Bitcoin or Ethereum.',
          emoji: 'ⓗ'
        },
        {
          heading: 'Why Hedera is Good for Africa',
          list: [
            '**Very Low Fees** - Transactions cost less than $0.01',
            '**Fast** - Transactions confirmed in 3-5 seconds',
            '**Eco-Friendly** - Uses very little electricity (important for sustainable development)',
            '**Fair** - Everyone has equal chance, no mining monopolies',
            '**Governed by Global Companies** - Google, IBM, Boeing ensure it stays reliable'
          ]
        },
        {
          heading: 'Real Use Cases',
          text: 'Hedera is already being used for real-world applications:',
          list: [
            'Digital identity for refugees',
            'Supply chain tracking to prevent fake products',
            'Micropayments for content creators',
            'Carbon credit tracking'
          ]
        },
        {
          heading: 'Your Journey Starts Here',
          text: 'In the next courses, you\'ll learn how to build applications on Hedera and be part of Africa\'s blockchain revolution!',
          emoji: '🚀'
        }
      ]
    }
  }
];

// Understanding Transactions Course (Explorer - Beginner)
export const understandingTransactionsLessons: LessonContent[] = [
  {
    id: 'ut_lesson_1',
    courseId: 'course_009',
    title: 'What is a Transaction?',
    type: 'text',
    sequence: 1,
    duration: 5,
    content: {
      sections: [
        {
          heading: 'Understanding Blockchain Transactions',
          text: 'A blockchain transaction is like sending mobile money, but instead of going through MTN or Safaricom, it goes directly through a global network that anyone can verify.',
          emoji: '💸'
        },
        {
          heading: 'What Happens in a Transaction?',
          list: [
            '**Sender** - You initiate the transfer from your wallet',
            '**Recipient** - The person or address receiving the funds',
            '**Amount** - How much cryptocurrency you\'re sending',
            '**Fee** - Small payment to process the transaction',
            '**Signature** - Your digital proof that you authorize this'
          ]
        },
        {
          heading: 'Comparing to What You Know',
          text: 'When you send mobile money, the telecom company records it in their private database. With blockchain, the transaction is recorded on a public ledger that everyone can see (but your identity stays private).',
          emoji: '📱'
        }
      ]
    }
  },
  {
    id: 'ut_lesson_2',
    courseId: 'course_009',
    title: 'Transaction Journey',
    type: 'interactive',
    sequence: 2,
    duration: 8,
    content: {
      type: 'transaction_flow'
    }
  },
  {
    id: 'ut_lesson_3',
    courseId: 'course_009',
    title: 'Transaction Fees Explained',
    type: 'text',
    sequence: 3,
    duration: 5,
    content: {
      sections: [
        {
          heading: 'Why Do Fees Exist?',
          text: 'Transaction fees pay the network validators who process and secure your transaction. Unlike banks that charge high percentages, blockchain fees are usually very small.',
          emoji: '💰'
        },
        {
          heading: 'Hedera Fee Comparison',
          list: [
            '**Bank Transfer** - Often 500-2000 Naira for local transfers',
            '**Western Union** - 5-15% of the amount you send',
            '**Mobile Money** - 1-5% depending on amount',
            '**Hedera** - Less than $0.01 (about 4 Naira) regardless of amount!'
          ]
        },
        {
          heading: 'Fee Benefits in Africa',
          text: 'For Africans sending money across borders or making micropayments, these tiny fees are revolutionary. You can send $1 or $1000 for the same tiny fee - this opens up new possibilities for small businesses and remittances.',
          emoji: '🌍'
        }
      ]
    }
  },
  {
    id: 'ut_lesson_4',
    courseId: 'course_009',
    title: 'Transaction States',
    type: 'text',
    sequence: 4,
    duration: 4,
    content: {
      sections: [
        {
          heading: 'Pending',
          text: 'Your transaction has been broadcast to the network and is waiting to be processed. On Hedera, this usually lasts only 2-5 seconds!',
          emoji: '⏳'
        },
        {
          heading: 'Confirmed',
          text: 'The network has verified and recorded your transaction. It\'s now permanent on the blockchain - it cannot be reversed or deleted.',
          emoji: '✅'
        },
        {
          heading: 'Failed',
          text: 'Something went wrong - maybe insufficient balance, wrong address format, or network error. Your funds are returned minus the small fee.',
          emoji: '❌'
        },
        {
          heading: 'Irreversibility',
          text: 'Once confirmed, blockchain transactions CANNOT be reversed. This is different from banks or mobile money. Always double-check the recipient address before sending!',
          emoji: '⚠️'
        }
      ]
    }
  },
  {
    id: 'ut_lesson_5',
    courseId: 'course_009',
    title: 'Transaction Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What is the main difference between a blockchain transaction and mobile money transfer?',
          options: [
            'Blockchain is slower',
            'Blockchain transactions are recorded on a public ledger, not a company\'s private database',
            'Mobile money is cheaper',
            'You need a bank account for blockchain'
          ],
          correctAnswer: 1,
          explanation: 'Blockchain transactions are recorded on a public, decentralized ledger that anyone can verify, unlike mobile money which is controlled by a single company with a private database.'
        },
        {
          question: 'How much does a typical Hedera transaction cost?',
          options: [
            'About $10',
            '5% of the amount sent',
            'Less than $0.01',
            'Free'
          ],
          correctAnswer: 2,
          explanation: 'Hedera transactions cost less than $0.01, making it much cheaper than traditional money transfer services that charge percentages or high fixed fees.'
        },
        {
          question: 'Can you reverse a blockchain transaction after it\'s confirmed?',
          options: [
            'Yes, within 24 hours',
            'Yes, if you contact support',
            'No, it\'s permanent',
            'Only if both parties agree'
          ],
          correctAnswer: 2,
          explanation: 'Once a blockchain transaction is confirmed, it\'s permanent and cannot be reversed. This is why it\'s crucial to double-check all details before sending.'
        },
        {
          question: 'What do transaction fees pay for?',
          options: [
            'The company\'s profit',
            'Network validators who process and secure the transaction',
            'Marketing costs',
            'Customer support'
          ],
          correctAnswer: 1,
          explanation: 'Transaction fees compensate the network validators who process, verify, and secure your transaction on the blockchain.'
        }
      ]
    }
  },
  {
    id: 'ut_lesson_6',
    courseId: 'course_009',
    title: 'Your First Real Transaction',
    type: 'practical',
    sequence: 6,
    duration: 10,
    content: {
      title: 'Send Your First Blockchain Transaction',
      description: 'Now it\'s time to put your knowledge into practice! You\'ll connect your wallet and send a real transaction on the Hedera testnet.',
      objective: 'Successfully submit a transaction to the Hedera testnet, track its confirmation, and view it on HashScan explorer.',
      steps: [
        'Connect your crypto wallet to the platform',
        'Review the transaction details carefully',
        'Submit the transaction and wait for network confirmation',
        'View your confirmed transaction on HashScan blockchain explorer',
        'Earn your "First Transaction" achievement badge!'
      ],
      transactionAmount: 0.1,
      successMessage: 'Congratulations! You\'ve Sent Your First Blockchain Transaction!',
      tips: [
        'This transaction uses testnet HBAR, which has no real monetary value',
        'The entire process takes only 3-5 seconds on Hedera',
        'You can view all transaction details on the HashScan explorer',
        'Your wallet will ask you to confirm the transaction - this is normal and keeps you safe'
      ]
    }
  }
];

export function getLessonsForCourse(courseId: string): LessonContent[] {
  if (courseId === 'course_001') return blockchainFundamentalsLessons;
  if (courseId === 'course_004') return walletSecurityLessons;
  if (courseId === 'course_009') return understandingTransactionsLessons;
  if (courseId === 'course_010') return nftBeginnerLessons;
  if (courseId === 'course_011') return nftIntermediateLessons;
  if (courseId === 'course_012') return nftAdvancedLessons;
  if (courseId === 'course_013') return introDAppsLessons;
  if (courseId === 'course_014') return testnetLessons;
  if (courseId === 'course_015') return previewnetLessons;
  if (courseId === 'course_016') return mainnetLessons;
  if (courseId === 'course_017') return devnetLessons;
  if (courseId === 'course_018') return dappInteractionLessons;
  if (courseId === 'course_019') return blockchainExplorersLessons;
  
  // New Explorer Track Courses (020-044)
  if (courseId === 'course_020') return crossBorderPaymentsLessons;
  if (courseId === 'course_021') return avoidingScamsLessons;
  if (courseId === 'course_022') return stablecoinsLessons;
  if (courseId === 'course_023') return mobileMoneyToCryptoLessons;
  if (courseId === 'course_024') return privateKeysOwnershipLessons;
  if (courseId === 'course_025') return defiBasicsLessons;
  if (courseId === 'course_026') return dexLessons;
  if (courseId === 'course_027') return cryptoTaxesLessons;
  if (courseId === 'course_028') return hederaConsensusLessons;
  if (courseId === 'course_029') return web3CareersLessons;
  if (courseId === 'course_030') return cryptocurrencyBasicsLessons;
  if (courseId === 'course_031') return digitalIdentityLessons;
  if (courseId === 'course_032') return daoLessons;
  if (courseId === 'course_033') return blockchainGamingLessons;
  if (courseId === 'course_034') return readingChartsLessons;
  if (courseId === 'course_035') return cryptoExchangesLessons;
  if (courseId === 'course_036') return hederaCouncilLessons;
  if (courseId === 'course_037') return hederaUseCasesLessons;
  if (courseId === 'course_038') return consensusMechanismsLessons;
  if (courseId === 'course_039') return layer1vs2Lessons;
  if (courseId === 'course_040') return smartContractBasicsLessons;
  if (courseId === 'course_041') return tokenomicsLessons;
  if (courseId === 'course_042') return cryptoCommunitiesLessons;
  if (courseId === 'course_043') return advancedSecurityLessons;
  if (courseId === 'course_044') return earningYieldLessons;
  
  return [];
}
