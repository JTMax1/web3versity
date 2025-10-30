/**
 * Hedera Governing Council Timeline - Interactive Governance Education
 *
 * WOW Factor: Visualize how Hedera's unique governance works!
 * Shows the evolution of the governing council and how decisions are made.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2, Users, Shield, Globe, CheckCircle, Info,
  Calendar, TrendingUp, Award, ExternalLink
} from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';

interface HederaCouncilTimelineProps {
  onInteract?: () => void;
}

interface CouncilMember {
  id: string;
  name: string;
  logo: string;
  industry: string;
  joinedYear: number;
  region: string;
  description: string;
  contribution: string;
}

const COUNCIL_MEMBERS: CouncilMember[] = [
  {
    id: 'google',
    name: 'Google',
    logo: '🔍',
    industry: 'Technology',
    joinedYear: 2019,
    region: 'North America',
    description: 'Global technology leader and cloud provider',
    contribution: 'Infrastructure and technical expertise'
  },
  {
    id: 'ibm',
    name: 'IBM',
    logo: '💼',
    industry: 'Technology',
    joinedYear: 2019,
    region: 'North America',
    description: 'Enterprise technology and consulting',
    contribution: 'Enterprise blockchain solutions'
  },
  {
    id: 'boeing',
    name: 'Boeing',
    logo: '✈️',
    industry: 'Aerospace',
    joinedYear: 2019,
    region: 'North America',
    description: 'Aerospace and defense manufacturer',
    contribution: 'Supply chain and aerospace applications'
  },
  {
    id: 'deutsche-telekom',
    name: 'Deutsche Telekom',
    logo: '📡',
    industry: 'Telecommunications',
    joinedYear: 2019,
    region: 'Europe',
    description: 'Leading European telecom provider',
    contribution: 'Network infrastructure and connectivity'
  },
  {
    id: 'lg',
    name: 'LG Electronics',
    logo: '📺',
    industry: 'Electronics',
    joinedYear: 2020,
    region: 'Asia',
    description: 'Consumer electronics and home appliances',
    contribution: 'IoT and smart home integration'
  },
  {
    id: 'ucl',
    name: 'University College London',
    logo: '🎓',
    industry: 'Education',
    joinedYear: 2019,
    region: 'Europe',
    description: 'Leading research university',
    contribution: 'Research and academic validation'
  },
  {
    id: 'wipro',
    name: 'Wipro',
    logo: '💻',
    industry: 'IT Services',
    joinedYear: 2021,
    region: 'Asia',
    description: 'Global IT consulting and services',
    contribution: 'Enterprise solutions and consulting'
  },
  {
    id: 'standard-bank',
    name: 'Standard Bank',
    logo: '🏦',
    industry: 'Banking',
    joinedYear: 2022,
    region: 'Africa',
    description: 'Africa\'s largest bank by assets',
    contribution: 'Financial services and African expansion'
  }
];

const GOVERNANCE_FACTS = [
  {
    icon: '🏛️',
    title: 'Decentralized Governance',
    description: 'Up to 39 diverse organizations govern Hedera, no single entity has control'
  },
  {
    icon: '🌍',
    title: 'Global Representation',
    description: 'Council members span multiple continents, industries, and sectors'
  },
  {
    icon: '⚖️',
    title: 'Term Limits',
    description: 'Members serve limited terms to ensure fresh perspectives and prevent centralization'
  },
  {
    icon: '🗳️',
    title: 'Voting Rights',
    description: 'Each council member has equal voting power on network decisions'
  },
  {
    icon: '🔒',
    title: 'Node Operation',
    description: 'Council members run consensus nodes to secure the network'
  },
  {
    icon: '💡',
    title: 'Technical Contribution',
    description: 'Members contribute expertise from their respective industries'
  }
];

export const HederaCouncilTimeline: React.FC<HederaCouncilTimelineProps> = ({ onInteract }) => {
  const [selectedMember, setSelectedMember] = useState<CouncilMember | null>(null);
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [hasInteracted, setHasInteracted] = useState(false);

  const industries = ['all', ...Array.from(new Set(COUNCIL_MEMBERS.map(m => m.industry)))];
  const regions = ['all', ...Array.from(new Set(COUNCIL_MEMBERS.map(m => m.region)))];

  const filteredMembers = COUNCIL_MEMBERS.filter(member => {
    if (filterIndustry !== 'all' && member.industry !== filterIndustry) return false;
    if (filterRegion !== 'all' && member.region !== filterRegion) return false;
    return true;
  });

  const handleSelectMember = (member: CouncilMember) => {
    setSelectedMember(member);
    if (!hasInteracted) {
      setHasInteracted(true);
      onInteract?.();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <Card className="p-6 md:p-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
            <Building2 className="w-7 h-7 md:w-8 md:h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Hedera Governing Council</h2>
            <p className="text-white/90 text-sm md:text-base mb-3">
              Explore how Hedera's unique decentralized governance model works
            </p>
            <div className="flex flex-wrap gap-2 text-xs md:text-sm">
              <div className="px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                🏛️ Up to 39 Members
              </div>
              <div className="px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                🌍 Global Diversity
              </div>
              <div className="px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                ⚖️ Equal Voting Power
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* What Makes Hedera Different */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-2 border-blue-200">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Why Hedera's Governance is Unique
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="font-semibold text-blue-900 dark:text-blue-300">Traditional Blockchain</p>
            <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
              <li>• Anonymous miners/validators</li>
              <li>• Concentrated mining pools</li>
              <li>• 51% attack risks</li>
              <li>• Energy intensive PoW</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-purple-900 dark:text-purple-300">Other DLTs</p>
            <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
              <li>• Token-weighted voting</li>
              <li>• Whale dominance</li>
              <li>• Foundation control</li>
              <li>• Plutocracy risks</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-green-900 dark:text-green-300">Hedera ✓</p>
            <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
              <li>• Known, trusted organizations</li>
              <li>• Equal voting rights</li>
              <li>• Industry diversity</li>
              <li>• Geographic distribution</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2">Filter by Industry</label>
            <select
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
            >
              {industries.map(industry => (
                <option key={industry} value={industry}>
                  {industry === 'all' ? 'All Industries' : industry}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2">Filter by Region</label>
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
            >
              {regions.map(region => (
                <option key={region} value={region}>
                  {region === 'all' ? 'All Regions' : region}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
          Showing {filteredMembers.length} of {COUNCIL_MEMBERS.length} council members
        </p>
      </Card>

      {/* Council Members Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredMembers.map((member) => (
          <motion.div
            key={member.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            layout
          >
            <Card
              onClick={() => handleSelectMember(member)}
              className="p-6 cursor-pointer hover:shadow-xl transition-all text-center h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 hover:border-purple-400"
            >
              <div className="text-5xl mb-3">{member.logo}</div>
              <h4 className="font-bold text-base mb-1">{member.name}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{member.industry}</p>
              <div className="flex items-center justify-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                <Calendar className="w-3 h-3" />
                <span>Joined {member.joinedYear}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Selected Member Details */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6 md:p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-2 border-purple-300">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-6xl">{selectedMember.logo}</div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{selectedMember.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                        {selectedMember.industry}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                        {selectedMember.region}
                      </span>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Joined {selectedMember.joinedYear}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">{selectedMember.description}</p>
                    <div className="flex items-start gap-2 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Award className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-purple-900 dark:text-purple-300 text-sm">Contribution:</p>
                        <p className="text-sm text-purple-800 dark:text-purple-400">{selectedMember.contribution}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedMember(null)}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Governance Facts */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Info className="w-6 h-6 text-indigo-600" />
          How Hedera Governance Works
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GOVERNANCE_FACTS.map((fact, index) => (
            <Card key={index} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <div className="text-3xl mb-2">{fact.icon}</div>
              <h4 className="font-bold text-sm mb-2">{fact.title}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">{fact.description}</p>
            </Card>
          ))}
        </div>
      </Card>

      {/* Comparison with Traditional Systems */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <h3 className="text-xl font-bold mb-4">Why This Matters for Africa</h3>
        <div className="space-y-3 text-sm md:text-base">
          <div className="flex items-start gap-3 p-3 bg-white/70 dark:bg-gray-900/70 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Trusted Infrastructure</p>
              <p className="text-gray-600 dark:text-gray-400">Known organizations like Standard Bank ensure credibility for African institutions</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white/70 dark:bg-gray-900/70 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">No Plutocracy</p>
              <p className="text-gray-600 dark:text-gray-400">Equal voting prevents wealthy entities from controlling the network</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white/70 dark:bg-gray-900/70 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Industry Expertise</p>
              <p className="text-gray-600 dark:text-gray-400">Diverse sectors bring real-world solutions for banking, telecom, and more</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white/70 dark:bg-gray-900/70 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Long-term Stability</p>
              <p className="text-gray-600 dark:text-gray-400">Term limits and proven governance model ensure sustainable growth</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Learn More */}
      <Card className="p-6 text-center bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
        <Globe className="w-12 h-12 mx-auto mb-3 text-purple-600" />
        <h4 className="text-lg font-bold mb-2">Want to Learn More?</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Visit the official Hedera website to see the full list of governing council members and learn about their governance model
        </p>
        <Button
          onClick={() => window.open('https://hedera.com/council', '_blank')}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View Official Council
        </Button>
      </Card>
    </div>
  );
};
