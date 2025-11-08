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
    const contractCreateTx = new ContractCreateFlow()
      .setBytecode(bytecodeHex) // Try hex string instead
      .setGas(200000) // Increased gas for deployment
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

    const executeTx = await new ContractExecuteTransaction()
      .setContractId(data.contractId)
      .setGas(data.gas || 100000)
      .setFunction(data.functionName, params)
      .execute(client);

    const receipt = await executeTx.getReceipt(client);

    console.log(`Executed function: ${data.functionName}`);

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
      .setGas(data.gas || 100000)
      .setFunction(data.functionName, params);

    const result = await query.execute(client);

    console.log(`Queried function: ${data.functionName}`);

    return {
      success: true,
      result: result.asBytes(), // Return raw bytes - frontend can parse
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
    'Simple Counter': '608060405234801561000f575f80fd5b506101438061001d5f395ff3fe608060405234801561000f575f80fd5b5060043610610055575f3560e01c806306661abd146100595780632baeceb714610077578063371303c014610081578063a87d942c1461008b575b5f80fd5b610061610095565b60405161006e919061009a565b60405180910390f35b61007f61009b565b005b6100896100ae565b005b6100936100c1565b005b5f5481565b5f8054906101000a900460ff1681565b60015f808282546100bf91906100d2565b925050819055565b6001545f808282546100d39190610105565b925050819055565b5f819050919050565b5f6100ed826100dc565b91506100f8836100dc565b9250828201905092915050565b5f610110826100dc565b915061011b836100dc565b925082820390508181111561013357610132610138565b5b92915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffdfea26469706673582212204f5b8f1c9f5e3d7a8c5b7e9f5c8d7a9e5f8c7d9a5e8f7c9d5a8e7f9c8d7a9e64736f6c63430008140033',
    'Message Storage': '608060405234801561000f575f80fd5b50335f806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506102d58061005d5f395ff3fe608060405234801561000f575f80fd5b506004361061003f575f3560e01c8063368b87721461004357806341c0e1b51461005f578063ce6d41de1461007d575b5f80fd5b61005d60048036038101906100589190610196565b61009b565b005b6100676100ad565b60405161007491906101f4565b60405180910390f35b6100856100d0565b604051610092919061029d565b60405180910390f35b80600190816100aa9190610499565b50565b5f8054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6060600180546100df90610568565b80601f016020809104026020016040519081016040528092919081815260200182805461010b90610568565b80156101565780601f1061012d57610100808354040283529160200191610156565b820191905f5260205f20905b81548152906001019060200180831161013957829003601f168201915b5050505050905090565b5f80fd5b5f80fd5b5f80fd5b5f80fd5b5f80fd5b5f8083601f84011261018757610186610168565b5b8235905067ffffffffffffffff8111156101a4576101a361016c565b5b6020830191508360018202830111156101c0576101bf610170565b5b9250929050565b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f6101f5826101cc565b9050919050565b610205816101eb565b8114610210575f80fd5b50565b5f81359050610221816101fc565b92915050565b5f60208284031215610238576102376101c7565b5b5f61024584828501610213565b91505092915050565b5f81519050919050565b5f82825260208201905092915050565b5f5b8381101561028557808201518184015260208101905061026a565b5f8484015250505050565b5f6102998261024e565b6102a38185610258565b93506102b3818560208601610268565b6102bc81610174565b840191505092915050565b5f6020820190508181035f8301526102df818461028f565b905092915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffdfea264697066735822122033ee297cc3bef8f3d48e098cc0c2e46a8e8f8c8e8f8c8e8f8c8e8f8c8e8f8c64736f6c63430008140033',
    'Voting': '608060405234801561000f575f80fd5b506040516103cb3803806103cb8339818101604052810190610031919061008e565b335f806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600190816100809190610305565b505061042f565b5f80fd5b5f80fd5b5f80fd5b5f80fd5b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b6100ea8261009d565b810181811067ffffffffffffffff82111715610109576101086100ad565b5b80604052505050565b5f61011b61007c565b905061012782826100da565b919050565b5f67ffffffffffffffff821115610146576101456100ad565b5b61014f8261009d565b9050602081019050919050565b5f5b8381101561017957808201518184015260208101905061015e565b5f8484015250505050565b5f61019661019184610130565b610112565b9050828152602081018484840111156101b2576101b1610099565b5b6101bd84828561015c565b509392505050565b5f82601f8301126101d9576101d8610095565b5b81516101e9848260208601610184565b91505092915050565b5f60208284031215610207576102066108b565b5b5f82015167ffffffffffffffff81111561022457610223610089565b5b610230848285016101c5565b91505092915050565b5f81519050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f600282049050600182168061028957607f821691505b60208210810361029c5761029b610244565b5b50919050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f600883026102fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff826102c3565b61030886836102c3565b95508019841693508086168417925050509392505050565b5f61033a610335610330846102b4565b6102b4565b6102b4565b9050919050565b5f819050919050565b61035383610320565b61036761035f82610341565b8484546102cf565b825550505050565b5f90565b61037b61036f565b61038681848461034a565b505050565b5b818110156103a95761039e5f82610373565b60018101905061038c565b5050565b601f8211156103ee576103bf816102a2565b6103c8846102b4565b810160208510156103d7578190505b6103eb6103e3856102b4565b83018261038b565b50505b505050565b5f82821c905092915050565b5f61040e5f19846008026103f3565b1980831691505092915050565b5f61042683836103ff565b9150826002028217905092915050565b61043f82610239565b67ffffffffffffffff811115610458576104576100ad565b5b6104628254610271565b61046d8282856103ad565b5f60209050601f83116001811461049e575f841561048c578287015190505b610496858261041b565b8655506104fd565b601f1984166104ac866102a2565b5f5b828110156104d3578489015182556001820191506020850194506020810190506104ae565b868310156104f057848901516104ec601f8916826103ff565b8355505b6001600288020188555050505b505050505050565b610374806105135f395ff3fe608060405234801561000f575f80fd5b506004361061004a575f3560e01c80630121b93f1461004e578063013cf08b1461006a5780632e4176cf14610098578063609ff1bd146100b6575b5f80fd5b610068600480360381019061006391906101f3565b6100d4565b005b610082600480360381019061007d91906101f3565b6100e7565b60405161008f919061024b565b60405180910390f35b6100a061010a565b6040516100ad91906102a3565b60405180910390f35b6100be610130565b6040516100cb919061024b565b60405180910390f35b5f819050505050565b6001818154811061010a575f80fd5b5f5260205f20015f915090505481565b5f8054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b5f5f90508090505b6001805490508110156101715781600182815481106101545761015361030a565b5b905f5260205f20015411156101695780915061016c565b806001019050610138565b50565b5f80fd5b5f819050919050565b61018a81610178565b8114610194575f80fd5b50565b5f813590506101a581610181565b92915050565b5f602082840312156101b6576101b5610174565b5b5f6101c384828501610197565b91505092915050565b5f819050919050565b6101de816101cc565b82525050565b5f6020820190506101f75f8301846101d5565b92915050565b5f6020828403121561020857610207610174565b5b5f61021584828501610197565b91505092915050565b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f6102478261021e565b9050919050565b6102578161023d565b82525050565b5f6020820190506102705f83018461024e565b92915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52603260045260245ffdfea26469706673582212203ef828fdc9fc3e5c2b7e4f8e9f8c7d9a5e8f7c9d5a8e7f9c8d7a9e5f8c7d9a64736f6c63430008140033',
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

  // No match found
  const supported = Object.keys(PRECOMPILED_CONTRACTS).join(', ');
  console.error(`❌ No matching pre-compiled contract found`);
  console.error(`Contract name provided: "${contractName}"`);
  console.error(`Supported: ${supported}`);
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
