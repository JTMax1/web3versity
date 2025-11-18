/**
 * Compile Educational Smart Contracts to Bytecode
 * Run: node compile-contracts.js
 */

const solc = require('solc');

// Contract sources matching EXACTLY what's in the frontend
const contracts = {
  'SimpleCounter': `
// SPDX-License-Identifier: MIT
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

  'MessageStorage': `
// SPDX-License-Identifier: MIT
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

  'SimpleVoting': `
// SPDX-License-Identifier: MIT
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
}`
};

function compileContract(name, source) {
  const input = {
    language: 'Solidity',
    sources: {
      [`${name}.sol`]: {
        content: source
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['evm.bytecode.object', 'evm.deployedBytecode.object']
        }
      },
      optimizer: {
        enabled: false // Disable optimization for simpler bytecode
      },
      evmVersion: 'london' // Use London EVM version for Hedera compatibility
    }
  };

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Compiling ${name}...`);
  console.log(`${'='.repeat(60)}`);

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  // Check for errors
  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      console.error(`❌ Compilation errors for ${name}:`);
      errors.forEach(err => console.error(err.formattedMessage));
      return null;
    }
  }

  const contractOutput = output.contracts[`${name}.sol`][name];
  const bytecode = contractOutput.evm.bytecode.object;
  const deployedBytecode = contractOutput.evm.deployedBytecode.object;

  console.log(`✅ ${name} compiled successfully!`);
  console.log(`\nDeployment Bytecode (use this in Edge Function):`);
  console.log(`Length: ${bytecode.length} chars (${bytecode.length / 2} bytes)`);
  console.log(`\n'${name.replace('Simple', 'Simple ')}': '${bytecode}',\n`);

  return bytecode;
}

console.log(`
╔════════════════════════════════════════════════════════════╗
║  Smart Contract Bytecode Compiler for Web3Versity        ║
║  Using solc compiler for Hedera-compatible bytecode       ║
╚════════════════════════════════════════════════════════════╝
`);

// Check if solc is installed
try {
  console.log(`Solc version: ${solc.version()}\n`);
} catch (error) {
  console.error(`
❌ ERROR: solc not installed!

Please install it first:
  npm install solc@0.8.20

Then run this script again:
  node compile-contracts.js
`);
  process.exit(1);
}

// Compile all contracts
const bytecodes = {};
for (const [name, source] of Object.entries(contracts)) {
  const bytecode = compileContract(name, source);
  if (bytecode) {
    bytecodes[name] = bytecode;
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log('📋 SUMMARY - Copy these to Edge Function:');
console.log(`${'='.repeat(60)}\n`);

console.log(`const PRECOMPILED_CONTRACTS: Record<string, string> = {`);
if (bytecodes.SimpleCounter) {
  console.log(`  'Simple Counter': '${bytecodes.SimpleCounter}',`);
}
if (bytecodes.MessageStorage) {
  console.log(`  'Message Storage': '${bytecodes.MessageStorage}',`);
}
if (bytecodes.SimpleVoting) {
  console.log(`  'Simple Voting': '${bytecodes.SimpleVoting}',`);
}
console.log(`};\n`);

console.log(`✅ All contracts compiled successfully!`);
console.log(`\nNext steps:`);
console.log(`1. Copy the above PRECOMPILED_CONTRACTS object`);
console.log(`2. Replace the bytecode in supabase/functions/contract-deploy/index.ts`);
console.log(`3. Run: supabase functions deploy contract-deploy`);
console.log(`4. Test all three contracts in the playground\n`);
