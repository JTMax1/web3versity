import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../ui/button';
import { Wallet, CheckCircle, AlertTriangle, Shield, Smartphone } from 'lucide-react';

interface WalletConnectionDemoProps {
  onInteract?: () => void;
}

export function WalletConnectionDemo({ onInteract }: WalletConnectionDemoProps) {
  const [step, setStep] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const steps = [
    {
      title: 'DApp Requests Connection',
      description: 'You visit a DApp and click "Connect Wallet"',
      icon: <Smartphone className="w-8 h-8" />
    },
    {
      title: 'Choose Your Wallet',
      description: 'Select which wallet you want to use (HashPack, Blade, etc.)',
      icon: <Wallet className="w-8 h-8" />
    },
    {
      title: 'Review Permissions',
      description: 'Check what the DApp is requesting access to',
      icon: <Shield className="w-8 h-8" />
    },
    {
      title: 'Approve Connection',
      description: 'Approve in your wallet app',
      icon: <CheckCircle className="w-8 h-8" />
    }
  ];

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setStep(0);
  };

  const handleNextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      if (step === 0 && onInteract) {
        onInteract();
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 rounded-3xl bg-gradient-to-br from-violet-50 to-fuchsia-50"
         style={{ boxShadow: '0 8px 32px rgba(139, 92, 246, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.8)' }}>
      
      <div className="mb-8 text-center">
        <h3 className="mb-2">Connecting Your Wallet to DApps</h3>
        <p className="text-gray-600">Learn how to safely connect and interact with decentralized applications</p>
      </div>

      {!isConnected ? (
        <>
          {/* Steps Progress */}
          <div className="mb-8 flex items-center justify-between px-4">
            {steps.map((s, index) => (
              <div key={index} className="flex items-center">
                <motion.div
                  animate={{
                    scale: step === index ? 1.1 : 1,
                    backgroundColor: step > index ? '#10b981' : 
                                    step === index ? '#8b5cf6' : '#e5e7eb'
                  }}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ boxShadow: step === index ? '0 4px 16px rgba(139, 92, 246, 0.4)' : '' }}
                >
                  {step > index ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <div className="text-white">{index + 1}</div>
                  )}
                </motion.div>
                
                {index < steps.length - 1 && (
                  <motion.div
                    animate={{ 
                      backgroundColor: step > index ? '#10b981' : '#e5e7eb'
                    }}
                    className="h-1 mx-2"
                    style={{ width: '60px' }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Current Step */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl bg-white"
            style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-violet-100 text-violet-600">
                {steps[step].icon}
              </div>
              <div className="flex-1">
                <h4 className="mb-2">{steps[step].title}</h4>
                <p className="text-gray-600 mb-4">{steps[step].description}</p>

                {step === 0 && (
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm">
                      💡 The DApp cannot access your wallet until you give permission. It's like when a mobile app 
                      asks to access your camera - you decide!
                    </p>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-3">Popular Hedera wallets:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 cursor-pointer hover:bg-purple-100">
                        <p className="mb-1">🦅 HashPack</p>
                        <p className="text-xs text-gray-600">Most popular</p>
                      </div>
                      <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 cursor-pointer hover:bg-purple-100">
                        <p className="mb-1">⚔️ Blade</p>
                        <p className="text-xs text-gray-600">Mobile-friendly</p>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-300">
                    <div className="flex items-start gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="mb-2"><strong>Check These Permissions:</strong></p>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>✓ View your account address (Safe)</li>
                          <li>✓ See your token balances (Safe)</li>
                          <li>✓ Request transaction signatures (Safe if you approve each one)</li>
                          <li>❌ Automatic withdrawals (NEVER approve this!)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm mb-3">
                      <strong>Final Check Before Approving:</strong>
                    </p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>✓ Is this website's URL correct?</li>
                      <li>✓ Do you trust this DApp?</li>
                      <li>✓ Are the permissions reasonable?</li>
                      <li>✓ Did YOU initiate this connection?</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              {step < steps.length - 1 ? (
                <Button onClick={handleNextStep} className="bg-violet-600 hover:bg-violet-700">
                  Continue
                </Button>
              ) : (
                <Button 
                  onClick={handleConnect} 
                  disabled={isConnecting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Approve Connection
                    </>
                  )}
                </Button>
              )}
              {step > 0 && (
                <Button onClick={() => setStep(step - 1)} variant="outline">
                  Back
                </Button>
              )}
            </div>
          </motion.div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Connected State */}
          <div className="p-8 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center"
               style={{ boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)' }}>
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <h4 className="text-white mb-2">Wallet Connected!</h4>
            <p className="text-white/90 mb-4">You can now interact with the DApp safely</p>
            <div className="inline-block px-4 py-2 rounded-lg bg-white/20 backdrop-blur">
              <p className="text-sm text-white">0.0.123456</p>
            </div>
          </div>

          {/* What You Can Do Now */}
          <div className="p-6 rounded-2xl bg-white" style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}>
            <p className="mb-4"><strong>What You Can Do Now:</strong></p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                <span className="text-blue-600">💸</span>
                <div>
                  <p className="mb-1">Send Transactions</p>
                  <p className="text-sm text-gray-600">
                    The DApp can request transactions, but you must approve each one in your wallet
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50">
                <span className="text-purple-600">🎨</span>
                <div>
                  <p className="mb-1">Interact with Smart Contracts</p>
                  <p className="text-sm text-gray-600">
                    Buy NFTs, trade tokens, or use DeFi features
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50">
                <span className="text-green-600">👁️</span>
                <div>
                  <p className="mb-1">View Your Assets</p>
                  <p className="text-sm text-gray-600">
                    The DApp can display your tokens and NFTs
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Reminders */}
          <div className="p-6 rounded-2xl bg-red-50 border-2 border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <p className="mb-3"><strong>Important Safety Reminders:</strong></p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>🔐 Never share your seed phrase - the DApp doesn't need it</li>
                  <li>✅ Always review transactions before approving</li>
                  <li>👀 Check transaction details carefully (amount, recipient)</li>
                  <li>🚪 Disconnect when you're done using the DApp</li>
                  <li>⚠️ Only connect to DApps you trust</li>
                </ul>
              </div>
            </div>
          </div>

          {/* African Context */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300">
            <p className="mb-3">
              <strong>🌍 Why This Matters in Africa:</strong>
            </p>
            <p className="text-gray-700">
              Unlike mobile money where the company (MTN, Safaricom) has full control, with DApps YOU stay in control. 
              The connection just allows the DApp to show your balances and request transactions - but you approve every 
              single action. No one can freeze your account or block your access!
            </p>
          </div>

          <Button onClick={handleDisconnect} variant="outline" className="w-full">
            Disconnect Wallet
          </Button>
        </motion.div>
      )}
    </div>
  );
}
