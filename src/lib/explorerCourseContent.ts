// Explorer track course content - Part 2
import { LessonContent } from './courseContent';

// NFT Advanced Course Lessons  (course_012)
export const nftAdvancedLessons: LessonContent[] = [
  {
    id: 'nfta_lesson_1',
    courseId: 'course_012',
    title: 'NFT Standards and Metadata',
    type: 'text',
    sequence: 1,
    duration: 7,
    content: {
      sections: [
        {
          heading: 'Understanding NFT Standards',
          text: 'NFT standards are like rules that ensure NFTs work across different platforms. On Ethereum, it\'s ERC-721 and ERC-1155. On Hedera, NFTs use the Token Service with specific configurations.',
          emoji: '📋'
        },
        {
          heading: 'What is Metadata?',
          text: 'Metadata is the information about your NFT - its name, description, image, properties, etc. This data is usually stored as JSON (a structured text format).',
          list: [
            '**Name** - "African Sunset #42"',
            '**Description** - Details about the artwork',
            '**Image URL** - Link to the actual image file',
            '**Properties** - Rarity traits, attributes, etc.',
            '**Creator** - Who made it'
          ]
        },
        {
          heading: 'Storage Solutions',
          text: 'The actual image isn\'t stored on the blockchain (too expensive!). Instead, it\'s stored on IPFS (decentralized storage) or Arweave, and the blockchain only stores the link.',
          emoji: '💾'
        },
        {
          heading: 'Why This Matters',
          text: 'Understanding metadata helps you verify NFT authenticity and determine if an NFT is properly configured for long-term preservation.',
          emoji: '🔍'
        }
      ]
    }
  },
  {
    id: 'nfta_lesson_2',
    courseId: 'course_012',
    title: 'Smart Contracts in NFTs',
    type: 'text',
    sequence: 2,
    duration: 8,
    content: {
      sections: [
        {
          heading: 'NFTs Are Smart Contracts',
          text: 'Every NFT collection is actually a smart contract - a program on the blockchain that defines the rules for the NFTs.',
          emoji: '⚙️'
        },
        {
          heading: 'What Smart Contracts Control',
          list: [
            '**Minting Rules** - How many NFTs can be created',
            '**Transfer Rules** - Can they be sold? Gifted?',
            '**Royalty Enforcement** - Automatic payments to creators',
            '**Utility Features** - What benefits NFT holders get',
            '**Access Control** - Who can mint or manage the collection'
          ]
        },
        {
          heading: 'Reading Smart Contracts',
          text: 'On a blockchain explorer, you can view an NFT\'s smart contract to understand its rules. Look for verified contracts with clear, audited code.',
          emoji: '📖'
        },
        {
          heading: 'African Use Case',
          text: 'A Kenyan cooperative could create NFTs representing coffee farm shares. The smart contract automatically distributes profits to NFT holders when coffee sells!',
          emoji: '☕'
        }
      ]
    }
  },
  {
    id: 'nfta_lesson_3',
    courseId: 'course_012',
    title: 'NFT Metadata Deep Dive',
    type: 'interactive',
    sequence: 3,
    duration: 12,
    content: {
      type: 'nft_metadata'
    }
  },
  {
    id: 'nfta_lesson_4',
    courseId: 'course_012',
    title: 'Advanced NFT Use Cases',
    type: 'text',
    sequence: 4,
    duration: 7,
    content: {
      sections: [
        {
          heading: 'Beyond Digital Art',
          text: 'NFTs are expanding far beyond art into practical applications:',
          emoji: '🚀'
        },
        {
          heading: 'Real-World Applications',
          list: [
            '**Ticketing** - Concert tickets that can\'t be counterfeited',
            '**Supply Chain** - Track products from factory to customer',
            '**Gaming** - Own your in-game items and trade them',
            '**Real Estate** - Digital deeds and fractional ownership',
            '**Identity** - Portable digital credentials',
            '**Membership** - Exclusive clubs and communities'
          ]
        },
        {
          heading: 'Dynamic NFTs',
          text: 'Some NFTs change based on conditions - like a tree NFT that grows over time, or a sports card that updates with player stats!',
          emoji: '🌱'
        },
        {
          heading: 'African Innovation Opportunity',
          text: 'Africa can leapfrog traditional systems: land registries using NFTs, educational credentials on blockchain, supply chain tracking for exports like cocoa and coffee.',
          emoji: '🌍'
        }
      ]
    }
  },
  {
    id: 'nfta_lesson_5',
    courseId: 'course_012',
    title: 'Advanced NFT Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'Where is the actual image of an NFT typically stored?',
          options: [
            'On the blockchain',
            'On IPFS or Arweave with link on blockchain',
            'On the marketplace website',
            'In your wallet'
          ],
          correctAnswer: 1,
          explanation: 'NFT images are stored on decentralized storage like IPFS or Arweave because storing large files directly on blockchain is too expensive. The blockchain only stores the link.'
        },
        {
          question: 'What is NFT metadata?',
          options: [
            'The price of the NFT',
            'Information about the NFT (name, description, properties)',
            'The owner\'s address',
            'The blockchain it\'s on'
          ],
          correctAnswer: 1,
          explanation: 'Metadata is structured information about the NFT including its name, description, image link, and properties - usually stored as JSON.'
        },
        {
          question: 'Can NFTs represent real-world assets?',
          options: [
            'No, only digital art',
            'Yes, including property deeds, tickets, and credentials',
            'Only in video games',
            'Only for wealthy people'
          ],
          correctAnswer: 1,
          explanation: 'NFTs can represent any unique asset, both digital and physical - from art to property deeds to concert tickets to educational certificates.'
        }
      ]
    }
  }
];

// Introduction to DApps Course (course_013)
export const introDAppsLessons: LessonContent[] = [
  {
    id: 'dapp_lesson_1',
    courseId: 'course_013',
    title: 'What Are DApps?',
    type: 'text',
    sequence: 1,
    duration: 5,
    content: {
      sections: [
        {
          heading: 'DApp = Decentralized Application',
          text: 'A DApp is an application that runs on a blockchain network instead of company-owned servers. Think of it as an app where no single company is in control.',
          emoji: '📱'
        },
        {
          heading: 'Key Differences from Regular Apps',
          list: [
            '**No Central Server** - Runs on blockchain network',
            '**Open Source** - Code is transparent and verifiable',
            '**Permissionless** - Anyone can use without approval',
            '**Permanent** - Can\'t be shut down by any company',
            '**You Own Your Data** - Not stored in company databases'
          ]
        },
        {
          heading: 'Why DApps Matter in Africa',
          text: 'Many Africans have experienced apps being blocked, accounts frozen, or services withdrawn. DApps can\'t be shut down by governments or companies - they keep running as long as the blockchain exists.',
          emoji: '🌍'
        }
      ]
    }
  },
  {
    id: 'dapp_lesson_2',
    courseId: 'course_013',
    title: 'Traditional Apps vs DApps',
    type: 'interactive',
    sequence: 2,
    duration: 10,
    content: {
      type: 'dapp_demo'
    }
  },
  {
    id: 'dapp_lesson_3',
    courseId: 'course_013',
    title: 'Popular DApp Categories',
    type: 'text',
    sequence: 3,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'DeFi (Decentralized Finance)',
          text: 'Lending, borrowing, trading without banks. Examples: SaucerSwap on Hedera, Aave, Uniswap.',
          emoji: '💰'
        },
        {
          heading: 'NFT Marketplaces',
          text: 'Buy, sell, create NFTs. Examples: Zuse Market, HashAxis, OpenSea.',
          emoji: '🎨'
        },
        {
          heading: 'Gaming & Metaverse',
          text: 'Play games where you truly own your items. Examples: Axie Infinity, Decentraland.',
          emoji: '🎮'
        },
        {
          heading: 'Social & Communication',
          text: 'Social media where you own your content and data. Examples: Lens Protocol, Farcaster.',
          emoji: '💬'
        },
        {
          heading: 'DAOs (Organizations)',
          text: 'Community-run organizations with transparent voting. Used for everything from investment clubs to cooperatives.',
          emoji: '🏛️'
        }
      ]
    }
  },
  {
    id: 'dapp_lesson_4',
    courseId: 'course_013',
    title: 'DApps Quiz',
    type: 'quiz',
    sequence: 4,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What makes a DApp different from a regular app?',
          options: [
            'It costs more money',
            'It runs on blockchain instead of company servers',
            'It\'s only for crypto traders',
            'It has better graphics'
          ],
          correctAnswer: 1,
          explanation: 'DApps run on decentralized blockchain networks instead of centralized company servers, making them resistant to censorship and single points of failure.'
        },
        {
          question: 'Can a government or company shut down a DApp?',
          options: [
            'Yes, easily',
            'Yes, but only with permission',
            'No, DApps run on decentralized networks',
            'Only if they want to'
          ],
          correctAnswer: 2,
          explanation: 'DApps run on decentralized networks with no central control point, making them very difficult to shut down or censor.'
        },
        {
          question: 'What is a key benefit of DApps for African users?',
          options: [
            'They make you rich quickly',
            'They\'re immune to censorship and account freezing',
            'They\'re free to use',
            'They don\'t need internet'
          ],
          correctAnswer: 1,
          explanation: 'DApps can\'t be shut down or have user accounts frozen by companies or governments, providing reliable access to services regardless of political or corporate decisions.'
        }
      ]
    }
  }
];

// Understanding Testnet (course_014)
export const testnetLessons: LessonContent[] = [
  {
    id: 'test_lesson_1',
    courseId: 'course_014',
    title: 'What is Testnet?',
    type: 'text',
    sequence: 1,
    duration: 5,
    content: {
      sections: [
        {
          heading: 'Your Practice Blockchain',
          text: 'Testnet is a version of Hedera where you can practice everything - sending transactions, creating tokens, using DApps - all without spending real money!',
          emoji: '🧪'
        },
        {
          heading: 'Why Testnet Exists',
          text: 'Just like you wouldn\'t drive on a highway before practicing in an empty parking lot, you shouldn\'t use real crypto before practicing on testnet.',
          list: [
            'Learn without financial risk',
            'Test applications before launch',
            'Experiment with new features',
            'Practice wallet operations'
          ]
        },
        {
          heading: 'Test Tokens Are Free',
          text: 'You get free test HBAR from a "faucet" - a service that gives you tokens for practice. These have no real value but work exactly like real HBAR.',
          emoji: '💧'
        }
      ]
    }
  },
  {
    id: 'test_lesson_2',
    courseId: 'course_014',
    title: 'Using Hedera Testnet',
    type: 'text',
    sequence: 2,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'Getting Started on Testnet',
          list: [
            '**Step 1** - Create a Hedera testnet account',
            '**Step 2** - Get free test HBAR from a faucet',
            '**Step 3** - Practice sending transactions',
            '**Step 4** - Try creating tokens or NFTs',
            '**Step 5** - Interact with test DApps'
          ]
        },
        {
          heading: 'What You Can Do on Testnet',
          text: 'Everything! Create accounts, transfer HBAR, mint tokens, deploy smart contracts, create NFTs - all identical to mainnet but risk-free.',
          emoji: '✅'
        },
        {
          heading: 'When to Move to Mainnet',
          text: 'Only after you\'re comfortable with wallets, transactions, and understand the risks. Start with very small amounts on mainnet.',
          emoji: '⚠️'
        },
        {
          heading: 'African Learning Tip',
          text: 'Given internet costs in Africa, practice thoroughly on testnet before using real money on mainnet. Make all your mistakes here - it\'s free!',
          emoji: '💡'
        }
      ]
    }
  },
  {
    id: 'test_lesson_3',
    courseId: 'course_014',
    title: 'Network Comparison Interactive',
    type: 'interactive',
    sequence: 3,
    duration: 10,
    content: {
      type: 'network_comparison'
    }
  },
  {
    id: 'test_lesson_4',
    courseId: 'course_014',
    title: 'Testnet Quiz',
    type: 'quiz',
    sequence: 4,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What is testnet used for?',
          options: [
            'Making real money',
            'Practice and learning without financial risk',
            'Storing valuable NFTs',
            'Competing with mainnet'
          ],
          correctAnswer: 1,
          explanation: 'Testnet is a safe environment to practice blockchain operations without risking real money - perfect for learning and testing.'
        },
        {
          question: 'Do testnet tokens have real value?',
          options: [
            'Yes, worth the same as mainnet',
            'Yes, but less valuable',
            'No, they are only for practice',
            'Sometimes'
          ],
          correctAnswer: 2,
          explanation: 'Testnet tokens have no real monetary value - they exist purely for practice and testing purposes.'
        },
        {
          question: 'When should you start using mainnet?',
          options: [
            'Immediately',
            'After thoroughly practicing on testnet',
            'Never',
            'When you have lots of money'
          ],
          correctAnswer: 1,
          explanation: 'You should only move to mainnet after you\'re comfortable with testnet operations and understand the risks of using real money.'
        }
      ]
    }
  },
  {
    id: 'test_lesson_5',
    courseId: 'course_014',
    title: 'Practice on Testnet',
    type: 'practical',
    sequence: 5,
    duration: 10,
    content: {
      title: 'Your First Testnet Transaction',
      description: 'Put your testnet knowledge into action! Send a real transaction on Hedera\'s testnet - completely risk-free.',
      objective: 'Experience the full transaction lifecycle on testnet: connect wallet, submit transaction, wait for confirmation, and verify on HashScan.',
      steps: [
        'Connect your wallet to the Hedera testnet',
        'Review transaction details (no real money involved!)',
        'Sign and submit your testnet transaction',
        'Watch real-time confirmation on the network',
        'Explore your transaction on HashScan testnet explorer'
      ],
      transactionAmount: 0.5,
      successMessage: 'Perfect! You\'ve Mastered Testnet Transactions!',
      tips: [
        'Testnet HBAR is completely free - use the faucet to get more anytime',
        'Everything works exactly like mainnet, but with zero financial risk',
        'Practice as many times as you want - mistakes are free here!',
        'This is the perfect place to build confidence before using real crypto'
      ]
    }
  }
];

// Understanding PreviewNet (course_015)
export const previewnetLessons: LessonContent[] = [
  {
    id: 'preview_lesson_1',
    courseId: 'course_015',
    title: 'What is PreviewNet?',
    type: 'text',
    sequence: 1,
    duration: 5,
    content: {
      sections: [
        {
          heading: 'The Beta Testing Network',
          text: 'PreviewNet is where Hedera tests new features before launching them on mainnet. It\'s like a sneak preview of what\'s coming!',
          emoji: '👀'
        },
        {
          heading: 'Why PreviewNet Matters',
          text: 'When Hedera develops new capabilities - like improved smart contracts or new token features - they test them on PreviewNet first. This ensures everything works perfectly before going live with real money.',
          emoji: '🔬'
        },
        {
          heading: 'Who Uses PreviewNet?',
          list: [
            'Advanced developers testing upcoming features',
            'Early adopters wanting to try new capabilities',
            'Beta testers helping find bugs',
            'Project teams preparing for mainnet upgrades'
          ]
        },
        {
          heading: 'Key Difference from Testnet',
          text: 'Testnet mirrors current mainnet features. PreviewNet showcases FUTURE features. Both use free test tokens.',
          emoji: '🆚'
        }
      ]
    }
  },
  {
    id: 'preview_lesson_2',
    courseId: 'course_015',
    title: 'Network Comparison',
    type: 'interactive',
    sequence: 2,
    duration: 10,
    content: {
      type: 'network_comparison'
    }
  },
  {
    id: 'preview_lesson_3',
    courseId: 'course_015',
    title: 'PreviewNet Quiz',
    type: 'quiz',
    sequence: 3,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What is the main purpose of PreviewNet?',
          options: [
            'To replace mainnet',
            'To test new features before mainnet launch',
            'To make money',
            'To compete with testnet'
          ],
          correctAnswer: 1,
          explanation: 'PreviewNet is specifically for testing upcoming Hedera features before they are released on mainnet.'
        },
        {
          question: 'What kind of tokens does PreviewNet use?',
          options: [
            'Real HBAR worth money',
            'Free test tokens with no value',
            'Bitcoin',
            'Expensive premium tokens'
          ],
          correctAnswer: 1,
          explanation: 'Like testnet, PreviewNet uses free test tokens that have no real monetary value.'
        },
        {
          question: 'Who should use PreviewNet?',
          options: [
            'Complete beginners',
            'Advanced developers and early adopters',
            'Only Hedera employees',
            'No one'
          ],
          correctAnswer: 1,
          explanation: 'PreviewNet is best for advanced developers and early adopters who want to test and prepare for upcoming features.'
        }
      ]
    }
  }
];

// Understanding Mainnet (course_016)
export const mainnetLessons: LessonContent[] = [
  {
    id: 'main_lesson_1',
    courseId: 'course_016',
    title: 'What is Mainnet?',
    type: 'text',
    sequence: 1,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'The Real Deal',
          text: 'Mainnet is the production Hedera network - where real transactions happen with real cryptocurrency. This is NOT practice - this is the real thing!',
          emoji: '🌍'
        },
        {
          heading: 'Real Money, Real Consequences',
          text: 'On mainnet, HBAR costs real money. Transactions are permanent and cannot be undone. There are no do-overs or resets.',
          emoji: '💰'
        },
        {
          heading: 'What Happens on Mainnet',
          list: [
            'Real financial transactions',
            'Live DApp operations',
            'Actual NFT trading',
            'Production smart contracts',
            'Real business operations'
          ]
        },
        {
          heading: 'When to Use Mainnet',
          text: 'Only use mainnet when you\'re confident, have practiced on testnet, understand the risks, and are ready to use real money. Start with very small amounts!',
          emoji: '⚠️'
        },
        {
          heading: 'African Business Opportunity',
          text: 'Mainnet enables African businesses to receive payments globally, send remittances cheaply, and participate in the global digital economy without traditional banking barriers.',
          emoji: '🌍'
        }
      ]
    }
  },
  {
    id: 'main_lesson_2',
    courseId: 'course_016',
    title: 'Network Comparison',
    type: 'interactive',
    sequence: 2,
    duration: 10,
    content: {
      type: 'network_comparison'
    }
  },
  {
    id: 'main_lesson_3',
    courseId: 'course_016',
    title: 'Safety on Mainnet',
    type: 'text',
    sequence: 3,
    duration: 7,
    content: {
      sections: [
        {
          heading: 'Critical Safety Rules',
          emoji: '🔐',
          list: [
            '**Start Small** - Test with tiny amounts first',
            '**Double Check** - Verify addresses before sending',
            '**Secure Wallet** - Use hardware wallet for large amounts',
            '**Backup Seed Phrase** - Store safely in multiple locations',
            '**No Sharing** - NEVER share your seed phrase or private keys'
          ]
        },
        {
          heading: 'Common Mainnet Mistakes',
          text: 'Sending to wrong address (permanent loss), falling for scams, not backing up wallet, using untrusted DApps, investing more than you can afford to lose.',
          emoji: '❌'
        },
        {
          heading: 'Best Practices',
          list: [
            'Research before using any DApp',
            'Keep most funds in cold storage',
            'Use small test transactions first',
            'Stay informed about security threats',
            'Never rush transactions - take your time'
          ]
        },
        {
          heading: 'African Context Warning',
          text: 'In regions with less crypto education, scammers are active. Be extra cautious, verify everything, and never trust promises of guaranteed returns or "get rich quick" schemes.',
          emoji: '⚠️'
        }
      ]
    }
  },
  {
    id: 'main_lesson_4',
    courseId: 'course_016',
    title: 'Mainnet Quiz',
    type: 'quiz',
    sequence: 4,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What makes mainnet different from testnet?',
          options: [
            'Mainnet is slower',
            'Mainnet uses real money and transactions are permanent',
            'Mainnet is only for developers',
            'There is no difference'
          ],
          correctAnswer: 1,
          explanation: 'Mainnet uses real cryptocurrency with real value, and all transactions are permanent and irreversible.'
        },
        {
          question: 'Can you undo a transaction on mainnet?',
          options: [
            'Yes, within 24 hours',
            'Yes, if you contact support',
            'No, transactions are permanent',
            'Only if the recipient agrees'
          ],
          correctAnswer: 2,
          explanation: 'Blockchain transactions on mainnet are permanent and cannot be reversed once confirmed.'
        },
        {
          question: 'What should you do before using mainnet?',
          options: [
            'Jump right in',
            'Practice thoroughly on testnet first',
            'Buy as much crypto as possible',
            'Share your wallet details'
          ],
          correctAnswer: 1,
          explanation: 'You should practice extensively on testnet before using real money on mainnet to understand how everything works safely.'
        }
      ]
    }
  }
];

// Understanding Devnet (course_017)
export const devnetLessons: LessonContent[] = [
  {
    id: 'dev_lesson_1',
    courseId: 'course_017',
    title: 'What is Devnet?',
    type: 'text',
    sequence: 1,
    duration: 5,
    content: {
      sections: [
        {
          heading: 'Your Local Development Environment',
          text: 'Devnet is a local version of Hedera that runs on YOUR computer. It\'s like having your own personal blockchain for development!',
          emoji: '💻'
        },
        {
          heading: 'Why Devnet?',
          list: [
            '**No Internet Needed** - Work offline',
            '**Instant Testing** - No waiting for network',
            '**Complete Control** - Reset anytime',
            '**Private** - Only you can access it',
            '**Free** - No costs at all'
          ]
        },
        {
          heading: 'Perfect for Developers',
          text: 'When building DApps, you need to test constantly. Devnet lets you run thousands of tests instantly without waiting for network confirmation or using test tokens.',
          emoji: '⚡'
        },
        {
          heading: 'Not for Everyone',
          text: 'Devnet is specifically for developers building applications. If you\'re learning to USE blockchain (not build on it), stick with testnet.',
          emoji: '🎯'
        }
      ]
    }
  },
  {
    id: 'dev_lesson_2',
    courseId: 'course_017',
    title: 'Network Comparison',
    type: 'interactive',
    sequence: 2,
    duration: 10,
    content: {
      type: 'network_comparison'
    }
  },
  {
    id: 'dev_lesson_3',
    courseId: 'course_017',
    title: 'Devnet Quiz',
    type: 'quiz',
    sequence: 3,
    duration: 5,
    content: {
      questions: [
        {
          question: 'Where does devnet run?',
          options: [
            'On Hedera\'s servers',
            'On your local computer',
            'In the cloud',
            'On mainnet'
          ],
          correctAnswer: 1,
          explanation: 'Devnet runs locally on your own computer, giving you a private development environment.'
        },
        {
          question: 'Who should primarily use devnet?',
          options: [
            'Complete beginners',
            'Developers building applications',
            'NFT collectors',
            'Crypto traders'
          ],
          correctAnswer: 1,
          explanation: 'Devnet is specifically designed for developers who are building and testing blockchain applications.'
        },
        {
          question: 'What is a key advantage of devnet?',
          options: [
            'It uses real money',
            'It works without internet and provides instant testing',
            'It\'s connected to mainnet',
            'It\'s more secure than mainnet'
          ],
          correctAnswer: 1,
          explanation: 'Devnet runs locally without internet, allowing instant testing and development without network delays.'
        }
      ]
    }
  }
];

// DApp Interaction (course_018)
export const dappInteractionLessons: LessonContent[] = [
  {
    id: 'dappi_lesson_1',
    courseId: 'course_018',
    title: 'Connecting Your Wallet',
    type: 'text',
    sequence: 1,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'How DApps Access Your Wallet',
          text: 'DApps don\'t have direct access to your wallet. Instead, they REQUEST permission to interact with it. You stay in control!',
          emoji: '🔐'
        },
        {
          heading: 'The Connection Process',
          list: [
            '**Step 1** - DApp requests connection',
            '**Step 2** - Your wallet app asks for permission',
            '**Step 3** - You review what access they want',
            '**Step 4** - You approve or reject',
            '**Step 5** - Connection established (if approved)'
          ]
        },
        {
          heading: 'What DApps Can See',
          text: 'When connected, DApps can see your account address and token balances. They CANNOT move your funds without your explicit approval of each transaction.',
          emoji: '👁️'
        },
        {
          heading: 'Safety First',
          text: 'Only connect to DApps you trust. Check the URL carefully (scammers create fake sites). You can disconnect anytime.',
          emoji: '⚠️'
        }
      ]
    }
  },
  {
    id: 'dappi_lesson_2',
    courseId: 'course_018',
    title: 'Wallet Connection Demo',
    type: 'interactive',
    sequence: 2,
    duration: 12,
    content: {
      type: 'wallet_connection'
    }
  },
  {
    id: 'dappi_lesson_3',
    courseId: 'course_018',
    title: 'Approving Transactions',
    type: 'text',
    sequence: 3,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'Transaction Approval Flow',
          text: 'When a DApp wants to make a transaction (like buying an NFT), it sends a request to your wallet. Your wallet shows you the details, and YOU decide to approve or reject.',
          emoji: '✅'
        },
        {
          heading: 'What to Check Before Approving',
          list: [
            '**Transaction Type** - What is it doing?',
            '**Amount** - How much is being sent?',
            '**Recipient** - Where is it going?',
            '**Fees** - What are the gas costs?',
            '**Smart Contract** - Is it from the expected DApp?'
          ]
        },
        {
          heading: 'Red Flags',
          emoji: '🚩',
          list: [
            'Unexpected transaction requests',
            'Amounts that seem wrong',
            'Unknown recipient addresses',
            'Requests for "unlimited" token access',
            'Pressure to approve quickly'
          ]
        },
        {
          heading: 'African Mobile Money Analogy',
          text: 'It\'s like M-Pesa asking you to confirm with your PIN before every transaction. The difference? With DApps, YOU have complete control - no company can override your decision!',
          emoji: '📱'
        }
      ]
    }
  },
  {
    id: 'dappi_lesson_4',
    courseId: 'course_018',
    title: 'DApp Interaction Quiz',
    type: 'quiz',
    sequence: 4,
    duration: 5,
    content: {
      questions: [
        {
          question: 'Can a DApp move your funds without your approval?',
          options: [
            'Yes, once connected',
            'No, you must approve each transaction',
            'Only if you give them your seed phrase',
            'Yes, but only small amounts'
          ],
          correctAnswer: 1,
          explanation: 'DApps can only REQUEST transactions. You must approve each one individually in your wallet - they cannot move funds without your explicit permission.'
        },
        {
          question: 'What should you check before approving a transaction?',
          options: [
            'Just the amount',
            'Amount, recipient, transaction type, and fees',
            'Nothing, just approve',
            'Only the DApp name'
          ],
          correctAnswer: 1,
          explanation: 'Always review the amount, recipient address, what the transaction does, and the fees before approving.'
        },
        {
          question: 'What does "unlimited token approval" mean?',
          options: [
            'Free tokens',
            'The DApp can spend unlimited amounts of that token',
            'Unlimited transactions',
            'It\'s always safe'
          ],
          correctAnswer: 1,
          explanation: 'Unlimited approval lets the DApp spend any amount of that token without asking again. Only approve this for trusted DApps and consider revoking it after use.'
        }
      ]
    }
  }
];

// Understanding Blockchain Explorers (course_019)
export const blockchainExplorersLessons: LessonContent[] = [
  {
    id: 'explore_lesson_1',
    courseId: 'course_019',
    title: 'What is a Blockchain Explorer?',
    type: 'text',
    sequence: 1,
    duration: 5,
    content: {
      sections: [
        {
          heading: 'Your Window into the Blockchain',
          text: 'A blockchain explorer is like Google for blockchain - it lets you search for and view any transaction, account, or token on the network.',
          emoji: '🔍'
        },
        {
          heading: 'Why Explorers Matter',
          text: 'Blockchain promises transparency. Explorers make that transparency accessible - you can verify ANY transaction or check ANY account balance.',
          emoji: '👁️'
        },
        {
          heading: 'Hedera\'s Explorer: HashScan',
          text: 'HashScan (hashscan.io) is the main blockchain explorer for Hedera. It works for testnet, previewnet, and mainnet.',
          emoji: '🔎'
        },
        {
          heading: 'What You Can Look Up',
          list: [
            'Transaction details and status',
            'Account balances and history',
            'Token information and transfers',
            'NFT collections and ownership',
            'Smart contract interactions',
            'Network statistics'
          ]
        }
      ]
    }
  },
  {
    id: 'explore_lesson_2',
    courseId: 'course_019',
    title: 'Explorer Tutorial',
    type: 'interactive',
    sequence: 2,
    duration: 15,
    content: {
      type: 'explorer_guide'
    }
  },
  {
    id: 'explore_lesson_3',
    courseId: 'course_019',
    title: 'Practical Uses',
    type: 'text',
    sequence: 3,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'Verify Transactions',
          text: 'After sending money, paste the transaction ID into the explorer to confirm it went through and see exactly when it was confirmed.',
          emoji: '✅'
        },
        {
          heading: 'Check Before You Trust',
          text: 'Before using a DApp or buying an NFT, check the explorer to see how active it is, how long it\'s existed, and if others are using it.',
          emoji: '🔍'
        },
        {
          heading: 'Audit Token Claims',
          text: 'If someone claims they have 10,000 tokens of something, you can verify it on the explorer. No need to trust - just verify!',
          emoji: '📊'
        },
        {
          heading: 'African Business Use Case',
          text: 'Imagine you\'re doing business with a company in another African country. Before sending goods, check their wallet on the explorer to verify they have the funds they claim!',
          emoji: '🌍'
        },
        {
          heading: 'Track NFT Authenticity',
          text: 'Verify an NFT was created by the real artist by checking the creator\'s account history and comparing it to their known address.',
          emoji: '🎨'
        }
      ]
    }
  },
  {
    id: 'explore_lesson_4',
    courseId: 'course_019',
    title: 'Blockchain Explorer Quiz',
    type: 'quiz',
    sequence: 4,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What can you do with a blockchain explorer?',
          options: [
            'Send transactions',
            'View and verify transactions, accounts, and tokens',
            'Create new tokens',
            'Mine cryptocurrency'
          ],
          correctAnswer: 1,
          explanation: 'Blockchain explorers let you view and verify information on the blockchain but don\'t allow you to send transactions or create tokens.'
        },
        {
          question: 'What is Hedera\'s main blockchain explorer?',
          options: [
            'Etherscan',
            'HashScan',
            'BlockExplorer',
            'HederaScan'
          ],
          correctAnswer: 1,
          explanation: 'HashScan (hashscan.io) is the primary blockchain explorer for the Hedera network.'
        },
        {
          question: 'Why would you use an explorer before buying an NFT?',
          options: [
            'To get a discount',
            'To verify the creator and check the NFT\'s history',
            'It\'s required by law',
            'To make it cheaper'
          ],
          correctAnswer: 1,
          explanation: 'You can use an explorer to verify the NFT was created by the claimed artist and check its ownership history to ensure authenticity.'
        }
      ]
    }
  }
];

// Export all new lessons
export { };
