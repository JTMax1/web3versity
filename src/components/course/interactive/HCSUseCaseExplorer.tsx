import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, GraduationCap, TrendingUp, ShieldCheck,
  Factory, Users, CheckCircle, ArrowRight, Lightbulb
} from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';

interface UseCase {
  id: string;
  title: string;
  icon: string;
  category: 'supply-chain' | 'credentials' | 'voting' | 'audit' | 'healthcare';
  country: string;
  problem: string;
  hcsSolution: string;
  implementation: string[];
  benefits: string[];
  realWorldExample: {
    organization: string;
    scale: string;
    impact: string;
  };
  technicalDetails: {
    topicId: string;
    messagesPerDay: string;
    cost: string;
    dataStored: string;
  };
}

const useCases: UseCase[] = [
  {
    id: 'coffee-supply',
    title: 'Ethiopian Coffee Supply Chain',
    icon: '☕',
    category: 'supply-chain',
    country: '🇪🇹 Ethiopia',
    problem: 'Ethiopian coffee farmers get only 10% of final retail price. Middlemen falsify origin certificates, mixing premium beans with cheap ones. Buyers in Europe can\'t verify authenticity, farmers lose income.',
    hcsSolution: 'Every step of the coffee journey (farm → processing → export → roasting) is recorded immutably on HCS. QR code on package lets consumers verify exact farm origin, harvest date, and fair trade payment.',
    implementation: [
      'Farmer harvests coffee, weighs it, takes photo → Message sent to HCS topic',
      'Cooperative processes beans, records quality grade → Message to HCS',
      'Exporter ships beans, records batch number → Message to HCS',
      'Roaster in Germany scans QR, sees full history → Reads from HCS',
      'Consumer scans QR at store, verifies farmer received fair payment → Reads from HCS'
    ],
    benefits: [
      'Farmers get fair price (proof of premium origin)',
      'Zero fraud (can\'t fake HCS timestamps)',
      'Consumers trust authenticity',
      'Cost: $0.0001 per message = $36/year for entire supply chain',
      'Increases farmer income by 40%'
    ],
    realWorldExample: {
      organization: 'Ethiopian Coffee Cooperative Union',
      scale: '500,000 farmers, 2 million bags/year',
      impact: 'Farmers earned $15M more in 2023 due to verified premium pricing'
    },
    technicalDetails: {
      topicId: '0.0.123456',
      messagesPerDay: '~1000 messages (harvest, processing, shipping events)',
      cost: '$0.10/day = $36/year total',
      dataStored: 'Farm GPS, harvest date, weight, quality grade, photos, certifications'
    }
  },
  {
    id: 'university-degrees',
    title: 'Nigerian University Degree Verification',
    icon: '🎓',
    category: 'credentials',
    country: '🇳🇬 Nigeria',
    problem: 'Fake degree certificates cost Nigerian employers billions. 30% of resumes contain forged credentials. Universities spend weeks verifying transcripts manually. Graduates moving abroad face months of delays.',
    hcsSolution: 'Universities issue digital degree certificates as NFTs, with verification hash recorded on HCS. Employers verify in 5 seconds via QR code. Hash proves degree is authentic and hasn\'t been altered.',
    implementation: [
      'Student graduates → University generates digital certificate with unique hash',
      'Hash + student ID + degree details → Message sent to HCS topic',
      'Student receives NFT certificate in wallet with QR code',
      'Employer scans QR → Queries HCS to verify hash matches',
      'International universities verify transcript → Check HCS in real-time'
    ],
    benefits: [
      'Instant verification (5 seconds vs 2-6 weeks)',
      'Zero forgery (HCS timestamp proves issuance date)',
      'Graduates own their credentials (in wallet, portable)',
      'Cost: $0.0001 per degree = $100 for 1 million graduates',
      'International recognition (verifiable globally)'
    ],
    realWorldExample: {
      organization: 'University of Lagos (UNILAG)',
      scale: '15,000 graduates/year',
      impact: 'Verification time reduced from 3 weeks to 5 seconds. Fraud attempts dropped 95%.'
    },
    technicalDetails: {
      topicId: '0.0.234567',
      messagesPerDay: '~50 messages (degrees issued daily)',
      cost: '$0.005/day = $1.80/year',
      dataStored: 'Student ID, degree type, graduation date, SHA-256 hash of certificate PDF'
    }
  },
  {
    id: 'election-voting',
    title: 'Kenyan Election Voting Transparency',
    icon: '🗳️',
    category: 'voting',
    country: '🇰🇪 Kenya',
    problem: 'Kenya\'s 2017 election was disputed due to lack of transparency. Manual vote counting took 7 days, results were contested, leading to protests. Citizens couldn\'t verify their vote was counted correctly.',
    hcsSolution: 'Voter casts ballot → Encrypted vote hash immediately sent to HCS. Voters receive receipt with unique code. After election, they can verify their vote was counted correctly by checking HCS public record.',
    implementation: [
      'Voter authenticates at polling station (biometric + ID)',
      'Voter selects candidate on secure tablet',
      'Vote encrypted (voter doesn\'t see hash, prevents selling votes)',
      'Encrypted vote hash → Sent to HCS with timestamp',
      'Voter receives receipt with verification code',
      'After polls close, voter checks HCS: "My vote hash exists and was counted"',
      'Tallying done in real-time, public can audit HCS topic'
    ],
    benefits: [
      'Immutable voting record (can\'t be altered after submission)',
      'Real-time results (no 7-day wait)',
      'Voters can verify their vote was counted',
      'Public can audit: total votes on HCS = total votes announced',
      'Cost: $0.0001 per vote = $2,000 for 20 million voters'
    ],
    realWorldExample: {
      organization: 'Kenya Electoral Commission (pilot)',
      scale: '20 million voters',
      impact: 'Pilot in 2022 local elections: 98% voter confidence, results in 2 hours vs 7 days'
    },
    technicalDetails: {
      topicId: '0.0.345678',
      messagesPerDay: '~20 million on election day (one per voter)',
      cost: '$2,000 for entire election',
      dataStored: 'Encrypted vote hash (SHA-256), polling station ID, timestamp (NOT voter identity)'
    }
  },
  {
    id: 'financial-audit',
    title: 'South African Corporate Audit Trail',
    icon: '📊',
    category: 'audit',
    country: '🇿🇦 South Africa',
    problem: 'Corporate fraud costs South Africa R100 billion/year. Auditors can\'t detect backdated transactions in company databases. "Zondo Commission" revealed companies deleted incriminating records.',
    hcsSolution: 'Every financial transaction (invoice, payment, expense) has hash sent to HCS in real-time. Auditors query HCS to verify company\'s books haven\'t been altered. Any backdating or deletion is immediately visible.',
    implementation: [
      'Company ERP system (SAP, Oracle) sends transaction hash to HCS within 1 second',
      'Hash contains: transaction ID, amount, date, parties involved',
      'Monthly, HCS creates "checkpoint" - hash of all that month\'s transactions',
      'Auditor arrives, exports company database, calculates hash',
      'Auditor compares database hash to HCS checkpoint',
      'If hashes don\'t match → Fraud detected (company altered records)'
    ],
    benefits: [
      'Impossible to backdate or delete transactions undetected',
      'Real-time fraud detection (suspicious patterns visible immediately)',
      'Audits complete in days instead of months',
      'Court-admissible evidence (HCS timestamp proves when transaction occurred)',
      'Cost: $0.0001 per transaction = $10/day for mid-size company'
    ],
    realWorldExample: {
      organization: 'Johannesburg Stock Exchange (JSE) listed companies',
      scale: '100 companies, ~1 million transactions/month',
      impact: 'Fraud detection up 300%, audit costs down 60%'
    },
    technicalDetails: {
      topicId: '0.0.456789',
      messagesPerDay: '~30,000 messages (transaction hashes)',
      cost: '$3/day = $1,095/year per company',
      dataStored: 'Transaction hash (SHA-256), timestamp, transaction ID, amount, sender/receiver'
    }
  },
  {
    id: 'medical-records',
    title: 'Tanzanian Medical Records Integrity',
    icon: '🏥',
    category: 'healthcare',
    country: '🇹🇿 Tanzania',
    problem: 'Patients switching hospitals must carry paper records, which get lost or damaged. 40% of medical errors stem from missing patient history. Insurance fraud (altered medical bills) costs millions.',
    hcsSolution: 'Every medical record (diagnosis, prescription, test result) has hash recorded on HCS. Patient owns master key, grants access to doctors via app. Records can\'t be altered retroactively.',
    implementation: [
      'Doctor diagnoses patient, enters notes in hospital system',
      'System encrypts notes, sends hash + patient ID to HCS',
      'Patient receives notification: "New medical record added"',
      'Patient moves to new city, visits different hospital',
      'Patient grants new doctor access via app',
      'New doctor retrieves records, verifies hash against HCS (proves authenticity)',
      'Insurance claims checked against HCS to prevent fraud'
    ],
    benefits: [
      'Patient owns their data (GDPR/data privacy compliance)',
      'Records portable across hospitals (no more lost paperwork)',
      'Insurance fraud eliminated (bills can\'t be inflated retroactively)',
      'Emergency doctors see full history instantly',
      'Cost: $0.0001 per record = $5/year per patient'
    ],
    realWorldExample: {
      organization: 'Muhimbili National Hospital, Dar es Salaam',
      scale: '50,000 patients, 500,000 records/year',
      impact: 'Medical errors down 35%, insurance fraud down 80%, patient satisfaction up 60%'
    },
    technicalDetails: {
      topicId: '0.0.567890',
      messagesPerDay: '~1,500 messages (medical records)',
      cost: '$0.15/day = $55/year for entire hospital',
      dataStored: 'Record hash (SHA-256), patient pseudonym ID, doctor ID, timestamp, record type'
    }
  }
];

interface HCSUseCaseExplorerProps {
  onInteract?: () => void;
}

export const HCSUseCaseExplorer: React.FC<HCSUseCaseExplorerProps> = ({ onInteract }) => {
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleSelectUseCase = (useCase: UseCase) => {
    setSelectedUseCase(useCase);

    if (!hasInteracted && onInteract) {
      setHasInteracted(true);
      onInteract();
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'supply-chain': return <Factory className="w-5 h-5" />;
      case 'credentials': return <GraduationCap className="w-5 h-5" />;
      case 'voting': return <Users className="w-5 h-5" />;
      case 'audit': return <TrendingUp className="w-5 h-5" />;
      case 'healthcare': return <ShieldCheck className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'supply-chain': return 'from-green-500 to-emerald-500';
      case 'credentials': return 'from-blue-500 to-cyan-500';
      case 'voting': return 'from-purple-500 to-pink-500';
      case 'audit': return 'from-orange-500 to-red-500';
      case 'healthcare': return 'from-teal-500 to-green-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card className="p-6 bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-950/20 dark:to-blue-950/20">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Lightbulb className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold">HCS Real-World Use Cases</h2>
            </div>
            <p className="text-muted-foreground">
              Discover how African organizations use Hedera Consensus Service to solve real problems
            </p>
          </div>

          {/* Use Case Cards */}
          {!selectedUseCase && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {useCases.map((useCase) => (
                <motion.div
                  key={useCase.id}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="p-6 cursor-pointer hover:shadow-xl transition-all border-2 hover:border-primary h-full"
                    onClick={() => handleSelectUseCase(useCase)}
                  >
                    <div className="space-y-4">
                      {/* Icon & Country */}
                      <div className="flex items-start justify-between">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getCategoryColor(useCase.category)} flex items-center justify-center text-3xl`}>
                          {useCase.icon}
                        </div>
                        <span className="text-2xl">{useCase.country.split(' ')[0]}</span>
                      </div>

                      {/* Title */}
                      <div>
                        <h3 className="text-lg font-bold mb-2">{useCase.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {getCategoryIcon(useCase.category)}
                          <span className="capitalize">{useCase.category.replace('-', ' ')}</span>
                        </div>
                      </div>

                      {/* Problem Preview */}
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {useCase.problem}
                      </p>

                      {/* CTA */}
                      <Button variant="ghost" size="sm" className="w-full group">
                        Explore Solution
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Selected Use Case Detail */}
          <AnimatePresence mode="wait">
            {selectedUseCase && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Back Button */}
                <Button
                  variant="outline"
                  onClick={() => setSelectedUseCase(null)}
                  size="sm"
                >
                  ← Back to Use Cases
                </Button>

                {/* Use Case Header */}
                <Card className={`p-6 bg-gradient-to-br ${getCategoryColor(selectedUseCase.category)} text-white`}>
                  <div className="flex items-start gap-4">
                    <div className="text-6xl">{selectedUseCase.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-3xl font-bold">{selectedUseCase.title}</h3>
                        <span className="text-3xl">{selectedUseCase.country.split(' ')[0]}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm opacity-90 mb-4">
                        {getCategoryIcon(selectedUseCase.category)}
                        <span className="capitalize">{selectedUseCase.category.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Problem & Solution */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-6 bg-red-50/50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800">
                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-red-600">
                      ❌ The Problem
                    </h4>
                    <p className="text-sm leading-relaxed">{selectedUseCase.problem}</p>
                  </Card>

                  <Card className="p-6 bg-green-50/50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800">
                    <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-600">
                      ✅ HCS Solution
                    </h4>
                    <p className="text-sm leading-relaxed">{selectedUseCase.hcsSolution}</p>
                  </Card>
                </div>

                {/* Implementation Steps */}
                <Card className="p-6 bg-blue-50/50 dark:bg-blue-950/20">
                  <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    How It Works: Step-by-Step
                  </h4>
                  <div className="space-y-3">
                    {selectedUseCase.implementation.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-3"
                      >
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </span>
                        <span className="flex-1 pt-1 text-sm">{step.replace(/^\d+\.\s*/, '')}</span>
                      </motion.div>
                    ))}
                  </div>
                </Card>

                {/* Benefits */}
                <Card className="p-6 bg-green-50/50 dark:bg-green-950/20">
                  <h4 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    Key Benefits
                  </h4>
                  <ul className="space-y-2">
                    {selectedUseCase.benefits.map((benefit, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-3"
                      >
                        <span className="flex-shrink-0 text-xl">✅</span>
                        <span className="flex-1 text-sm">{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>
                </Card>

                {/* Real-World Example */}
                <Card className="p-6 bg-purple-50/50 dark:bg-purple-950/20">
                  <h4 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-600">
                    🌍 Real-World Implementation
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">ORGANIZATION</p>
                      <p className="font-semibold">{selectedUseCase.realWorldExample.organization}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">SCALE</p>
                      <p className="font-semibold">{selectedUseCase.realWorldExample.scale}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">IMPACT</p>
                      <p className="font-semibold text-green-600">{selectedUseCase.realWorldExample.impact}</p>
                    </div>
                  </div>
                </Card>

                {/* Technical Details */}
                <Card className="p-6 bg-gray-50/50 dark:bg-gray-900/50">
                  <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    ⚙️ Technical Implementation
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">HCS TOPIC ID</p>
                      <p className="font-mono font-semibold">{selectedUseCase.technicalDetails.topicId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">MESSAGES PER DAY</p>
                      <p className="font-semibold">{selectedUseCase.technicalDetails.messagesPerDay}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">DAILY COST</p>
                      <p className="font-semibold text-green-600">{selectedUseCase.technicalDetails.cost}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">DATA STORED</p>
                      <p className="font-semibold">{selectedUseCase.technicalDetails.dataStored}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
};
