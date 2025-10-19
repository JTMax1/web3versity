// New Explorer Track Courses - Part 1 (Courses 020-031)
// Top Priority Courses for African Learners
import { LessonContent } from './courseContent';

// ==================== COURSE 020: Cross-Border Payments with Crypto ====================
export const crossBorderPaymentsLessons: LessonContent[] = [
  {
    id: 'cbp_lesson_1',
    courseId: 'course_020',
    title: 'The Remittance Challenge in Africa',
    type: 'text',
    sequence: 1,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'Africa\'s Remittance Reality',
          text: 'Africans sent over $100 billion in remittances in 2024, yet traditional services charge 8-12% in fees. A Nigerian worker in UK sending £500 home loses £50-60 just in fees!',
          emoji: '💸'
        },
        {
          heading: 'Traditional Problems',
          list: [
            '**High Fees** - Western Union charges 5-15% depending on amount and corridor',
            '**Slow Speed** - Can take 2-5 days for money to arrive',
            '**Limited Access** - Rural areas often lack pickup locations',
            '**Exchange Rate Markup** - Hidden fees in unfavorable exchange rates',
            '**Documentation** - Complex ID requirements on both ends'
          ]
        },
        {
          heading: 'Real Example: Lagos to Nairobi',
          text: 'Traditional wire transfer: $100 sent → $12 fees + $3 in exchange markup = $85 received after 3 days. With crypto: $100 sent → $0.50 fees = $99.50 received in 5 seconds!',
          emoji: '🌍'
        },
        {
          heading: 'Why This Matters',
          text: 'For families depending on remittances for food, school fees, and medicine, every shilling matters. Crypto can save 10-15% on every transfer - money that stays with families instead of corporations.',
          emoji: '❤️'
        }
      ]
    }
  },
  {
    id: 'cbp_lesson_2',
    courseId: 'course_020',
    title: 'How Crypto Solves Cross-Border Payments',
    type: 'text',
    sequence: 2,
    duration: 7,
    content: {
      sections: [
        {
          heading: 'The Crypto Advantage',
          text: 'Cryptocurrency doesn\'t recognize borders. Sending HBAR from Ghana to Kenya is identical to sending it across Accra - same speed, same tiny fee.',
          emoji: '⚡'
        },
        {
          heading: 'Key Benefits for Africa',
          list: [
            '**Tiny Fees** - Hedera charges less than $0.01 regardless of amount',
            '**Speed** - Transactions finalize in 3-5 seconds',
            '**24/7 Availability** - No banking hours or holidays',
            '**Direct** - Wallet to wallet, no intermediaries',
            '**Transparent** - See exactly what recipient will get'
          ]
        },
        {
          heading: 'The Process',
          text: 'Step 1: Buy crypto with local currency. Step 2: Send to recipient\'s wallet. Step 3: Recipient converts to their local currency. Total time: Under 10 minutes. Total cost: Under 2%.',
          emoji: '🔄'
        },
        {
          heading: 'Using Stablecoins',
          text: 'For remittances, stablecoins like USDC are perfect. They maintain dollar value, so you don\'t worry about price swings during the transfer. Your $100 stays $100.',
          emoji: '💵'
        },
        {
          heading: 'Real African Solutions',
          text: 'Services like Bitnob in Nigeria, Mara in Kenya, and Valr in South Africa make it easy to convert between crypto and local currency. The infrastructure is here and growing!',
          emoji: '🚀'
        }
      ]
    }
  },
  {
    id: 'cbp_lesson_3',
    courseId: 'course_020',
    title: 'Payment Comparison Interactive',
    type: 'interactive',
    sequence: 3,
    duration: 10,
    content: {
      type: 'payment_comparison'
    }
  },
  {
    id: 'cbp_lesson_4',
    courseId: 'course_020',
    title: 'Send a Cross-Border Payment',
    type: 'practical',
    sequence: 4,
    duration: 10,
    content: {
      title: 'Simulate a Cross-Border Remittance',
      description: 'Experience sending cryptocurrency across borders with the speed and low cost that traditional services can\'t match.',
      objective: 'Successfully send testnet HBAR as if sending remittance from South Africa to Nigeria, tracking the entire journey.',
      steps: [
        'Connect your wallet (representing sender in Johannesburg)',
        'Enter amount to send (simulate ZAR to NGN)',
        'Review the incredibly low fees compared to Western Union',
        'Send transaction and see 3-second confirmation',
        'View on explorer showing it\'s ready for recipient instantly'
      ],
      transactionAmount: 1.0,
      successMessage: 'Payment Sent! In the real world, this just saved your family 10%!',
      tips: [
        'Compare this $0.0001 fee to 8-12% with traditional remittance',
        'Notice the 3-5 second speed vs 2-5 days with banks',
        '24/7 availability - no waiting for Monday morning',
        'Recipient gets nearly 100% of what you sent'
      ]
    }
  },
  {
    id: 'cbp_lesson_5',
    courseId: 'course_020',
    title: 'Cross-Border Payments Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'How much do traditional remittance services typically charge for Africa?',
          options: [
            '1-2%',
            '3-5%',
            '8-12%',
            '20-25%'
          ],
          correctAnswer: 2,
          explanation: 'Traditional services charge 8-12% on average for African remittances, one of the highest rates globally. Crypto can reduce this to under 1%.'
        },
        {
          question: 'How long does a Hedera cross-border crypto transfer take?',
          options: [
            '2-5 days',
            '24 hours',
            '10-30 minutes',
            '3-5 seconds'
          ],
          correctAnswer: 3,
          explanation: 'Hedera transactions finalize in 3-5 seconds, regardless of whether you\'re sending across the street or across continents!'
        },
        {
          question: 'Why are stablecoins good for remittances?',
          options: [
            'They have higher fees',
            'They maintain stable value during transfer',
            'They are slower',
            'They require a bank account'
          ],
          correctAnswer: 1,
          explanation: 'Stablecoins maintain their value (usually pegged to USD), so the amount you send is the amount received, without volatility risk during the transfer.'
        },
        {
          question: 'What happens to the money saved from lower crypto fees?',
          options: [
            'Goes to the blockchain',
            'Stays with your family instead of corporations',
            'Is lost in conversion',
            'Is required for taxes'
          ],
          correctAnswer: 1,
          explanation: 'Money saved from lower fees stays with your family. On a $500 transfer, saving 10% means $50 more for school fees, food, or medicine!'
        }
      ]
    }
  }
];

// ==================== COURSE 021: Avoiding Crypto Scams ====================
export const avoidingScamsLessons: LessonContent[] = [
  {
    id: 'scam_lesson_1',
    courseId: 'course_021',
    title: 'Common Scams Targeting Africans',
    type: 'text',
    sequence: 1,
    duration: 7,
    content: {
      sections: [
        {
          heading: '⚠️ The Scam Epidemic',
          text: 'Africans lose millions to crypto scams yearly. Scammers specifically target Africa because they know mobile money culture and promise "get rich quick". Don\'t be a victim!',
          emoji: '🚨'
        },
        {
          heading: 'Ponzi Schemes (MMM-Style)',
          text: 'Promise 50-100% returns monthly. Examples: "Invest 10,000 Naira, get 20,000 in 30 days!" Remember MMM Nigeria? Same playbook with crypto. Early investors get paid with new investors\' money until it collapses.',
          list: [
            '**Red Flag**: Guaranteed high returns (>20% monthly)',
            '**Red Flag**: Recruit friends to earn bonuses',
            '**Red Flag**: No clear business model',
            '**Reality**: 99% of investors lose everything'
          ]
        },
        {
          heading: 'Fake Exchanges',
          text: 'Websites that look like Binance or Luno but are fake. You deposit crypto, it shows in your "account", but you can never withdraw.',
          emoji: '🎭'
        },
        {
          heading: 'WhatsApp/Telegram Scams',
          text: 'Strangers add you to groups promising trading signals, airdrops, or investments. They build trust for weeks, then ask you to send crypto to "activate" your account. Classic advance-fee fraud!',
          emoji: '📱'
        },
        {
          heading: 'Fake Giveaways',
          text: '"Send 0.5 ETH and we\'ll send back 5 ETH!" Often impersonating Vitalik Buterin, Elon Musk, or Hedera. Real giveaways NEVER ask you to send crypto first.',
          emoji: '🎁'
        },
        {
          heading: 'Romance Scams',
          text: 'Meet on dating app, build relationship, then introduce crypto investment opportunity or ask for help with crypto emergency. Often targets diaspora.',
          emoji: '💔'
        }
      ]
    }
  },
  {
    id: 'scam_lesson_2',
    courseId: 'course_021',
    title: 'How to Protect Yourself',
    type: 'text',
    sequence: 2,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'The Golden Rules',
          list: [
            '**If it\'s too good to be true, it IS** - 100% monthly returns don\'t exist',
            '**NEVER share your seed phrase** - Not even with "support"',
            '**No one gives free money** - Legitimate giveaways don\'t require payment',
            '**Verify everything** - Check official websites directly, not links',
            '**Take your time** - Scammers create urgency ("Offer ends today!")'
          ]
        },
        {
          heading: 'Verification Checklist',
          text: 'Before sending any crypto or investing:',
          list: [
            '✓ Check if website URL is exactly correct (not Binance-africa.com)',
            '✓ Look for official verification (blue checkmarks on Twitter)',
            '✓ Search "[project name] + scam" on Google',
            '✓ Ask in legitimate community groups',
            '✓ Verify team members on LinkedIn'
          ]
        },
        {
          heading: 'Trust Your Gut',
          text: 'If someone pressures you with "limited time", "exclusive opportunity", or "your friend already joined" - STOP. Legitimate projects give you time to research.',
          emoji: '🛑'
        },
        {
          heading: 'Report and Warn Others',
          text: 'If you encounter a scam, report to local authorities and warn your community. Scammers target multiple people - your warning could save someone\'s savings.',
          emoji: '📢'
        }
      ]
    }
  },
  {
    id: 'scam_lesson_3',
    courseId: 'course_021',
    title: 'Scam Detector Interactive',
    type: 'interactive',
    sequence: 3,
    duration: 10,
    content: {
      type: 'scam_detector'
    }
  },
  {
    id: 'scam_lesson_4',
    courseId: 'course_021',
    title: 'Real African Scam Cases',
    type: 'text',
    sequence: 4,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'Case 1: MBA Capital (South Africa, 2021)',
          text: 'Promised 10% weekly returns on Bitcoin investments. Collected over R80 million from 27,000 South Africans. Founders disappeared. Investors lost everything.',
          emoji: '💔'
        },
        {
          heading: 'What Went Wrong',
          list: [
            'Unsustainable returns (10% weekly = 14,000% yearly!)',
            'No legitimate trading strategy',
            'Paid early investors with new deposits (Ponzi)',
            'Operated without financial services license'
          ]
        },
        {
          heading: 'Case 2: Velox 10 Global (Nigeria, 2020)',
          text: 'WhatsApp-based scam promising to triple investments in 30 days. Millions lost. Operators vanished.',
          emoji: '📱'
        },
        {
          heading: 'Red Flags That Were Ignored',
          list: [
            'Anonymous operators (no real names)',
            'Operated primarily on WhatsApp',
            'Guaranteed returns',
            'Pressure to recruit others'
          ]
        },
        {
          heading: 'Case 3: Fake HashPack Extension',
          text: 'Scammers created fake Hedera wallet extension that stole seed phrases. Always download from official sources!',
          emoji: '🎭'
        },
        {
          heading: 'The Lesson',
          text: 'EVERY scam had clear warning signs that victims ignored. Due diligence takes 1 hour. Losing your savings lasts forever. Choose wisely.',
          emoji: '📚'
        }
      ]
    }
  },
  {
    id: 'scam_lesson_5',
    courseId: 'course_021',
    title: 'Scam Prevention Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'Someone promises 50% returns monthly on your crypto investment. What should you do?',
          options: [
            'Invest immediately before the offer ends',
            'Invest but only a small amount',
            'Recognize it as a scam and walk away',
            'Ask your friends to join'
          ],
          correctAnswer: 2,
          explanation: '50% monthly returns (17,000% yearly!) are mathematically impossible to sustain. This is a classic Ponzi scheme red flag. Walk away immediately!'
        },
        {
          question: 'You get a DM from "Hedera Support" asking for your seed phrase to fix an issue. What do you do?',
          options: [
            'Send it to help fix the problem',
            'Ask for verification first',
            'Ignore and report - it\'s 100% a scam',
            'Send them half of the words to verify'
          ],
          correctAnswer: 2,
          explanation: 'Real support NEVER asks for seed phrases, passwords, or private keys. This is always a scam. Report and block immediately!'
        },
        {
          question: 'A website promises to double any HBAR you send them. Is this legitimate?',
          options: [
            'Yes, if it\'s on Twitter',
            'Yes, if many people are doing it',
            'No, it\'s always a scam',
            'Only if a celebrity posted it'
          ],
          correctAnswer: 2,
          explanation: 'No legitimate entity will double your crypto. These are giveaway scams. Even if they impersonate celebrities, it\'s a scam!'
        },
        {
          question: 'What\'s the best way to verify if a crypto project is legitimate?',
          options: [
            'Check if your friend invested',
            'Research team, check reviews, verify official channels, take your time',
            'Invest a small amount to test',
            'Trust the website looks professional'
          ],
          correctAnswer: 1,
          explanation: 'Proper due diligence includes researching the team, reading independent reviews, verifying official communication channels, and taking time to decide. Never rush!'
        }
      ]
    }
  }
];

// Continue with remaining courses in next file due to size...
