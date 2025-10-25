import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { SeedPhraseDemo } from '../interactive/SeedPhraseDemo';
import { StorageComparison } from '../interactive/StorageComparison';
import { MarketTransactionDemo } from '../interactive/MarketTransactionDemo';
import { BlockChainAnimation } from '../interactive/BlockChainAnimation';
import { MobileMoneyComparison } from '../interactive/MobileMoneyComparison';
import { TransactionFlow } from '../interactive/TransactionFlow';
import { NFTShowcase } from '../interactive/NFTShowcase';
import { NFTMarketplace } from '../interactive/NFTMarketplace';
import { NFTMetadata } from '../interactive/NFTMetadata';
import { DAppDemo } from '../interactive/DAppDemo';
import { NetworkComparison } from '../interactive/NetworkComparison';
import { WalletConnectionDemo } from '../interactive/WalletConnectionDemo';
import { ExplorerGuide } from '../interactive/ExplorerGuide';
import { PaymentComparison } from '../interactive/PaymentComparison';
import { ScamDetector } from '../interactive/ScamDetector';
import { ConsensusAnimation } from '../interactive/ConsensusAnimation';
import { DeFiProtocolExplorer } from '../interactive/DeFiProtocolExplorer';
import { HCSUseCaseExplorer } from '../interactive/HCSUseCaseExplorer';
import { PhishingSimulator } from '../interactive/PhishingSimulator';
import { YieldCalculator } from '../interactive/YieldCalculator';
import { BlockChainBuilder } from '../interactive/BlockChainBuilder';
import { TransactionSimulator } from '../interactive/TransactionSimulator';
import { CentralizedVsDecentralized } from '../interactive/CentralizedVsDecentralized';
import { BeginnerScamOrLegit } from '../interactive/BeginnerScamOrLegit';

interface InteractiveLessonProps {
  content: any;
  onComplete: (score?: number) => void;
  isCompleted?: boolean;
  isCompleting?: boolean;
}

export function InteractiveLesson({ content, onComplete, isCompleted = false, isCompleting = false }: InteractiveLessonProps) {
  const [hasInteracted, setHasInteracted] = useState(false);

  const renderInteractive = () => {
    switch (content.type) {
      case 'seed_phrase_demo':
        return <SeedPhraseDemo content={content} onInteract={() => setHasInteracted(true)} />;
      case 'storage_comparison':
        return <StorageComparison content={content} onInteract={() => setHasInteracted(true)} />;
      case 'market_transaction_demo':
        return <MarketTransactionDemo content={content} onInteract={() => setHasInteracted(true)} />;
      case 'block_chain_animation':
        return <BlockChainAnimation content={content} onInteract={() => setHasInteracted(true)} />;
      case 'mobile_money_comparison':
        return <MobileMoneyComparison content={content} onInteract={() => setHasInteracted(true)} />;
      case 'transaction_flow':
        return <TransactionFlow onInteract={() => setHasInteracted(true)} />;
      case 'nft_showcase':
        return <NFTShowcase content={content} onInteract={() => setHasInteracted(true)} />;
      case 'nft_marketplace':
        return <NFTMarketplace content={content} onInteract={() => setHasInteracted(true)} />;
      case 'nft_metadata':
        return <NFTMetadata content={content} onInteract={() => setHasInteracted(true)} />;
      case 'dapp_demo':
        return <DAppDemo onInteract={() => setHasInteracted(true)} />;
      case 'network_comparison':
      case 'consensus_comparison':
        return <NetworkComparison onInteract={() => setHasInteracted(true)} />;
      case 'wallet_connection':
        return <WalletConnectionDemo onInteract={() => setHasInteracted(true)} />;
      case 'explorer_guide':
        return <ExplorerGuide onInteract={() => setHasInteracted(true)} />;
      case 'payment_comparison':
        return <PaymentComparison />;
      case 'scam_detector':
        return <ScamDetector onInteract={() => setHasInteracted(true)} />;
      case 'consensus_animation':
        return <ConsensusAnimation onInteract={() => setHasInteracted(true)} />;
      case 'defi_protocol_explorer':
        return <DeFiProtocolExplorer onInteract={() => setHasInteracted(true)} />;
      case 'hcs_use_case_explorer':
        return <HCSUseCaseExplorer onInteract={() => setHasInteracted(true)} />;
      case 'phishing_simulator':
        return <PhishingSimulator onInteract={() => setHasInteracted(true)} />;
      case 'yield_calculator':
        return <YieldCalculator onInteract={() => setHasInteracted(true)} />;
      case 'blockchain_builder':
        return <BlockChainBuilder onInteract={() => setHasInteracted(true)} />;
      case 'transaction_simulator':
        return <TransactionSimulator onInteract={() => setHasInteracted(true)} />;
      case 'centralized_vs_decentralized':
        return <CentralizedVsDecentralized onInteract={() => setHasInteracted(true)} />;
      case 'beginner_scam_or_legit':
        return <BeginnerScamOrLegit onInteract={() => setHasInteracted(true)} />;

      // Missing interactive types that fall back to auto-complete placeholders
      case 'tax_calculator':
      case 'career_explorer':
      case 'play_to_earn_demo':
      case 'chart_analysis':
      case 'exchange_demo':
      case 'council_timeline':
      case 'layer_comparison':
        // These types are used in migrations but don't have dedicated components yet
        // Auto-completing after 2 seconds to allow lesson progression
        setTimeout(() => setHasInteracted(true), 2000);
        return <div className="p-8 text-center space-y-4">
          <h3 className="text-2xl">📚 Interactive Component: {content.type.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h3>
          <p className="text-muted-foreground mb-4">
            {content.explanation || 'This interactive experience is automatically completing for demonstration purposes. In a full implementation, this would be a rich interactive component.'}
          </p>
          {content.analogy && (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-4 max-w-2xl mx-auto">
              <p className="text-yellow-900 text-sm">
                <strong>💡 {content.analogy}</strong>
              </p>
            </div>
          )}
          <div className="mt-6 text-sm text-gray-500">
            ⏱️ Auto-completing in 2 seconds...
          </div>
        </div>;
      default:
        return <div>Interactive content coming soon</div>;
    }
  };

  return (
    <div className="space-y-8">
      {renderInteractive()}

      {/* Complete Button */}
      <div className="pt-6 border-t border-gray-200">
        <Button
          onClick={() => onComplete()}
          disabled={!hasInteracted || isCompleting}
          className={`w-full py-6 rounded-2xl transition-all duration-200 ${
            isCompleting
              ? 'bg-gray-400 text-white cursor-wait'
              : isCompleted
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-[0_4px_16px_rgba(34,197,94,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)] active:translate-y-[2px] active:shadow-[0_2px_8px_rgba(34,197,94,0.3),inset_2px_2px_8px_rgba(0,0,0,0.2)]'
              : hasInteracted
              ? 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:from-[#0074b7] hover:to-[#0098d8] shadow-[0_4px_16px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)] active:translate-y-[2px] active:shadow-[0_2px_8px_rgba(0,132,199,0.3),inset_2px_2px_8px_rgba(0,0,0,0.2)]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          {isCompleting
            ? 'Saving...'
            : isCompleted
            ? 'Continue to Next Lesson →'
            : hasInteracted
            ? 'Save & Continue'
            : 'Complete the interactive activity'}
        </Button>
      </div>
    </div>
  );
}
