/**
 * AI Generator Page
 *
 * Main page for AI course generation feature.
 * Wraps CourseGenerator component with page layout and feature check.
 * Requires educator or admin role to access.
 */

import { AlertCircle, Sparkles, Brain, Lock, Mail } from 'lucide-react';
import { CourseGenerator } from '../ai/CourseGenerator';
import { useIsAIEnabled } from '../../hooks/useAI';
import { useWallet } from '../../contexts/WalletContext';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

export function AIGenerator() {
  const isAIEnabled = useIsAIEnabled();
  const { user } = useWallet();

  // Check if user is educator or admin
  const isEducatorOrAdmin = user?.is_educator || user?.is_admin;

  // Check if user has educator or admin access
  if (!isEducatorOrAdmin) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Lock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-amber-900">Educator Access Required</CardTitle>
                <CardDescription className="text-amber-700">
                  This feature is available to educators and administrators only
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <p className="text-gray-700">
                The AI Course Generator is a powerful tool that allows educators to create complete,
                African-contextualized Web3 courses in minutes using artificial intelligence.
              </p>

              <div className="bg-white p-4 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-2">Features Available to Educators:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm ml-2">
                  <li>Generate entire courses with AI (5-15 lessons)</li>
                  <li>Automatic African-contextualized examples (M-Pesa, Naira, etc.)</li>
                  <li>Multiple lesson types (text, interactive, quizzes, practical)</li>
                  <li>Real-time quality validation</li>
                  <li>Edit and refine AI-generated content</li>
                  <li>Submit courses for admin review</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  How to Request Educator Access
                </h3>
                <p className="text-blue-800 text-sm mb-3">
                  To become an educator and gain access to the AI Course Generator:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm ml-2">
                  <li>Email the admin at <strong>johntochukwumax@gmail.com</strong></li>
                  <li>Include your wallet address: <code className="bg-blue-100 px-2 py-0.5 rounded">{user?.wallet_address || 'Not connected'}</code></li>
                  <li>Briefly describe your teaching experience or course ideas</li>
                  <li>Wait for admin approval (usually within 24-48 hours)</li>
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => window.open('mailto:johntochukwumax@gmail.com?subject=Educator Access Request&body=Hello, I would like to request educator access for Web3Versity. My wallet address is: ' + (user?.wallet_address || ''), '_blank')}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Request Access via Email
                </Button>
                <Button
                  onClick={() => window.history.back()}
                  variant="outline"
                  className="flex-1"
                >
                  Go Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-600" />
              <div>
                <CardTitle>About the AI Course Generator</CardTitle>
                <CardDescription>
                  Powered by Google Gemini AI
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-600">
              <p>
                This feature uses Google's Gemini AI to automatically generate complete Web3
                courses with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>African-contextualized examples and analogies</li>
                <li>Real-world use cases (mobile money, remittances, etc.)</li>
                <li>Multiple lesson types (text, interactive, quizzes, code)</li>
                <li>Automatic quality validation (60+ score required)</li>
                <li>Mobile-optimized content</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
