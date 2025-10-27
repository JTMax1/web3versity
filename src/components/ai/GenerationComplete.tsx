/**
 * Generation Complete Component
 *
 * Step 4 of course generation wizard.
 * Success screen with next actions.
 */

import { CheckCircle2, BookOpen, Sparkles, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { GeneratedCourse } from '../../hooks/useAI';

interface GenerationCompleteProps {
  course: GeneratedCourse;
  onGenerateAnother: () => void;
  onViewCourse: () => void;
  onBackToDashboard: () => void;
}

export function GenerationComplete({
  course,
  onGenerateAnother,
  onViewCourse,
  onBackToDashboard,
}: GenerationCompleteProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl">Course Generated Successfully!</CardTitle>
          <CardDescription className="text-base">
            Your AI-generated course has been saved and is ready for students
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Course Summary */}
          <div className="p-6 bg-muted/50 rounded-lg space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <span className="text-4xl">{course.thumbnail_emoji}</span>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{course.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="outline">{course.track}</Badge>
                <Badge variant="outline">{course.difficulty}</Badge>
                <Badge variant="outline">{course.category}</Badge>
                <Badge variant="outline">{course.estimated_hours}h</Badge>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{course.lessons.length}</div>
                <div className="text-xs text-muted-foreground">Lessons</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {course.learning_objectives.length}
                </div>
                <div className="text-xs text-muted-foreground">Objectives</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{course.estimated_hours}</div>
                <div className="text-xs text-muted-foreground">Hours</div>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="space-y-3">
            <p className="text-sm font-medium">What's Included:</p>
            <ul className="space-y-2">
              {[
                'Complete lesson content with African examples',
                'Interactive components and hands-on exercises',
                'Quizzes to test understanding',
                'XP rewards for completion',
                'Mobile-optimized for accessibility',
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Button onClick={onViewCourse} size="lg" className="w-full gap-2">
              <BookOpen className="w-4 h-4" />
              View Course
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={onGenerateAnother} variant="outline" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Generate Another
              </Button>
              <Button onClick={onBackToDashboard} variant="outline" className="gap-2">
                <Home className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Next Steps */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Next Steps:</p>
            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
              <li>Review course content and make any edits if needed</li>
              <li>Share with students to start enrollments</li>
              <li>Monitor student progress and feedback</li>
              <li>Generate more courses to expand your catalog</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
