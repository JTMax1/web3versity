import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code, Palette, LineChart, Shield, Users, Briefcase, DollarSign, TrendingUp, BookOpen, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';

interface CareerExplorerProps {
  onInteract?: () => void;
}

interface CareerPath {
  id: string;
  icon: any;
  title: string;
  description: string;
  skills: string[];
  salary: {
    entry: string;
    mid: string;
    senior: string;
  };
  demand: 'High' | 'Very High' | 'Extreme';
  africanOpportunities: string[];
  learningPath: string[];
  companies: string[];
  color: string;
}

const careerPaths: CareerPath[] = [
  {
    id: 'blockchain-dev',
    icon: Code,
    title: 'Blockchain Developer',
    description: 'Build decentralized applications and smart contracts on platforms like Hedera, Ethereum, and more.',
    skills: ['Solidity', 'JavaScript', 'Web3.js', 'Smart Contracts', 'Hedera SDK'],
    salary: {
      entry: '$40k - $70k',
      mid: '$80k - $120k',
      senior: '$150k - $250k+'
    },
    demand: 'Extreme',
    africanOpportunities: [
      'Remote work for global companies',
      'African blockchain startups (Nigeria, Kenya, SA)',
      'DeFi protocols expanding to Africa',
      'Local payment solutions using blockchain'
    ],
    learningPath: [
      'Master JavaScript/TypeScript',
      'Learn Solidity basics',
      'Build smart contracts on testnet',
      'Contribute to open-source projects',
      'Build portfolio of dApps'
    ],
    companies: ['Hedera', 'Flutterwave', 'Yellow Card', 'Mara', 'Luno'],
    color: 'blue'
  },
  {
    id: 'web3-designer',
    icon: Palette,
    title: 'Web3 UI/UX Designer',
    description: 'Design beautiful, intuitive interfaces for crypto wallets, NFT platforms, and dApps.',
    skills: ['Figma', 'UI/UX', 'Web3 Flows', 'NFT Design', 'Prototyping'],
    salary: {
      entry: '$30k - $50k',
      mid: '$60k - $100k',
      senior: '$120k - $180k'
    },
    demand: 'Very High',
    africanOpportunities: [
      'Design for African-focused crypto apps',
      'NFT marketplace design',
      'Wallet UX for mobile-first users',
      'Design consultancy for Web3 projects'
    ],
    learningPath: [
      'Master design tools (Figma, Sketch)',
      'Understand Web3 user flows',
      'Study successful dApp designs',
      'Design wallet mockups',
      'Create NFT collection visuals'
    ],
    companies: ['OpenSea', 'Rainbow Wallet', 'Luno', 'African NFT platforms'],
    color: 'purple'
  },
  {
    id: 'defi-analyst',
    icon: LineChart,
    title: 'DeFi Analyst',
    description: 'Analyze decentralized finance protocols, identify opportunities, and manage crypto portfolios.',
    skills: ['Financial Analysis', 'DeFi Protocols', 'Data Analysis', 'Risk Assessment'],
    salary: {
      entry: '$35k - $60k',
      mid: '$70k - $110k',
      senior: '$130k - $200k'
    },
    demand: 'High',
    africanOpportunities: [
      'Crypto investment firms',
      'DeFi education platforms',
      'Portfolio management services',
      'Research for African crypto adoption'
    ],
    learningPath: [
      'Understand traditional finance',
      'Learn DeFi protocols (Aave, Uniswap, etc.)',
      'Practice portfolio analysis',
      'Write investment reports',
      'Build DeFi dashboard'
    ],
    companies: ['Binance', 'Luno', 'Yellow Card', 'VALR'],
    color: 'green'
  },
  {
    id: 'security-auditor',
    icon: Shield,
    title: 'Smart Contract Auditor',
    description: 'Review and secure smart contracts, identify vulnerabilities, protect millions in crypto assets.',
    skills: ['Solidity', 'Security', 'Auditing', 'Cryptography', 'Testing'],
    salary: {
      entry: '$50k - $80k',
      mid: '$100k - $150k',
      senior: '$180k - $300k+'
    },
    demand: 'Extreme',
    africanOpportunities: [
      'Remote auditing for global firms',
      'Security consultancy',
      'Training African developers',
      'Bug bounty hunting'
    ],
    learningPath: [
      'Master Solidity development',
      'Study common vulnerabilities',
      'Practice CTF challenges',
      'Audit open-source contracts',
      'Get certified (CertiK, etc.)'
    ],
    companies: ['CertiK', 'Trail of Bits', 'OpenZeppelin', 'Quantstamp'],
    color: 'red'
  },
  {
    id: 'community-manager',
    icon: Users,
    title: 'Web3 Community Manager',
    description: 'Build and engage crypto communities, manage Discord/Twitter, drive adoption and engagement.',
    skills: ['Community Building', 'Social Media', 'Discord/Twitter', 'Content Creation'],
    salary: {
      entry: '$25k - $45k',
      mid: '$50k - $80k',
      senior: '$90k - $140k'
    },
    demand: 'Very High',
    africanOpportunities: [
      'African crypto projects need local managers',
      'Global projects want African expansion',
      'NFT project community building',
      'Education and onboarding focus'
    ],
    learningPath: [
      'Build personal crypto presence',
      'Learn Discord/community tools',
      'Study successful communities',
      'Create engaging content',
      'Manage small project communities'
    ],
    companies: ['Most crypto projects', 'Yellow Card', 'Quidax', 'Bundle Africa'],
    color: 'orange'
  },
  {
    id: 'product-manager',
    icon: Briefcase,
    title: 'Web3 Product Manager',
    description: 'Define product strategy, manage roadmaps, bridge tech and business for crypto products.',
    skills: ['Product Strategy', 'Agile', 'Web3 Knowledge', 'User Research', 'Analytics'],
    salary: {
      entry: '$45k - $75k',
      mid: '$90k - $140k',
      senior: '$160k - $250k+'
    },
    demand: 'Very High',
    africanOpportunities: [
      'Crypto fintech startups',
      'Payment solutions',
      'NFT platforms',
      'DeFi products for African markets'
    ],
    learningPath: [
      'Understand product management basics',
      'Deep dive into Web3 products',
      'Learn user research',
      'Study successful crypto products',
      'Build your own mini dApp'
    ],
    companies: ['Flutterwave', 'Chipper Cash', 'Luno', 'VALR', 'Mara'],
    color: 'indigo'
  }
];

export const CareerExplorer: React.FC<CareerExplorerProps> = ({ onInteract }) => {
  const [selectedCareer, setSelectedCareer] = useState<CareerPath | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleSelectCareer = (career: CareerPath) => {
    setSelectedCareer(career);
    if (!hasInteracted) {
      setHasInteracted(true);
      onInteract?.();
    }
  };

  const handleBack = () => {
    setSelectedCareer(null);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      green: 'from-green-500 to-green-600',
      red: 'from-red-500 to-red-600',
      orange: 'from-orange-500 to-orange-600',
      indigo: 'from-indigo-500 to-indigo-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getDemandColor = (demand: string) => {
    if (demand === 'Extreme') return 'bg-red-500 text-white';
    if (demand === 'Very High') return 'bg-orange-500 text-white';
    return 'bg-green-500 text-white';
  };

  if (selectedCareer) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="w-full p-6 space-y-6"
      >
        <Button onClick={handleBack} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Career Paths
        </Button>

        {/* Header */}
        <Card className={`p-8 bg-gradient-to-r ${getColorClasses(selectedCareer.color)} text-white`}>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <selectedCareer.icon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl mb-2">{selectedCareer.title}</h2>
              <p className="text-white/90 text-lg">{selectedCareer.description}</p>
              <div className="mt-4">
                <Badge className={`${getDemandColor(selectedCareer.demand)} border-0`}>
                  {selectedCareer.demand} Demand
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Salary Information */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <h3 className="mb-4 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            Salary Ranges (USD, Annual)
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/70 dark:bg-gray-900/70 rounded-xl text-center">
              <p className="text-sm text-muted-foreground mb-1">Entry Level</p>
              <p className="text-xl font-bold text-green-600">{selectedCareer.salary.entry}</p>
            </div>
            <div className="p-4 bg-white/70 dark:bg-gray-900/70 rounded-xl text-center">
              <p className="text-sm text-muted-foreground mb-1">Mid Level</p>
              <p className="text-xl font-bold text-blue-600">{selectedCareer.salary.mid}</p>
            </div>
            <div className="p-4 bg-white/70 dark:bg-gray-900/70 rounded-xl text-center">
              <p className="text-sm text-muted-foreground mb-1">Senior Level</p>
              <p className="text-xl font-bold text-purple-600">{selectedCareer.salary.senior}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            💡 African professionals often work remotely for global salaries while living locally
          </p>
        </Card>

        {/* Required Skills */}
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Required Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedCareer.skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="px-4 py-2">
                {skill}
              </Badge>
            ))}
          </div>
        </Card>

        {/* African Opportunities */}
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
          <h3 className="mb-4 flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            African Opportunities
          </h3>
          <ul className="space-y-3">
            {selectedCareer.africanOpportunities.map((opp, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg">
                <span className="text-amber-600 mt-1">✓</span>
                <span>{opp}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Learning Path */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <h3 className="mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            Learning Path
          </h3>
          <div className="space-y-3">
            {selectedCareer.learningPath.map((step, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <span className="mt-1">{step}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Companies Hiring */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <h3 className="mb-4 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            Companies & Projects Hiring
          </h3>
          <div className="flex flex-wrap gap-3">
            {selectedCareer.companies.map((company, index) => (
              <div key={index} className="px-4 py-2 bg-white/70 dark:bg-gray-900/70 rounded-lg font-medium">
                {company}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            💼 Check crypto job boards: CryptoJobsList, Web3.career, RemoteOK
          </p>
        </Card>

        {/* Next Steps */}
        <Card className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <h3 className="mb-4">🚀 Ready to Start?</h3>
          <div className="space-y-2 text-white/90">
            <p>1. Complete the Web3versity courses relevant to this career</p>
            <p>2. Build projects for your portfolio</p>
            <p>3. Join Web3 communities (Discord, Twitter)</p>
            <p>4. Network with African Web3 professionals</p>
            <p>5. Apply for internships or junior positions</p>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-4xl">Explore Web3 Careers</h2>
        <p className="text-muted-foreground text-lg">
          Discover high-paying career paths in the blockchain industry
        </p>
        <p className="text-sm text-blue-600">
          Click any career to see detailed information, salary ranges, and learning paths
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {careerPaths.map((career) => (
          <motion.div
            key={career.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className="p-6 cursor-pointer hover:shadow-lg transition-all h-full"
              onClick={() => handleSelectCareer(career)}
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${getColorClasses(career.color)} rounded-2xl flex items-center justify-center mb-4`}>
                <career.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="mb-2">{career.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {career.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <Badge className={`${getDemandColor(career.demand)} border-0`}>
                  {career.demand}
                </Badge>
                <span className="text-xs text-green-600 font-bold">
                  {career.salary.mid}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {career.skills.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {career.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{career.skills.length - 3}
                  </Badge>
                )}
              </div>

              <Button className="w-full" variant="outline">
                Learn More
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Why Web3 Careers for Africans */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 mt-8">
        <h3 className="mb-4">🌍 Why Web3 Careers Are Perfect for Africa</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="font-semibold text-blue-600">💰 Global Salaries, Local Cost of Living</p>
            <p className="text-sm text-muted-foreground">
              Earn in USD while living in Africa, giving you 3-5x purchasing power
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-purple-600">🏠 Remote-First Industry</p>
            <p className="text-sm text-muted-foreground">
              90% of Web3 jobs are remote - work from anywhere in Africa
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-green-600">📈 Fastest Growing Tech Sector</p>
            <p className="text-sm text-muted-foreground">
              Blockchain jobs grew 395% in 2021-2023, with Africa leading adoption
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-orange-600">🚀 Low Barrier to Entry</p>
            <p className="text-sm text-muted-foreground">
              Learn online, build portfolio, get hired - no traditional degrees required
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
