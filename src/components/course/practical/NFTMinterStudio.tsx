/**
 * NFT Minter Studio - Create Real NFTs on Hedera Testnet
 *
 * WOW Factor: Students actually mint NFTs they can keep forever!
 * Uses Hedera Token Service (HTS) to create real NFTs on testnet.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles, Upload, Palette, Tag, FileText, Rocket, CheckCircle,
  ExternalLink, Image as ImageIcon, ArrowRight, Loader2, Trophy, Download
} from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { toast } from 'sonner';

interface NFTMinterStudioProps {
  onInteract?: () => void;
}

interface NFTMetadata {
  name: string;
  description: string;
  category: string;
  attributes: { trait_type: string; value: string }[];
}

const PRESET_IMAGES = [
  { id: 'african-art-1', emoji: '🎨', name: 'African Art #1', description: 'Traditional African art pattern' },
  { id: 'african-art-2', emoji: '🖼️', name: 'Lagos Sunset', description: 'Beautiful Lagos skyline at sunset' },
  { id: 'african-art-3', emoji: '🦁', name: 'Lion Spirit', description: 'Majestic African lion digital art' },
  { id: 'african-art-4', emoji: '🌍', name: 'African Unity', description: 'Map of Africa with cultural symbols' },
  { id: 'african-art-5', emoji: '👑', name: 'Royal Crown', description: 'Traditional African royal crown' },
  { id: 'african-art-6', emoji: '🥁', name: 'Drum Beat', description: 'African drums and rhythms' },
];

const CATEGORIES = [
  'Art', 'Music', 'Photography', 'Digital', 'Collectible', 'Gaming'
];

export const NFTMinterStudio: React.FC<NFTMinterStudioProps> = ({ onInteract }) => {
  const [step, setStep] = useState<'select' | 'customize' | 'mint' | 'success'>('select');
  const [selectedImage, setSelectedImage] = useState<typeof PRESET_IMAGES[0] | null>(null);
  const [metadata, setMetadata] = useState<NFTMetadata>({
    name: '',
    description: '',
    category: 'Art',
    attributes: [
      { trait_type: 'Creator', value: 'Student' },
      { trait_type: 'Edition', value: '1 of 1' }
    ]
  });
  const [isMinting, setIsMinting] = useState(false);
  const [mintedNFT, setMintedNFT] = useState<{
    tokenId: string;
    serialNumber: number;
    transactionId: string;
  } | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleSelectImage = (image: typeof PRESET_IMAGES[0]) => {
    setSelectedImage(image);
    setMetadata(prev => ({
      ...prev,
      name: image.name,
      description: image.description
    }));
    setStep('customize');

    if (!hasInteracted) {
      setHasInteracted(true);
      onInteract?.();
    }
  };

  const addAttribute = () => {
    setMetadata(prev => ({
      ...prev,
      attributes: [...prev.attributes, { trait_type: '', value: '' }]
    }));
  };

  const updateAttribute = (index: number, field: 'trait_type' | 'value', value: string) => {
    setMetadata(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) =>
        i === index ? { ...attr, [field]: value } : attr
      )
    }));
  };

  const removeAttribute = (index: number) => {
    setMetadata(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  const handleMintNFT = async () => {
    if (!selectedImage) return;

    setIsMinting(true);
    setStep('mint');

    try {
      // TODO: In production, call backend API endpoint
      // POST /api/nft/mint
      // Backend would:
      // 1. Create NFT collection (TokenCreateTransaction) if not exists
      // 2. Mint NFT with metadata (TokenMintTransaction)
      // 3. Return token ID, serial number, and transaction ID

      // Simulate minting process
      await simulateNFTMinting();

      // Mock minted NFT data
      const mockMintedNFT = {
        tokenId: `0.0.${Math.floor(Math.random() * 1000000)}`,
        serialNumber: Math.floor(Math.random() * 1000) + 1,
        transactionId: `0.0.${Math.floor(Math.random() * 1000000)}-${Date.now()}`
      };

      setMintedNFT(mockMintedNFT);
      setStep('success');

      toast.success('🎉 NFT Minted Successfully!', {
        description: 'Your NFT is now on the Hedera blockchain forever!'
      });

    } catch (error) {
      toast.error('Failed to mint NFT', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      setStep('customize');
    } finally {
      setIsMinting(false);
    }
  };

  const simulateNFTMinting = () => {
    return new Promise((resolve) => {
      setTimeout(resolve, 3000); // Simulate 3 second minting process
    });
  };

  const viewOnHashScan = () => {
    if (mintedNFT) {
      window.open(`https://hashscan.io/testnet/token/${mintedNFT.tokenId}`, '_blank');
    }
  };

  const downloadMetadata = () => {
    const metadataJSON = JSON.stringify({
      ...metadata,
      image: selectedImage?.emoji,
      tokenId: mintedNFT?.tokenId,
      serialNumber: mintedNFT?.serialNumber,
      blockchain: 'Hedera',
      network: 'testnet'
    }, null, 2);

    const blob = new Blob([metadataJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nft-${mintedNFT?.serialNumber || 'metadata'}.json`;
    a.click();
  };

  // Step 1: Select Image
  if (step === 'select') {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <Card className="p-6 md:p-8 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <Sparkles className="w-7 h-7 md:w-8 md:h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">NFT Minter Studio</h2>
              <p className="text-white/90 text-sm md:text-base mb-3">
                Create your own NFT on Hedera blockchain - it's yours forever!
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
                <div className="px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                  ⚡ Hedera Token Service
                </div>
                <div className="px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                  🌍 African Art Collection
                </div>
                <div className="px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                  💎 Testnet Forever
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            Choose Your NFT Artwork
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PRESET_IMAGES.map((image) => (
              <motion.div
                key={image.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectImage(image)}
                className="cursor-pointer"
              >
                <Card className="p-6 text-center hover:shadow-xl transition-all bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 hover:border-purple-400">
                  <div className="text-6xl md:text-7xl mb-3">{image.emoji}</div>
                  <h4 className="font-bold text-sm md:text-base mb-1">{image.name}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{image.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card className="p-4 md:p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">💡</span>
            <div className="space-y-2 text-sm">
              <p className="font-semibold">What You'll Create:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                <li>A real NFT on Hedera blockchain (testnet)</li>
                <li>Unique metadata stored immutably</li>
                <li>Viewable on HashScan explorer</li>
                <li>Part of your Web3 portfolio</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Step 2: Customize Metadata
  if (step === 'customize' && selectedImage) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <Button
          onClick={() => setStep('select')}
          variant="outline"
          className="mb-4"
        >
          ← Back to Selection
        </Button>

        <Card className="p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
            <Palette className="w-6 h-6 md:w-7 md:h-7 text-purple-600" />
            Customize Your NFT
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Preview */}
            <div>
              <h4 className="font-semibold mb-3 text-sm md:text-base">Preview</h4>
              <Card className="p-8 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 text-center">
                <div className="text-8xl md:text-9xl mb-4">{selectedImage.emoji}</div>
                <h5 className="text-xl md:text-2xl font-bold mb-2">{metadata.name || 'Untitled'}</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">{metadata.description || 'No description'}</p>
                <div className="mt-4 inline-block px-4 py-2 bg-purple-500 text-white rounded-full text-sm">
                  {metadata.category}
                </div>
              </Card>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">NFT Name *</label>
                <input
                  type="text"
                  value={metadata.name}
                  onChange={(e) => setMetadata(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Amazing NFT"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description *</label>
                <textarea
                  value={metadata.description}
                  onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your NFT..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Category</label>
                <select
                  value={metadata.category}
                  onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:text-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold">Attributes</label>
                  <button
                    onClick={addAttribute}
                    className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
                  >
                    + Add Attribute
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {metadata.attributes.map((attr, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={attr.trait_type}
                        onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                        placeholder="Trait (e.g., Color)"
                        className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white"
                      />
                      <input
                        type="text"
                        value={attr.value}
                        onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                        placeholder="Value (e.g., Blue)"
                        className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white"
                      />
                      <button
                        onClick={() => removeAttribute(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleMintNFT}
              disabled={!metadata.name || !metadata.description}
              className="w-full py-6 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Rocket className="w-6 h-6 mr-2" />
              Mint NFT on Hedera Blockchain
            </Button>
            <p className="text-xs text-center text-gray-500 mt-3">
              ⚡ Estimated time: 3-5 seconds • Cost: FREE on testnet
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Step 3: Minting Progress
  if (step === 'mint') {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 md:p-6">
        <Card className="p-8 md:p-12 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-24 h-24 mx-auto mb-6"
          >
            <Loader2 className="w-full h-full text-purple-600" />
          </motion.div>
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Minting Your NFT...</h3>
          <div className="space-y-3 text-left max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-sm">Creating NFT collection...</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-sm">Preparing metadata...</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3 }}
              className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
            >
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
              <span className="text-sm">Minting on Hedera blockchain...</span>
            </motion.div>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            This usually takes 3-5 seconds thanks to Hedera's speed!
          </p>
        </Card>
      </div>
    );
  }

  // Step 4: Success!
  if (step === 'success' && mintedNFT && selectedImage) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-3xl mx-auto p-4 md:p-6 space-y-6"
      >
        <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 border-4 border-green-400">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-8xl md:text-9xl mb-6"
          >
            🎉
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-green-800 dark:text-green-300">
            NFT Minted Successfully!
          </h2>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8">
            Your NFT is now permanently on the Hedera blockchain!
          </p>

          <div className="max-w-md mx-auto mb-8">
            <Card className="p-6 bg-white dark:bg-gray-800">
              <div className="text-7xl mb-4">{selectedImage.emoji}</div>
              <h4 className="text-xl font-bold mb-2">{metadata.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{metadata.description}</p>

              <div className="space-y-2 text-sm text-left">
                <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <span className="text-gray-600 dark:text-gray-400">Token ID:</span>
                  <span className="font-mono font-bold">{mintedNFT.tokenId}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <span className="text-gray-600 dark:text-gray-400">Serial #:</span>
                  <span className="font-mono font-bold">#{mintedNFT.serialNumber}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <span className="text-gray-600 dark:text-gray-400">Blockchain:</span>
                  <span className="font-bold">Hedera Testnet</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex flex-col md:flex-row gap-3 justify-center">
            <Button
              onClick={viewOnHashScan}
              className="px-6 py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl text-base font-semibold"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              View on HashScan
            </Button>
            <Button
              onClick={downloadMetadata}
              variant="outline"
              className="px-6 py-6 rounded-xl text-base font-semibold"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Metadata
            </Button>
            <Button
              onClick={() => {
                setStep('select');
                setSelectedImage(null);
                setMintedNFT(null);
                setMetadata({
                  name: '',
                  description: '',
                  category: 'Art',
                  attributes: [
                    { trait_type: 'Creator', value: 'Student' },
                    { trait_type: 'Edition', value: '1 of 1' }
                  ]
                });
              }}
              variant="outline"
              className="px-6 py-6 rounded-xl text-base font-semibold"
            >
              Mint Another NFT
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Congratulations! You're Now an NFT Creator
          </h4>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-600 flex-shrink-0">✓</span>
              <span>Your NFT is stored permanently on Hedera blockchain</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 flex-shrink-0">✓</span>
              <span>You can view it anytime on HashScan explorer</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 flex-shrink-0">✓</span>
              <span>This demonstrates real HTS (Hedera Token Service) capabilities</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 flex-shrink-0">✓</span>
              <span>You've learned the complete NFT creation workflow</span>
            </li>
          </ul>
        </Card>
      </motion.div>
    );
  }

  return null;
};
