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

interface InteractiveLessonProps {
  content: any;
  onComplete: () => void;
}

export function InteractiveLesson({ content, onComplete }: InteractiveLessonProps) {
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
        return <ScamDetector />;
      case 'tax_calculator':
      case 'career_explorer':
      case 'play_to_earn_demo':
      case 'chart_analysis':
      case 'exchange_demo':
      case 'council_timeline':
      case 'layer_comparison':
        // These will be simplified or use existing components
        setTimeout(() => setHasInteracted(true), 2000);
        return <div className="p-8 text-center space-y-4">
          <h3 className="text-2xl">Interactive Component</h3>
          <p className="text-muted-foreground">
            This interactive experience is automatically completing for demonstration purposes.
            In a full implementation, this would be a rich interactive component.
          </p>
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
          onClick={onComplete}
          disabled={!hasInteracted}
          className={`w-full py-6 rounded-2xl transition-all ${
            hasInteracted
              ? 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:from-[#0074b7] hover:to-[#0098d8] shadow-[0_4px_16px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          {hasInteracted ? 'Mark as Complete & Continue' : 'Complete the interactive activity'}
        </Button>
      </div>
    </div>
  );
}
