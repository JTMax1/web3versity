# Web3Versity 🌍

> **Democratizing Blockchain Education Across Africa**

A decentralized educational platform built on Hedera Hashgraph, providing free, comprehensive Web3 education with blockchain-verified credentials, gamification, and hands-on learning experiences.

**Hedera Africa Hackathon 2025 Submission**
**Track:** DLT for Operations (Education & Skill Development)

---

## 🎯 Project Overview

Web3Versity addresses the critical need for accessible, high-quality blockchain education in Africa by leveraging Hedera's fast, fair, and secure distributed ledger technology to create an immersive learning platform.

### Key Features

- ✅ **44 Comprehensive Courses** across Explorer and Developer tracks
- 🎓 **Blockchain-Verified Certificates** as NFTs on Hedera
- 🏆 **Gamification System** with XP, levels, badges, and leaderboards
- 🔗 **Hedera Testnet Integration** with faucet and real transactions
- 💬 **Community Discussions** for peer-to-peer learning
- 📱 **Mobile-First Design** optimized for African users
- 🌐 **African-Contextualized Content** with local examples and use cases

### Why Hedera?

- **Fast**: 3-5 second transaction finality
- **Cheap**: <$0.01 per transaction
- **Eco-Friendly**: Carbon-negative consensus
- **Fair**: No mining monopolies, equal access for all
- **Governed**: By world-class organizations (Google, IBM, Standard Bank)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm** package manager
- **Metamask** browser extension
- **Supabase** account (for database)
- **Hedera Testnet** account (for blockchain features)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Web3Versity_1.0

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations (see DOCUMENTATION/03-Database/)

# Start development server
pnpm run dev
```

The app will open at `http://localhost:3000`

### First-Time Setup

1. **Database Setup**: Execute the migration SQL in your Supabase dashboard
   - See `DOCUMENTATION/03-Database/QUICK-START.md` for detailed instructions

2. **Environment Configuration**: Configure your `.env.local` file
   - See `DOCUMENTATION/04-Implementation/` for environment setup guide

3. **Metamask Configuration**: Add Hedera Testnet to Metamask
   - Network Name: Hedera Testnet
   - RPC URL: `https://testnet.hashio.io/api`
   - Chain ID: 296
   - Currency Symbol: HBAR

4. **Get Test HBAR**: Visit [Hedera Faucet](https://portal.hedera.com/faucet)

---

## 📚 Documentation

Comprehensive documentation is available in the `DOCUMENTATION/` folder:

### For Users
- **User Guide**: How to use the platform
- **Course Catalog**: Available courses and learning paths
- **FAQ**: Common questions and answers

### For Developers
- **[SRS Document](DOCUMENTATION/01-Requirements/SRS-Software-Requirements-Specification.md)**: Complete requirements specification
- **[Database Schema](DOCUMENTATION/03-Database/Database-Schema.md)**: Database design and structure
- **[Database Migration](DOCUMENTATION/03-Database/Database-Migrations.sql)**: Complete migration script
- **[Quick Start Guide](DOCUMENTATION/03-Database/QUICK-START.md)**: 5-minute database setup
- **[Implementation Status](DOCUMENTATION/04-Implementation/Feature-Implementation-Status.md)**: What's built and what's next
- **[Phase-by-Phase Plan](DOCUMENTATION/04-Implementation/PHASE-BY-PHASE-IMPLEMENTATION-PLAN.md)**: Implementation roadmap 
- **[Architecture](DOCUMENTATION/02-Architecture/)**: System design and architecture

### Documentation Structure

```
DOCUMENTATION/
├── 01-Requirements/
│   └── SRS-Software-Requirements-Specification.md
├── 02-Architecture/
│   ├── System-Architecture.md
│   ├── Wallet-Integration-Guide.md
│   └── Hedera-Integration-Guide.md
├── 03-Database/
│   ├── Database-Schema.md
│   ├── Database-Migrations.sql
│   ├── QUICK-START.md
│   ├── MIGRATION-README.md
│   └── SCHEMA-DIAGRAM.md
├── 04-Implementation/
│   ├── Feature-Implementation-Status.md
│   ├── PHASE-BY-PHASE-IMPLEMENTATION-PLAN.md
│   └── Implementation-Plan-Phase-[1-4].md
├── 05-Deployment/
│   └── Deployment-Guide.md
└── 06-UserGuides/
    ├── Student-Guide.md
    └── Educator-Guide.md
```

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18.3.1 with TypeScript
- Vite 6.3.5 (build tool)
- Tailwind CSS (styling)
- Radix UI + shadcn/ui (components)
- Lucide Icons

**Backend:**
- Supabase (PostgreSQL 15)
- Supabase Auth
- Supabase Realtime

**Blockchain:**
- Hedera Hashgraph Testnet (Chain ID: 296)
- Hedera Token Service (HTS) for NFTs
- Metamask for wallet connection

**Developer Tools:**
- pnpm (package manager)
- TypeScript (type safety)
- ESLint + Prettier (code quality)

### System Architecture

```
┌─────────────────┐
│   React Frontend │
│   (Vite + TS)    │
└────────┬─────────┘
         │
         ├──────────┐
         │          │
    ┌────▼─────┐   ┌▼──────────────┐
    │ Supabase │   │    Metamask   │
    │ Database │   │  (Hedera RPC) │
    └──────────┘   └───────┬───────┘
                           │
                    ┌──────▼────────┐
                    │ Hedera Testnet│
                    │  (Chain 296)  │
                    └───────────────┘
```

---

## 📖 Features

### For Learners (Explorer Track)

**Beginner-Friendly Courses:**
- Blockchain Fundamentals
- Wallet Security
- Understanding Transactions
- NFT Basics
- DeFi Introduction
- Cross-Border Payments with Crypto
- Avoiding Scams
- Mobile Money to Crypto Transition
- And 30+ more courses!

**Interactive Learning:**
- Text lessons with African context
- Interactive simulations (20+ components)
- Quizzes with explanations
- Hands-on practical exercises

**Gamification:**
- Earn XP by completing lessons
- Level up (1-100)
- Unlock achievement badges
- Compete on leaderboards
- Daily login streaks

**Blockchain Credentials:**
- NFT certificates for completed courses
- Publicly verifiable on Hedera
- Shareable on social media
- Permanent proof of learning

### For Developers (Developer Track)

**Technical Courses:**
- Smart Contracts on Hedera
- Hedera Token Service (HTS)
- Building DApps
- NFT Development
- DeFi Protocols
- Consensus Service Deep Dive
- And 14 technical courses!

**Developer Tools:**
- Code playground
- Hedera SDK integration
- Transaction testing
- Live testnet interaction

### Community Features

- Discussion forums
- Course-specific Q&A
- Peer-to-peer support
- Upvoting and solution marking
- User profiles and reputation

---

## 🎓 Course Catalog

### Explorer Track (30 courses for non-technical users)

| Course | Level | Hours | Category |
|--------|-------|-------|----------|
| Hedera Fundamentals | Beginner | 4h | Blockchain Basics |
| Wallet Security Best Practices | Beginner | 3h | Security |
| Understanding Transactions | Beginner | 3h | Blockchain Basics |
| Understanding NFTs (3-part series) | Beginner-Advanced | 15h | NFTs |
| Cross-Border Payments with Crypto | Beginner | 2h | Payments |
| Avoiding Crypto Scams in Africa | Beginner | 2h | Security |
| Understanding Stablecoins | Beginner | 2h | Crypto Basics |
| From Mobile Money to Crypto | Beginner | 2h | Crypto Basics |
| DeFi Basics for Beginners | Beginner | 3h | DeFi |
| Careers in Web3 | Beginner | 3h | Career |
| ...and 20 more courses | | | |

### Developer Track (14 courses for technical users)

| Course | Level | Hours | Category |
|--------|-------|-------|----------|
| Introduction to Hedera Token Service | Beginner | 6h | Token Development |
| Smart Contracts on Hedera | Intermediate | 10h | Smart Contracts |
| Building DApps with Hedera | Advanced | 15h | DApp Development |
| Understanding NFTs on Hedera | Intermediate | 8h | NFTs |
| Hedera Consensus Service Deep Dive | Advanced | 8h | Advanced Topics |
| DeFi Basics (Developer) | Intermediate | 10h | DeFi |
| ...and 8 more courses | | | |

**Total: 44 courses, 200+ lessons, 100+ hours of content**

---

## 🎮 Gamification System

### Experience Points (XP)

- **Text Lesson**: 10 XP
- **Interactive Lesson**: 10 XP
- **Quiz (70-99%)**: 20 XP
- **Quiz (100%)**: 30 XP
- **Practical Exercise**: 50 XP
- **Course Completion**: 100 XP bonus

### Levels

- **Formula**: `Level = floor(sqrt(Total XP / 100))`
- **Range**: 1-100
- **Progression**: Exponential (higher levels require more XP)

### Achievements (25+ Badges)

**Learning Achievements:**
- 🎯 First Steps (Complete first lesson)
- 📚 Knowledge Seeker (Complete 5 courses)
- 🎓 Scholar (Complete 10 courses)
- 🏆 Hedera Expert (Complete all Hedera courses)
- ✨ Perfect Score (100% on any quiz)
- 🧠 Quiz Master (Pass 10 quizzes)
- ...and 20 more!

**Social Achievements:**
- 🤝 Community Helper (Answer 20 forum questions)
- 💬 Conversationalist (Create 10 discussions)
- ⭐ Popular (Receive 50 upvotes)

**Special Achievements:**
- 🔥 Week Warrior (7-day streak)
- 🔥🔥 Month Master (30-day streak)
- 👑 Top 10 (Reach top 10 on leaderboard)

### Leaderboards

- **All-Time**: Ranked by total XP
- **This Week**: Ranked by XP earned this week
- **This Month**: Ranked by XP earned this month
- **Top 100** displayed, with current user highlight

---

## 🔗 Hedera Integration

### Wallet Connection

- **Metamask** integration with Hedera Testnet
- **EVM Address** (0x...) to **Hedera Account ID** (0.0.xxxxx) conversion
- **Network Switching** to Hedera Testnet (Chain ID 296)
- **Balance Queries** and transaction history

### Testnet Faucet

- **Free HBAR** distribution for learning
- **10 HBAR per day** per user
- **24-hour cooldown** between requests
- **Transaction tracking** and HashScan links

### NFT Certificates

- **HTS (Hedera Token Service)** for NFT minting
- **Certificate NFTs** minted on course completion
- **Metadata** stored on IPFS or Hedera File Service
- **Publicly verifiable** on HashScan
- **Transferable** to other wallets

### Achievement Badges (Planned)

- **NFT Collection** for all badges
- **Earned badges** minted automatically
- **Profile showcase** and sharing

### Transaction Logging

- All blockchain transactions logged to database
- **Audit trail** for transparency
- **HashScan integration** for exploration

---

## 🗄️ Database

### Schema Overview

**17 Tables:**
- `users` - User accounts and wallet info
- `courses` - Course catalog
- `lessons` - Lesson content (JSONB)
- `user_progress` - Enrollment and completion tracking
- `lesson_completions` - Individual lesson tracking
- `achievements` - Badge definitions
- `user_achievements` - Earned badges
- `user_streaks` - Daily streak tracking
- `leaderboard_cache` - Cached rankings
- `discussions` - Forum threads
- `replies` - Forum responses
- `discussion_votes` - Upvote/downvote tracking
- `faucet_requests` - HBAR faucet requests
- `transactions` - Blockchain transaction log
- `nft_certificates` - Minted certificates
- `course_prerequisites` - Course dependencies
- `platform_settings` - Configuration

**45+ Indexes** for performance optimization

**7 Functions** for business logic:
- `calculate_user_level(xp)` - Level calculation
- `award_xp(user_id, amount)` - XP rewards
- `update_course_progress()` - Progress tracking
- `update_streak(user_id)` - Streak management
- `refresh_leaderboard()` - Ranking calculation
- `check_achievements(user_id)` - Badge unlocking
- `update_updated_at_column()` - Auto-update timestamps

**8 Triggers** for automation

See [Database Schema](DOCUMENTATION/03-Database/Database-Schema.md) for complete details.

---

## 🚦 Current Implementation Status

### ✅ Completed

- **Frontend UI**: 90% complete
  - All pages built (Landing, Dashboard, Catalog, Viewer, Leaderboard, Profile, Community, Faucet, Playground)
  - 40+ shadcn/ui components integrated
  - Neomorphic design system
  - Responsive and mobile-first
  - 20+ interactive learning components

- **Course Content**: 100% complete
  - All 44 courses defined with metadata
  - 200+ lessons with full content
  - African-contextualized examples
  - Interactive simulations
  - Quizzes with explanations

- **Database Design**: 100% complete
  - Complete schema documented
  - Migration SQL ready
  - Functions and triggers defined
  - Sample data included

### ⚠️ Partially Complete

- **Learning Features**: UI only (40%)
  - Lesson viewing works
  - Completion tracking UI exists
  - No database persistence yet

- **Gamification**: UI only (30%)
  - XP and level display
  - Badge gallery
  - Leaderboard UI
  - No actual unlocking logic

- **Blockchain**: Simulated (15%)
  - Mock wallet connection
  - Simulated transactions
  - No real Hedera integration

### ❌ Not Started

- **Database Connection**: 0%
  - Supabase client not set up
  - No API functions

- **Authentication**: 0%
  - No real wallet integration
  - No user registration

- **Hedera Integration**: 0%
  - No Metamask connection
  - No faucet functionality
  - No NFT minting

- **Community**: 0%
  - No discussion CRUD operations
  - No voting system

**Overall Completion: ~35%**

See [Feature Implementation Status](DOCUMENTATION/04-Implementation/Feature-Implementation-Status.md) for detailed breakdown.

---

## 🛣️ Roadmap

### Phase 1: Foundation (3-4 days) - CRITICAL
- ⬜ Set up Supabase client
- ⬜ Run database migrations
- ⬜ Implement Metamask wallet connection
- ⬜ Create user authentication system
- ⬜ Link Hedera accounts to users

### Phase 2: Core Learning (5-6 days) - CRITICAL
- ⬜ Connect course catalog to database
- ⬜ Implement enrollment system
- ⬜ Build lesson completion tracking
- ⬜ Implement XP reward system
- ⬜ Create progress dashboards

### Phase 3: Blockchain Integration (4-5 days) - HIGH PRIORITY
- ⬜ Implement Hedera Testnet faucet
- ⬜ Enable practice transactions
- ⬜ Mint NFT certificates
- ⬜ Create badge NFT collection
- ⬜ Build public certificate verification

### Phase 4: Community & Polish (3-4 days) - MEDIUM PRIORITY
- ⬜ Implement discussion forums
- ⬜ Add achievement unlocking
- ⬜ Create streak tracking
- ⬜ Add notifications
- ⬜ Performance optimization
- ⬜ Bug fixes and testing

**Total Estimated Time: 3-4 weeks**

See [Phase-by-Phase Implementation Plan](DOCUMENTATION/04-Implementation/PHASE-BY-PHASE-IMPLEMENTATION-PLAN.md) for detailed tasks for each phase.

---

## 🎯 Hedera Hackathon Alignment

### Track: DLT for Operations (Education)

**How Web3Versity Uses Hedera to Improve Education:**

1. **Transparent Credential Verification**
   - Certificates issued as HTS NFTs
   - Publicly verifiable on HashScan
   - Tamper-proof and permanent
   - Employers can verify instantly

2. **Low-Cost Operations**
   - Certificate minting: <$0.01 per NFT
   - Faucet distributions: $0.0001 per transaction
   - Enables micro-rewards and badges
   - Sustainable at scale

3. **Fast Transaction Finality**
   - 3-5 second confirmations
   - Instant certificate issuance
   - Real-time leaderboard updates
   - Smooth user experience

4. **Eco-Friendly Education**
   - Carbon-negative consensus
   - Sustainable Web3 education
   - Aligns with African sustainability goals

5. **African Focus**
   - Content tailored to African context
   - Mobile-first design (limited data)
   - Local examples and use cases
   - Addresses unique challenges (remittances, financial inclusion)

### Innovation Highlights

- **First** blockchain education platform with African-specific content
- **Comprehensive** gamification tied to on-chain credentials
- **Accessible** to both technical and non-technical learners
- **Practical** hands-on learning with real testnet HBAR
- **Scalable** to millions of users with Hedera's throughput

---

## 🧪 Testing

### Manual Testing (Current)

Test the application manually using the following checklist:

**Wallet Connection:**
- [ ] Metamask prompts for connection
- [ ] Correct Hedera account displayed
- [ ] Balance fetches correctly
- [ ] Network switching works

**Course Browsing:**
- [ ] All 44 courses display
- [ ] Filtering works
- [ ] Search finds courses
- [ ] Enrollment button functions

**Learning:**
- [ ] Lessons load and display
- [ ] Quizzes submit and score
- [ ] Interactive components work
- [ ] Completion tracking persists

**Blockchain:**
- [ ] Faucet distributes HBAR
- [ ] Certificates mint successfully
- [ ] NFTs appear in profile
- [ ] HashScan links work

### Automated Testing (Planned)

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Coverage report
pnpm run test:coverage
```

---

## 🚀 Deployment

### Development

```bash
pnpm run dev
```

Runs on `http://localhost:3000`

### Production Build

```bash
pnpm run build
```

Output in `build/` folder

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

See [Deployment Guide](DOCUMENTATION/05-Deployment/Deployment-Guide.md) for detailed instructions.

---

## 📊 Project Metrics

- **Total Courses**: 44
- **Total Lessons**: 200+
- **Lines of Code**: ~15,000
- **React Components**: 100+
- **Interactive Simulations**: 20+
- **Database Tables**: 17
- **API Functions**: 50+
- **Documentation Pages**: ~100 pages
- **Development Time**: 3-4 weeks (estimated)

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests (when available): `pnpm run test`
5. Commit: `git commit -m "feat: add my feature"`
6. Push: `git push origin feature/my-feature`
7. Create a Pull Request

### Contribution Ideas

- Add more courses (especially African-focused topics)
- Translate to French, Swahili, Amharic, etc.
- Create more interactive learning components
- Improve accessibility (WCAG 2.1 AA)
- Add mobile app (React Native)
- Build admin dashboard
- Performance optimizations

---

## 📜 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Hedera Hashgraph** for the fast, fair, and secure DLT platform
- **Exponential Science** and **The Hashgraph Association** for organizing the hackathon
- **Supabase** for the excellent backend platform
- **shadcn/ui** for the beautiful component library
- **African Web3 Community** for inspiration and feedback

---

## 📞 Contact & Support

- **Website**: [Coming Soon]
- **Twitter**: [@Web3Versity](https://twitter.com/web3versity) (placeholder)
- **Discord**: [Join Community](https://discord.gg/web3versity) (placeholder)
- **Email**: support@web3versity.com (placeholder)

### For Hackathon Judges

- **Project Demo**: [Video Link]
- **Live Demo**: [Deployed URL]
- **GitHub**: [Repository URL]
- **Documentation**: See `DOCUMENTATION/` folder

---

## 🌟 Why Web3Versity Matters

**Education is the foundation of economic development.**

Africa has:
- 🌍 The youngest population globally (median age 19)
- 📱 High mobile penetration (80%+)
- 💡 Growing interest in blockchain and crypto
- 🚀 Immense untapped potential

But lacks:
- 📚 Accessible, high-quality Web3 education
- 🎓 Verifiable credentials recognized globally
- 💰 Financial infrastructure for many citizens
- 🔧 Practical skills for Web3 careers

**Web3Versity bridges these gaps** by providing:
- ✅ Free, comprehensive blockchain education
- ✅ Blockchain-verified credentials (NFTs)
- ✅ Hands-on experience with real technology
- ✅ Career pathways in Web3
- ✅ Community for peer learning
- ✅ African-contextualized content

**Together, we're building the future of education in Africa.** 🚀

---

## 📈 Impact Goals

### Year 1 (2025)
- 🎯 10,000+ registered users
- 🎯 5,000+ certificates issued
- 🎯 20+ countries reached across Africa
- 🎯 50+ courses available
- 🎯 5 languages supported

### Year 2 (2026)
- 🎯 100,000+ users
- 🎯 50,000+ certificates
- 🎯 100+ courses
- 🎯 Partnerships with 10+ African universities
- 🎯 Job placement program

### Year 3 (2027)
- 🎯 1,000,000+ users
- 🎯 500,000+ certificates
- 🎯 200+ courses
- 🎯 Pan-African accreditation
- 🎯 Become the #1 Web3 education platform in Africa

---

**Built with ❤️ for Africa | Powered by Hedera Hashgraph**

**#HederaAfricaHackathon2025 #Web3Education #BlockchainForGood #AfricaRising**

