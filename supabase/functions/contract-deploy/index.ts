/**
 * Smart Contract Deployment Edge Function
 *
 * Compiles and deploys Solidity contracts to Hedera testnet.
 * This function handles the server-side Hedera SDK operations.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  Client,
  ContractCreateFlow,
  ContractFunctionParameters,
  ContractExecuteTransaction,
  ContractCallQuery,
  PrivateKey,
  AccountId,
  Hbar,
} from 'npm:@hashgraph/sdk@^2.40.0';

// Hedera configuration from environment variables
const HEDERA_NETWORK = Deno.env.get('HEDERA_NETWORK') || 'testnet';
const HEDERA_OPERATOR_ID = Deno.env.get('HEDERA_OPERATOR_ID');
const HEDERA_OPERATOR_KEY = Deno.env.get('HEDERA_OPERATOR_KEY');

interface DeployRequest {
  healthCheck?: boolean;
  action: 'deploy' | 'execute' | 'query';
  // For deploy
  contractName?: string;
  solidityCode?: string;
  constructorParams?: any[];
  // For execute/query
  contractId?: string;
  functionName?: string;
  functionParams?: Array<{ type: string; value: any }>;
  gas?: number;
  outputType?: string; // For query - helps decode return values (e.g., "string", "uint256", "(uint256, uint256)")
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const body: DeployRequest = await req.json();

    // Health check endpoint
    if (body.healthCheck) {
      return new Response(
        JSON.stringify({ available: true, network: HEDERA_NETWORK }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Validate environment variables
    if (!HEDERA_OPERATOR_ID || !HEDERA_OPERATOR_KEY) {
      throw new Error('Hedera operator credentials not configured');
    }

    // Initialize Hedera client
    const client = Client.forTestnet();
    client.setOperator(
      AccountId.fromString(HEDERA_OPERATOR_ID),
      PrivateKey.fromString(HEDERA_OPERATOR_KEY)
    );

    let result;

    switch (body.action) {
      case 'deploy':
        result = await deployContract(client, body);
        break;
      case 'execute':
        result = await executeContract(client, body);
        break;
      case 'query':
        result = await queryContract(client, body);
        break;
      default:
        throw new Error('Invalid action');
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: result.success ? 200 : 400,
      }
    );

  } catch (error) {
    console.error('Contract Operation Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 500,
      }
    );
  }
});

/**
 * Deploy a smart contract
 */
async function deployContract(
  client: Client,
  data: DeployRequest
): Promise<{
  success: boolean;
  contractId?: string;
  transactionId?: string;
  contractAddress?: string;
  error?: string;
}> {
  try {
    if (!data.solidityCode) {
      throw new Error('Solidity code is required');
    }

    console.log('Compiling and deploying contract...');

    // Note: In production, you'd use solc (Solidity compiler) here
    // For now, we'll use pre-compiled bytecode for common contracts
    const bytecode = await compileContract(data.solidityCode, data.contractName || 'Contract');

    // Log bytecode info
    console.log(`Deploying with bytecode length: ${bytecode.length} bytes`);
    console.log(`First 20 bytes: ${Array.from(bytecode.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join('')}`);

    // IMPORTANT: Try deploying with hex string instead of Uint8Array
    // Convert Uint8Array back to hex string for Hedera SDK
    const bytecodeHex = Array.from(bytecode).map(b => b.toString(16).padStart(2, '0')).join('');
    console.log(`Bytecode as hex string (first 40 chars): ${bytecodeHex.substring(0, 40)}`);

    // Deploy contract using ContractCreateFlow
    // Dynamically set gas based on bytecode size
    // NOTE: Hedera requires significantly more gas than just bytecode.length * some_factor
    // The CREATE opcode and deployment process itself consumes substantial gas
    const gasLimit = Math.max(1000000, bytecode.length * 300); // Increased: minimum 1M or 300 per byte
    console.log(`Setting gas limit: ${gasLimit} (bytecode size: ${bytecode.length} bytes)`);

    const contractCreateTx = new ContractCreateFlow()
      .setBytecode(bytecodeHex) // Hex string format
      .setGas(gasLimit) // Dynamic gas based on contract complexity
      .setConstructorParameters(
        data.constructorParams ? buildConstructorParams(data.constructorParams) : new ContractFunctionParameters()
      );

    const txResponse = await contractCreateTx.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const contractId = receipt.contractId;

    if (!contractId) {
      throw new Error('Contract ID not returned');
    }

    console.log(`Contract deployed: ${contractId.toString()}`);

    return {
      success: true,
      contractId: contractId.toString(),
      transactionId: txResponse.transactionId.toString(),
      contractAddress: `0.0.${contractId.toString()}`,
    };

  } catch (error) {
    console.error('Error deploying contract:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Execute a contract function (state-changing)
 */
async function executeContract(
  client: Client,
  data: DeployRequest
): Promise<{
  success: boolean;
  transactionId?: string;
  result?: any;
  error?: string;
}> {
  try {
    if (!data.contractId || !data.functionName) {
      throw new Error('Contract ID and function name are required');
    }

    const params = data.functionParams
      ? buildFunctionParams(data.functionParams)
      : new ContractFunctionParameters();

    console.log(`📝 Executing: contractId=${data.contractId}, function=${data.functionName}`);
    console.log(`⛽ Gas limit: ${data.gas || 300000}`);

    const executeTx = await new ContractExecuteTransaction()
      .setContractId(data.contractId)
      .setGas(data.gas || 300000) // Increased default gas from 100k to 300k
      .setFunction(data.functionName, params)
      .execute(client);

    const receipt = await executeTx.getReceipt(client);

    console.log(`✅ Executed function: ${data.functionName}, status: ${receipt.status.toString()}`);

    return {
      success: true,
      transactionId: executeTx.transactionId.toString(),
      result: receipt.status.toString(),
    };

  } catch (error) {
    console.error('Error executing contract:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Query a contract function (view/pure function)
 */
async function queryContract(
  client: Client,
  data: DeployRequest
): Promise<{
  success: boolean;
  result?: any;
  error?: string;
}> {
  try {
    if (!data.contractId || !data.functionName) {
      throw new Error('Contract ID and function name are required');
    }

    const params = data.functionParams
      ? buildFunctionParams(data.functionParams)
      : new ContractFunctionParameters();

    const query = new ContractCallQuery()
      .setContractId(data.contractId)
      .setGas(data.gas || 300000)
      .setFunction(data.functionName, params);

    const result = await query.execute(client);

    console.log(`Queried function: ${data.functionName}`);
    console.log(`Output type: ${data.outputType || 'unknown'}`);

    // Decode result based on output type
    let decodedResult: any;
    const outputType = data.outputType?.toLowerCase() || '';

    try {
      if (outputType.includes('string')) {
        // Decode string result
        decodedResult = result.getString(0);
      } else if (outputType.includes('uint256') || outputType === 'uint') {
        // Decode uint256 result
        const bigNum = result.getUint256(0);
        decodedResult = bigNum.toString();
      } else if (outputType.includes('(uint256, uint256)')) {
        // Decode tuple of two uint256s
        const first = result.getUint256(0);
        const second = result.getUint256(1);
        decodedResult = `(${first.toString()}, ${second.toString()})`;
      } else if (outputType.includes('bool')) {
        // Decode boolean result
        decodedResult = result.getBool(0);
      } else {
        // Fallback: return raw bytes as hex
        const bytes = result.asBytes();
        decodedResult = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (decodeError) {
      console.error('Error decoding result:', decodeError);
      // Fallback to raw bytes
      const bytes = result.asBytes();
      decodedResult = `0x${Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')}`;
    }

    console.log(`Decoded result: ${decodedResult}`);

    return {
      success: true,
      result: decodedResult,
    };

  } catch (error) {
    console.error('Error querying contract:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Compile Solidity code (simplified - uses pre-compiled bytecode)
 * In production, integrate with @solidity/solc or similar
 */
async function compileContract(solidityCode: string, contractName: string): Promise<Uint8Array> {
  console.log(`📝 Compile request: contractName="${contractName}", codeLength=${solidityCode.length}`);

  // Pre-compiled bytecode for common contracts (includes constructor bytecode + runtime bytecode)
  const PRECOMPILED_CONTRACTS: Record<string, string> = {
    'Simple Counter': '608060405234801561001057600080fd5b506102a8806100206000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c806306661abd146100515780632baeceb71461006f578063a87d942c14610079578063d09de08a14610097575b600080fd5b6100596100a1565b6040516100669190610143565b60405180910390f35b6100776100a7565b005b610081610106565b60405161008e9190610143565b60405180910390f35b61009f61010f565b005b60005481565b60008054116100eb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016100e2906101bb565b60405180910390fd5b60016000808282546100fd919061020a565b92505081905550565b60008054905090565b6001600080828254610121919061023e565b92505081905550565b6000819050919050565b61013d8161012a565b82525050565b60006020820190506101586000830184610134565b92915050565b600082825260208201905092915050565b7f436f756e74206973207a65726f00000000000000000000000000000000000000600082015250565b60006101a5600d8361015e565b91506101b08261016f565b602082019050919050565b600060208201905081810360008301526101d481610198565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006102158261012a565b91506102208361012a565b9250828203905081811115610238576102376101db565b5b92915050565b60006102498261012a565b91506102548361012a565b925082820190508082111561026c5761026b6101db565b5b9291505056fea264697066735822122051697613e2eacbbc91d5130aff102b3067b1de59ae26892816957bd26d239ac664736f6c63430008140033',
    'Message Storage': '608060405234801561001057600080fd5b5033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610727806100616000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c8063368b8772146100465780638da5cb5b14610062578063ce6d41de14610080575b600080fd5b610060600480360381019061005b91906102c3565b61009e565b005b61006a6100b1565b604051610077919061034d565b60405180910390f35b6100886100d7565b60405161009591906103e7565b60405180910390f35b80600090816100ad919061061f565b5050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6060600080546100e690610438565b80601f016020809104026020016040519081016040528092919081815260200182805461011290610438565b801561015f5780601f106101345761010080835404028352916020019161015f565b820191906000526020600020905b81548152906001019060200180831161014257829003601f168201915b5050505050905090565b6000604051905090565b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6101d082610187565b810181811067ffffffffffffffff821117156101ef576101ee610198565b5b80604052505050565b6000610202610169565b905061020e82826101c7565b919050565b600067ffffffffffffffff82111561022e5761022d610198565b5b61023782610187565b9050602081019050919050565b82818337600083830152505050565b600061026661026184610213565b6101f8565b90508281526020810184848401111561028257610281610182565b5b61028d848285610244565b509392505050565b600082601f8301126102aa576102a961017d565b5b81356102ba848260208601610253565b91505092915050565b6000602082840312156102d9576102d8610173565b5b600082013567ffffffffffffffff8111156102f7576102f6610178565b5b61030384828501610295565b91505092915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006103378261030c565b9050919050565b6103478161032c565b82525050565b6000602082019050610362600083018461033e565b92915050565b600081519050919050565b600082825260208201905092915050565b60005b838110156103a2578082015181840152602081019050610387565b60008484015250505050565b60006103b982610368565b6103c38185610373565b93506103d3818560208601610384565b6103dc81610187565b840191505092915050565b6000602082019050818103600083015261040181846103ae565b905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061045057607f821691505b60208210810361046357610462610409565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b6000600883026104cb7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8261048e565b6104d5868361048e565b95508019841693508086168417925050509392505050565b6000819050919050565b6000819050919050565b600061051c610517610512846104ed565b6104f7565b6104ed565b9050919050565b6000819050919050565b61053683610501565b61054a61054282610523565b84845461049b565b825550505050565b600090565b61055f610552565b61056a81848461052d565b505050565b5b8181101561058e57610583600082610557565b600181019050610570565b5050565b601f8211156105d3576105a481610469565b6105ad8461047e565b810160208510156105bc578190505b6105d06105c88561047e565b83018261056f565b50505b505050565b600082821c905092915050565b60006105f6600019846008026105d8565b1980831691505092915050565b600061060f83836105e5565b9150826002028217905092915050565b61062882610368565b67ffffffffffffffff81111561064157610640610198565b5b61064b8254610438565b610656828285610592565b600060209050601f8311600181146106895760008415610677578287015190505b6106818582610603565b8655506106e9565b601f19841661069786610469565b60005b828110156106bf5784890151825560018201915060208501945060208101905061069a565b868310156106dc57848901516106d8601f8916826105e5565b8355505b6001600288020188555050505b50505050505056fea264697066735822122082041c3c0fd96935845fc3b70865684ce44c12979773d3751ca3fd92deacd4aa64736f6c63430008140033',
    'Simple Voting': '608060405234801561001057600080fd5b5061057c806100206000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c806309eef43e1461006757806341c12a70146100975780634717f97c146100a157806390cf581c146100c0578063b5b47f42146100ca578063fb286c65146100e8575b600080fd5b610081600480360381019061007c91906103a6565b610106565b60405161008e91906103ee565b60405180910390f35b61009f610126565b005b6100a9610226565b6040516100b7929190610422565b60405180910390f35b6100c8610237565b005b6100d2610337565b6040516100df919061044b565b60405180910390f35b6100f061033d565b6040516100fd919061044b565b60405180910390f35b60026020528060005260406000206000915054906101000a900460ff1681565b600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16156101b3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101aa906104c3565b60405180910390fd5b60018060008282546101c59190610512565b925050819055506001600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff021916908315150217905550565b600080600054600154915091509091565b600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16156102c4576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016102bb906104c3565b60405180910390fd5b60016000808282546102d69190610512565b925050819055506001600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff021916908315150217905550565b60015481565b60005481565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061037382610348565b9050919050565b61038381610368565b811461038e57600080fd5b50565b6000813590506103a08161037a565b92915050565b6000602082840312156103bc576103bb610343565b5b60006103ca84828501610391565b91505092915050565b60008115159050919050565b6103e8816103d3565b82525050565b600060208201905061040360008301846103df565b92915050565b6000819050919050565b61041c81610409565b82525050565b60006040820190506104376000830185610413565b6104446020830184610413565b9392505050565b60006020820190506104606000830184610413565b92915050565b600082825260208201905092915050565b7f416c726561647920766f74656400000000000000000000000000000000000000600082015250565b60006104ad600d83610466565b91506104b882610477565b602082019050919050565b600060208201905081810360008301526104dc816104a0565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061051d82610409565b915061052883610409565b92508282019050808211156105405761053f6104e3565b5b9291505056fea264697066735822122097c25db73e839965620283786b6341c3796b0e061376478d893a5a3ca130b74564736f6c63430008140033',
  };

  // Try exact match first (case-insensitive)
  for (const [name, bytecode] of Object.entries(PRECOMPILED_CONTRACTS)) {
    if (contractName.toLowerCase() === name.toLowerCase()) {
      console.log(`✅ Exact match found: ${name}`);
      console.log(`Bytecode length: ${bytecode.length} hex chars = ${bytecode.length / 2} bytes`);

      // Remove 0x prefix if present
      const cleanBytecode = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;

      // Parse bytecode carefully
      const hexPairs = cleanBytecode.match(/.{1,2}/g);
      if (!hexPairs) {
        throw new Error(`Invalid bytecode format for ${name}`);
      }

      const bytes = new Uint8Array(hexPairs.map(byte => parseInt(byte, 16)));
      console.log(`Parsed to ${bytes.length} bytes`);
      console.log(`First 10 bytes: ${Array.from(bytes.slice(0, 10)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ')}`);

      return bytes;
    }
  }

  // Try partial match in contract name
  for (const [name, bytecode] of Object.entries(PRECOMPILED_CONTRACTS)) {
    if (contractName.toLowerCase().includes(name.toLowerCase().replace(' ', ''))) {
      console.log(`✅ Partial name match found: ${name}`);

      const cleanBytecode = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;
      const hexPairs = cleanBytecode.match(/.{1,2}/g);
      if (!hexPairs) {
        throw new Error(`Invalid bytecode format for ${name}`);
      }

      const bytes = new Uint8Array(hexPairs.map(byte => parseInt(byte, 16)));
      console.log(`Parsed to ${bytes.length} bytes`);
      return bytes;
    }
  }

  // Try match in Solidity code
  for (const [name, bytecode] of Object.entries(PRECOMPILED_CONTRACTS)) {
    const contractNameInCode = name.replace(' ', '');
    if (solidityCode.includes(`contract ${contractNameInCode}`)) {
      console.log(`✅ Code match found: contract ${contractNameInCode}`);

      const cleanBytecode = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;
      const hexPairs = cleanBytecode.match(/.{1,2}/g);
      if (!hexPairs) {
        throw new Error(`Invalid bytecode format for ${name}`);
      }

      const bytes = new Uint8Array(hexPairs.map(byte => parseInt(byte, 16)));
      console.log(`Parsed to ${bytes.length} bytes`);
      return bytes;
    }
  }

  // No match found - throw error instead of using fallback
  const supported = Object.keys(PRECOMPILED_CONTRACTS).join(', ');
  console.error(`❌ No matching pre-compiled contract found`);
  console.error(`Contract name provided: "${contractName}"`);
  console.error(`Supported contracts: ${supported}`);
  throw new Error(`Contract "${contractName}" not supported. Supported contracts: ${supported}`);
}

/**
 * Build constructor parameters
 */
function buildConstructorParams(params: any[]): ContractFunctionParameters {
  const contractParams = new ContractFunctionParameters();

  params.forEach(param => {
    if (typeof param === 'string') {
      contractParams.addString(param);
    } else if (typeof param === 'number') {
      contractParams.addUint256(param);
    } else if (typeof param === 'boolean') {
      contractParams.addBool(param);
    }
    // Add more types as needed
  });

  return contractParams;
}

/**
 * Build function parameters
 */
function buildFunctionParams(params: Array<{ type: string; value: any }>): ContractFunctionParameters {
  const contractParams = new ContractFunctionParameters();

  params.forEach(param => {
    switch (param.type) {
      case 'string':
        contractParams.addString(param.value);
        break;
      case 'uint256':
      case 'uint':
        contractParams.addUint256(param.value);
        break;
      case 'address':
        contractParams.addAddress(param.value);
        break;
      case 'bool':
        contractParams.addBool(param.value);
        break;
      // Add more types as needed
    }
  });

  return contractParams;
}
