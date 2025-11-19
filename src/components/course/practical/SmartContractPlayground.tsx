/**
 * Smart Contract Playground - Deploy & Interact with Solidity Contracts on Hedera
 *
 * WOW Factor: Students deploy real smart contracts to Hedera testnet!
 * No setup required, one-click deployment and interaction.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code, Play, Rocket, CheckCircle, ExternalLink, Zap,
  FileCode, Activity, Loader2, Copy, Check, Terminal, Trophy, Sparkles
} from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { toast } from 'sonner';
import { deployContractClientSide, executeContractClientSide, queryContractClientSide } from '../../../lib/hedera/contracts-service';

interface SmartContractPlaygroundProps {
  onInteract?: () => void;
}

interface Contract {
  id: string;
  name: string;
  description: string;
  icon: string;
  code: string;
  functions: ContractFunction[];
}

interface ContractFunction {
  name: string;
  description: string;
  inputs: { name: string; type: string; placeholder?: string }[];
  outputs?: string;
  isPayable?: boolean;
  readonly?: boolean; // For view/pure functions
}

const SAMPLE_CONTRACTS: Contract[] = [
  {
    id: 'counter',
    name: 'Simple Counter',
    description: 'A basic counter contract to increment/decrement a number',
    icon: '🔢',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleCounter {
    uint256 public count;

    function increment() public {
        count += 1;
    }

    function decrement() public {
        require(count > 0, "Count is zero");
        count -= 1;
    }

    function getCount() public view returns (uint256) {
        return count;
    }
}`,
    functions: [
      {
        name: 'increment',
        description: 'Add 1 to the counter',
        inputs: []
      },
      {
        name: 'decrement',
        description: 'Subtract 1 from the counter',
        inputs: []
      },
      {
        name: 'getCount',
        description: 'Get the current count value',
        inputs: [],
        outputs: 'uint256',
        readonly: true
      }
    ]
  },
  {
    id: 'storage',
    name: 'Message Storage',
    description: 'Store and retrieve text messages on the blockchain',
    icon: '💾',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MessageStorage {
    string private message;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function setMessage(string memory _message) public {
        message = _message;
    }

    function getMessage() public view returns (string memory) {
        return message;
    }
}`,
    functions: [
      {
        name: 'setMessage',
        description: 'Store a new message',
        inputs: [{ name: '_message', type: 'string', placeholder: 'Hello from Hedera!' }]
      },
      {
        name: 'getMessage',
        description: 'Retrieve the stored message',
        inputs: [],
        outputs: 'string',
        readonly: true
      }
    ]
  },
  {
    id: 'voting',
    name: 'Simple Voting',
    description: 'A basic voting contract for yes/no decisions',
    icon: '🗳️',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleVoting {
    uint256 public yesVotes;
    uint256 public noVotes;
    mapping(address => bool) public hasVoted;

    function voteYes() public {
        require(!hasVoted[msg.sender], "Already voted");
        yesVotes += 1;
        hasVoted[msg.sender] = true;
    }

    function voteNo() public {
        require(!hasVoted[msg.sender], "Already voted");
        noVotes += 1;
        hasVoted[msg.sender] = true;
    }

    function getResults() public view returns (uint256, uint256) {
        return (yesVotes, noVotes);
    }
}`,
    functions: [
      {
        name: 'voteYes',
        description: 'Cast a YES vote',
        inputs: []
      },
      {
        name: 'voteNo',
        description: 'Cast a NO vote',
        inputs: []
      },
      {
        name: 'getResults',
        description: 'Get current vote counts',
        inputs: [],
        outputs: '(uint256, uint256)',
        readonly: true
      }
    ]
  }
];

export const SmartContractPlayground: React.FC<SmartContractPlaygroundProps> = ({ onInteract }) => {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [functionResults, setFunctionResults] = useState<Record<string, any>>({});
  const [functionInputs, setFunctionInputs] = useState<Record<string, string[]>>({});
  const [executingFunction, setExecutingFunction] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSelectContract = (contract: Contract) => {
    setSelectedContract(contract);
    setDeployedAddress(null);
    setTransactionId(null);
    setFunctionResults({});
    setFunctionInputs({});
    setShowSuccessModal(false);
    // Don't call onInteract here - only after successful deployment
  };

  const handleDeploy = async () => {
    if (!selectedContract) return;

    setIsDeploying(true);

    try {
      // Call client-side contract deployment (prompts wallet signature)
      const result = await deployContractClientSide({
        contractName: selectedContract.name,
        solidityCode: selectedContract.code,
        constructorParams: [],
      });

      if (!result.success) {
        throw new Error(result.error || 'Deployment failed');
      }

      console.log('✅ Contract deployed:', result);

      setDeployedAddress(result.contractId || '');
      setTransactionId(result.transactionId || '');
      setShowSuccessModal(true); // Show success modal

      // DON'T call onInteract here - wait until user executes a function
      // This allows them to interact with the deployed contract first

      toast.success('🎉 Contract Signed and Deployed!', {
        description: `Contract is live at ${result.contractId}. Now try executing a function!`
      });

    } catch (error) {
      console.error('❌ Deployment error:', error);
      toast.error('Deployment failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleExecuteFunction = async (func: ContractFunction) => {
    if (!deployedAddress) return;

    setExecutingFunction(func.name);

    try {
      console.log(`🎯 Executing function: ${func.name}`);

      // Build function parameters from inputs
      const functionParams = func.inputs.map((input, i) => ({
        type: input.type,
        value: functionInputs[func.name]?.[i] || '',
      }));

      // For readonly functions (view/pure), use query instead of execute
      const isReadonly = func.readonly || false;

      const apiResult = isReadonly
        ? await queryContractClientSide({
            contractId: deployedAddress,
            functionName: func.name,
            functionParams,
            outputType: func.outputs, // Pass output type for proper decoding
            gas: 300000,
          })
        : await executeContractClientSide({
            contractId: deployedAddress,
            functionName: func.name,
            functionParams,
            gas: 300000,
          });

      if (!apiResult.success) {
        throw new Error(apiResult.error || 'Execution failed');
      }

      console.log(`✅ Function ${isReadonly ? 'queried' : 'executed'}:`, apiResult);

      // Parse result for display
      let displayResult;
      if (func.outputs && apiResult.result !== undefined) {
        // For readonly functions, result should already be decoded
        displayResult = apiResult.result;
      } else if (!isReadonly) {
        displayResult = `Transaction ID: ${apiResult.transactionId}`;
      } else {
        displayResult = 'Success';
      }

      setFunctionResults(prev => ({ ...prev, [func.name]: displayResult }));

      // NOW call onInteract after successful function execution
      // This completes the lesson only AFTER user interacts with deployed contract
      if (!hasInteracted) {
        setHasInteracted(true);
        onInteract?.();
      }

      toast.success(`✅ ${func.name} executed`, {
        description: displayResult ? `Result: ${String(displayResult).substring(0, 100)}` : 'Transaction successful'
      });

    } catch (error) {
      console.error(`❌ Execution error for ${func.name}:`, error);
      toast.error(`Failed to execute ${func.name}`, {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setExecutingFunction(null);
    }
  };

  const copyCode = () => {
    if (selectedContract) {
      navigator.clipboard.writeText(selectedContract.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast.success('Code copied to clipboard!');
    }
  };

  const viewOnHashScan = () => {
    if (deployedAddress) {
      window.open(`https://hashscan.io/testnet/contract/${deployedAddress}`, '_blank');
    }
  };

  // Success Modal Component
  const SuccessModal = () => {
    if (!showSuccessModal || !selectedContract || !deployedAddress) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowSuccessModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Header */}
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 p-8 text-center text-white">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-4"
              >
                <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Trophy className="w-10 h-10" />
                </div>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl md:text-3xl font-bold mb-2"
              >
                Contract Deployed! 🎉
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/90"
              >
                Your smart contract is now live on Hedera testnet
              </motion.p>
            </div>

            {/* Contract Details */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl">
                <div className="text-3xl">{selectedContract.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Contract Name</p>
                  <p className="font-bold text-gray-900 dark:text-white">{selectedContract.name}</p>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Contract ID</p>
                  <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white break-all">
                    {deployedAddress}
                  </p>
                </div>
                {transactionId && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Transaction ID</p>
                    <p className="font-mono text-xs text-gray-700 dark:text-gray-300 break-all">
                      {transactionId}
                    </p>
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-semibold mb-1">Your contract is verified on HashScan!</p>
                  <p className="text-xs">
                    Click below to view your contract on the blockchain explorer and verify the deployment.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={() => {
                    viewOnHashScan();
                    setShowSuccessModal(false);
                  }}
                  className="w-full py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl text-base font-semibold"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  View on HashScan
                </Button>
                <Button
                  onClick={() => setShowSuccessModal(false)}
                  variant="outline"
                  className="w-full py-6 rounded-xl text-base font-semibold"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Test Contract Functions
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // Contract Selection View
  if (!selectedContract) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <Card className="p-6 md:p-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <Code className="w-7 h-7 md:w-8 md:h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Smart Contract Playground</h2>
              <p className="text-white/90 text-sm md:text-base mb-3">
                Deploy and interact with real Solidity smart contracts on Hedera
              </p>
              <div className="flex flex-wrap gap-2 text-xs md:text-sm">
                <div className="px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                  ⚡ One-Click Deploy
                </div>
                <div className="px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                  🔗 Hedera EVM
                </div>
                <div className="px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                  💡 No Setup Required
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {SAMPLE_CONTRACTS.map((contract) => (
            <motion.div
              key={contract.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Card
                onClick={() => handleSelectContract(contract)}
                className="p-6 cursor-pointer hover:shadow-xl transition-all h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 hover:border-purple-400"
              >
                <div className="text-5xl md:text-6xl mb-4">{contract.icon}</div>
                <h3 className="text-lg md:text-xl font-bold mb-2">{contract.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{contract.description}</p>
                <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-semibold">
                  <Rocket className="w-4 h-4" />
                  <span>Deploy & Test →</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">💡</span>
            <div className="space-y-2 text-sm">
              <p className="font-semibold">What You'll Learn:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                <li>Deploy real Solidity smart contracts to Hedera</li>
                <li>Call contract functions and read state</li>
                <li>Understand gas costs and transaction flow</li>
                <li>View contracts on HashScan explorer</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Contract Interaction View
  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <Button onClick={() => setSelectedContract(null)} variant="outline" className="mb-4">
        ← Back to Contracts
      </Button>

      {/* Contract Header */}
      <Card className="p-6 md:p-8 bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="text-5xl md:text-6xl flex-shrink-0">{selectedContract.icon}</div>
            <div className="min-w-0">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">{selectedContract.name}</h3>
              <p className="text-white/90 mb-4">{selectedContract.description}</p>
              {deployedAddress && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Deployed at: <span className="font-mono">{deployedAddress}</span></span>
                  </div>
                  <button
                    onClick={viewOnHashScan}
                    className="flex items-center gap-2 text-sm hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on HashScan
                  </button>
                </div>
              )}
            </div>
          </div>
          {!deployedAddress && (
            <Button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="flex-shrink-0 px-6 py-6 bg-white text-purple-600 hover:bg-gray-100 rounded-xl font-bold"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5 mr-2" />
                  Deploy Contract
                </>
              )}
            </Button>
          )}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contract Code */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-600" />
              Contract Code
            </h4>
            <Button
              onClick={copyCode}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedCode ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs md:text-sm font-mono max-h-96 overflow-y-auto">
            <pre>{selectedContract.code}</pre>
          </div>
        </Card>

        {/* Contract Functions */}
        <Card className="p-6">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-600" />
            Contract Functions
          </h4>

          {!deployedAddress ? (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Deploy the contract first to interact with functions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedContract.functions.map((func, index) => (
                <Card key={index} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                  <div className="mb-3">
                    <h5 className="font-bold text-sm md:text-base mb-1">{func.name}()</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{func.description}</p>
                  </div>

                  {func.inputs.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {func.inputs.map((input, i) => (
                        <input
                          key={i}
                          type="text"
                          placeholder={input.placeholder || `${input.name} (${input.type})`}
                          value={functionInputs[func.name]?.[i] || ''}
                          onChange={(e) => {
                            setFunctionInputs(prev => ({
                              ...prev,
                              [func.name]: [
                                ...(prev[func.name] || []).slice(0, i),
                                e.target.value,
                                ...(prev[func.name] || []).slice(i + 1)
                              ]
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                        />
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => handleExecuteFunction(func)}
                    disabled={executingFunction === func.name}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg disabled:opacity-50"
                    size="sm"
                  >
                    {executingFunction === func.name ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Execute
                      </>
                    )}
                  </Button>

                  {functionResults[func.name] !== undefined && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg"
                    >
                      <p className="text-xs font-semibold text-green-800 dark:text-green-300 mb-1">Result:</p>
                      <p className="text-sm font-mono text-green-700 dark:text-green-400">
                        {String(functionResults[func.name])}
                      </p>
                    </motion.div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
          <h4 className="font-bold mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            Smart Contract Benefits on Hedera
          </h4>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-orange-600 flex-shrink-0">✓</span>
              <span>EVM-compatible - Use Solidity like Ethereum</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 flex-shrink-0">✓</span>
              <span>Low gas fees (~$0.01 typical transaction)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 flex-shrink-0">✓</span>
              <span>Fast finality (~3 seconds)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 flex-shrink-0">✓</span>
              <span>Carbon negative network</span>
            </li>
          </ul>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <h4 className="font-bold mb-3">🎯 Real-World Use Cases</h4>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p><strong>Counter:</strong> Event counters, vote tracking, inventory management</p>
            <p><strong>Storage:</strong> Document hashes, public records, notarization</p>
            <p><strong>Voting:</strong> DAO governance, community decisions, polls</p>
          </div>
        </Card>
      </div>

      {/* Success Modal */}
      <SuccessModal />
    </div>
  );
};
