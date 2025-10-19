// Additional course content for new courses
import { LessonContent } from './courseContent';

// Understanding NFTs - Beginner Course (Explorer)
export const nftBeginnerLessons: LessonContent[] = [
  {
    id: 'nftb_lesson_1',
    courseId: 'course_010',
    title: 'What Are NFTs?',
    type: 'text',
    sequence: 1,
    duration: 5,
    content: {
      sections: [
        {
          heading: 'NFT = Non-Fungible Token',
          text: '"Non-fungible" means unique and irreplaceable. Think of it like this: a 1000 Naira note is fungible - any 1000 Naira note has the same value. But your house deed is non-fungible - it represents YOUR specific house, not just any house.',
          emoji: '🎨'
        },
        {
          heading: 'Digital Ownership Certificates',
          text: 'An NFT is like a digital certificate of ownership stored on the blockchain. It proves you own a specific digital item - whether that\'s art, music, a video, or even a ticket.',
          emoji: '📜'
        },
        {
          heading: 'Why NFTs Matter in Africa',
          text: 'For too long, African artists, musicians, and creators couldn\'t prove ownership of their digital work or earn from it globally. NFTs change this - they let creators sell directly to the world and prove authenticity.',
          emoji: '🌍'
        }
      ]
    }
  },
  {
    id: 'nftb_lesson_2',
    courseId: 'course_010',
    title: 'Real-World NFT Examples',
    type: 'interactive',
    sequence: 2,
    duration: 10,
    content: {
      type: 'nft_showcase'
    }
  },
  {
    id: 'nftb_lesson_3',
    courseId: 'course_010',
    title: 'How NFTs Work',
    type: 'text',
    sequence: 3,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'Creating an NFT (Minting)',
          text: 'When you "mint" an NFT, you\'re creating a unique token on the blockchain that represents your digital item. This token contains information about the item and proves ownership.',
          emoji: '⚒️'
        },
        {
          heading: 'What\'s Stored in an NFT?',
          list: [
            '**Unique ID** - A one-of-a-kind identifier',
            '**Owner Address** - Who currently owns it',
            '**Metadata** - Information about the item (title, description, image)',
            '**Smart Contract** - Rules about the NFT (can it be sold, what royalties, etc.)',
            '**Creation History** - When and by whom it was created'
          ]
        },
        {
          heading: 'Transferring Ownership',
          text: 'When you buy or sell an NFT, the blockchain updates the owner field. This change is permanent and publicly verifiable - everyone can see the entire ownership history!',
          emoji: '🔄'
        }
      ]
    }
  },
  {
    id: 'nftb_lesson_4',
    courseId: 'course_010',
    title: 'NFT Beginner Quiz',
    type: 'quiz',
    sequence: 4,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What does "non-fungible" mean?',
          options: [
            'Very expensive',
            'Unique and cannot be replaced with something identical',
            'Digital only',
            'Not real money'
          ],
          correctAnswer: 1,
          explanation: 'Non-fungible means unique and irreplaceable. Each NFT is one-of-a-kind, unlike regular tokens where each unit is identical.'
        },
        {
          question: 'What does an NFT prove?',
          options: [
            'The item is expensive',
            'The item is beautiful',
            'You own a specific digital item',
            'The item is real art'
          ],
          correctAnswer: 2,
          explanation: 'An NFT serves as a certificate of ownership for a specific digital item, recorded permanently on the blockchain.'
        },
        {
          question: 'How can NFTs help African creators?',
          options: [
            'They can\'t help',
            'They allow direct global sales and proof of authenticity',
            'They make everything free',
            'They only help musicians'
          ],
          correctAnswer: 1,
          explanation: 'NFTs enable African creators to sell their work directly to global buyers, prove ownership and authenticity, and earn royalties on resales - without needing galleries or intermediaries.'
        }
      ]
    }
  }
];

// Understanding NFTs - Intermediate Course (Explorer)
export const nftIntermediateLessons: LessonContent[] = [
  {
    id: 'nfti_lesson_1',
    courseId: 'course_011',
    title: 'NFT Marketplaces',
    type: 'text',
    sequence: 1,
    duration: 6,
    content: {
      sections: [
        {
          heading: 'What is an NFT Marketplace?',
          text: 'An NFT marketplace is like a digital art gallery or marketplace where you can buy, sell, and trade NFTs. Popular examples include Zuse Market (for Hedera), OpenSea, and Rarible.',
          emoji: '🏪'
        },
        {
          heading: 'How Marketplaces Work',
          list: [
            '**Listing** - Sellers list their NFTs with a price',
            '**Discovery** - Buyers browse and search for NFTs',
            '**Bidding** - Some NFTs can be bid on (like an auction)',
            '**Purchase** - Smart contracts handle the sale automatically',
            '**Transfer** - NFT ownership transfers to buyer immediately'
          ]
        },
        {
          heading: 'Marketplace Fees',
          text: 'Most marketplaces charge 2-5% fee on sales. This is much lower than traditional art galleries that take 30-50%! Plus, creators can set royalties to earn from future resales.',
          emoji: '💰'
        },
        {
          heading: 'African NFT Opportunities',
          text: 'African artists can now sell to collectors in New York, Tokyo, or Dubai without leaving Lagos or Nairobi. No visa needed, no shipping costs, no gatekeepers - just direct global access.',
          emoji: '🌍'
        }
      ]
    }
  },
  {
    id: 'nfti_lesson_2',
    courseId: 'course_011',
    title: 'Understanding Royalties',
    type: 'text',
    sequence: 2,
    duration: 5,
    content: {
      sections: [
        {
          heading: 'Creator Royalties Explained',
          text: 'Royalties are automatic payments to the original creator every time their NFT is resold. If you create an NFT with 10% royalties, you earn 10% of every future sale - forever!',
          emoji: '💎'
        },
        {
          heading: 'Why This is Revolutionary',
          text: 'Imagine a Nigerian artist sells their artwork for 100 HBAR. Years later, it resells for 10,000 HBAR. With traditional art, the artist gets nothing. With NFT royalties, they automatically get 1,000 HBAR (if 10% royalty)!',
          emoji: '🎨'
        },
        {
          heading: 'How Royalties Work',
          list: [
            'Set when creating the NFT (typically 5-15%)',
            'Enforced automatically by smart contracts',
            'Paid directly to creator\'s wallet',
            'Works for every resale, forever',
            'No middleman or trust needed'
          ]
        },
        {
          heading: 'Impact on African Musicians',
          text: 'A Ghanaian musician can release a song as NFTs. Every time fans resell or trade these NFTs, the musician earns royalties automatically - creating long-term passive income!',
          emoji: '🎵'
        }
      ]
    }
  },
  {
    id: 'nfti_lesson_3',
    courseId: 'course_011',
    title: 'NFT Marketplace Experience',
    type: 'interactive',
    sequence: 3,
    duration: 10,
    content: {
      type: 'nft_marketplace'
    }
  },
  {
    id: 'nfti_lesson_4',
    courseId: 'course_011',
    title: 'Buying NFTs Safely',
    type: 'text',
    sequence: 4,
    duration: 7,
    content: {
      sections: [
        {
          heading: 'Before You Buy',
          text: 'NFT scams exist, just like in any market. Here\'s how to buy safely:',
          list: [
            '**Verify the Creator** - Check if the seller is the real creator or authorized',
            '**Check Marketplace Reputation** - Use well-known, audited marketplaces',
            '**Review Smart Contract** - Look at the NFT\'s contract on blockchain explorer',
            '**Understand What You\'re Buying** - Read description and terms carefully',
            '**Start Small** - Begin with affordable NFTs while learning'
          ]
        },
        {
          heading: 'Common NFT Scams',
          emoji: '⚠️',
          list: [
            'Fake copies of popular NFTs',
            'Promising guaranteed profits',
            'Phishing links in social media',
            'Fake marketplaces that steal your wallet info',
            'Rug pulls (creator abandons project after selling)'
          ]
        },
        {
          heading: 'Red Flags to Watch For',
          text: 'Be suspicious if: the price seems too good to be true, the seller pressures you to buy quickly, no verifiable information about the creator, or promises of guaranteed returns.',
          emoji: '🚩'
        }
      ]
    }
  },
  {
    id: 'nfti_lesson_5',
    courseId: 'course_011',
    title: 'Intermediate NFT Quiz',
    type: 'quiz',
    sequence: 5,
    duration: 5,
    content: {
      questions: [
        {
          question: 'What are NFT royalties?',
          options: [
            'One-time payment to the creator',
            'Automatic payments to creators on every resale',
            'Fees charged by marketplaces',
            'Taxes on NFT sales'
          ],
          correctAnswer: 1,
          explanation: 'Royalties are automatic payments sent to the original creator every time their NFT is resold, creating ongoing income for creators.'
        },
        {
          question: 'How do NFT marketplaces compare to traditional art galleries in terms of fees?',
          options: [
            'Much higher fees (50%+)',
            'About the same (30-40%)',
            'Much lower fees (2-5%)',
            'No fees at all'
          ],
          correctAnswer: 2,
          explanation: 'NFT marketplaces typically charge 2-5% compared to traditional galleries that take 30-50%, giving creators much better earnings.'
        },
        {
          question: 'What should you verify before buying an NFT?',
          options: [
            'Only the price',
            'The creator\'s identity, marketplace reputation, and smart contract',
            'Just that it looks nice',
            'Nothing - all NFTs are safe'
          ],
          correctAnswer: 1,
          explanation: 'Always verify the creator is legitimate, the marketplace is reputable, and review the smart contract before buying to avoid scams.'
        }
      ]
    }
  }
];

// Re-export from explorerCourseContent
export { 
  nftAdvancedLessons, 
  introDAppsLessons, 
  testnetLessons 
} from './explorerCourseContent';
