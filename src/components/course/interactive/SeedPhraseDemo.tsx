import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Eye, EyeOff, Copy, CheckCircle } from 'lucide-react';

interface SeedPhraseDemoProps {
  content: any;
  onInteract: () => void;
}

export function SeedPhraseDemo({ content, onInteract }: SeedPhraseDemoProps) {
  const [showWords, setShowWords] = useState(false);
  const [copiedWord, setCopiedWord] = useState<number | null>(null);
  const [hasRevealed, setHasRevealed] = useState(false);

  const handleReveal = () => {
    setShowWords(true);
    setHasRevealed(true);
    onInteract();
  };

  const handleCopyWord = (index: number) => {
    setCopiedWord(index);
    setTimeout(() => setCopiedWord(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="bg-gradient-to-br from-[#0084C7]/5 to-[#00a8e8]/10 rounded-3xl p-6 shadow-[inset_0_2px_8px_rgba(0,132,199,0.1)]">
        <h3 className="mb-4">What is a Seed Phrase?</h3>
        <p className="text-gray-700 mb-4">{content.explanation}</p>
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
          <p className="text-yellow-900">
            <strong>💡 {content.analogy}</strong>
          </p>
        </div>
      </div>

      {/* Demo Seed Phrase */}
      <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-6">
          <h4>Example Seed Phrase</h4>
          <Button
            onClick={handleReveal}
            className="bg-[#0084C7] text-white hover:bg-[#0074b7] rounded-full px-6 shadow-[0_4px_16px_rgba(0,132,199,0.3)]"
            size="sm"
          >
            {showWords ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showWords ? 'Hide Words' : 'Reveal Words'}
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {content.demoWords.map((word: string, index: number) => (
            <div
              key={index}
              className={`relative p-4 rounded-2xl transition-all ${
                showWords
                  ? 'bg-gradient-to-br from-gray-50 to-gray-100 shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]'
                  : 'bg-gray-200 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)]'
              }`}
            >
              <div className="text-xs text-gray-500 mb-1">{index + 1}</div>
              <div className="flex items-center justify-between">
                {showWords ? (
                  <>
                    <span className="text-gray-900">{word}</span>
                    <button
                      onClick={() => handleCopyWord(index)}
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                    >
                      {copiedWord === index ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-600" />
                      )}
                    </button>
                  </>
                ) : (
                  <span className="text-gray-400">••••••</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {showWords && (
          <div className="mt-6 bg-red-50 border-2 border-red-400 rounded-2xl p-4">
            <p className="text-red-900 text-sm">
              <strong>⚠️ IMPORTANT:</strong> This is just a demo. In real life, NEVER take screenshots or share your seed phrase with anyone!
            </p>
          </div>
        )}
      </div>

      {/* Key Points */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-2xl p-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
          <div className="text-3xl mb-3">✅</div>
          <h4 className="text-green-900 mb-2">DO:</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Write on paper and store safely</li>
            <li>• Keep multiple backup copies</li>
            <li>• Store in different secure locations</li>
            <li>• Consider metal backup for large amounts</li>
          </ul>
        </div>

        <div className="bg-red-50 rounded-2xl p-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
          <div className="text-3xl mb-3">❌</div>
          <h4 className="text-red-900 mb-2">DON'T:</h4>
          <ul className="text-sm text-red-800 space-y-1">
            <li>• Take screenshots</li>
            <li>• Save on computer or phone</li>
            <li>• Share with anyone</li>
            <li>• Store in email or cloud</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
