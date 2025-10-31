/**
 * Practical Type Fuzzy Matcher
 *
 * Maps AI-generated practical lesson types to valid component IDs
 * Handles variations and common aliases automatically
 */

import { PRACTICAL_TYPES, type PracticalType } from '../course-creation/practical-types';

/**
 * Mapping of AI variations to valid practical type IDs
 */
const PRACTICAL_TYPE_ALIASES: Record<string, string[]> = {
  // Transaction variations
  transaction: [
    'transaction',
    'send_hbar',
    'hbar_transfer',
    'transfer',
    'send_transaction',
    'transfer_hbar',
    'cryptocurrency_transfer',
    'token_transfer',
    'transaction_sender',
  ],

  // NFT variations
  nft_minting: [
    'nft_minting',
    'nft_mint',
    'mint_nft',
    'create_nft',
    'nft_creation',
    'nft_studio',
    'nft_minter',
    'mint_token',
  ],

  // Smart Contract variations
  contract: [
    'contract',
    'smart_contract',
    'deploy_contract',
    'contract_deploy',
    'contract_deployment',
    'solidity_contract',
    'smart_contract_playground',
    'contract_interaction',
  ],

  // HCS variations
  hcs_message: [
    'hcs_message',
    'hcs',
    'consensus_message',
    'message_board',
    'hcs_messaging',
    'hedera_consensus',
    'consensus_service',
    'topic_message',
  ],

  // DeFi variations
  defi: [
    'defi',
    'defi_protocol',
    'liquidity_pool',
    'staking',
    'yield_farming',
    'liquidity_provision',
    'defi_interaction',
    'protocol_interaction',
  ],

  // DEX variations
  dex_swap: [
    'dex_swap',
    'dex',
    'token_swap',
    'swap_tokens',
    'exchange',
    'dex_trade',
    'swap',
    'token_exchange',
  ],

  // Wallet Creation variations
  wallet_creation: [
    'wallet_creation',
    'create_wallet',
    'wallet_setup',
    'new_wallet',
    'generate_wallet',
    'wallet_generation',
    'setup_wallet',
  ],

  // Wallet Investigation variations
  wallet_investigation: [
    'wallet_investigation',
    'investigate_wallet',
    'wallet_analysis',
    'analyze_wallet',
    'wallet_forensics',
    'wallet_explorer',
    'account_investigation',
  ],

  // Explorer Navigation variations
  explorer_navigation: [
    'explorer_navigation',
    'explorer',
    'hashscan',
    'blockchain_explorer',
    'navigate_explorer',
    'explorer_guide',
    'scan_navigation',
  ],

  // Transaction Detective variations
  transaction_detective: [
    'transaction_detective',
    'detective',
    'transaction_analysis',
    'forensics',
    'transaction_forensics',
    'blockchain_detective',
    'trace_transaction',
  ],
};

/**
 * Match AI-generated interactiveType to valid practical type ID
 *
 * @param aiType - The interactiveType string from AI generation
 * @returns Valid practical type ID or null if no match found
 */
export function matchPracticalType(aiType: string): string | null {
  if (!aiType) return null;

  const normalized = aiType.toLowerCase().trim();

  // Direct match (AI followed instructions perfectly)
  if (PRACTICAL_TYPES.find(type => type.id === normalized)) {
    return normalized;
  }

  // Fuzzy match using aliases
  for (const [validId, aliases] of Object.entries(PRACTICAL_TYPE_ALIASES)) {
    if (aliases.includes(normalized)) {
      console.log(`[Practical Matcher] Mapped "${aiType}" → "${validId}"`);
      return validId;
    }
  }

  // Partial match (contains keyword)
  for (const [validId, aliases] of Object.entries(PRACTICAL_TYPE_ALIASES)) {
    for (const alias of aliases) {
      if (normalized.includes(alias) || alias.includes(normalized)) {
        console.log(`[Practical Matcher] Partial match "${aiType}" → "${validId}"`);
        return validId;
      }
    }
  }

  console.warn(`[Practical Matcher] No match found for "${aiType}". Manual selection required.`);
  return null;
}

/**
 * Validate and fix practical lesson interactiveType
 *
 * @param lesson - The lesson object to validate
 * @returns Object with validation result and suggested fix
 */
export function validatePracticalType(lesson: any): {
  valid: boolean;
  originalType: string;
  suggestedType: string | null;
  needsManualSelection: boolean;
} {
  const originalType = lesson.practicalType || lesson.interactiveType || '';
  const suggestedType = matchPracticalType(originalType);

  return {
    valid: suggestedType !== null,
    originalType,
    suggestedType,
    needsManualSelection: suggestedType === null,
  };
}

/**
 * Get all valid practical type IDs
 */
export function getValidPracticalTypeIds(): string[] {
  return PRACTICAL_TYPES.map(type => type.id);
}

/**
 * Get practical type info by ID
 */
export function getPracticalTypeInfo(id: string): PracticalType | null {
  return PRACTICAL_TYPES.find(type => type.id === id) || null;
}

/**
 * Auto-fix practical lessons in a course
 * Returns fixed lessons and list of lessons that need manual selection
 */
export function autoFixPracticalLessons(lessons: any[]): {
  fixedLessons: any[];
  needsManualSelection: Array<{
    lessonIndex: number;
    lessonTitle: string;
    originalType: string;
  }>;
} {
  const fixedLessons = [...lessons];
  const needsManualSelection: Array<{
    lessonIndex: number;
    lessonTitle: string;
    originalType: string;
  }> = [];

  lessons.forEach((lesson, index) => {
    if (lesson.type === 'practical' || lesson.lesson_type === 'practical') {
      const validation = validatePracticalType(lesson);

      if (validation.valid && validation.suggestedType) {
        // Auto-fix: Update to valid type
        if (fixedLessons[index].practicalType) {
          fixedLessons[index].practicalType = validation.suggestedType;
        }
        if (fixedLessons[index].interactiveType) {
          fixedLessons[index].interactiveType = validation.suggestedType;
        }
        if (fixedLessons[index].content?.interactiveType) {
          fixedLessons[index].content.interactiveType = validation.suggestedType;
        }
      } else {
        // Needs manual selection
        needsManualSelection.push({
          lessonIndex: index,
          lessonTitle: lesson.title || `Lesson ${index + 1}`,
          originalType: validation.originalType,
        });
      }
    }
  });

  return {
    fixedLessons,
    needsManualSelection,
  };
}
