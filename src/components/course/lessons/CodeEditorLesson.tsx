import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { CheckCircle, Play, RotateCcw, Lightbulb, Book, ExternalLink } from 'lucide-react';

interface CodeEditorLessonProps {
  content: any;
  onComplete: (score?: number) => void;
  isCompleted?: boolean;
  isCompleting?: boolean;
}

interface Test {
  name: string;
  assertion: string;
  expected: string;
}

interface Reference {
  title: string;
  url: string;
}

export function CodeEditorLesson({
  content,
  onComplete,
  isCompleted = false,
  isCompleting = false,
}: CodeEditorLessonProps) {
  const [code, setCode] = useState(content.starterCode || '// Start coding here...\n');
  const [output, setOutput] = useState<string>('');
  const [testResults, setTestResults] = useState<{ name: string; passed: boolean; message: string }[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [allTestsPassed, setAllTestsPassed] = useState(false);

  const runCode = () => {
    // Capture console.log output
    const logs: string[] = [];
    const originalLog = console.log;

    // Override console.log temporarily
    console.log = (...args: any[]) => {
      logs.push(args.map(arg => String(arg)).join(' '));
      originalLog(...args);
    };

    try {
      // Clear previous output and results
      setOutput('');
      setTestResults([]);

      // Run the user's code
      // eslint-disable-next-line no-eval
      eval(code);

      // Restore console.log
      console.log = originalLog;

      // Set output
      const outputText = logs.join('\n');
      setOutput(outputText || '(No output)');

      // Run tests if they exist
      if (content.tests && content.tests.length > 0) {
        const results = content.tests.map((test: Test) => {
          // Simple test: check if output contains expected string
          const passed = outputText.includes(test.expected);
          return {
            name: test.name,
            passed,
            message: passed
              ? `✓ ${test.name}`
              : `✗ ${test.name} - Expected: "${test.expected}"`,
          };
        });

        setTestResults(results);

        const allPassed = results.every((r) => r.passed);
        setAllTestsPassed(allPassed);
      } else {
        // If no tests, any output is considered success
        setAllTestsPassed(outputText.length > 0);
      }
    } catch (error: any) {
      console.log = originalLog;
      setOutput(`Error: ${error.message}`);
      setTestResults([]);
      setAllTestsPassed(false);
    }
  };

  const resetCode = () => {
    setCode(content.starterCode || '');
    setOutput('');
    setTestResults([]);
    setAllTestsPassed(false);
  };

  const showSolution = () => {
    if (content.solution) {
      setCode(content.solution);
    }
  };

  const handleComplete = () => {
    const score = allTestsPassed ? 100 : 0;
    onComplete(score);
  };

  return (
    <div className="space-y-6">
      {/* Title and Description */}
      <div className="space-y-3">
        <h3 className="text-2xl font-bold">{content.title || 'Code Exercise'}</h3>
        <p className="text-gray-700">{content.description || 'Complete the coding exercise below.'}</p>
      </div>

      {/* Code Editor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">Your Code:</label>
          <div className="flex gap-2">
            <Button
              onClick={resetCode}
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={runCode}
              className="bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white rounded-full"
              size="sm"
            >
              <Play className="w-4 h-4 mr-2" />
              Run Code
            </Button>
          </div>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-green-400 rounded-2xl border-2 border-gray-700 focus:border-[#0084C7] focus:outline-none resize-none shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]"
          spellCheck={false}
          placeholder="// Start coding here..."
        />
      </div>

      {/* Output */}
      {output && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Output:</label>
          <div className="p-4 bg-gray-100 rounded-2xl border-2 border-gray-300 font-mono text-sm whitespace-pre-wrap min-h-[80px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
            {output}
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Test Results:</label>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl border-2 ${
                  result.passed
                    ? 'bg-green-50 border-green-400 text-green-800'
                    : 'bg-red-50 border-red-400 text-red-800'
                }`}
              >
                {result.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Message */}
      {allTestsPassed && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-2xl">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <h4 className="text-green-900 font-bold">Great job! 🎉</h4>
              <p className="text-green-800 text-sm">All tests passed! You can now complete this lesson.</p>
            </div>
          </div>
        </div>
      )}

      {/* Hints */}
      {content.hints && content.hints.length > 0 && (
        <div className="space-y-3">
          <Button
            onClick={() => setShowHints(!showHints)}
            variant="outline"
            className="w-full rounded-2xl"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            {showHints ? 'Hide Hints' : 'Need Help? Show Hints'}
          </Button>

          {showHints && (
            <div className="space-y-2">
              {content.hints.slice(0, currentHint + 1).map((hint: string, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-2xl text-yellow-900 text-sm"
                >
                  <strong>Hint {index + 1}:</strong> {hint}
                </div>
              ))}
              {currentHint < content.hints.length - 1 && (
                <Button
                  onClick={() => setCurrentHint((prev) => prev + 1)}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  Show Next Hint
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Explanation */}
      {content.explanation && (
        <div className="p-4 bg-blue-50 border-2 border-blue-400 rounded-2xl">
          <div className="flex items-start gap-3">
            <Book className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <h4 className="text-blue-900 font-bold">💡 Explanation:</h4>
              <div
                className="text-blue-800 text-sm prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: content.explanation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
              />
            </div>
          </div>
        </div>
      )}

      {/* References */}
      {content.references && content.references.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">📚 Learn More:</label>
          <div className="space-y-2">
            {content.references.map((ref: Reference, index: number) => (
              <a
                key={index}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-[#0084C7]" />
                <span className="text-sm text-gray-700">{ref.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Solution Button */}
      {content.solution && !allTestsPassed && (
        <Button
          onClick={showSolution}
          variant="outline"
          className="w-full rounded-2xl border-orange-400 text-orange-700 hover:bg-orange-50"
        >
          Show Solution (if stuck)
        </Button>
      )}

      {/* Complete Button */}
      <div className="pt-6 border-t border-gray-200">
        <Button
          onClick={handleComplete}
          disabled={!allTestsPassed || isCompleting}
          className={`w-full py-6 rounded-2xl transition-all duration-200 ${
            isCompleting
              ? 'bg-gray-400 text-white cursor-wait'
              : isCompleted
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-[0_4px_16px_rgba(34,197,94,0.3)]'
              : allTestsPassed
              ? 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:from-[#0074b7] hover:to-[#0098d8] shadow-[0_4px_16px_rgba(0,132,199,0.3)]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          {isCompleting
            ? 'Saving...'
            : isCompleted
            ? 'Continue to Next Lesson →'
            : allTestsPassed
            ? 'Complete Lesson & Continue'
            : 'Pass all tests to continue'}
        </Button>
      </div>
    </div>
  );
}
