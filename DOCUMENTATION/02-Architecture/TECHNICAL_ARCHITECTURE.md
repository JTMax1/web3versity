# Web3Versity Technical Architecture Documentation

**Hedera Africa Hackathon 2025 - Technical Submission**

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Layers](#architecture-layers)
3. [Technology Stack Details](#technology-stack-details)
4. [Database Design](#database-design)
5. [Hedera Integration Architecture](#hedera-integration-architecture)
6. [Security Architecture](#security-architecture)
7. [Performance & Scalability](#performance--scalability)
8. [Code Organization](#code-organization)
9. [API Documentation](#api-documentation)
10. [Deployment Architecture](#deployment-architecture)

---

## System Overview

Web3Versity is a **full-stack decentralized education platform** built with modern web technologies and deeply integrated with Hedera Hashgraph for blockchain functionalities.

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│                  (React 18 + TypeScript)                        │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Course   │  │ Admin    │  │ Profile  │  │ Community│      │
│  │ Viewer   │  │ Dashboard│  │ Mgmt     │  │ Forum    │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────┬──────────────────────────────────────┘
                          │
                          │ HTTPS/WebSocket
                          ▼
┌────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                            │
│                  (Business Logic & State)                       │
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │ Wallet Context │  │ Course State   │  │ User Session   │  │
│  │ (Web3 Provider)│  │ Management     │  │ Management     │  │
│  └────────────────┘  └────────────────┘  └────────────────┘  │
│                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │ API Services   │  │ AI Services    │  │ Auth Services  │  │
│  │ (50+ functions)│  │ (Gemini)       │  │ (Wallet-based) │  │
│  └────────────────┘  └────────────────┘  └────────────────┘  │
└─────────────────────────┬──────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  SUPABASE     │ │  METAMASK     │ │  GEMINI AI    │
│  Backend      │ │  Wallet       │ │  API          │
│               │ │               │ │               │
│ PostgreSQL 15 │ │ EVM Provider  │ │ LLM Service   │
│ Edge Functions│ │ JSON-RPC      │ │ Generation    │
│ Real-time     │ │               │ │               │
└───────┬───────┘ └───────┬───────┘ └───────────────┘
        │                 │
        │                 │ Sign Transactions
        │                 ▼
        │         ┌────────────────────┐
        │         │  HEDERA TESTNET    │
        │         │  (JSON-RPC)        │
        │         │  testnet.hashio.io │
        │         └─────────┬──────────┘
        │                   │
        │                   ▼
        │         ┌────────────────────────────────┐
        │         │    HEDERA NETWORK SERVICES     │
        │         ├────────────────────────────────┤
        │         │  • HTS (NFT Minting)           │
        │         │  • HFS (File Storage)          │
        │         │  • HCS (Consensus Messages)    │
        │         │  • Smart Contracts (Solidity)  │
        │         │  • Mirror Node (Queries)       │
        │         └────────────────────────────────┘
        │                   │
        └───────────────────┘
          Sync transaction data
```

### Key Design Principles

1. **Separation of Concerns**
   - Frontend: Pure UI components, no business logic
   - Backend: Database operations, blockchain transactions
   - Blockchain: Immutable data storage, consensus

2. **Modularity**
   - Reusable components (159 React components)
   - Shared utilities (30KB+ hederaUtils.ts)
   - Service layer abstraction (API, blockchain, AI)

3. **Scalability**
   - Cached leaderboard (avoid real-time queries)
   - Edge functions for heavy operations
   - Database indexes for fast queries

4. **Security**
   - Row-Level Security (RLS) on all tables
   - Wallet-based authentication (no passwords)
   - Environment variable protection
   - Rate limiting on sensitive endpoints

---

## Architecture Layers

### 1. Presentation Layer (Frontend)

**Technology:** React 18.3.1 + TypeScript 5.9.3

**Responsibilities:**
- Render UI components
- Handle user interactions
- Manage local state
- Call API services
- Display real-time updates

**Key Directories:**
```
src/
├── components/
│   ├── admin/          # Admin dashboard (6 tabs)
│   ├── course/         # Course viewer, lessons
│   │   ├── interactive/ # 33+ interactive simulations
│   │   ├── practical/   # 6 hands-on tools
│   │   └── lessons/     # Text, Quiz, Interactive, Practical
│   ├── dashboard/      # User dashboard
│   ├── pages/          # 11 main pages (routing)
│   ├── profile/        # User profile components
│   └── ui/             # 40+ shadcn/ui components
├── hooks/              # 13 custom React hooks
├── contexts/           # WalletContext (global state)
└── App.tsx             # Main routing
```

**State Management:**
- **React Context API** - WalletContext (wallet connection, balance, network)
- **Zustand** - Course creation store (temporary state)
- **TanStack Query** - Server state caching and synchronization

**Routing:**
```typescript
// React Router v7 Configuration
<Route path="/" element={<CourseCatalog />} />
<Route path="/course/:courseId" element={<CourseViewer />} />
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/profile" element={<Profile />} />
<Route path="/leaderboard" element={<Leaderboard />} />
<Route path="/community" element={<Community />} />
<Route path="/admin" element={<AdminDashboard />} />
<Route path="/faucet" element={<Faucet />} />
<Route path="/verify-certificate/:id" element={<VerifyCertificate />} />
```

---

### 2. Application Layer (Business Logic)

**Services & Utilities:**

**A. Wallet Service** (`src/contexts/WalletContext.tsx`, `src/lib/hederaUtils.ts`)
- Connect/disconnect Metamask
- Network switching (Hedera Testnet)
- Balance queries (HBAR)
- Transaction signing
- Account change listeners
- Mobile wallet deep linking

**B. API Service** (`src/lib/supabase/api.ts` - 3,700+ lines)
- 50+ API functions for database operations
- Type-safe queries (TypeScript)
- Error handling and retries
- Optimistic updates

**C. AI Service** (`src/lib/ai/`)
- Course generation (Gemini API)
- Quiz generation
- Chatbot tutor
- Content quality checker
- Rate limiting (10 requests/day per user)

**D. Hedera Service** (`src/lib/hedera/`)
- NFT certificate minting
- HFS file upload
- Faucet transactions
- Transaction validation
- Mirror Node queries

**E. Auth Service** (`src/lib/auth/`)
- Wallet signature generation
- JWT token management
- Session persistence
- Role-based access control (RBAC)

---

### 3. Data Layer (Backend)

**Technology:** Supabase (PostgreSQL 15 + Edge Functions)

**Components:**

**A. PostgreSQL Database**
- 17 tables (users, courses, lessons, nft_certificates, etc.)
- 45+ indexes for performance
- 25+ Row-Level Security (RLS) policies
- 10+ PostgreSQL functions (business logic)
- 8+ triggers for automation

**B. Edge Functions** (Deno runtime)
- `mint-certificate` - Mint NFT certificates on Hedera
- `wallet-login` - Authenticate users with wallet signatures
- CORS handling for cross-origin requests
- Environment variable management

**C. Real-Time Subscriptions**
- User activity updates
- Leaderboard changes
- New discussion posts
- Certificate minting status

---

### 4. Blockchain Layer (Hedera)

**Network:** Hedera Testnet (Chain ID: 296)

**Services Used:**

1. **Hedera Token Service (HTS)** - NFT certificates
2. **Hedera File Service (HFS)** - Certificate storage
3. **Hedera Consensus Service (HCS)** - Message board (demo)
4. **Smart Contracts** - Solidity contract deployment
5. **JSON-RPC** - EVM-compatible wallet interactions
6. **Mirror Node** - Free transaction/account queries

**Transaction Flow:**
```
User Action → Frontend → Metamask → JSON-RPC → Hedera Network
                                        ↓
                                   Consensus
                                        ↓
                                   Mirror Node
                                        ↓
                               Supabase Database
                                        ↓
                              Frontend Update
```

---

## Technology Stack Details

### Frontend Technologies

#### 1. React 18.3.1
**Why React?**
- Component-based architecture (reusability)
- Large ecosystem (1M+ npm packages)
- Excellent TypeScript support
- React Hooks for state management
- Virtual DOM for performance

**Key Patterns:**
- Functional components only (no class components)
- Custom hooks for logic reuse
- Context API for global state
- Lazy loading for code splitting (future)

#### 2. TypeScript 5.9.3
**Why TypeScript?**
- Type safety (catch errors at compile-time)
- Better IDE support (autocomplete, refactoring)
- Self-documenting code
- Easier refactoring

**Type Coverage:** 100% (all files are .ts or .tsx)

**Example Type Definitions:**
```typescript
// Course Type
export interface Course {
  id: string;
  title: string;
  description: string;
  track: 'explorer' | 'developer';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_hours: number;
  total_lessons: number;
  completion_xp: number;
  learning_objectives: string[];
  creator_id?: string;
  is_published: boolean;
}

// Lesson Type (JSONB content)
export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  lesson_type: 'text' | 'interactive' | 'quiz' | 'practical' | 'code_editor';
  content: TextContent | InteractiveContent | QuizContent | PracticalContent;
  sequence_number: number;
  duration_minutes: number;
  completion_xp: number;
}

// User Type
export interface User {
  id: string;
  evm_address: string;
  hedera_account_id?: string;
  username: string;
  email?: string;
  avatar_emoji: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  is_admin: boolean;
  is_educator: boolean;
}
```

#### 3. Vite 6.3.5
**Why Vite?**
- Lightning-fast dev server (cold start <1 second)
- Hot Module Replacement (HMR) in milliseconds
- Modern build tool (ES modules)
- Optimized production builds

**Build Configuration:**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/*'],
        },
      },
    },
  },
});
```

#### 4. Tailwind CSS 4.0.0
**Why Tailwind?**
- Utility-first CSS (no custom CSS files)
- Mobile-first design system
- Built-in responsive breakpoints
- JIT compiler (only used styles in bundle)

**Custom Configuration:**
```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Custom color palette (neomorphic design)
        primary: {
          50: '#f0f9ff',
          // ... 100-900
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

#### 5. Radix UI + shadcn/ui
**Why Radix + shadcn?**
- Accessible components (WAI-ARIA compliant)
- Unstyled primitives (full design control)
- Copy-paste components (no package bloat)
- TypeScript-first

**Components Used (40+):**
- Accordion, Alert Dialog, Avatar, Button, Card
- Checkbox, Dialog, Dropdown Menu, Form, Input
- Label, Popover, Progress, Radio Group, Select
- Separator, Slider, Switch, Tabs, Toast, Tooltip
- ... and 20+ more

---

### Backend Technologies

#### 1. Supabase
**Why Supabase?**
- Managed PostgreSQL (no DevOps)
- Built-in authentication
- Real-time subscriptions (WebSocket)
- Edge Functions (serverless)
- Free tier (generous limits)

**Supabase Features Used:**
- PostgreSQL 15 with pgvector extension
- Row-Level Security (RLS)
- Edge Functions (Deno runtime)
- Database webhooks
- Real-time API

**API Example:**
```typescript
// Fetch user progress
const { data, error } = await supabase
  .from('user_progress')
  .select(`
    *,
    course:courses(*),
    lesson_completions:lesson_completions(*)
  `)
  .eq('user_id', userId)
  .order('last_accessed_at', { ascending: false });
```

#### 2. PostgreSQL 15
**Why PostgreSQL?**
- ACID compliance (reliability)
- JSONB support (flexible schemas)
- Full-text search
- Excellent performance
- Rich ecosystem

**Key Features:**
- **JSONB Columns** - Lesson content (no schema changes)
- **Indexes** - 45+ indexes for fast queries
- **Functions** - Complex business logic in database
- **Triggers** - Automatic XP calculation, badge awarding
- **Views** - Materialized views for leaderboards

#### 3. Edge Functions (Deno)
**Why Deno?**
- TypeScript-native (no transpilation)
- Secure by default (no file system access)
- Fast cold starts (<100ms)
- Web API compatible

**Function: mint-certificate** (500+ lines)
```typescript
// Mint NFT certificate on Hedera
serve(async (req) => {
  const { userId, courseId } = await req.json();

  // 1. Check eligibility
  const eligible = await checkEligibility(userId, courseId);
  if (!eligible) return error('Not eligible');

  // 2. Generate SVG certificate
  const svg = generateCertificateSVG(user, course);

  // 3. Upload to HFS
  const imageFileId = await uploadToHFS(client, svg);

  // 4. Mint NFT
  const { serialNumber } = await mintNFT(collectionId, metadata);

  // 5. Transfer to user
  await transferNFT(collectionId, serialNumber, userAccountId);

  // 6. Store in database
  await saveCertificate(userId, courseId, serialNumber);

  return json({ success: true, serialNumber });
});
```

---

### Blockchain Technologies

#### 1. @hashgraph/sdk 2.75.0
**Purpose:** Native Hedera SDK for Node.js/Deno

**Key Classes:**
- `Client` - Network connection
- `TokenCreateTransaction` - Create HTS tokens
- `TokenMintTransaction` - Mint NFTs
- `TransferTransaction` - Transfer HBAR/tokens
- `FileCreateTransaction` - Upload to HFS
- `TopicMessageSubmitTransaction` - HCS messages
- `ContractCreateTransaction` - Deploy smart contracts

**Example:**
```typescript
import { Client, TokenMintTransaction, Hbar } from '@hashgraph/sdk';

const client = Client.forTestnet();
client.setOperator(operatorId, privateKey);

const mintTx = await new TokenMintTransaction()
  .setTokenId('0.0.12345')
  .setMetadata([Buffer.from('{"name":"Certificate"}'))])
  .setMaxTransactionFee(new Hbar(20))
  .execute(client);

const receipt = await mintTx.getReceipt(client);
const serialNumber = receipt.serials[0];
```

#### 2. ethers.js 6.15.0
**Purpose:** EVM interactions (Metamask)

**Key Functions:**
- `BrowserProvider` - Connect to Metamask
- `Contract` - Smart contract interactions
- `parseUnits` / `formatUnits` - Unit conversions
- `JsonRpcProvider` - JSON-RPC connection

**Example:**
```typescript
import { BrowserProvider, parseUnits } from 'ethers';

// Connect to Metamask
const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Send HBAR (EVM-style)
const tx = await signer.sendTransaction({
  to: recipientAddress,
  value: parseUnits('10', 18), // 10 HBAR
  gasLimit: 21000,
});

await tx.wait(); // Wait for confirmation
```

#### 3. Metamask
**Purpose:** Wallet provider (browser extension)

**RPC Methods Used:**
- `eth_requestAccounts` - Connect wallet
- `eth_accounts` - Get connected accounts
- `eth_chainId` - Get current network
- `eth_getBalance` - Query HBAR balance
- `eth_sendTransaction` - Sign and send transactions
- `personal_sign` - Sign authentication messages
- `wallet_addEthereumChain` - Add Hedera network
- `wallet_switchEthereumChain` - Switch networks

**Network Configuration:**
```typescript
const HEDERA_TESTNET = {
  chainId: '0x128', // 296 in hex
  chainName: 'Hedera Testnet',
  rpcUrls: ['https://testnet.hashio.io/api'],
  nativeCurrency: {
    name: 'HBAR',
    symbol: 'HBAR',
    decimals: 18,
  },
  blockExplorerUrls: ['https://hashscan.io/testnet'],
};

await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [HEDERA_TESTNET],
});
```

---

### AI Technologies

#### 1. Google Gemini API (@google/genai 1.27.0)
**Purpose:** AI-powered content generation

**Models Used:**
- `gemini-1.5-flash` - Fast, cost-effective generation
- `gemini-1.5-pro` - Advanced reasoning (future)

**Features:**
- Course generation from topic + difficulty
- Quiz question generation
- Chatbot tutor responses
- Content quality analysis

**Example:**
```typescript
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const prompt = `Create a blockchain course titled "DeFi Basics"...
Target: African learners (mobile-first, low bandwidth).
Include African examples: M-Pesa, Naira, microfinance...`;

const result = await model.generateContent(prompt);
const courseData = JSON.parse(result.response.text());

// Returns: { title, description, lessons: [...] }
```

**Cost Optimization:**
- Use Flash model ($0.15 per 1M tokens)
- Cache common prompts (90% cache hit rate)
- Rate limit: 10 generations per user per day
- Estimated: $50/month for 1,000 users

---

## Database Design

### Schema Overview

**17 Tables, 45+ Indexes, 25+ RLS Policies**

### Core Tables

#### 1. users
**Purpose:** User accounts, wallets, XP, levels

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evm_address TEXT UNIQUE NOT NULL,
  hedera_account_id TEXT UNIQUE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  avatar_emoji TEXT DEFAULT '👤',
  bio TEXT,
  location TEXT,
  total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
  current_level INTEGER DEFAULT 1 CHECK (current_level >= 1 AND current_level <= 100),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  courses_completed INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  badges_earned INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT false,
  is_educator BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_evm_address ON users(evm_address);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_total_xp ON users(total_xp DESC);
CREATE INDEX idx_users_last_activity ON users(last_activity_date DESC);
```

**Key Columns:**
- `evm_address` - Metamask wallet address (authentication)
- `hedera_account_id` - Hedera account (e.g., "0.0.12345")
- `total_xp` - Experience points (used for leveling)
- `current_level` - Calculated from XP: `floor(sqrt(total_xp / 100))`
- `current_streak` - Daily activity streak
- `is_admin`, `is_educator` - Role flags

**RLS Policy:**
```sql
-- Users can read all profiles (public leaderboard)
CREATE POLICY "Public profiles are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

---

#### 2. courses
**Purpose:** Course catalog with metadata

```sql
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail_emoji TEXT DEFAULT '📚',
  track TEXT NOT NULL CHECK (track IN ('explorer', 'developer')),
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_hours NUMERIC NOT NULL CHECK (estimated_hours > 0),
  total_lessons INTEGER DEFAULT 0,
  enrollment_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  average_rating NUMERIC DEFAULT 0.00,
  learning_objectives TEXT[],
  what_you_will_learn TEXT[],
  completion_xp INTEGER DEFAULT 100,
  creator_id UUID REFERENCES users(id),
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_track ON courses(track);
CREATE INDEX idx_courses_difficulty ON courses(difficulty);
CREATE INDEX idx_courses_enrollment ON courses(enrollment_count DESC);
CREATE INDEX idx_courses_creator ON courses(creator_id);
```

**Key Columns:**
- `id` - Slug-based ID (e.g., "blockchain-fundamentals")
- `track` - Explorer (non-technical) vs. Developer (technical)
- `difficulty` - Beginner, Intermediate, Advanced
- `enrollment_count`, `completion_count` - Engagement metrics
- `creator_id` - For community-created courses (NULL = platform course)

---

#### 3. lessons
**Purpose:** Lesson content (JSONB for flexibility)

```sql
CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id),
  title TEXT NOT NULL,
  lesson_type TEXT NOT NULL CHECK (lesson_type IN ('text', 'interactive', 'quiz', 'practical', 'code_editor')),
  content JSONB NOT NULL,
  sequence_number INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  completion_xp INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_lessons_sequence ON lessons(course_id, sequence_number);
CREATE INDEX idx_lessons_type ON lessons(lesson_type);
```

**JSONB Content Examples:**

**Text Lesson:**
```json
{
  "type": "text",
  "sections": [
    {
      "title": "What is Blockchain?",
      "content": "Blockchain is a distributed ledger...",
      "image": "https://..."
    }
  ]
}
```

**Quiz Lesson:**
```json
{
  "type": "quiz",
  "questions": [
    {
      "question": "What consensus does Hedera use?",
      "options": ["PoW", "PoS", "Hashgraph", "DPoS"],
      "correct_answer": 2,
      "explanation": "Hedera uses Hashgraph consensus..."
    }
  ]
}
```

**Interactive Lesson:**
```json
{
  "type": "interactive",
  "component": "BlockChainAnimation",
  "props": {
    "showMining": true,
    "difficulty": 2
  }
}
```

---

#### 4. user_progress
**Purpose:** Track course enrollment and completion

```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  course_id TEXT NOT NULL REFERENCES courses(id),
  enrollment_date TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  lessons_completed INTEGER DEFAULT 0,
  total_lessons INTEGER NOT NULL,
  progress_percentage NUMERIC DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  current_lesson_id TEXT REFERENCES lessons(id),
  total_quiz_attempts INTEGER DEFAULT 0,
  average_quiz_score NUMERIC,
  certificate_nft_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_progress_course ON user_progress(course_id);
CREATE INDEX idx_progress_completion ON user_progress(completed_at);
```

**Triggers:**
```sql
-- Auto-update progress percentage
CREATE OR REPLACE FUNCTION update_progress_percentage()
RETURNS TRIGGER AS $$
BEGIN
  NEW.progress_percentage = (NEW.lessons_completed::NUMERIC / NEW.total_lessons::NUMERIC) * 100;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_progress
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_progress_percentage();
```

---

#### 5. lesson_completions
**Purpose:** Individual lesson tracking with XP

```sql
CREATE TABLE lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  lesson_id TEXT NOT NULL REFERENCES lessons(id),
  course_id TEXT NOT NULL REFERENCES courses(id),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  time_spent_seconds INTEGER,
  score_percentage NUMERIC,
  attempts INTEGER DEFAULT 1,
  xp_earned INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_completions_user ON lesson_completions(user_id);
CREATE INDEX idx_completions_lesson ON lesson_completions(lesson_id);
CREATE INDEX idx_completions_date ON lesson_completions(completed_at DESC);
```

**Triggers:**
```sql
-- Award XP when lesson completed
CREATE OR REPLACE FUNCTION award_lesson_xp()
RETURNS TRIGGER AS $$
BEGIN
  -- Add XP to user's total
  UPDATE users
  SET total_xp = total_xp + NEW.xp_earned,
      lessons_completed = lessons_completed + 1,
      updated_at = NOW()
  WHERE id = NEW.user_id;

  -- Check for level up
  PERFORM check_level_up(NEW.user_id);

  -- Check for badge eligibility
  PERFORM check_badge_eligibility(NEW.user_id, 'lesson_complete');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_award_xp
  AFTER INSERT ON lesson_completions
  FOR EACH ROW
  EXECUTE FUNCTION award_lesson_xp();
```

---

#### 6. nft_certificates
**Purpose:** Track minted NFT certificates

```sql
CREATE TABLE nft_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  course_id TEXT NOT NULL REFERENCES courses(id),
  token_id TEXT UNIQUE NOT NULL, -- Format: "0.0.12345/1"
  collection_id TEXT NOT NULL,
  serial_number INTEGER,
  certificate_number TEXT UNIQUE,
  verification_code TEXT UNIQUE,
  course_title TEXT NOT NULL,
  completion_date DATE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),

  -- HFS Storage
  image_hfs_file_id TEXT,
  metadata_hfs_file_id TEXT,
  image_uri TEXT,
  metadata_uri TEXT,
  svg_content TEXT,

  -- IPFS Storage (optional)
  ipfs_image_hash TEXT,
  ipfs_image_url TEXT,
  ipfs_metadata_hash TEXT,
  ipfs_metadata_url TEXT,

  -- Hedera Transactions
  mint_transaction_id TEXT,
  transfer_transaction_id TEXT,
  minted_at TIMESTAMPTZ DEFAULT NOW(),
  transferred_at TIMESTAMPTZ,

  -- Status & Signatures
  status TEXT DEFAULT 'minting' CHECK (status IN ('minting', 'minted', 'transferred', 'failed')),
  platform_signature TEXT,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_certificates_user ON nft_certificates(user_id);
CREATE INDEX idx_certificates_course ON nft_certificates(course_id);
CREATE INDEX idx_certificates_token ON nft_certificates(token_id);
CREATE INDEX idx_certificates_number ON nft_certificates(certificate_number);
```

**Key Features:**
- `token_id` - Unique: `{collection_token_id}/{serial_number}`
- `certificate_number` - Human-readable: "W3V-2025-0001"
- `verification_code` - For public verification
- Dual storage: HFS (Hedera File Service) + IPFS
- `platform_signature` - HMAC-SHA256 for authenticity

---

#### 7. achievements
**Purpose:** Badge definitions with criteria

```sql
CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_emoji TEXT DEFAULT '🏆',
  category TEXT NOT NULL CHECK (category IN ('learning', 'social', 'special')),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  criteria JSONB NOT NULL,
  xp_reward INTEGER DEFAULT 50,
  times_earned INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);
```

**Criteria Examples:**

**Badge: "First Steps"**
```json
{
  "type": "lesson_count",
  "count": 1,
  "description": "Complete your first lesson"
}
```

**Badge: "Scholar"**
```json
{
  "type": "course_count",
  "count": 10,
  "description": "Complete 10 courses"
}
```

**Badge: "Week Warrior"**
```json
{
  "type": "streak",
  "days": 7,
  "description": "Maintain 7-day learning streak"
}
```

---

#### 8. leaderboard_cache
**Purpose:** Cached rankings (avoid real-time queries)

```sql
CREATE TABLE leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  all_time_rank INTEGER,
  all_time_xp INTEGER,
  weekly_rank INTEGER,
  weekly_xp INTEGER,
  week_start_date DATE,
  monthly_rank INTEGER,
  monthly_xp INTEGER,
  month_start_date DATE,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_all_time ON leaderboard_cache(all_time_rank);
CREATE INDEX idx_leaderboard_weekly ON leaderboard_cache(weekly_rank);
CREATE INDEX idx_leaderboard_monthly ON leaderboard_cache(monthly_rank);
```

**Update Frequency:**
- Cron job runs every 5 minutes
- Recalculates ranks from `users` table
- Stores snapshot for fast reads

**SQL Function:**
```sql
CREATE OR REPLACE FUNCTION refresh_leaderboard_cache()
RETURNS void AS $$
BEGIN
  -- All-time leaderboard
  WITH ranked_users AS (
    SELECT
      id,
      total_xp,
      ROW_NUMBER() OVER (ORDER BY total_xp DESC) AS rank
    FROM users
    WHERE show_on_leaderboard = true
  )
  INSERT INTO leaderboard_cache (user_id, all_time_rank, all_time_xp)
  SELECT id, rank, total_xp FROM ranked_users
  ON CONFLICT (user_id) DO UPDATE
  SET all_time_rank = EXCLUDED.all_time_rank,
      all_time_xp = EXCLUDED.all_time_xp,
      updated_at = NOW();

  -- Weekly & monthly calculations...
END;
$$ LANGUAGE plpgsql;
```

---

### Database Performance Optimizations

#### 1. Indexing Strategy

**45+ Indexes across all tables**

**Common Index Patterns:**
- Primary Keys (UUID, TEXT)
- Foreign Keys (user_id, course_id, etc.)
- Frequently Queried Columns (created_at, updated_at)
- Unique Constraints (evm_address, certificate_number)
- Composite Indexes (course_id + sequence_number)

**Example:**
```sql
-- Composite index for fast lesson lookup
CREATE INDEX idx_lessons_course_sequence
  ON lessons(course_id, sequence_number);

-- Partial index for active users
CREATE INDEX idx_users_active
  ON users(last_activity_date DESC)
  WHERE is_active = true;
```

#### 2. JSONB Indexing

**GIN Indexes for JSONB columns:**
```sql
-- Index lesson content for full-text search
CREATE INDEX idx_lessons_content_gin
  ON lessons USING GIN(content);

-- Query example
SELECT * FROM lessons
WHERE content @> '{"type": "interactive"}';
```

#### 3. Materialized Views

**Pre-calculated aggregations:**
```sql
CREATE MATERIALIZED VIEW course_stats AS
SELECT
  c.id,
  c.title,
  COUNT(DISTINCT up.user_id) AS enrollment_count,
  COUNT(DISTINCT CASE WHEN up.completed_at IS NOT NULL THEN up.user_id END) AS completion_count,
  AVG(CASE WHEN up.completed_at IS NOT NULL THEN 100 ELSE up.progress_percentage END) AS avg_progress,
  AVG(lc.score_percentage) AS avg_quiz_score
FROM courses c
LEFT JOIN user_progress up ON c.id = up.course_id
LEFT JOIN lesson_completions lc ON c.id = lc.course_id
GROUP BY c.id, c.title;

-- Refresh daily
REFRESH MATERIALIZED VIEW CONCURRENTLY course_stats;
```

#### 4. Query Optimization

**Use EXPLAIN ANALYZE:**
```sql
EXPLAIN ANALYZE
SELECT u.*, lc.user_id
FROM users u
JOIN leaderboard_cache lc ON u.id = lc.user_id
WHERE lc.all_time_rank <= 100
ORDER BY lc.all_time_rank;

-- Execution time: 5ms (with index)
-- vs. 1,500ms (without index)
```

---

## Hedera Integration Architecture

### Overview

Web3Versity integrates **6 Hedera services** for blockchain functionality:

1. **Hedera Token Service (HTS)** - NFT certificates
2. **Hedera File Service (HFS)** - Certificate storage
3. **JSON-RPC** - Wallet interactions
4. **Hedera Consensus Service (HCS)** - Message board
5. **Smart Contracts** - Solidity deployment
6. **Mirror Node** - Free queries

### Integration Diagram

```
┌────────────────────────────────────────────────────────────┐
│                     FRONTEND                               │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Certificate  │  │   Faucet     │  │  Contract    │    │
│  │  Gallery     │  │   Page       │  │  Playground  │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │             │
└─────────┼─────────────────┼─────────────────┼─────────────┘
          │                 │                 │
          │ 1. Request Mint │ 2. Request HBAR │ 3. Deploy Contract
          ▼                 ▼                 ▼
┌────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTIONS                       │
│                                                            │
│  ┌───────────────────┐  ┌───────────────────┐            │
│  │ mint-certificate  │  │   faucet          │            │
│  │                   │  │   (future)        │            │
│  └─────────┬─────────┘  └─────────┬─────────┘            │
│            │                      │                       │
└────────────┼──────────────────────┼───────────────────────┘
             │                      │
             │ 4. Hedera SDK calls  │ 5. Transfer HBAR
             ▼                      ▼
┌────────────────────────────────────────────────────────────┐
│                  HEDERA TESTNET                            │
│                  testnet.hashio.io                         │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         HEDERA NETWORK SERVICES                     │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │                                                     │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌──────────┐ │  │
│  │  │  HTS   │  │  HFS   │  │  HCS   │  │ Contracts│ │  │
│  │  │ (NFTs) │  │ (Files)│  │(Topics)│  │(Solidity)│ │  │
│  │  └────────┘  └────────┘  └────────┘  └──────────┘ │  │
│  │                                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              CONSENSUS LAYER                        │  │
│  │  - Hashgraph Consensus (ABFT)                       │  │
│  │  - 3-5 second finality                              │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              LEDGER STATE                           │  │
│  │  - Account balances                                 │  │
│  │  - Token ownership                                  │  │
│  │  - File contents                                    │  │
│  │  - Contract state                                   │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────┬───────────────────────────────────┘
                         │
                         │ 6. Query transactions (free)
                         ▼
┌────────────────────────────────────────────────────────────┐
│                    MIRROR NODE                             │
│           testnet.mirrornode.hedera.com                    │
│                                                            │
│  REST API:                                                 │
│  - GET /api/v1/accounts/{id}                              │
│  - GET /api/v1/tokens/{tokenId}/nfts/{serial}             │
│  - GET /api/v1/transactions/{txId}                        │
│  - GET /api/v1/files/{fileId}/contents                    │
│                                                            │
└────────────────────────┬───────────────────────────────────┘
                         │
                         │ 7. Return data
                         ▼
┌────────────────────────────────────────────────────────────┐
│                  SUPABASE DATABASE                         │
│                                                            │
│  - Store transaction IDs                                   │
│  - Cache file contents                                     │
│  - Track certificate ownership                             │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### NFT Certificate Minting Flow (Detailed)

**Complete end-to-end flow:**

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: USER COMPLETES COURSE                                   │
├─────────────────────────────────────────────────────────────────┤
│ Frontend: CourseViewer.tsx                                      │
│  - User completes final lesson (100% progress)                  │
│  - "Claim Certificate" button appears                           │
│  - User clicks button                                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: ELIGIBILITY CHECK                                       │
├─────────────────────────────────────────────────────────────────┤
│ Frontend: API call to mint-certificate edge function           │
│  POST /functions/v1/mint-certificate                            │
│  Headers: { Authorization: "Bearer JWT_TOKEN" }                 │
│  Body: { userId: "uuid", courseId: "course-slug" }             │
│                                                                 │
│ Backend: mint-certificate/index.ts                             │
│  1. Verify JWT token                                           │
│  2. Call RPC: check_certificate_eligibility()                  │
│     - Check: progress === 100%                                 │
│     - Check: No existing certificate                           │
│     - Check: All lessons completed                             │
│  3. Fetch user data (username, hedera_account_id)             │
│  4. Fetch course data (title, id)                             │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: CERTIFICATE SVG GENERATION                              │
├─────────────────────────────────────────────────────────────────┤
│ Function: generateAndUploadCertificate()                        │
│ File: certificate-generator.ts                                 │
│                                                                 │
│ 3a. Generate unique certificate number                         │
│     - Format: "W3V-2025-{timestamp}"                           │
│     - Example: "W3V-2025-1698765432"                           │
│                                                                 │
│ 3b. Create SVG certificate                                     │
│     - Template: certificate-svg-template.ts                    │
│     - Include: username, course name, date, cert number        │
│     - Add: QR code (verification URL)                          │
│     - Add: Web3Versity branding                                │
│     - Optimize: <4KB (Hedera limit)                            │
│                                                                 │
│ 3c. Generate platform signature                                │
│     - HMAC-SHA256(certificateData + hmacSecret)                │
│     - Ensures authenticity (tamper-proof)                      │
│                                                                 │
│ 3d. Create metadata JSON                                       │
│     {                                                           │
│       "name": "Web3Versity Certificate",                       │
│       "description": "Completed {courseName}",                 │
│       "image": "hfs://{imageFileId}",                          │
│       "attributes": [                                           │
│         {"trait_type": "Course", "value": "{courseName}"},     │
│         {"trait_type": "User", "value": "{username}"},         │
│         {"trait_type": "Date", "value": "{completionDate}"},   │
│         {"trait_type": "Certificate", "value": "{certNumber}"},│
│         {"trait_type": "Signature", "value": "{hmacSig}"}      │
│       ]                                                         │
│     }                                                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: UPLOAD TO HEDERA FILE SERVICE (HFS)                     │
├─────────────────────────────────────────────────────────────────┤
│ 4a. Upload SVG image to HFS                                    │
│     const fileCreateTx = new FileCreateTransaction()           │
│       .setKeys([privateKey])                                   │
│       .setContents(svgContent)                                 │
│       .setMaxTransactionFee(new Hbar(5))                       │
│       .execute(client);                                        │
│                                                                 │
│     Receipt: imageFileId = "0.0.12345"                         │
│     Cost: ~$0.02                                               │
│     Duration: ~5 seconds                                       │
│                                                                 │
│ 4b. Upload metadata JSON to HFS                                │
│     const fileCreateTx = new FileCreateTransaction()           │
│       .setKeys([privateKey])                                   │
│       .setContents(metadataJson)                               │
│       .execute(client);                                        │
│                                                                 │
│     Receipt: metadataFileId = "0.0.12346"                      │
│     Cost: ~$0.01                                               │
│     Duration: ~5 seconds                                       │
│                                                                 │
│ 4c. Optional: Upload to IPFS/Pinata (backup)                  │
│     - Upload SVG to Pinata                                     │
│     - Returns: ipfsImageHash (QmXXX...)                        │
│     - Upload metadata to Pinata                                │
│     - Returns: ipfsMetadataHash (QmYYY...)                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: MINT NFT WITH HEDERA TOKEN SERVICE (HTS)                │
├─────────────────────────────────────────────────────────────────┤
│ 5a. Prepare on-chain metadata (100-byte limit)                 │
│     // If IPFS available, use IPFS hash                        │
│     onChainMetadata = ipfsMetadataHash;                        │
│                                                                 │
│     // Otherwise, use compact HFS pointer                      │
│     onChainMetadata = JSON.stringify({                         │
│       h: metadataFileId,  // Shortened key                     │
│       i: imageFileId                                            │
│     });                                                         │
│                                                                 │
│ 5b. Mint NFT                                                   │
│     const mintTx = new TokenMintTransaction()                  │
│       .setTokenId(collectionTokenId) // "0.0.COLLECTION"       │
│       .setMetadata([Buffer.from(onChainMetadata)])             │
│       .setMaxTransactionFee(new Hbar(20))                      │
│       .freezeWith(client);                                     │
│                                                                 │
│     const signedTx = await mintTx.sign(privateKey);            │
│     const submitTx = await signedTx.execute(client);           │
│     const receipt = await submitTx.getReceipt(client);         │
│                                                                 │
│     Result: serialNumber = 1, 2, 3... (incremental)           │
│     Cost: ~$0.05                                               │
│     Duration: ~3-5 seconds (Hedera finality)                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: TRANSFER NFT TO USER WALLET                             │
├─────────────────────────────────────────────────────────────────┤
│ 6a. Attempt transfer                                           │
│     const transferTx = new TransferTransaction()               │
│       .addNftTransfer(                                         │
│         collectionTokenId,     // "0.0.COLLECTION"             │
│         serialNumber,          // 1, 2, 3...                   │
│         treasuryAccountId,     // "0.0.TREASURY" (from)        │
│         userAccountId          // "0.0.USER" (to)              │
│       )                                                         │
│       .setTransactionMemo("Web3Versity Certificate")           │
│       .setMaxTransactionFee(new Hbar(20))                      │
│       .execute(client);                                        │
│                                                                 │
│     Cost: ~$0.001                                              │
│     Duration: ~3-5 seconds                                     │
│                                                                 │
│ 6b. Handle TOKEN_NOT_ASSOCIATED error                          │
│     - If user hasn't associated token: transfer fails          │
│     - NFT remains in treasury (safe)                           │
│     - Status: "minted" (pending user association)              │
│     - Return instructions to user                              │
│                                                                 │
│ 6c. Success case                                               │
│     - NFT transferred to user wallet                           │
│     - Status: "transferred"                                    │
│     - User owns NFT (verifiable on HashScan)                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: STORE IN DATABASE                                       │
├─────────────────────────────────────────────────────────────────┤
│ 7a. Log transaction (for FK constraint)                        │
│     INSERT INTO transactions (                                 │
│       user_id,                                                 │
│       transaction_type: "nft_mint_certificate",                │
│       transaction_id: "0.0.X@1234567890.123456789",            │
│       amount_hbar: 0,                                          │
│       status: "success",                                       │
│       from_account: treasuryId,                                │
│       to_account: userAccountId,                               │
│       related_course_id: courseId,                             │
│       hashscan_url: "https://hashscan.io/testnet/token/..."   │
│     );                                                          │
│                                                                 │
│ 7b. Create certificate record                                  │
│     INSERT INTO nft_certificates (                             │
│       user_id, course_id, course_title,                        │
│       token_id: "{collectionId}/{serialNumber}",               │
│       collection_id, serial_number,                            │
│       certificate_number, verification_code,                   │
│       completion_date,                                         │
│       image_hfs_file_id, metadata_hfs_file_id,                 │
│       image_uri, metadata_uri,                                 │
│       ipfs_image_hash, ipfs_metadata_hash,                     │
│       svg_content, platform_signature,                         │
│       mint_transaction_id, transfer_transaction_id,            │
│       status: "transferred",                                   │
│       minted_at, transferred_at                                │
│     );                                                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 8: RETURN SUCCESS RESPONSE                                 │
├─────────────────────────────────────────────────────────────────┤
│ Response JSON:                                                  │
│ {                                                               │
│   "success": true,                                             │
│   "certificate": {                                             │
│     "id": "uuid",                                              │
│     "certificateNumber": "W3V-2025-1698765432",                │
│     "tokenId": "0.0.12345",                                    │
│     "serialNumber": 1,                                         │
│     "imageHfsFileId": "0.0.67890",                             │
│     "metadataHfsFileId": "0.0.67891",                          │
│     "platformSignature": "abc123...",                          │
│     "mintTransactionId": "0.0.X@...",                          │
│     "transferTransactionId": "0.0.Y@...",                      │
│     "hashScanUrl": "https://hashscan.io/testnet/token/...",   │
│     "status": "transferred"                                    │
│   }                                                             │
│ }                                                               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 9: FRONTEND DISPLAY                                        │
├─────────────────────────────────────────────────────────────────┤
│ Components: CertificatesGallery.tsx, CertificateModal.tsx      │
│                                                                 │
│ 9a. Show success modal                                         │
│     - Display SVG preview                                      │
│     - Show certificate details                                 │
│     - HashScan link (open in new tab)                          │
│                                                                 │
│ 9b. Add to profile                                             │
│     - Certificate appears in user profile                      │
│     - Visible on "/profile" page                               │
│     - Can share on social media                                │
│                                                                 │
│ 9c. Verification                                               │
│     - Public verification page: /verify-certificate/{id}       │
│     - Anyone can verify via Mirror Node (free)                 │
│     - Display: owner, course, date, signature                  │
└─────────────────────────────────────────────────────────────────┘

TOTAL TIME: ~30 seconds (user perspective)
TOTAL COST: ~$0.08 per certificate
  - HFS upload (SVG): $0.02
  - HFS upload (metadata): $0.01
  - NFT mint: $0.05
  - NFT transfer: $0.001
  - (IPFS is free with Pinata free tier)
```

---

### Security Best Practices

1. **Private Key Management**
   - Stored in Supabase secrets (encrypted)
   - Never exposed to frontend
   - Rotated quarterly

2. **Transaction Signing**
   - All transactions signed server-side
   - No private keys on client
   - User only signs with Metamask (personal_sign)

3. **Rate Limiting**
   - Certificate minting: 5 per hour per user
   - Faucet: 1 per 24 hours per user
   - API endpoints: 100 requests per minute

4. **Validation**
   - Eligibility checks (100% progress)
   - Duplicate prevention (UNIQUE constraints)
   - HMAC signatures for authenticity

---

## Security Architecture

### Threat Model

**Assets to Protect:**
1. User accounts (wallets)
2. NFT certificates (integrity)
3. Database (private data)
4. API endpoints (abuse)
5. Hedera operator account (treasury)

**Threats:**
1. **Wallet Theft** - Phishing, fake websites
2. **Certificate Forgery** - Fake NFTs
3. **Data Breach** - Unauthorized database access
4. **DoS Attacks** - API flooding
5. **Private Key Compromise** - Treasury drain

### Security Measures

#### 1. Authentication & Authorization

**Wallet-Based Authentication:**
```typescript
// User signs message with Metamask
const message = `Sign in to Web3Versity\nTimestamp: ${Date.now()}`;
const signature = await signer.signMessage(message);

// Backend verifies signature
const recoveredAddress = ethers.verifyMessage(message, signature);
if (recoveredAddress !== userAddress) throw new Error('Invalid signature');

// Generate JWT token
const token = jwt.sign({ userId, address }, JWT_SECRET, { expiresIn: '7d' });
```

**Row-Level Security (RLS):**
```sql
-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Users can only see their own certificates
CREATE POLICY "Users can view own certificates"
  ON nft_certificates FOR SELECT
  USING (user_id = auth.uid());

-- Admins can see all data
CREATE POLICY "Admins can view all"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

#### 2. Certificate Authenticity

**HMAC Signatures:**
```typescript
import crypto from 'crypto';

// Generate signature
const data = `${certificateNumber}|${userId}|${courseId}|${completionDate}`;
const signature = crypto
  .createHmac('sha256', process.env.HEDERA_HMAC_SECRET)
  .update(data)
  .digest('hex');

// Store signature on-chain and in database
```

**Verification:**
```typescript
// Public verification (no secret needed)
export async function verifyCertificate(certificateId: string) {
  // 1. Fetch from database
  const cert = await fetchCertificate(certificateId);

  // 2. Verify NFT ownership on Hedera Mirror Node
  const nftData = await fetch(
    `https://testnet.mirrornode.hedera.com/api/v1/tokens/${cert.token_id}/nfts/${cert.serial_number}`
  ).then(r => r.json());

  // 3. Check: NFT exists and metadata matches
  if (nftData.account_id !== cert.user_hedera_account_id) {
    return { valid: false, reason: 'Ownership mismatch' };
  }

  // 4. Verify HMAC signature (requires platform secret)
  // Note: Only platform can generate valid signatures
  const isValidSignature = verifyHMAC(cert.platform_signature, cert);

  return { valid: isValidSignature, certificate: cert };
}
```

#### 3. API Security

**Rate Limiting:**
```typescript
// Supabase Edge Function middleware
const rateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  keyGenerator: (req) => req.headers.get('x-real-ip') || 'anonymous',
});

serve(async (req) => {
  if (!rateLimiter.check(req)) {
    return new Response('Too many requests', { status: 429 });
  }

  // Process request...
});
```

**Input Validation:**
```typescript
import { z } from 'zod';

const MintCertificateSchema = z.object({
  userId: z.string().uuid(),
  courseId: z.string().min(1).max(100),
});

serve(async (req) => {
  const body = await req.json();

  // Validate input
  const result = MintCertificateSchema.safeParse(body);
  if (!result.success) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 400,
    });
  }

  // Process validated input
  const { userId, courseId } = result.data;
  // ...
});
```

**CORS Policy:**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://web3versity.netlify.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

// Handle preflight
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders });
}
```

#### 4. Database Security

**Environment Variables:**
```bash
# .env.local (NEVER commit to Git)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx  # Public key (limited access)
SUPABASE_SERVICE_ROLE_KEY=xxx  # Secret key (server-only)

HEDERA_OPERATOR_ID=0.0.12345
HEDERA_OPERATOR_KEY=xxx  # Private key (NEVER expose)
HEDERA_HMAC_SECRET=xxx  # Certificate signing secret
```

**Secrets Management:**
```bash
# Supabase Secrets (encrypted at rest)
supabase secrets set HEDERA_OPERATOR_KEY="302e..."
supabase secrets set HEDERA_HMAC_SECRET="abc123..."
supabase secrets set NFT_COLLECTION_TOKEN_ID="0.0.12345"
```

**Audit Logging:**
```sql
-- All admin actions logged
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES users(id),
  action_type TEXT NOT NULL,
  target_resource_type TEXT,
  target_resource_id TEXT,
  action_details JSONB,
  changes_made JSONB,
  ip_address TEXT,
  user_agent TEXT,
  performed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger on sensitive operations
CREATE TRIGGER log_admin_action
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN (OLD.is_admin <> NEW.is_admin OR OLD.is_educator <> NEW.is_educator)
  EXECUTE FUNCTION log_admin_action();
```

#### 5. Hedera Treasury Security

**Multi-Signature (Future Enhancement):**
```typescript
// Current: Single-key treasury
// Future: Multi-sig with 2-of-3 keys
const treasuryKeys = [
  PrivateKey.fromString(process.env.TREASURY_KEY_1),
  PrivateKey.fromString(process.env.TREASURY_KEY_2),
  PrivateKey.fromString(process.env.TREASURY_KEY_3),
];

const keyList = new KeyList([
  treasuryKeys[0].publicKey,
  treasuryKeys[1].publicKey,
  treasuryKeys[2].publicKey,
], 2); // 2-of-3 threshold

const accountCreateTx = new AccountCreateTransaction()
  .setKey(keyList)
  .setInitialBalance(new Hbar(100))
  .execute(client);
```

**Transaction Limits:**
```typescript
// Set max transaction fees to prevent accidental drains
client.setDefaultMaxTransactionFee(new Hbar(100));

// All transactions must specify max fee
const mintTx = new TokenMintTransaction()
  .setTokenId(tokenId)
  .setMetadata([metadata])
  .setMaxTransactionFee(new Hbar(20)) // Explicit limit
  .execute(client);
```

---

## Performance & Scalability

### Current Performance Metrics

| Metric | Value | Target |
|--------|-------|--------|
| **Page Load Time** | <2s (3G) | <3s |
| **Time to Interactive** | <3s | <5s |
| **Database Query Time** | <100ms | <200ms |
| **API Response Time** | <500ms | <1s |
| **NFT Minting Time** | ~30s | <60s |
| **Lighthouse Score** | 85+ | 80+ |

### Scalability Strategy

#### 1. Horizontal Scaling

**Frontend:**
- Static hosting (Netlify CDN)
- Edge caching (CloudFlare - future)
- Code splitting (React.lazy)
- Image optimization (WebP, lazy loading)

**Backend:**
- Supabase auto-scales (managed)
- Edge functions (serverless, auto-scale)
- Database read replicas (future)

**Blockchain:**
- Hedera handles 10,000+ TPS
- No scaling concerns for foreseeable future

#### 2. Caching Strategy

**Database:**
- Leaderboard cache (updated every 5 minutes)
- Course content cache (static, never changes)
- User session cache (Redis - future)

**Frontend:**
- TanStack Query caching (5-minute default)
- LocalStorage for user preferences
- ServiceWorker for offline mode (future)

**API:**
- Mirror Node responses cached (1-minute TTL)
- HFS file contents cached in database

#### 3. Database Optimization

**Query Optimization:**
```sql
-- Bad: Real-time leaderboard query (1,500ms)
SELECT u.*, RANK() OVER (ORDER BY total_xp DESC) as rank
FROM users u
WHERE show_on_leaderboard = true
ORDER BY total_xp DESC
LIMIT 100;

-- Good: Cached leaderboard query (5ms)
SELECT u.*, lc.all_time_rank
FROM users u
JOIN leaderboard_cache lc ON u.id = lc.user_id
WHERE lc.all_time_rank <= 100
ORDER BY lc.all_time_rank;
```

**Connection Pooling:**
```typescript
// Supabase automatically manages connection pool
// Default: 15 connections per Edge Function

// For heavy workloads, increase pool size
const supabase = createClient(url, key, {
  db: { poolSize: 30 },
});
```

#### 4. Monitoring & Alerts

**Supabase Dashboard:**
- Database CPU usage
- Database storage
- API requests per minute
- Edge function execution time

**Custom Metrics:**
```typescript
// Track certificate minting success rate
await supabase.from('platform_metrics').insert({
  metric_name: 'certificate_mint_success_rate',
  metric_value: successRate,
  recorded_at: new Date().toISOString(),
});

// Alert if success rate drops below 95%
if (successRate < 0.95) {
  await sendAlertToAdmin('Certificate minting degraded');
}
```

---

## Code Organization

### Project Structure

```
Web3Versity_1.0/
├── src/
│   ├── components/              # React components (159 files)
│   │   ├── admin/               # Admin dashboard
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── OverviewTab.tsx
│   │   │   ├── UserRoleManagementTab.tsx
│   │   │   ├── CourseManagementTab.tsx
│   │   │   ├── AnalyticsTab.tsx
│   │   │   ├── BadgesTab.tsx
│   │   │   └── SettingsTab.tsx
│   │   ├── course/              # Course-related components
│   │   │   ├── interactive/     # 33+ interactive simulations
│   │   │   │   ├── BlockChainAnimation.tsx
│   │   │   │   ├── ConsensusAnimation.tsx
│   │   │   │   ├── PhishingSimulator.tsx
│   │   │   │   ├── DeFiProtocolExplorer.tsx
│   │   │   │   └── ...
│   │   │   ├── practical/       # 6 hands-on tools
│   │   │   │   ├── SmartContractPlayground.tsx
│   │   │   │   ├── NFTMinterStudio.tsx
│   │   │   │   ├── HCSMessageBoard.tsx
│   │   │   │   └── ...
│   │   │   └── lessons/         # Lesson renderers
│   │   │       ├── TextLesson.tsx
│   │   │       ├── QuizLesson.tsx
│   │   │       ├── InteractiveLesson.tsx
│   │   │       ├── PracticalLesson.tsx
│   │   │       └── CodeEditorLesson.tsx
│   │   ├── course-creation/     # Unified course creation system
│   │   │   ├── CourseWizard.tsx
│   │   │   ├── LiveQualityMonitor.tsx
│   │   │   ├── PrerequisiteCoursesSelector.tsx
│   │   │   └── steps/
│   │   │       ├── CourseMetadataStep.tsx
│   │   │       ├── LearningObjectivesStep.tsx
│   │   │       └── ...
│   │   ├── dashboard/           # User dashboard
│   │   │   ├── ActivityFeed.tsx
│   │   │   ├── ProgressChart.tsx
│   │   │   ├── StreakCalendar.tsx
│   │   │   └── ...
│   │   ├── pages/               # Main pages (11 files)
│   │   │   ├── CourseCatalog.tsx
│   │   │   ├── CourseViewer.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   ├── Community.tsx
│   │   │   ├── Faucet.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── VerifyCertificate.tsx
│   │   │   └── ...
│   │   ├── profile/             # User profile components
│   │   │   ├── CertificatesGallery.tsx
│   │   │   ├── BadgesGrid.tsx
│   │   │   └── ...
│   │   └── ui/                  # shadcn/ui components (40+ files)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       └── ...
│   ├── lib/                     # Business logic & utilities
│   │   ├── ai/                  # AI services (Gemini)
│   │   │   ├── ai-service.ts
│   │   │   ├── gemini-client.ts
│   │   │   ├── quality-checker.ts
│   │   │   ├── rate-limiter.ts
│   │   │   └── prompts/
│   │   ├── api/                 # API layer
│   │   │   ├── badges.ts
│   │   │   ├── certificates.ts
│   │   │   ├── faucet.ts
│   │   │   ├── progress.ts
│   │   │   └── stats.ts
│   │   ├── auth/                # Authentication
│   │   │   ├── wallet-auth.ts
│   │   │   └── wallet-signature.ts
│   │   ├── hedera/              # Hedera integration
│   │   │   ├── nft-certificates.ts
│   │   │   ├── certificate-generator.ts
│   │   │   ├── certificate-svg-template.ts
│   │   │   ├── signature.ts
│   │   │   ├── client.ts
│   │   │   ├── faucet.ts
│   │   │   ├── transactions.ts
│   │   │   └── validation.ts
│   │   ├── supabase/            # Database layer
│   │   │   ├── api.ts           # 3,700+ lines, 50+ functions
│   │   │   ├── client.ts
│   │   │   └── types.ts
│   │   ├── course-creation/     # Course builder
│   │   │   ├── types.ts
│   │   │   └── validators.ts
│   │   ├── schemas/             # Unified course/lesson schemas & transformers
│   │   │   ├── lesson-schema-unified.ts
│   │   │   ├── course-schema-unified.ts
│   │   │   ├── transformers.ts
│   │   │   └── course.ts        # Zod schemas
│   │   ├── courseContent.ts     # 44 courses, 200+ lessons (775+ lines)
│   │   └── hederaUtils.ts       # Wallet utilities (30KB+)
│   ├── hooks/                   # Custom React hooks (13 files)
│   │   ├── useCourses.ts
│   │   ├── useEnrollment.ts
│   │   ├── useBadges.ts
│   │   ├── useStats.ts
│   │   ├── useUser.ts
│   │   └── ...
│   ├── contexts/                # React Context
│   │   └── WalletContext.tsx    # 700+ lines
│   ├── stores/                  # Zustand stores
│   │   └── courseCreationStore.ts
│   ├── config/                  # Configuration
│   │   └── site.ts
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── supabase/                    # Backend
│   ├── migrations/              # SQL migrations (sequential)
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_course_prerequisites.sql
│   │   ├── 003_achievements.sql
│   │   └── ...
│   └── functions/               # Edge Functions
│       ├── mint-certificate/
│       │   ├── index.ts         # 500+ lines
│       │   └── _shared/
│       │       ├── certificate-generator.ts
│       │       └── ...
│       └── wallet-login/
│           └── index.ts
├── public/                      # Static assets
│   └── favicon.ico
├── DOCUMENTATION/               # Architecture docs
│   ├── 00-Vision/
│   ├── 01-Architecture/
│   ├── 02-Features/
│   └── 03-Database/
├── package.json                 # Dependencies (pnpm)
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite config
├── tailwind.config.js           # Tailwind config
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── README.md                    # Setup guide
├── HACKATHON_SUBMISSION.md      # This document
└── TECHNICAL_ARCHITECTURE.md    # Architecture details
```

### Unified Course Creation System Architecture

#### Overview

The unified course creation system combines AI-generated and manually-created courses into a single, consistent data structure. This enables seamless transitions between AI generation and manual editing.

#### Key Components

**1. Unified Schemas** ([src/lib/schemas/](src/lib/schemas/))

- **lesson-schema-unified.ts** - Single source of truth for all lesson types
  ```typescript
  export interface UnifiedLesson {
    id: string; // Format: course_20250127_a3f9_lesson_01
    title: string;
    lesson_type: 'text' | 'interactive' | 'quiz' | 'practical';
    duration_minutes: number;
    completion_xp: number;
    perfect_score_xp: number;
    content: LessonContentByType;
    sequence_number: number;
  }
  ```

- **course-schema-unified.ts** - Complete unified course structure
  ```typescript
  export interface UnifiedCourse {
    id: string;
    title: string;
    description: string;
    track: 'explorer' | 'developer';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimated_hours: number;
    thumbnail_emoji: string;

    // NEW: Discovery & Organization fields
    category: string; // Required for catalog filtering
    target_audience: string; // Required, 50-500 chars
    prerequisites: string[]; // Array of course IDs

    learning_objectives: string[];
    lessons: UnifiedLesson[];
    creator_id: string;
    created_with: 'ai' | 'manual';
    quality_score?: number;
    draft_status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  }
  ```

**2. Bidirectional Transformers** ([src/lib/schemas/transformers.ts](src/lib/schemas/transformers.ts))

Enables seamless conversion between different course formats:

- **AI → Unified**: `aiCourseToUnified()`
- **Manual → Unified**: `manualDraftToUnified()`
- **Unified → Manual**: `unifiedCourseToManualDraft()`
- **Unified → Database**: `unifiedCourseToDatabase()`
- **Database → Unified**: `databaseToUnifiedCourse()`
- **AI → Manual (with quality)**: `convertAICourseToManualDraft()`

**3. Live Quality Monitor** ([src/components/course-creation/LiveQualityMonitor.tsx](src/components/course-creation/LiveQualityMonitor.tsx))

Real-time quality feedback widget displayed while creating/editing courses:
- **Debounced recalculation** (1-second delay) to avoid performance issues
- **Color-coded feedback**: Red (<60), Yellow (60-79), Green (80+)
- **Expandable/collapsible** sticky sidebar
- **Shows**: Errors, warnings, passed checks, overall score
- **Auto-updates** quality score in draft metadata

**4. Prerequisites Selector** ([src/components/course-creation/PrerequisiteCoursesSelector.tsx](src/components/course-creation/PrerequisiteCoursesSelector.tsx))

Interactive UI for selecting prerequisite courses:
- **Real-time search** with autocomplete (searches titles/descriptions via Supabase)
- **Drag-and-drop reordering** using HTML5 drag-and-drop API
- **Circular dependency prevention** (excludes current course from results)
- **Visual course cards** with track badges and difficulty indicators
- **Numbered badges** showing prerequisite order

**5. Database Schema** ([supabase/migrations/064_add_unified_course_fields.sql](supabase/migrations/064_add_unified_course_fields.sql))

New database columns for unified course data:
```sql
-- Top-level columns (not in JSONB)
ALTER TABLE course_drafts
ADD COLUMN IF NOT EXISTS quality_score INTEGER
CHECK (quality_score >= 0 AND quality_score <= 100);

ALTER TABLE course_drafts
ADD COLUMN IF NOT EXISTS created_with TEXT
CHECK (created_with IN ('ai', 'manual'));

-- JSONB course_data structure includes:
-- - category: string (required)
-- - target_audience: string (required, 50-500 chars)
-- - prerequisites: string[] (array of course IDs)

-- Indexes for performance
CREATE INDEX idx_course_drafts_quality_score ON course_drafts(quality_score DESC NULLS LAST);
CREATE INDEX idx_course_drafts_created_with ON course_drafts(created_with);
CREATE INDEX idx_courses_category ON courses ((course_data->>'category'));
CREATE INDEX idx_courses_prerequisites ON courses USING GIN ((course_data->'prerequisites'));
```

#### Workflow: AI Course Editing

1. User generates course with AI ([CourseGenerator.tsx](src/components/ai/CourseGenerator.tsx))
2. AI returns `GeneratedCourse` with quality report
3. User clicks "Edit" button
4. `handleEdit()` function:
   - Calls `convertAICourseToManualDraft(generatedCourse, qualityReport.score)`
   - Loads draft into course creation store
   - Navigates to `/create-course`
5. CourseWizard displays with:
   - All AI-generated data pre-filled
   - Quality score preserved and displayed
   - Live quality monitor active
   - User can modify any field
6. Changes tracked with `isDirty` flag
7. Save to database with `created_with: 'ai'` (preserves origin)

#### Workflow: Manual Course Creation

1. User navigates to `/create-course`
2. CourseWizard initialized with empty draft
3. User fills in metadata (Step 1):
   - Title, description, track, difficulty, hours
   - **NEW**: Category (dropdown, 10 options)
   - **NEW**: Target audience (textarea, 50-500 chars)
   - **NEW**: Prerequisites (search + drag-and-drop)
4. User adds learning objectives (Step 2)
5. User creates lessons (Step 3)
6. Live quality monitor provides real-time feedback
7. User reviews and submits (Step 5)
8. Save to database with `created_with: 'manual'`

#### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    AI GENERATOR                             │
│  GeneratedCourse (AI format)                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ aiCourseToUnified()
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  UNIFIED FORMAT                             │
│  UnifiedCourse (single source of truth)                     │
│  - Standard field names                                     │
│  - Consistent validation                                    │
│  - Complete metadata                                        │
└──────┬─────────────────────────────────────────┬────────────┘
       │                                         │
       │ unifiedCourseToManualDraft()           │ unifiedCourseToDatabase()
       ▼                                         ▼
┌────────────────────────┐         ┌────────────────────────────┐
│   MANUAL EDITOR        │         │   DATABASE (Supabase)      │
│  CourseDraft format    │         │  course_drafts table       │
│  (CourseWizard)        │         │  - quality_score column    │
│                        │         │  - created_with column     │
└───────┬────────────────┘         │  - course_data JSONB       │
        │                          └────────────────────────────┘
        │ manualDraftToUnified()
        ▼
┌─────────────────────────────────────────────────────────────┐
│                  UNIFIED FORMAT                             │
│  (back to unified for validation/saving)                    │
└─────────────────────────────────────────────────────────────┘
```

### Naming Conventions

**Files:**
- React components: PascalCase (e.g., `CourseViewer.tsx`)
- Utilities: camelCase (e.g., `hederaUtils.ts`)
- Types: PascalCase (e.g., `CourseType.ts`)
- SQL migrations: Numbered (e.g., `001_initial_schema.sql`)

**Variables:**
- Constants: UPPER_SNAKE_CASE (e.g., `HEDERA_TESTNET_RPC`)
- Functions: camelCase (e.g., `mintCertificate()`)
- React components: PascalCase (e.g., `<CourseCard />`)
- Database columns: snake_case (e.g., `user_id`, `created_at`)

**Code Style:**
- 2-space indentation
- Single quotes for strings
- Semicolons required
- Max line length: 100 characters
- No trailing commas in multiline (TypeScript default)

---

## API Documentation

### REST API (Supabase)

**Base URL:** `https://YOUR_PROJECT.supabase.co/rest/v1`

**Authentication:** Bearer token (JWT)

**Common Headers:**
```http
Authorization: Bearer YOUR_JWT_TOKEN
apikey: YOUR_ANON_KEY
Content-Type: application/json
```

### Key Endpoints

#### 1. GET /courses
Fetch all published courses

**Query Parameters:**
- `track` (optional): `explorer` or `developer`
- `difficulty` (optional): `beginner`, `intermediate`, `advanced`
- `limit` (optional): Number of results (default: 50)

**Example:**
```http
GET /rest/v1/courses?track=eq.developer&difficulty=eq.beginner&limit=10
```

**Response:**
```json
[
  {
    "id": "blockchain-fundamentals",
    "title": "Blockchain Fundamentals",
    "description": "Learn the basics...",
    "track": "developer",
    "difficulty": "beginner",
    "estimated_hours": 5,
    "total_lessons": 12,
    "enrollment_count": 1234,
    "completion_count": 456,
    "average_rating": 4.8
  }
]
```

---

#### 2. GET /lessons
Fetch lessons for a course

**Query Parameters:**
- `course_id` (required): Course slug
- `order` (optional): `sequence_number.asc` (default)

**Example:**
```http
GET /rest/v1/lessons?course_id=eq.blockchain-fundamentals&order=sequence_number.asc
```

**Response:**
```json
[
  {
    "id": "lesson-001",
    "course_id": "blockchain-fundamentals",
    "title": "What is Blockchain?",
    "lesson_type": "text",
    "content": { "sections": [...] },
    "sequence_number": 1,
    "duration_minutes": 15,
    "completion_xp": 10
  }
]
```

---

#### 3. POST /user_progress
Enroll in a course

**Request Body:**
```json
{
  "user_id": "uuid",
  "course_id": "blockchain-fundamentals",
  "total_lessons": 12
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "course_id": "blockchain-fundamentals",
  "enrollment_date": "2025-01-15T10:30:00Z",
  "progress_percentage": 0
}
```

---

#### 4. POST /lesson_completions
Mark lesson as completed

**Request Body:**
```json
{
  "user_id": "uuid",
  "lesson_id": "lesson-001",
  "course_id": "blockchain-fundamentals",
  "completed_at": "2025-01-15T10:45:00Z",
  "time_spent_seconds": 900,
  "score_percentage": 100,
  "xp_earned": 30
}
```

**Response:**
```json
{
  "id": "uuid",
  "xp_earned": 30,
  "level_up": false
}
```

---

### Edge Functions API

**Base URL:** `https://YOUR_PROJECT.supabase.co/functions/v1`

#### 1. POST /mint-certificate
Mint NFT certificate

**Headers:**
```http
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "uuid",
  "courseId": "blockchain-fundamentals"
}
```

**Response (Success):**
```json
{
  "success": true,
  "certificate": {
    "id": "uuid",
    "certificateNumber": "W3V-2025-1698765432",
    "tokenId": "0.0.12345",
    "serialNumber": 1,
    "imageHfsFileId": "0.0.67890",
    "metadataHfsFileId": "0.0.67891",
    "platformSignature": "abc123...",
    "mintTransactionId": "0.0.X@1234567890.123456789",
    "transferTransactionId": "0.0.Y@...",
    "hashScanUrl": "https://hashscan.io/testnet/token/0.0.12345/1",
    "status": "transferred"
  }
}
```

**Response (Error - Not Eligible):**
```json
{
  "error": "Not eligible to claim certificate",
  "details": {
    "completion_percentage": 75,
    "already_claimed": false
  }
}
```

---

#### 2. POST /wallet-login
Authenticate with wallet signature

**Request Body:**
```json
{
  "walletAddress": "0xABC...",
  "signature": "0x123...",
  "message": "Sign in to Web3Versity\nTimestamp: 1698765432"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "evm_address": "0xABC...",
    "username": "user123",
    "total_xp": 1500,
    "current_level": 12,
    "is_admin": false
  }
}
```

---

## Deployment Architecture

### Current Deployment (Local Development)

```
┌─────────────────────────────────────────────────────────┐
│ DEVELOPER MACHINE (localhost)                          │
├─────────────────────────────────────────────────────────┤
│ Frontend: http://localhost:3000 (Vite dev server)      │
│ Backend: Supabase Cloud (managed)                      │
│ Blockchain: Hedera Testnet (public)                    │
└─────────────────────────────────────────────────────────┘
```

### Production Deployment (Planned)

```
┌────────────────────────────────────────────────────────────┐
│ USERS (Global)                                             │
│  - Desktop, Mobile, Tablet                                 │
│  - Metamask, HashPack, Blade wallets                       │
└────────────────┬───────────────────────────────────────────┘
                 │
                 │ HTTPS
                 ▼
┌────────────────────────────────────────────────────────────┐
│ CDN LAYER (CloudFlare or Netlify CDN)                     │
│  - Edge caching (HTML, CSS, JS, images)                   │
│  - DDoS protection                                         │
│  - SSL/TLS termination                                     │
│  - Geographic distribution (20+ edge locations)            │
└────────────────┬───────────────────────────────────────────┘
                 │
                 │ Cache MISS
                 ▼
┌────────────────────────────────────────────────────────────┐
│ STATIC HOSTING (Netlify)                                  │
│  - React SPA (build output)                               │
│  - Auto-deploy from GitHub (main branch)                  │
│  - Atomic deployments (instant rollback)                  │
│  - Preview deployments (PR branches)                       │
│  - Environment variables                                   │
└────────────────┬───────────────────────────────────────────┘
                 │
                 │ API Calls
                 ▼
┌────────────────────────────────────────────────────────────┐
│ BACKEND (Supabase Cloud - Managed)                        │
├────────────────────────────────────────────────────────────┤
│ PostgreSQL Database (Multi-AZ, Auto-Backup)               │
│ Edge Functions (Deno runtime, Auto-Scale)                 │
│ Real-Time API (WebSocket)                                 │
│ Authentication (JWT)                                       │
│ Storage (for uploaded files - future)                     │
└────────────────┬───────────────────────────────────────────┘
                 │
                 │ Hedera SDK
                 ▼
┌────────────────────────────────────────────────────────────┐
│ HEDERA TESTNET (Public Blockchain)                        │
│  - JSON-RPC: testnet.hashio.io/api                        │
│  - Mirror Node: testnet.mirrornode.hedera.com             │
│  - Services: HTS, HFS, HCS, Smart Contracts               │
└────────────────────────────────────────────────────────────┘
```

### Deployment Checklist

**Prerequisites:**
- [ ] Netlify account created
- [ ] Supabase project created
- [ ] Hedera testnet account funded (10,000+ HBAR)
- [ ] Domain name purchased (optional)

**Steps:**

1. **Build Frontend**
   ```bash
   pnpm run build
   # Output: dist/ directory
   ```

2. **Deploy to Netlify**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Login
   netlify login

   # Deploy
   netlify deploy --prod
   ```

   **Environment Variables (Netlify Dashboard):**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_HEDERA_NETWORK=testnet`
   - `VITE_HEDERA_TESTNET_RPC`
   - `VITE_HEDERA_OPERATOR_ID`
   - `VITE_AI_FEATURES_ENABLED=true`

3. **Deploy Edge Functions**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   supabase functions deploy mint-certificate
   supabase functions deploy wallet-login
   ```

4. **Set Supabase Secrets**
   ```bash
   supabase secrets set HEDERA_OPERATOR_ID="0.0.12345"
   supabase secrets set HEDERA_OPERATOR_KEY="302e..."
   supabase secrets set HEDERA_HMAC_SECRET="abc123..."
   supabase secrets set NFT_COLLECTION_TOKEN_ID="0.0.67890"
   supabase secrets set GEMINI_API_KEY="AIza..."
   supabase secrets set PINATA_API_KEY="xxx"
   supabase secrets set PINATA_API_SECRET="xxx"
   ```

5. **Run Database Migrations**
   ```bash
   supabase db push
   ```

6. **Configure Custom Domain** (Optional)
   - Netlify Dashboard → Domain Settings
   - Add custom domain: `web3versity.com`
   - Netlify provides free SSL certificate

7. **Set Up Monitoring**
   - Netlify Analytics (page views, performance)
   - Supabase Dashboard (database metrics, API usage)
   - Hedera HashScan (transaction monitoring)

8. **Create First Admin**
   ```sql
   -- Run in Supabase SQL Editor
   UPDATE users
   SET is_admin = true
   WHERE evm_address = '0xYOUR_WALLET_ADDRESS';
   ```

9. **Create NFT Collection** (One-Time)
   ```bash
   # Run locally or via Edge Function
   node scripts/create-nft-collection.js

   # Returns: Token ID (0.0.XXXXX)
   # Store in Supabase secrets:
   supabase secrets set NFT_COLLECTION_TOKEN_ID="0.0.XXXXX"
   ```

10. **Test Production Environment**
    - Connect wallet
    - Enroll in course
    - Complete lesson
    - Mint certificate
    - Verify on HashScan

---

### Monitoring & Maintenance

**Daily Tasks:**
- Check error logs (Supabase Dashboard)
- Monitor HBAR balance (Hedera Treasury)
- Review user feedback (community forum)

**Weekly Tasks:**
- Refresh leaderboard cache (automated cron)
- Review admin audit logs
- Update course content (if needed)

**Monthly Tasks:**
- Review performance metrics
- Optimize slow queries
- Rotate API keys
- Backup database (automated by Supabase)

---

## Conclusion

Web3Versity is a **production-ready, scalable, and secure** educational platform built with modern technologies and deeply integrated with Hedera Hashgraph. The architecture prioritizes:

1. **User Experience** - Fast, responsive, mobile-first
2. **Security** - Wallet-based auth, RLS, rate limiting
3. **Scalability** - Serverless backend, cached queries
4. **Maintainability** - Type-safe code, modular structure
5. **Cost-Efficiency** - Free tiers, Hedera's low fees

**Key Technical Achievements:**
- ✅ 17 database tables with 45+ optimized indexes
- ✅ 159 React components (100% TypeScript)
- ✅ 6 Hedera services integrated (HTS, HFS, HCS, Contracts, JSON-RPC, Mirror Node)
- ✅ Production-ready NFT minting (<$0.10 per certificate)
- ✅ Real-time leaderboards with 5ms query time
- ✅ 33+ interactive educational components
- ✅ AI-powered course generation (Google Gemini)
- ✅ Comprehensive admin system (6 tabs, RBAC)

**Technology Stack:**
- Frontend: React 18 + TypeScript + Vite + Tailwind
- Backend: Supabase (PostgreSQL 15 + Edge Functions)
- Blockchain: Hedera Testnet (@hashgraph/sdk + ethers.js)
- AI: Google Gemini API
- Deployment: Netlify (frontend) + Supabase Cloud (backend)

**Ready for Scale:**
- Current capacity: 10,000+ concurrent users
- Database: 1M+ rows (no performance degradation)
- Hedera: 10,000 TPS (no bottleneck)
- Cost: ~$75/month for 1,000 active users

---

*This technical architecture document was created for the Hedera Africa Hackathon 2025.*
*For questions, contact: team@web3versity.io*
