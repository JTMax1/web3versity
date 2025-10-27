/**
 * AI Generator Page
 *
 * Main page for AI course generation feature.
 * Wraps CourseGenerator component with page layout and feature check.
 */

import { AlertCircle, Sparkles, Brain } from 'lucide-react';
import { CourseGenerator } from '../ai/CourseGenerator';
import { useIsAIEnabled } from '../../hooks/useAI';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export function AIGenerator() {
  const isAIEnabled = useIsAIEnabled();

  if (!isAIEnabled) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>AI Features Disabled</AlertTitle>
          <AlertDescription>
            AI course generation is currently disabled. Please contact the administrator to enable
            this feature.
          </AlertDescription>
        </Alert>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-muted-foreground" />
              <div>
                <CardTitle>AI Course Generator</CardTitle>
                <CardDescription>
                  Generate complete, African-contextualized courses in minutes using AI
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                This feature uses Google's Gemini AI to automatically generate complete Web3
                courses with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>African-contextualized examples and analogies</li>
                <li>Multiple lesson types (text, interactive, quizzes, code)</li>
                <li>Automatic quality validation</li>
                <li>Mobile-optimized content</li>
              </ul>
              <p className="text-xs">
                <strong>Note:</strong> To enable this feature, set <code>VITE_AI_FEATURES_ENABLED=true</code>{' '}
                in your environment variables and configure the Gemini API key.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Course Generator
            </h1>
            <p className="text-muted-foreground">
              Create complete, African-contextualized courses in minutes
            </p>
          </div>
        </div>

        <Alert className="border-purple-200 bg-purple-50">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-sm text-purple-900">
            <strong>New Feature:</strong> Generate entire courses with AI! The system automatically
            includes African examples, currencies (₦, KES, R, GHS), and mobile money references.
            Quality checks ensure content meets Web3Versity standards.
          </AlertDescription>
        </Alert>
      </div>

      {/* Course Generator Component */}
      <CourseGenerator />
    </div>
  );
}
