import React from 'react';
import { Button } from './ui/button';
import { detectMetamask } from '@/lib/hederaUtils';

export function MetamaskPrompt() {
  const [dismissed, setDismissed] = React.useState(false);

  if (detectMetamask() || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-2xl shadow-2xl p-6 max-w-sm border-2 border-[#0084C7] z-50">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>

      {/* Logo Header */}
      <div className="flex items-center justify-center mb-4">
        <img
          src="/assets/w3v-logo.png"
          alt="Web3versity"
          className="h-16 w-auto"
        />
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="text-4xl">🦊</div>
          <h3 className="font-bold text-lg">Metamask Required</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          To use Web3versity, you need Metamask wallet extension installed.
        </p>
        <Button
          onClick={() => window.open('https://metamask.io/download/', '_blank')}
          className="w-full bg-gradient-to-r from-[#0084C7] to-[#00a8e8] hover:from-[#0074b7] hover:to-[#0098d8]"
        >
          Install Metamask
        </Button>
      </div>
    </div>
  );
}