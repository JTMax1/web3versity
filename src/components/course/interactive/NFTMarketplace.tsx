import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../ui/button';
import { ShoppingCart, Tag, TrendingUp, Users, CheckCircle, Wallet } from 'lucide-react';

interface NFTMarketplaceProps {
  content?: any;
  onInteract: () => void;
}

type Step = 'browse' | 'select' | 'purchase' | 'complete';

export function NFTMarketplace({ content, onInteract }: NFTMarketplaceProps) {
  const [currentStep, setCurrentStep] = useState<Step>('browse');
  const [selectedNFT, setSelectedNFT] = useState<number | null>(null);
  const [balance, setBalance] = useState(1000);

  const nfts = [
    {
      id: 1,
      title: 'Lagos Skyline #42',
      creator: 'ChidinmaArt',
      price: 250,
      emoji: '🌆',
      royalty: '10%',
      description: 'Stunning digital art of Lagos at sunset'
    },
    {
      id: 2,
      title: 'Serengeti Wildlife',
      creator: 'TanzaniaPhotos',
      price: 180,
      emoji: '🦁',
      royalty: '5%',
      description: 'Rare wildlife photography NFT'
    },
    {
      id: 3,
      title: 'Afrobeat Beats Vol.1',
      creator: 'KofiMusic',
      price: 150,
      emoji: '🎵',
      royalty: '15%',
      description: 'Exclusive music track with concert access'
    }
  ];

  const handleSelectNFT = (id: number) => {
    setSelectedNFT(id);
    setCurrentStep('select');
    onInteract();
  };

  const handlePurchase = () => {
    if (selectedNFT !== null) {
      const nft = nfts.find(n => n.id === selectedNFT);
      if (nft) {
        setBalance(balance - nft.price);
        setCurrentStep('purchase');
        
        setTimeout(() => {
          setCurrentStep('complete');
        }, 2000);
      }
    }
  };

  const handleReset = () => {
    setCurrentStep('browse');
    setSelectedNFT(null);
    setBalance(1000);
  };

  const getSelectedNFT = () => nfts.find(n => n.id === selectedNFT);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-3xl bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"
         style={{ boxShadow: '0 8px 32px rgba(0, 132, 199, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.8)' }}>
      
      <div className="mb-8 text-center">
        <h3 className="mb-2">NFT Marketplace Simulation</h3>
        <p className="text-gray-600">Experience buying an NFT on a marketplace</p>
      </div>

      {/* Wallet Balance */}
      <div className="mb-6 p-4 rounded-2xl bg-white flex items-center justify-between"
           style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-100">
            <Wallet className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Your Wallet Balance</p>
            <p className="text-xl text-gray-900">{balance} HBAR</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 'browse' && (
          <motion.div
            key="browse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h4 className="mb-4">Browse NFT Collection</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {nfts.map((nft) => (
                <motion.div
                  key={nft.id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="p-6 rounded-2xl bg-white cursor-pointer"
                  style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}
                  onClick={() => handleSelectNFT(nft.id)}
                >
                  <div className="text-6xl mb-4 text-center">{nft.emoji}</div>
                  <h5 className="mb-1">{nft.title}</h5>
                  <p className="text-sm text-gray-500 mb-3">by @{nft.creator}</p>
                  <p className="text-sm text-gray-600 mb-3">{nft.description}</p>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Price</span>
                      <span className="text-blue-600">{nft.price} HBAR</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Royalty</span>
                      <span className="text-sm text-purple-600">{nft.royalty}</span>
                    </div>
                  </div>

                  <Button className="w-full mt-4 bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white">
                    Select
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {currentStep === 'select' && getSelectedNFT() && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Button
              onClick={() => setCurrentStep('browse')}
              variant="outline"
              className="mb-4"
            >
              ← Back to Browse
            </Button>

            <div className="p-8 rounded-2xl bg-white"
                 style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
              <div className="text-8xl mb-6 text-center">{getSelectedNFT()!.emoji}</div>
              
              <h3 className="mb-2 text-center">{getSelectedNFT()!.title}</h3>
              <p className="text-center text-gray-500 mb-6">by @{getSelectedNFT()!.creator}</p>

              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Price</span>
                    <span className="text-2xl text-blue-600">{getSelectedNFT()!.price} HBAR</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Creator Royalty</span>
                    <span className="text-purple-600">{getSelectedNFT()!.royalty}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                  <p className="text-sm">
                    <strong>💡 What's a Royalty?</strong><br />
                    When you resell this NFT, the original creator (@{getSelectedNFT()!.creator}) automatically receives {getSelectedNFT()!.royalty} of the sale. This is enforced by the smart contract!
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                  <p className="text-sm">
                    <strong>🌍 African Context:</strong><br />
                    African creators can now earn passive income forever when their work is resold - something impossible with traditional art sales!
                  </p>
                </div>
              </div>

              <Button
                onClick={handlePurchase}
                className="w-full py-6 text-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                disabled={balance < getSelectedNFT()!.price}
              >
                {balance < getSelectedNFT()!.price ? 'Insufficient Balance' : `Purchase for ${getSelectedNFT()!.price} HBAR`}
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 'purchase' && (
          <motion.div
            key="purchase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-12 rounded-2xl bg-white text-center"
            style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 360]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity
              }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
            >
              <ShoppingCart className="w-10 h-10 text-white" />
            </motion.div>
            <h3 className="mb-2">Processing Transaction...</h3>
            <p className="text-gray-600">Your NFT purchase is being confirmed on the blockchain</p>
          </motion.div>
        )}

        {currentStep === 'complete' && getSelectedNFT() && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 text-center"
                 style={{ boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)' }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500 flex items-center justify-center"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>

              <h3 className="mb-2">🎉 Purchase Complete!</h3>
              <p className="text-gray-700 mb-6">You now own {getSelectedNFT()!.title}</p>

              <div className="text-8xl mb-6">{getSelectedNFT()!.emoji}</div>

              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-xl bg-white">
                  <h4 className="mb-3">What Just Happened:</h4>
                  <ul className="text-left space-y-2 text-gray-700">
                    <li>✅ {getSelectedNFT()!.price} HBAR transferred from your wallet</li>
                    <li>✅ Smart contract transferred NFT ownership to you</li>
                    <li>✅ Creator received payment automatically</li>
                    <li>✅ Transaction recorded permanently on blockchain</li>
                    <li>✅ You can now display, keep, or resell this NFT</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <p className="text-sm text-purple-900">
                    <strong>Remember:</strong> When you resell this NFT, the creator will automatically receive their {getSelectedNFT()!.royalty} royalty. This supports African creators forever!
                  </p>
                </div>
              </div>

              <Button
                onClick={handleReset}
                className="bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white"
              >
                Try Another Purchase
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
