// New Explorer Track Courses - Part 3 (Courses 025-027)
// Top 10 Priority Courses Continued
import { LessonContent } from './courseContent';

// ==================== COURSE 025: DeFi Basics ====================
export const defiBasicsLessons: LessonContent[] = [
  {
    id: 'defi_lesson_1',
    courseId: 'course_025',
    title: 'What is DeFi?',
    type: 'text',
    sequence: 1,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'Decentralized Finance Explained',
          text: 'DeFi = Financial services WITHOUT banks, loan officers, or middlemen. Everything runs on smart contracts - code that automatically executes when conditions are met.',
          emoji: '🏦'
        },
        {
          heading: 'Traditional Finance Problems in Africa',
          list: [
            '**Bank Requirements** - Need address proof, payslips, minimum deposits',
            '**High Fees** - Banks charge for everything: transfers, withdrawals, maintenance',
            '**Limited Access** - 57% of sub-Saharan Africans are unbanked',
            '**Slow** - International transfers take days',
            '**Discrimination** - Banks reject loans based on informal income'
          ]
        },
        {
          heading: 'DeFi\'s Promise',
          text: 'With just a phone and internet, you can: Save and earn interest, get loans without credit checks, trade currencies, send money globally, invest in projects - all without asking permission from any bank!',
          emoji: '🚀'
        },
        {
          heading: 'How It Works (Simple)',
          text: 'You connect your wallet to a DeFi app (like SaucerSwap on Hedera). The app is just a friendly interface to smart contracts. You approve transactions, smart contracts execute automatically. No humans involved!',
          emoji: '🤖'
        },
        {
          heading: 'Why "Decentralized"?',
          text: 'Traditional: Bank controls your money. DeFi: Code controls money, code is on blockchain, blockchain is controlled by... nobody! It\'s like comparing a king (can do anything) to a constitution (rules everyone follows).',
          emoji: '⚖️'
        }
      ]
    }
  },
  {
    id: 'defi_lesson_2',
    courseId: 'course_025',
    title: 'Core DeFi Concepts',
    type: 'text',
    sequence: 2,
    duration: 8,
    content: {
      sections: [
        {
          heading: '1. Lending & Borrowing',
          text: 'Deposit stablecoins, earn 3-8% interest. Need a loan? Put up crypto collateral (like car title for loan), borrow instantly. No credit check, no loan officer meeting!',
          emoji: '💰'
        },
        {
          heading: 'African Example: Farming Loan',
          text: 'Chinedu needs 500,000 Naira for farming inputs but bank rejected him (informal income). With DeFi: Deposits $1,000 USDC as collateral, borrows $600 USDC, converts to Naira, buys supplies. Pays back after harvest.',
          emoji: '🌾'
        },
        {
          heading: '2. Decentralized Exchanges (DEXs)',
          text: 'Trade crypto without accounts or KYC. SaucerSwap on Hedera lets you swap HBAR for USDC directly from your wallet. Your keys never leave your device!',
          emoji: '🔄'
        },
        {
          heading: '3. Liquidity Pools',
          text: 'Instead of banks having all the money, regular people provide liquidity (add money to pools). When others trade, you earn fees! Like being the forex bureau instead of the customer.',
          emoji: '💧'
        },
        {
          heading: 'How Liquidity Pools Work',
          text: 'Aisha deposits 1000 HBAR + $100 USDC into HBAR/USDC pool. Now when traders swap between HBAR and USDC, they pay 0.3% fee. Aisha earns portion of ALL fees as passive income!',
          emoji: '📊'
        },
        {
          heading: '4. Yield Farming',
          text: 'Move your crypto between different DeFi protocols to maximize returns. Advanced users earn 10-50% APY. Beginners should start simple with single-asset staking.',
          emoji: '🚜'
        },
        {
          heading: '5. Stablecoins in DeFi',
          text: 'Most DeFi uses stablecoins (USDC, USDT) to avoid volatility. Earn 5% on USDC vs losing 15% to Naira inflation? Clear choice!',
          emoji: '💵'
        }
      ]
    }
  },
  {
    id: 'defi_lesson_3',
    courseId: 'course_025',
    title: 'DeFi Risks to Understand',
    type: 'text',
    sequence: 3,
    duration: 6,
    content: {
      sections: [
        {
          heading: '⚠️ Smart Contract Risk',
          text: 'Code has bugs. If smart contract has vulnerability, hackers can drain funds. Use audited protocols only (like SaucerSwap - audited by Hashgraph).',
          emoji: '⚠️'
        },
        {
          heading: '💸 Impermanent Loss',
          text: 'Providing liquidity can result in impermanent loss if prices change. Advanced concept - beginners should stick to staking single assets.',
          emoji: '💸'
        },
        {
          heading: '🎣 Rug Pulls',
          text: 'Scam projects where developers drain liquidity pool and disappear. How to avoid: Use established protocols, check if liquidity is "locked", read community reviews.',
          emoji: '🎣'
        },
        {
          heading: '🏦 No Deposit Insurance',
          text: 'Banks have deposit insurance (up to certain amount). DeFi? Zero insurance. If something goes wrong, your money can be lost. Only invest what you can afford to lose!',
          emoji: '🏦'
        },
        {
          heading: '📚 Complexity',
          text: 'DeFi is complex. Wrong transaction = lost funds. Start small! Learn with $10 before using $1000. No shame in being cautious.',
          emoji: '📚'
        },
        {
          heading: '✅ Risk Management',
          list: [
            'Start with tiny amounts to learn',
            'Use well-known protocols only',
            'Never invest more than you can lose',
            'Understand what you\'re doing BEFORE doing it',
            'Keep most funds in simple savings, experiment with small %'
          ]
        }
      ]
    }
  },
  {
    id: 'defi_lesson_4',
    courseId: 'course_025',
    title: 'Explore a DeFi Protocol',
    type: 'practical',
    sequence: 4,
    duration: 12,
    content: {
      title: 'Experience DeFi First-Hand',
      description: 'Connect to a real DeFi protocol and understand how decentralized finance works without intermediaries.',
      objective: 'Successfully interact with a DeFi smart contract and see how it executes automatically.',
      steps: [
        'Connect wallet to simulated DeFi protocol',
        'View available pools and interest rates',
        'Understand the concept of liquidity provision',
        'Simulate providing liquidity or staking',
        'See smart contract execute automatically (no human approval needed)'
      ],
      transactionAmount: 1.0,
      successMessage: 'Welcome to DeFi! You just interacted with a smart contract - no bank required!',
      tips: [
        'This happened instantly - no waiting for bank approval',
        'Smart contract executed automatically based on code',
        'Nobody could stop or censor this transaction',
        'In real DeFi, you would now be earning passive income!'
      ]
    }
  },
  {
    id: 'defi_lesson_5',
    courseId: 'course_025',
    title: 'DeFi Basics Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What makes DeFi "decentralized"?',
          options: [
            'It uses mobile apps',
            'It runs on smart contracts without human intermediaries',
            'It\'s faster than banks',
            'It has lower fees'
          ],
          correctAnswer: 1,
          explanation: 'DeFi is decentralized because smart contracts execute automatically without banks or intermediaries. Code, not humans, controls the financial services.'
        },
        {
          question: 'Why is DeFi potentially revolutionary for Africa?',
          options: [
            'It has better marketing',
            'It provides financial services to the unbanked without traditional requirements',
            'It\'s more expensive',
            'It requires a bank account'
          ],
          correctAnswer: 1,
          explanation: 'DeFi can serve Africa\'s 57% unbanked population by providing financial services without needing bank accounts, credit history, or meeting traditional banking requirements.'
        },
        {
          question: 'What is a major risk of DeFi?',
          options: [
            'Too many banks involved',
            'Government can easily stop it',
            'Smart contract bugs can lead to lost funds',
            'It\'s too slow'
          ],
          correctAnswer: 2,
          explanation: 'Smart contract bugs are a major risk. If code has vulnerabilities, hackers can exploit them and drain funds. Always use audited protocols!'
        },
        {
          question: 'What is a liquidity pool?',
          options: [
            'A swimming pool for crypto',
            'A collection of funds that enables trading and earns fees for providers',
            'A type of wallet',
            'A government program'
          ],
          correctAnswer: 1,
          explanation: 'Liquidity pools are collections of tokens locked in smart contracts. They enable trading on DEXs, and liquidity providers earn fees from trades.'
        }
      ]
    }
  }
];

// ==================== COURSE 026: Understanding DEXs (Decentralized Exchanges) ====================
export const dexLessons: LessonContent[] = [
  {
    id: 'dex_lesson_1',
    courseId: 'course_026',
    title: 'Centralized vs Decentralized Exchanges',
    type: 'text',
    sequence: 1,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'Centralized Exchanges (CEX)',
          text: 'Binance, Coinbase, Luno, Quidax - these are centralized. They hold your crypto (custodial), require KYC, can freeze accounts. Like traditional banks.',
          list: [
            '✅ User-friendly, easy to use',
            '✅ Customer support exists',
            '✅ Can recover passwords',
            '❌ They control your funds',
            '❌ Can freeze your account',
            '❌ KYC requirements',
            '❌ Single point of failure (hacks, collapse)'
          ]
        },
        {
          heading: 'Decentralized Exchanges (DEX)',
          text: 'SaucerSwap (Hedera), Uniswap (Ethereum), PancakeSwap (BSC) - you trade directly from your wallet. No accounts, no KYC, you always control your funds.',
          list: [
            '✅ You control your funds',
            '✅ No KYC required',
            '✅ Cannot freeze your account',
            '✅ Trade directly from wallet',
            '❌ Can\'t recover if you lose seed phrase',
            '❌ No customer support',
            '❌ Slightly more complex'
          ]
        },
        {
          heading: 'How DEXs Work',
          text: 'Instead of order books (like stock exchanges), DEXs use liquidity pools. Automated Market Makers (AMMs) use math formulas to determine prices. No middleman matching buyers/sellers!',
          emoji: '🤖'
        },
        {
          heading: 'African Context',
          text: 'In countries with strict regulations (Nigeria CBN ban), DEXs still work! Government can pressure Binance, but can\'t shut down SaucerSwap. This is true financial freedom.',
          emoji: '🇳🇬'
        }
      ]
    }
  },
  {
    id: 'dex_lesson_2',
    courseId: 'course_026',
    title: 'Understanding Trading on DEXs',
    type: 'text',
    sequence: 2,
    duration: 7,
    content: {
      sections: [
        {
          heading: 'Key Concepts',
          emoji: '📚'
        },
        {
          heading: '1. Slippage',
          text: 'Price difference between when you start transaction and when it completes. Trading 10 HBAR? Small slippage. Trading 10,000 HBAR? More slippage because you\'re affecting pool balance.',
          emoji: '📉'
        },
        {
          heading: 'Slippage Example',
          text: 'You want 100 USDC for your HBAR. High slippage (5%) = might get only 95 USDC. Low slippage (0.1%) = get 99.9 USDC. Set slippage tolerance in DEX settings!',
          emoji: '⚙️'
        },
        {
          heading: '2. Liquidity',
          text: 'How much money is in the pool. More liquidity = less slippage = better prices. SaucerSwap HBAR/USDC pool has millions in liquidity - good for trading!',
          emoji: '💧'
        },
        {
          heading: '3. Price Impact',
          text: 'Your trade\'s effect on price. Buy $100 HBAR? Tiny impact. Buy $100,000 HBAR? Significant impact. Bigger trades need more liquidity to avoid bad prices.',
          emoji: '📊'
        },
        {
          heading: '4. Gas/Transaction Fees',
          text: 'On Ethereum DEXs, gas fees can be $50-200 per swap! On Hedera\'s SaucerSwap? Less than $0.01! This is huge for African traders making small transactions.',
          emoji: '⚡'
        },
        {
          heading: 'Trading Strategy',
          list: [
            'Check liquidity before trading',
            'Set appropriate slippage (0.5-1% usually fine)',
            'Be aware of price impact on large orders',
            'Use DEXs on cheap networks (Hedera!) for small amounts'
          ]
        }
      ]
    }
  },
  {
    id: 'dex_lesson_3',
    courseId: 'course_026',
    title: 'Simulate a DEX Swap',
    type: 'practical',
    sequence: 3,
    duration: 10,
    content: {
      title: 'Experience Decentralized Trading',
      description: 'Make your first decentralized exchange swap and see how trading works without a centralized authority.',
      objective: 'Successfully swap tokens on a simulated DEX interface, understanding slippage and price impact.',
      steps: [
        'Connect your wallet to the DEX interface',
        'Select tokens to swap (HBAR to USDC)',
        'Enter amount and review price quote',
        'Set slippage tolerance',
        'Execute swap and see instant settlement'
      ],
      transactionAmount: 2.0,
      successMessage: 'Congratulations! You just traded on a DEX - nobody could stop or censor this!',
      tips: [
        'This swap happened peer-to-contract, not peer-to-peer',
        'No exchange held your funds at any point',
        'On Hedera, this costs less than $0.01',
        'You maintained custody throughout the entire process'
      ]
    }
  },
  {
    id: 'dex_lesson_4',
    courseId: 'course_026',
    title: 'When to Use CEX vs DEX',
    type: 'text',
    sequence: 4,
    duration: 5,
    content: {
      sections: [
        {
          heading: 'Use Centralized Exchanges For:',
          list: [
            '**Buying crypto with fiat** - Most DEXs don\'t support bank transfers',
            '**Selling crypto to fiat** - Need CEX to get money back to bank',
            '**Customer support** - Problem with account? CEX can help',
            '**Ease of use** - Best for complete beginners'
          ]
        },
        {
          heading: 'Use Decentralized Exchanges For:',
          list: [
            '**Trading between cryptos** - Swap HBAR for USDC directly',
            '**Privacy** - No KYC required',
            '**Regulatory uncertainty** - DEX works even if government bans crypto',
            '**Long-term holding** - Move from CEX to wallet, trade on DEX as needed'
          ]
        },
        {
          heading: 'Recommended Flow',
          text: '1. Buy crypto on CEX (Binance, Luno) using bank transfer. 2. Withdraw to self-custody wallet. 3. Use DEX (SaucerSwap) for swaps. 4. When selling to fiat, send back to CEX.',
          emoji: '🔄'
        },
        {
          heading: 'Never Keep Large Amounts on CEX',
          text: 'Remember FTX, remember Nigerian exchanges that shut down. Buy on CEX, then immediately withdraw to wallet. Only keep on CEX what you\'re actively trading.',
          emoji: '⚠️'
        }
      ]
    }
  },
  {
    id: 'dex_lesson_5',
    courseId: 'course_026',
    title: 'DEX Trading Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What is the main advantage of DEXs over CEXs?',
          options: [
            'Better customer support',
            'You maintain custody of your funds throughout trading',
            'Easier to use',
            'Can recover lost passwords'
          ],
          correctAnswer: 1,
          explanation: 'DEXs let you trade directly from your wallet, maintaining custody throughout. Nobody can freeze your account or hold your funds.'
        },
        {
          question: 'What is slippage in DEX trading?',
          options: [
            'Transaction fee',
            'Difference between expected price and executed price',
            'Time to complete trade',
            'Exchange commission'
          ],
          correctAnswer: 1,
          explanation: 'Slippage is the price difference between when you start a transaction and when it executes. More liquidity and smaller trades mean less slippage.'
        },
        {
          question: 'Why are Hedera DEXs attractive for African users?',
          options: [
            'They require KYC',
            'They have phone support',
            'Ultra-low fees ($0.0001) make small transactions viable',
            'They only work in Africa'
          ],
          correctAnswer: 2,
          explanation: 'Hedera DEXs have fees under $0.01, making them perfect for African users who often make smaller transactions that would be uneconomical on Ethereum ($50+ fees).'
        },
        {
          question: 'What should you do with crypto bought on a centralized exchange?',
          options: [
            'Keep it there indefinitely',
            'Trade it immediately',
            'Withdraw to self-custody wallet for safety',
            'Share your password with support'
          ],
          correctAnswer: 2,
          explanation: 'After buying on CEX, withdraw to self-custody wallet. This protects you from exchange collapse, hacks, or freezes. "Not your keys, not your coins!"'
        }
      ]
    }
  }
];

// ==================== COURSE 027: Crypto Taxes & Regulations ====================
export const cryptoTaxesLessons: LessonContent[] = [
  {
    id: 'tax_lesson_1',
    courseId: 'course_027',
    title: 'Crypto Legal Status in Africa',
    type: 'text',
    sequence: 1,
    duration: 8,
    content: {
      sections: [
        {
          heading: '🇳🇬 Nigeria',
          text: 'Legal status: Legal but restricted. 2021 CBN banned banks from servicing crypto companies. 2023: SEC recognizes crypto as securities. P2P trading thrives. Tax: Gains treated as capital gains (varies by interpretation).',
          emoji: '🇳🇬'
        },
        {
          heading: '🇰🇪 Kenya',
          text: 'Legal status: Not regulated as legal tender. 2023: Capital Markets Authority warning about risks but not banned. Widely used for M-Pesa to crypto. Tax: 30% capital gains tax applies.',
          emoji: '🇰🇪'
        },
        {
          heading: '🇿🇦 South Africa',
          text: 'Legal status: Most progressive! SARS (tax authority) recognizes crypto. Exchanges are regulated. Tax: Crypto assets taxed as income or capital gain depending on use (trading vs investment).',
          emoji: '🇿🇦'
        },
        {
          heading: '🇬🇭 Ghana',
          text: 'Legal status: Legal but not legal tender. Bank of Ghana studying CBDC. SEC regulates exchanges. Tax: Subject to standard income tax and capital gains.',
          emoji: '🇬🇭'
        },
        {
          heading: '🇺🇬 Uganda',
          text: 'Legal status: Legal, not regulated. Bank of Uganda warnings but no bans. Binance operates. Tax: Treated as foreign currency, capital gains apply.',
          emoji: '🇺🇬'
        },
        {
          heading: 'General Trend',
          text: 'Most African countries: Legal but unregulated or lightly regulated. Trend toward regulation (not bans). Always check your specific country\'s latest rules!',
          emoji: '📈'
        }
      ]
    }
  },
  {
    id: 'tax_lesson_2',
    courseId: 'course_027',
    title: 'Understanding Crypto Taxation',
    type: 'text',
    sequence: 2,
    duration: 7,
    content: {
      sections: [
        {
          heading: 'Taxable Events',
          text: 'Generally, these activities trigger taxes:',
          list: [
            '**Selling crypto for fiat** - If you bought HBAR at $0.05 and sold at $0.10, the gain is taxable',
            '**Trading crypto for crypto** - Swapping HBAR for USDC is taxable event in most countries',
            '**Spending crypto** - Buying goods with crypto = selling crypto for tax purposes',
            '**Earning crypto** - Getting paid in crypto, staking rewards, airdrops',
            '**Mining rewards** - If you mine/validate, earnings are taxable'
          ]
        },
        {
          heading: 'NOT Taxable (Usually)',
          list: [
            '**Buying crypto with fiat** - Just acquisition, no gain/loss',
            '**Transferring between your own wallets** - Moving HBAR from Binance to HashPack',
            '**HODLing** - Just holding doesn\'t trigger taxes',
            '**Receiving gifts** (under certain limits)'
          ]
        },
        {
          heading: 'Calculating Gains/Losses',
          text: 'Capital Gain = Selling Price - Purchase Price - Fees. Example: Bought 100 HBAR at $0.05 ($5) + $0.10 fee. Sold at $0.08 ($8) - $0.10 fee. Gain = $8 - $5 - $0.20 = $2.80 taxable gain.',
          emoji: '🧮'
        },
        {
          heading: 'Short-term vs Long-term',
          text: 'Some countries (like US) tax differently based on holding period. South Africa: >3 years may be capital gains (lower tax), <3 years may be income (higher tax). Check your country!',
          emoji: '⏱️'
        },
        {
          heading: 'Record Keeping is CRUCIAL',
          text: 'Tax authorities expect records. Note every trade, transfer, purchase. Use tools like CoinTracking or spreadsheets. In audit, you must prove your numbers!',
          emoji: '📝'
        }
      ]
    }
  },
  {
    id: 'tax_lesson_3',
    courseId: 'course_027',
    title: 'Interactive Tax Calculator',
    type: 'interactive',
    sequence: 3,
    duration: 10,
    content: {
      type: 'tax_calculator'
    }
  },
  {
    id: 'tax_lesson_4',
    courseId: 'course_027',
    title: 'Compliance Best Practices',
    type: 'text',
    sequence: 4,
    duration: 6,
    content: {
      sections: [
        {
          heading: '1. Keep Detailed Records',
          list: [
            'Date and time of every transaction',
            'Amount in crypto and equivalent fiat value at time',
            'Purpose (investment, payment, trade)',
            'Wallet addresses involved',
            'Exchange statements and blockchain records'
          ]
        },
        {
          heading: '2. Use Tracking Tools',
          text: 'CoinTracking, Koinly, CryptoTaxCalculator - sync your wallets and exchanges. They auto-calculate gains/losses and generate tax reports.',
          emoji: '🛠️'
        },
        {
          heading: '3. Declare Income Honestly',
          text: 'Even if government hasn\'t enforced crypto taxes yet, declare it. Tax evasion penalties are severe. Plus, governments are improving blockchain tracking.',
          emoji: '✅'
        },
        {
          heading: '4. Understand Your Country\'s Rules',
          text: 'Tax treatment varies wildly. Nigeria: unclear, often not enforced. South Africa: well-defined, enforced. Kenya: 30% capital gains. Consult local tax accountant familiar with crypto!',
          emoji: '🌍'
        },
        {
          heading: '5. Save Money for Taxes',
          text: 'If you made gains, set aside estimated tax amount. Don\'t spend all your profits! Owing taxes with no cash to pay = big problem.',
          emoji: '💰'
        },
        {
          heading: 'When to Get Professional Help',
          text: 'If you traded frequently, earned significant income, or ran business in crypto - hire crypto-savvy accountant. Cost of accountant < cost of getting taxes wrong!',
          emoji: '👨‍💼'
        }
      ]
    }
  },
  {
    id: 'tax_lesson_5',
    courseId: 'course_027',
    title: 'Crypto Taxes Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'In most African countries, when is crypto trading taxable?',
          options: [
            'Only when selling to fiat currency',
            'Never, crypto is not taxed',
            'When selling to fiat OR trading between cryptocurrencies',
            'Only if you made over $10,000'
          ],
          correctAnswer: 2,
          explanation: 'Most countries consider both selling to fiat AND crypto-to-crypto trades as taxable events. Each trade triggers a potential capital gain or loss.'
        },
        {
          question: 'What is South Africa\'s capital gains tax rate on crypto (as of 2024)?',
          options: [
            '0% - crypto is not taxed',
            'Varies based on income bracket, typically 18-45%',
            '50%',
            'Flat 30%'
          ],
          correctAnswer: 1,
          explanation: 'South Africa taxes crypto as either income or capital gains depending on use. Capital gains inclusion rate is typically 40% of gain, taxed at your marginal rate.'
        },
        {
          question: 'Which activity is generally NOT taxable?',
          options: [
            'Selling Bitcoin for Naira',
            'Trading HBAR for USDC',
            'Transferring crypto between your own wallets',
            'Receiving staking rewards'
          ],
          correctAnswer: 2,
          explanation: 'Transferring crypto between your own wallets is not a taxable event - it\'s just moving your property. No sale or trade occurred.'
        },
        {
          question: 'Why is record-keeping important for crypto taxes?',
          options: [
            'To impress your friends',
            'Tax authorities require proof of purchase prices and dates to calculate gains/losses',
            'It\'s not important',
            'Only for businesses'
          ],
          correctAnswer: 1,
          explanation: 'You must prove your cost basis (purchase price) to calculate gains. Without records, tax authority may assume 100% of sale is profit, resulting in much higher taxes!'
        }
      ]
    }
  }
];
