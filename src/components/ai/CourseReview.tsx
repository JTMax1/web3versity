/**
 * Course Review Component
 *
 * Step 3 of course generation wizard.
 * Shows generated course with quality report and actions.
 */

import { AlertCircle, AlertTriangle, CheckCircle2, RefreshCw, Save, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import type { GeneratedCourse } from '../../hooks/useAI';
import type { QualityReport } from '../../lib/ai/quality-checker';

interface CourseReviewProps {
  course: GeneratedCourse;
  qualityReport: QualityReport;
  onSave: () => void;
  onRegenerate: () => void;
  onEdit: () => void;
}

export function CourseReview({
  course,
  qualityReport,
  onSave,
  onRegenerate,
  onEdit,
}: CourseReviewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{course.title}</CardTitle>
              <CardDescription className="text-base">{course.description}</CardDescription>
              <div className="flex items-center gap-2 pt-2">
                <Badge variant="outline">{course.track}</Badge>
                <Badge variant="outline">{course.difficulty}</Badge>
                <Badge variant="outline">{course.category}</Badge>
                <Badge variant="outline">{course.estimated_hours}h</Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Quality Score</p>
              <div
                className={`text-4xl font-bold ${getScoreColor(qualityReport.score)}`}
              >
                {qualityReport.score}
              </div>
              <p className="text-xs text-muted-foreground">out of 100</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quality Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {qualityReport.passed ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            Quality Report
          </CardTitle>
          <CardDescription>
            Automated validation results - {qualityReport.checksPassed.length} checks passed,{' '}
            {qualityReport.checksFailed.length} need attention
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Passed Checks */}
          {qualityReport.checksPassed.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-green-600">✓ Passed Checks</p>
              <div className="flex flex-wrap gap-2">
                {qualityReport.checksPassed.map((check) => (
                  <Badge key={check} variant="outline" className="text-green-600 border-green-200">
                    {check}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {qualityReport.issues.filter((i) => i.severity === 'error').length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Critical Issues Found</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-2">
                  {qualityReport.issues
                    .filter((i) => i.severity === 'error')
                    .map((issue, idx) => (
                      <li key={idx} className="text-sm">
                        <strong>{issue.checkName}:</strong> {issue.message}
                        {issue.suggestion && (
                          <div className="text-xs mt-1 opacity-80">
                            Suggestion: {issue.suggestion}
                          </div>
                        )}
                      </li>
                    ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Warnings */}
          {qualityReport.warnings.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warnings</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-1">
                  {qualityReport.warnings.map((warning, idx) => (
                    <li key={idx} className="text-sm">
                      {warning}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* All Good */}
          {qualityReport.passed && qualityReport.warnings.length === 0 && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Excellent Quality!</AlertTitle>
              <AlertDescription className="text-green-700">
                This course passes all quality checks and is ready to publish.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Course Content Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
          <CardDescription>
            {course.lessons.length} lessons • {course.learning_objectives.length} learning objectives
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Learning Objectives */}
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium">Learning Objectives</p>
            <ul className="list-disc list-inside space-y-1">
              {course.learning_objectives.map((obj, idx) => (
                <li key={idx} className="text-sm text-muted-foreground">
                  {obj}
                </li>
              ))}
            </ul>
          </div>

          <Separator className="my-4" />

          {/* Lessons List */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Lessons</p>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-3">
                {course.lessons.map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          {idx + 1}.
                        </span>
                        <span className="text-sm font-medium">{lesson.title}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {lesson.lesson_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {lesson.duration_minutes} min
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {lesson.completion_xp} XP
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Target Audience */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">Target Audience</p>
            <p className="text-sm text-muted-foreground">{course.target_audience}</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center gap-4 pt-4">
        <Button variant="outline" onClick={onRegenerate} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit} disabled className="gap-2">
            <Edit className="w-4 h-4" />
            Edit (Coming Soon)
          </Button>
          <Button
            onClick={onSave}
            disabled={!qualityReport.passed}
            size="lg"
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Save & Publish
          </Button>
        </div>
      </div>

      {!qualityReport.passed && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Course quality score is below 60. Please fix critical issues or regenerate before publishing.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
