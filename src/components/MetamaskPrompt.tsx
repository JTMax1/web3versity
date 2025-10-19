import React from 'react';
import { Button } from './ui/button';
import { detectMetamask } from '@/lib/hederaUtils';

export function MetamaskPrompt() {
  const [dismissed, setDismissed] = React.useState(false);

  if (detectMetamask() || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-6 max-w-sm border-2 border-orange-500 z-50">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>

      <div className="flex items-start gap-4">
        <div className="text-4xl">🦊</div>
        <div>
          <h3 className="font-bold text-lg mb-2">Metamask Required</h3>
          <p className="text-sm text-gray-600 mb-4">
            To use Web3Versity, you need Metamask wallet extension installed.
          </p>
          <Button
            onClick={() => window.open('https://metamask.io/download/', '_blank')}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            Install Metamask
          </Button>
        </div>
      </div>
    </div>
  );
}