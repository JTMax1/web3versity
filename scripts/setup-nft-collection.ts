/**
 * One-Time Script: Create NFT Certificate Collection
 *
 * This script creates the Web3Versity NFT certificate collection on Hedera Testnet.
 * Run this ONCE during initial setup.
 *
 * Usage:
 *   npx ts-node scripts/setup-nft-collection.ts
 *
 * Requirements:
 *   - HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY in .env
 *   - Operator account must have sufficient HBAR (~50 HBAR for collection creation)
 */

import {
  Client,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Hbar,
} from '@hashgraph/sdk';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

async function createCertificateCollection() {
  console.log('🚀 Creating Web3Versity NFT Certificate Collection...\n');

  // Get credentials from environment
  const operatorId = process.env.HEDERA_TESTNET_OPERATOR_ID || process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_TESTNET_OPERATOR_KEY || process.env.HEDERA_OPERATOR_KEY;

  if (!operatorId || !operatorKey) {
    console.error('❌ Error: HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY must be set in .env');
    process.exit(1);
  }

  console.log(`📋 Operator Account: ${operatorId}`);

  // Initialize Hedera client
  const client = Client.forTestnet();
  const accountId = AccountId.fromString(operatorId);

  // Parse private key (try ECDSA first, fallback to ED25519)
  let privateKey: PrivateKey;
  try {
    privateKey = PrivateKey.fromStringECDSA(operatorKey);
    console.log('🔑 Using ECDSA private key');
  } catch {
    try {
      privateKey = PrivateKey.fromStringED25519(operatorKey);
      console.log('🔑 Using ED25519 private key');
    } catch (error) {
      console.error('❌ Error: Invalid private key format');
      process.exit(1);
    }
  }

  client.setOperator(accountId, privateKey);

  try {
    console.log('\n⏳ Creating NFT collection...');

    // Create NFT collection
    const transaction = await new TokenCreateTransaction()
      .setTokenName('Web3Versity Certificates')
      .setTokenSymbol('W3VCERT')
      .setTokenType(TokenType.NonFungibleUnique)
      .setSupplyType(TokenSupplyType.Infinite)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(accountId)
      .setSupplyKey(privateKey) // Needed to mint NFTs
      .setMaxTransactionFee(new Hbar(50))
      .freezeWith(client);

    const signedTx = await transaction.sign(privateKey);
    const txResponse = await signedTx.execute(client);

    console.log('⏳ Waiting for consensus...');
    const receipt = await txResponse.getReceipt(client);
    const tokenId = receipt.tokenId;

    if (!tokenId) {
      throw new Error('Failed to create NFT collection - no token ID returned');
    }

    const transactionId = txResponse.transactionId.toString();

    console.log('\n✅ NFT Collection Created Successfully!\n');
    console.log('📊 Collection Details:');
    console.log('├─ Token ID:', tokenId.toString());
    console.log('├─ Name: Web3Versity Certificates');
    console.log('├─ Symbol: W3VCERT');
    console.log('├─ Type: Non-Fungible Unique (NFT)');
    console.log('├─ Supply Type: Infinite');
    console.log('├─ Treasury: ', operatorId);
    console.log('└─ Transaction ID:', transactionId);

    console.log('\n🔗 View on HashScan:');
    console.log(`   https://hashscan.io/testnet/token/${tokenId.toString()}`);

    console.log('\n📝 Next Steps:');
    console.log('\n1. Add to Supabase Secrets (Dashboard → Settings → Edge Functions → Secrets):');
    console.log(`   HEDERA_NFT_COLLECTION_TOKEN_ID=${tokenId.toString()}`);

    console.log('\n2. Insert into database (SQL Editor):');
    console.log(`
   INSERT INTO nft_collection (
     collection_name,
     collection_symbol,
     token_id,
     treasury_account,
     description,
     creation_transaction_id,
     is_active
   ) VALUES (
     'Web3Versity Certificates',
     'W3VCERT',
     '${tokenId.toString()}',
     '${operatorId}',
     'Official course completion certificates for Web3Versity platform',
     '${transactionId}',
     true
   );
    `);

    console.log('\n3. Deploy mint-certificate Edge Function:');
    console.log('   supabase functions deploy mint-certificate');

    console.log('\n✨ Setup complete! Ready to mint certificates.\n');

    client.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating NFT collection:', error);
    client.close();
    process.exit(1);
  }
}

// Run the script
createCertificateCollection();
