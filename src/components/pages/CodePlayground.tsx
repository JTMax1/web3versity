import React, { useState } from 'react';
import { Play, RotateCcw, Download, Code, Terminal } from 'lucide-react';
import { Button } from '../ui/button';

export function CodePlayground() {
  const [code, setCode] = useState(`// Welcome to the Hedera Code Playground!
// Try running this code to create an account

const { Client, AccountCreateTransaction, Hbar, PrivateKey } = require("@hashgraph/sdk");

async function createAccount() {
  // Note: This is testnet code
  const client = Client.forTestnet();
  
  // Set operator (would use environment variables in production)
  const operatorId = "0.0.123456";
  const operatorKey = PrivateKey.generate();
  
  client.setOperator(operatorId, operatorKey);
  
  // Generate new key pair
  const newAccountPrivateKey = PrivateKey.generate();
  const newAccountPublicKey = newAccountPrivateKey.publicKey;
  
  // Create new account
  const transaction = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(new Hbar(10))
    .execute(client);
  
  const receipt = await transaction.getReceipt(client);
  const newAccountId = receipt.accountId;
  
  console.log("Success! New account ID:", newAccountId.toString());
  console.log("Account balance: 10 HBAR");
  
  return newAccountId;
}

createAccount();`);
  
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'output'>('code');

  const examples = [
    {
      name: 'Create Account',
      code: `// Example: Create a new Hedera account
const newAccountId = "0.0.789012";
console.log("Created account:", newAccountId);
console.log("Initial balance: 10 HBAR");`
    },
    {
      name: 'Transfer HBAR',
      code: `// Example: Transfer HBAR between accounts
const sender = "0.0.123456";
const receiver = "0.0.789012";
const amount = 5;

console.log(\`Transferring \${amount} HBAR\`);
console.log(\`From: \${sender}\`);
console.log(\`To: \${receiver}\`);
console.log("Transaction successful!");
console.log("Transaction ID: 0.0.123456@1697673600.123456789");`
    },
    {
      name: 'Create Token',
      code: `// Example: Create a fungible token
const tokenName = "MyToken";
const tokenSymbol = "MTK";
const initialSupply = 1000000;

console.log(\`Creating token: \${tokenName} (\${tokenSymbol})\`);
console.log(\`Initial supply: \${initialSupply}\`);
console.log("Token created successfully!");
console.log("Token ID: 0.0.999888");`
    }
  ];

  const handleRun = () => {
    setIsRunning(true);
    setActiveTab('output');
    
    // Simulate code execution
    setTimeout(() => {
      try {
        // Capture console.log outputs
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args: any[]) => {
          logs.push(args.map(arg => String(arg)).join(' '));
        };

        // Execute the code safely (in real implementation, this would be sandboxed)
        // For demo, we'll just simulate output
        if (code.includes('createAccount')) {
          logs.push('Success! New account ID: 0.0.123456789');
          logs.push('Account balance: 10 HBAR');
        } else if (code.includes('Transfer')) {
          logs.push('Transferring 5 HBAR');
          logs.push('From: 0.0.123456');
          logs.push('To: 0.0.789012');
          logs.push('Transaction successful!');
          logs.push('Transaction ID: 0.0.123456@1697673600.123456789');
        } else if (code.includes('Token')) {
          logs.push('Creating token: MyToken (MTK)');
          logs.push('Initial supply: 1000000');
          logs.push('Token created successfully!');
          logs.push('Token ID: 0.0.999888');
        } else {
          // Try to evaluate simple console.log statements
          const logMatches = code.match(/console\.log\([^)]+\)/g);
          if (logMatches) {
            logMatches.forEach(match => {
              const content = match.match(/console\.log\(["']?([^"')]+)["']?\)/);
              if (content && content[1]) {
                logs.push(content[1]);
              }
            });
          } else {
            logs.push('Code executed successfully!');
          }
        }

        console.log = originalLog;
        setOutput(logs.join('\n'));
      } catch (error) {
        setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      setIsRunning(false);
    }, 1000);
  };

  const handleReset = () => {
    setCode(examples[0].code);
    setOutput('');
    setActiveTab('code');
  };

  const loadExample = (example: typeof examples[0]) => {
    setCode(example.code);
    setOutput('');
    setActiveTab('code');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#dbeafe] py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">Code Playground</h1>
          <p className="text-gray-600">Write and test Hedera code in your browser</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Examples Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
              <h3 className="mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-[#0084C7]" />
                Examples
              </h3>
              <div className="space-y-2">
                {examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => loadExample(example)}
                    className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 hover:bg-[#0084C7]/10 transition-all text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,132,199,0.15)]"
                  >
                    {example.name}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm mb-2 text-gray-700">Keyboard Shortcuts</h4>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Run Code</span>
                    <code className="bg-gray-100 px-2 py-1 rounded">Ctrl+Enter</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Reset</span>
                    <code className="bg-gray-100 px-2 py-1 rounded">Ctrl+R</code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Editor and Output */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
              {/* Toolbar */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`px-4 py-2 rounded-xl transition-all ${
                      activeTab === 'code'
                        ? 'bg-white text-[#0084C7] shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]'
                        : 'text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    <Code className="w-4 h-4 inline mr-2" />
                    Code
                  </button>
                  <button
                    onClick={() => setActiveTab('output')}
                    className={`px-4 py-2 rounded-xl transition-all ${
                      activeTab === 'output'
                        ? 'bg-white text-[#0084C7] shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]'
                        : 'text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    <Terminal className="w-4 h-4 inline mr-2" />
                    Output
                  </button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleReset}
                    className="bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-xl px-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                    size="sm"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    onClick={handleRun}
                    disabled={isRunning}
                    className="bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:from-[#0074b7] hover:to-[#0098d8] rounded-xl px-6 shadow-[0_4px_16px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)]"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isRunning ? 'Running...' : 'Run Code'}
                  </Button>
                </div>
              </div>

              {/* Content Area */}
              <div className="h-[600px] overflow-auto">
                {activeTab === 'code' ? (
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full p-6 font-mono text-sm bg-gray-50 border-0 focus:outline-none resize-none"
                    spellCheck={false}
                    placeholder="Write your code here..."
                  />
                ) : (
                  <div className="p-6">
                    {output ? (
                      <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap">
                        {output}
                      </pre>
                    ) : (
                      <div className="text-center text-gray-400 mt-20">
                        <Terminal className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No output yet. Run your code to see results.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <InfoCard
                emoji="⚡"
                title="Fast Execution"
                description="Run code instantly in your browser"
              />
              <InfoCard
                emoji="🔒"
                title="Safe Sandbox"
                description="Isolated environment for testing"
              />
              <InfoCard
                emoji="🌐"
                title="Testnet Ready"
                description="Connect to Hedera testnet"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-[#0084C7]/10 to-[#00a8e8]/20 rounded-xl flex items-center justify-center shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]">
          <span className="text-xl">{emoji}</span>
        </div>
        <div>
          <div className="text-sm text-gray-900">{title}</div>
          <div className="text-xs text-gray-600">{description}</div>
        </div>
      </div>
    </div>
  );
}
