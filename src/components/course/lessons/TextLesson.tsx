import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { CheckCircle } from 'lucide-react';

interface TextLessonProps {
  content: any;
  onComplete: (score?: number) => void;
  isCompleted?: boolean;
  isCompleting?: boolean;
}

export function TextLesson({ content, onComplete, isCompleted = false, isCompleting = false }: TextLessonProps) {
  const [hasScrolled, setHasScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = (e: any) => {
      const element = e.target;
      if (element.scrollHeight - element.scrollTop <= element.clientHeight + 50) {
        setHasScrolled(true);
      }
    };

    const container = document.getElementById('lesson-content');
    container?.addEventListener('scroll', handleScroll);

    // Check if content is short enough that scrolling isn't needed
    if (container && container.scrollHeight <= container.clientHeight) {
      setHasScrolled(true);
    }

    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="space-y-8">
      <div 
        id="lesson-content"
        className="max-h-[600px] overflow-y-auto pr-4 space-y-8"
      >
        {content.sections.map((section: any, index: number) => (
          <div key={index} className="space-y-4">
            {section.emoji && (
              <div className="text-5xl mb-4">{section.emoji}</div>
            )}
            
            {section.heading && (
              <h3 className="text-xl">{section.heading}</h3>
            )}
            
            {section.text && (
              <p className="text-gray-700 leading-relaxed">{section.text}</p>
            )}
            
            {section.list && (
              <ul className="space-y-3 ml-4">
                {section.list.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#0084C7] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[inset_-1px_-1px_4px_rgba(0,0,0,0.2),inset_1px_1px_4px_rgba(255,255,255,0.5)]">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700 flex-1" dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Complete Button */}
      <div className="pt-6 border-t border-gray-200">
        <Button
          onClick={() => onComplete()}
          disabled={!hasScrolled || isCompleted || isCompleting}
          className={`w-full py-6 rounded-2xl transition-all ${
            isCompleted
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : isCompleting
              ? 'bg-gray-400 text-white cursor-wait'
              : hasScrolled
              ? 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:from-[#0074b7] hover:to-[#0098d8] shadow-[0_4px_16px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          {isCompleted ? '✓ Completed' : isCompleting ? 'Saving...' : hasScrolled ? 'Mark as Complete & Continue' : 'Scroll to bottom to continue'}
        </Button>
      </div>
    </div>
  );
}
