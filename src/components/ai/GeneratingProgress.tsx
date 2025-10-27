/**
 * Generating Progress Component
 *
 * Step 2 of course generation wizard.
 * Shows animated progress while AI generates course.
 */

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

interface GeneratingProgressProps {
  status: string;
  onCancel?: () => void;
}

const GENERATION_STEPS = [
  'Connecting to AI...',
  'Generating course structure...',
  'Creating lessons...',
  'Adding African context...',
  'Generating quizzes...',
  'Validating content...',
  'Running quality checks...',
  'Complete!',
];

export function GeneratingProgress({ status, onCancel }: GeneratingProgressProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Update current step based on status
    const stepIndex = GENERATION_STEPS.findIndex(step =>
      status.toLowerCase().includes(step.toLowerCase().split('...')[0])
    );

    if (stepIndex !== -1) {
      setCurrentStepIndex(stepIndex);
      setProgress(((stepIndex + 1) / GENERATION_STEPS.length) * 100);
    }
  }, [status]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span>Generating Your Course...</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-center text-muted-foreground">
            {Math.round(progress)}% Complete
          </p>
        </div>

        {/* Current Status */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm font-medium text-center">{status}</p>
        </div>

        {/* Step List */}
        <div className="space-y-3">
          {GENERATION_STEPS.map((step, index) => {
            const isComplete = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;

            return (
              <div
                key={step}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-primary/10 border border-primary/30'
                    : isComplete
                    ? 'bg-muted/50'
                    : 'opacity-50'
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${
                    isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {/* Info Text */}
        <div className="text-center space-y-2 pt-4">
          <p className="text-sm text-muted-foreground">
            This typically takes 30-90 seconds depending on course complexity
          </p>
          <p className="text-xs text-muted-foreground">
            The AI is creating complete lessons with African context, examples, and quizzes
          </p>
        </div>

        {/* Cancel Button (disabled during generation) */}
        {onCancel && (
          <div className="flex justify-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={true}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
