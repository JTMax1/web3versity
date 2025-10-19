import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../ui/button';
import { Code, Image, FileText, Database, Eye, EyeOff } from 'lucide-react';

interface NFTMetadataProps {
  content?: any;
  onInteract: () => void;
}

export function NFTMetadata({ content, onInteract }: NFTMetadataProps) {
  const [showJSON, setShowJSON] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'visual' | 'metadata' | 'storage'>('visual');

  const nftData = {
    name: 'African Sunset #42',
    description: 'A stunning digital artwork capturing the vibrant colors of an African sunset over the savanna',
    image: 'ipfs://QmX7Y8Z9.../sunset.jpg',
    attributes: [
      { trait_type: 'Artist', value: 'Adaeze_Art' },
      { trait_type: 'Location', value: 'Serengeti, Tanzania' },
      { trait_type: 'Color Palette', value: 'Warm' },
      { trait_type: 'Rarity', value: 'Rare' },
      { trait_type: 'Edition', value: '42/100' }
    ],
    creator: '0.0.123456',
    royalties: 10,
    contract: '0.0.789012'
  };

  const jsonMetadata = `{
  "name": "${nftData.name}",
  "description": "${nftData.description}",
  "image": "${nftData.image}",
  "attributes": ${JSON.stringify(nftData.attributes, null, 4)},
  "creator": "${nftData.creator}",
  "royaltyPercentage": ${nftData.royalties},
  "contract": "${nftData.contract}"
}`;

  const handleTabChange = (tab: 'visual' | 'metadata' | 'storage') => {
    setSelectedTab(tab);
    onInteract();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
         style={{ boxShadow: '0 8px 32px rgba(0, 132, 199, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.8)' }}>
      
      <div className="mb-8 text-center">
        <h3 className="mb-2">NFT Metadata Explorer</h3>
        <p className="text-gray-600">Understand what's inside an NFT</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2 p-2 rounded-2xl bg-white"
           style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}>
        <button
          onClick={() => handleTabChange('visual')}
          className={`flex-1 px-4 py-3 rounded-xl transition-all ${
            selectedTab === 'visual'
              ? 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Image className="w-5 h-5 mx-auto mb-1" />
          <span className="text-sm">Visual</span>
        </button>
        <button
          onClick={() => handleTabChange('metadata')}
          className={`flex-1 px-4 py-3 rounded-xl transition-all ${
            selectedTab === 'metadata'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FileText className="w-5 h-5 mx-auto mb-1" />
          <span className="text-sm">Metadata</span>
        </button>
        <button
          onClick={() => handleTabChange('storage')}
          className={`flex-1 px-4 py-3 rounded-xl transition-all ${
            selectedTab === 'storage'
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Database className="w-5 h-5 mx-auto mb-1" />
          <span className="text-sm">Storage</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {selectedTab === 'visual' && (
          <motion.div
            key="visual"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* NFT Display */}
            <div className="p-8 rounded-2xl bg-white"
                 style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
              <div className="mb-6 p-12 rounded-2xl bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 text-center"
                   style={{ boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.08)' }}>
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-9xl"
                >
                  🌅
                </motion.div>
              </div>

              <h3 className="mb-2">{nftData.name}</h3>
              <p className="text-gray-600 mb-4">{nftData.description}</p>

              <div className="grid grid-cols-2 gap-3">
                {nftData.attributes.map((attr, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-xl bg-gray-50"
                  >
                    <p className="text-xs text-gray-500">{attr.trait_type}</p>
                    <p className="text-gray-900">{attr.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>👀 What You See:</strong> This is the visual representation of the NFT - what collectors see when they view or display it. But there's much more data behind the scenes!
              </p>
            </div>
          </motion.div>
        )}

        {selectedTab === 'metadata' && (
          <motion.div
            key="metadata"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Toggle JSON View */}
            <div className="flex justify-between items-center mb-4">
              <h4>NFT Metadata Structure</h4>
              <Button
                onClick={() => {
                  setShowJSON(!showJSON);
                  if (!showJSON) onInteract();
                }}
                variant="outline"
                className="rounded-full"
              >
                {showJSON ? <><EyeOff className="w-4 h-4 mr-2" /> Hide</> : <><Eye className="w-4 h-4 mr-2" /> Show</>} JSON
              </Button>
            </div>

            {!showJSON ? (
              <div className="p-8 rounded-2xl bg-white space-y-6"
                   style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-purple-50">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <strong className="text-purple-900">Basic Information</strong>
                    </div>
                    <div className="space-y-2 ml-8">
                      <p><span className="text-gray-600">Name:</span> {nftData.name}</p>
                      <p><span className="text-gray-600">Description:</span> {nftData.description}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50">
                    <div className="flex items-center gap-3 mb-2">
                      <Code className="w-5 h-5 text-blue-600" />
                      <strong className="text-blue-900">Properties & Traits</strong>
                    </div>
                    <div className="space-y-2 ml-8">
                      {nftData.attributes.map((attr, index) => (
                        <p key={index}>
                          <span className="text-gray-600">{attr.trait_type}:</span> {attr.value}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-green-50">
                    <div className="flex items-center gap-3 mb-2">
                      <Database className="w-5 h-5 text-green-600" />
                      <strong className="text-green-900">Blockchain Data</strong>
                    </div>
                    <div className="space-y-2 ml-8">
                      <p><span className="text-gray-600">Creator Account:</span> {nftData.creator}</p>
                      <p><span className="text-gray-600">Royalty:</span> {nftData.royalties}%</p>
                      <p><span className="text-gray-600">Contract:</span> {nftData.contract}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 rounded-2xl bg-gray-900 overflow-x-auto"
                style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)' }}
              >
                <pre className="text-sm text-green-400 font-mono">
                  {jsonMetadata}
                </pre>
              </motion.div>
            )}

            <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
              <p className="text-sm text-yellow-900">
                <strong>📋 About Metadata:</strong> This structured data describes the NFT. It's usually stored as JSON (JavaScript Object Notation) and includes all information about the NFT - from its name to its properties to royalty settings.
              </p>
            </div>
          </motion.div>
        )}

        {selectedTab === 'storage' && (
          <motion.div
            key="storage"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="p-8 rounded-2xl bg-white"
                 style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
              <h4 className="mb-6">How NFT Data is Stored</h4>

              <div className="space-y-4">
                {/* Blockchain Layer */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-blue-600 text-white">
                      <span className="text-2xl">⛓️</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="mb-2">On the Blockchain (Hedera)</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• NFT Token ID and ownership record</li>
                        <li>• Creator account ID</li>
                        <li>• Royalty percentage</li>
                        <li>• Link to metadata (IPFS hash)</li>
                        <li>• Transaction history</li>
                      </ul>
                      <p className="text-xs text-blue-600 mt-2">💎 Permanent & Immutable</p>
                    </div>
                  </div>
                </motion.div>

                {/* IPFS Layer */}
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="p-6 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-purple-600 text-white">
                      <span className="text-2xl">📦</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="mb-2">On IPFS (Decentralized Storage)</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Metadata JSON file</li>
                        <li>• Actual image/video file</li>
                        <li>• Properties and attributes</li>
                        <li>• Description and details</li>
                      </ul>
                      <p className="text-xs text-purple-600 mt-2">📁 Distributed across global network</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                <p className="text-sm text-green-900">
                  <strong>🌍 Why This Matters for Africa:</strong><br />
                  This architecture ensures African creators' work isn't controlled by any single company or country. The blockchain proves ownership, while IPFS ensures the actual art is accessible globally, even if one server goes down!
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
              <p className="text-sm text-orange-900">
                <strong>💡 Key Insight:</strong> The blockchain doesn't store the actual image (too expensive!) - it stores a link to the image on decentralized storage. This keeps costs low while maintaining security and permanence.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
