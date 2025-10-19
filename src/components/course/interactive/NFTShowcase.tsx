import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../ui/button';
import { Palette, Music, Ticket, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface NFTExample {
  id: string;
  category: string;
  title: string;
  creator: string;
  description: string;
  icon: any;
  africanContext: string;
  emoji: string;
}

interface NFTShowcaseProps {
  content?: any;
  onInteract: () => void;
}

export function NFTShowcase({ content, onInteract }: NFTShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const nftExamples: NFTExample[] = [
    {
      id: 'art',
      category: 'Digital Art',
      title: 'African Sunset Collection',
      creator: 'Adaeze from Lagos',
      description: 'A digital painting celebrating African landscapes. The NFT proves Adaeze created and owns this art, and she earns royalties every time it\'s resold!',
      icon: Palette,
      africanContext: 'African artists can now sell directly to global collectors without needing galleries or expensive exhibitions.',
      emoji: '🎨'
    },
    {
      id: 'music',
      category: 'Music NFT',
      title: 'Afrobeat Rhythms Album',
      creator: 'Kwame from Accra',
      description: 'An exclusive music album as an NFT. Owners get special access to concerts and unreleased tracks. Kwame gets paid directly without record labels!',
      icon: Music,
      africanContext: 'Musicians can bypass traditional labels, keep more earnings, and build direct relationships with fans worldwide.',
      emoji: '🎵'
    },
    {
      id: 'ticket',
      category: 'Event Ticket',
      title: 'Afro Nation Concert Ticket',
      creator: 'Event Organizers',
      description: 'A concert ticket that can\'t be counterfeited! The blockchain proves it\'s real. After the concert, it becomes a collectible memory.',
      icon: Ticket,
      africanContext: 'No more fake tickets at African festivals and concerts. Organizers can also control resale prices and earn from secondary sales.',
      emoji: '🎫'
    },
    {
      id: 'certificate',
      category: 'Educational Certificate',
      title: 'University Degree Certificate',
      creator: 'University of Nairobi',
      description: 'A tamper-proof digital certificate. Employers worldwide can instantly verify it\'s real without calling the university!',
      icon: FileText,
      africanContext: 'Solves the problem of fake certificates in Africa. Students can prove their credentials anywhere in the world instantly.',
      emoji: '🎓'
    }
  ];

  const currentNFT = nftExamples[currentIndex];
  const Icon = currentNFT.icon;

  const handleNext = () => {
    if (currentIndex < nftExamples.length - 1) {
      setCurrentIndex(currentIndex + 1);
      if (!hasInteracted) {
        setHasInteracted(true);
        onInteract();
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50"
         style={{ boxShadow: '0 8px 32px rgba(0, 132, 199, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.8)' }}>
      
      <div className="mb-8 text-center">
        <h3 className="mb-2">Real-World NFT Examples</h3>
        <p className="text-gray-600">Explore how NFTs are being used across different industries</p>
      </div>

      {/* Progress Indicators */}
      <div className="mb-6 flex justify-center gap-2">
        {nftExamples.map((_, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.8 }}
            animate={{ 
              scale: index === currentIndex ? 1.2 : 1,
              backgroundColor: index === currentIndex ? '#0084C7' : 
                             index < currentIndex ? '#10b981' : '#e5e7eb'
            }}
            className="w-3 h-3 rounded-full"
          />
        ))}
      </div>

      {/* NFT Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="mb-6 p-8 rounded-2xl bg-white"
          style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.9)' }}
        >
          {/* NFT Visual */}
          <div className="mb-6 p-8 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 text-center"
               style={{ boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.08)' }}>
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="text-8xl mb-4"
            >
              {currentNFT.emoji}
            </motion.div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80"
                 style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <Icon className="w-5 h-5 text-purple-600" />
              <span className="text-purple-900">{currentNFT.category}</span>
            </div>
          </div>

          {/* NFT Details */}
          <div className="space-y-4">
            <div>
              <h4 className="mb-1">{currentNFT.title}</h4>
              <p className="text-sm text-gray-500">Created by {currentNFT.creator}</p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50"
                 style={{ boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.05)' }}>
              <p className="text-gray-700">{currentNFT.description}</p>
            </div>

            {/* African Context Highlight */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌍</span>
                <div className="flex-1">
                  <p className="text-green-900">
                    <strong>African Impact:</strong> {currentNFT.africanContext}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4">
        <Button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          variant="outline"
          className="rounded-full px-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="text-center text-sm text-gray-600">
          {currentIndex + 1} of {nftExamples.length}
        </div>

        <Button
          onClick={handleNext}
          disabled={currentIndex === nftExamples.length - 1}
          className="rounded-full px-6 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Completion Message */}
      {currentIndex === nftExamples.length - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50"
          style={{ boxShadow: '0 4px 16px rgba(139, 92, 246, 0.15)' }}
        >
          <h4 className="mb-3">🎉 NFTs Are Everywhere!</h4>
          <p className="text-gray-700">
            NFTs aren't just for digital art - they're revolutionizing how we prove ownership of everything from concert tickets to university degrees. For African creators and businesses, NFTs open doors to global markets without traditional barriers!
          </p>
        </motion.div>
      )}
    </div>
  );
}
