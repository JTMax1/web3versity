/**
 * Course Input Form Component
 *
 * Step 1 of course generation wizard.
 * Collects course parameters from user.
 */

import { useState } from 'react';
import { Sparkles, BookOpen, Code, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import type { CoursePrompt } from '../../hooks/useAI';

interface CourseInputFormProps {
  onGenerate: (prompt: CoursePrompt) => void;
  isLoading?: boolean;
  initialValues?: Partial<CoursePrompt>;
}

export function CourseInputForm({
  onGenerate,
  isLoading = false,
  initialValues,
}: CourseInputFormProps) {
  const [formData, setFormData] = useState<CoursePrompt>({
    track: initialValues?.track || 'explorer',
    difficulty: initialValues?.difficulty || 'beginner',
    topic: initialValues?.topic || '',
    description: initialValues?.description || '',
    customRequirements: initialValues?.customRequirements || '',
    targetLessons: initialValues?.targetLessons || 8,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.topic || formData.topic.trim().length < 10) {
      newErrors.topic = 'Topic must be at least 10 characters';
    }

    if (formData.targetLessons && (formData.targetLessons < 5 || formData.targetLessons > 20)) {
      newErrors.targetLessons = 'Target lessons must be between 5 and 20';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onGenerate(formData);
    }
  };

  const handleChange = (field: keyof CoursePrompt, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">AI Course Generator</CardTitle>
              <CardDescription>
                Generate complete, African-contextualized courses in minutes
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Track Selection */}
          <div className="space-y-2">
            <Label htmlFor="track">Course Track *</Label>
            <Select
              value={formData.track}
              onValueChange={(value) => handleChange('track', value as 'explorer' | 'developer')}
            >
              <SelectTrigger id="track">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="explorer">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Explorer (No-Code)</span>
                  </div>
                </SelectItem>
                <SelectItem value="developer">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    <span>Developer (Coding)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formData.track === 'explorer'
                ? 'For learners exploring Web3 concepts (no coding required)'
                : 'For developers building on Hedera (includes coding exercises)'}
            </p>
          </div>

          {/* Difficulty Level */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level *</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) =>
                handleChange('difficulty', value as 'beginner' | 'intermediate' | 'advanced')
              }
            >
              <SelectTrigger id="difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic">Course Topic *</Label>
            <Input
              id="topic"
              placeholder="e.g., Understanding Stablecoins for African Remittances"
              value={formData.topic}
              onChange={(e) => handleChange('topic', e.target.value)}
              className={errors.topic ? 'border-red-500' : ''}
              maxLength={200}
            />
            <div className="flex justify-between text-xs">
              <p className="text-muted-foreground">
                {errors.topic ? (
                  <span className="text-red-500">{errors.topic}</span>
                ) : (
                  'Be specific about what the course should teach'
                )}
              </p>
              <p className="text-muted-foreground">{formData.topic.length}/200</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Additional Context (Optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g., Teach small business owners how to use USDC for cross-border payments between Nigeria and Kenya"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.description.length}/1000
            </p>
          </div>

          {/* Custom Requirements */}
          <div className="space-y-2">
            <Label htmlFor="customRequirements">
              Special Requirements (Optional)
            </Label>
            <Textarea
              id="customRequirements"
              placeholder="e.g., Include mobile money comparisons, focus on M-Pesa integration, add scam warnings"
              value={formData.customRequirements}
              onChange={(e) => handleChange('customRequirements', e.target.value)}
              rows={2}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.customRequirements.length}/500
            </p>
          </div>

          {/* Target Lessons */}
          <div className="space-y-2">
            <Label htmlFor="targetLessons">Target Number of Lessons (Optional)</Label>
            <Input
              id="targetLessons"
              type="number"
              min={5}
              max={20}
              placeholder="8"
              value={formData.targetLessons || ''}
              onChange={(e) =>
                handleChange('targetLessons', e.target.value ? parseInt(e.target.value) : undefined)
              }
              className={errors.targetLessons ? 'border-red-500' : ''}
            />
            <p className="text-xs text-muted-foreground">
              {errors.targetLessons ? (
                <span className="text-red-500">{errors.targetLessons}</span>
              ) : (
                'Recommended: 6-12 lessons (leave blank for AI to decide based on topic)'
              )}
            </p>
          </div>

          {/* Info Alert */}
          <Alert>
            <HelpCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>African Context Required:</strong> All generated content will include African
              examples, currencies (₦, KES, R, GHS), and mobile money references. The AI ensures
              every lesson resonates with African learners.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Course
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
