import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { QuizQuestion } from '../../../lib/courseContent';

interface QuizLessonProps {
  content: { questions: QuizQuestion[] };
  onComplete: (score?: number) => void;
  isCompleted?: boolean;
  isCompleting?: boolean;
}

export function QuizLesson({ content, onComplete, isCompleted = false, isCompleting = false }: QuizLessonProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const question = content.questions[currentQuestion];
  const isLastQuestion = currentQuestion === content.questions.length - 1;
  const isCorrect = selectedAnswer === question.correctAnswer;

  const handleAnswerSelect = (index: number) => {
    if (showExplanation) return; // Don't allow changing after viewing explanation
    setSelectedAnswer(index);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    setShowExplanation(true);
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setCompleted(true);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  if (completed) {
    const percentage = Math.round((score / content.questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="text-center py-12">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[inset_-4px_-4px_16px_rgba(0,0,0,0.05),inset_4px_4px_16px_rgba(255,255,255,0.9)] ${
          passed 
            ? 'bg-gradient-to-br from-green-100 to-green-200' 
            : 'bg-gradient-to-br from-orange-100 to-orange-200'
        }`}>
          {passed ? (
            <CheckCircle className="w-12 h-12 text-green-600" />
          ) : (
            <span className="text-5xl">📚</span>
          )}
        </div>

        <h2 className="mb-4">Quiz Complete!</h2>
        <p className="text-xl text-gray-700 mb-2">
          Your Score: {score} / {content.questions.length}
        </p>
        <p className="text-3xl mb-6">{percentage}%</p>

        {passed ? (
          <div className="bg-green-50 rounded-2xl p-6 mb-8 shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)]">
            <p className="text-green-800">
              🎉 Excellent work! You've mastered this material.
            </p>
          </div>
        ) : (
          <div className="bg-orange-50 rounded-2xl p-6 mb-8 shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)]">
            <p className="text-orange-800">
              You can retake the quiz to improve your score. 70% is needed to pass.
            </p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          {!passed && (
            <Button
              onClick={() => {
                setCurrentQuestion(0);
                setScore(0);
                setCompleted(false);
                setSelectedAnswer(null);
                setShowExplanation(false);
              }}
              className="bg-white text-[#0084C7] hover:bg-gray-50 rounded-2xl px-8 py-4 shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)]"
            >
              Retake Quiz
            </Button>
          )}
          {passed && (
            <Button
              onClick={() => onComplete(percentage)}
              disabled={isCompleting}
              className={`rounded-2xl px-8 py-4 ${
                isCompleting
                  ? 'bg-gray-400 text-white cursor-wait'
                  : isCompleted
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-[0_4px_16px_rgba(34,197,94,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)]'
                  : 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:from-[#0074b7] hover:to-[#0098d8] shadow-[0_4px_16px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)]'
              }`}
            >
              {isCompleting
                ? 'Saving...'
                : isCompleted
                ? 'Continue to Next Lesson →'
                : 'Save & Continue'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Question {currentQuestion + 1} of {content.questions.length}</span>
        <span>Score: {score}/{content.questions.length}</span>
      </div>

      {/* Question */}
      <div className="bg-gradient-to-br from-[#0084C7]/5 to-[#00a8e8]/10 rounded-3xl p-8 shadow-[inset_0_2px_8px_rgba(0,132,199,0.1)]">
        <h3 className="text-xl mb-6">{question.question}</h3>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const showResult = showExplanation;
            const isThisCorrect = index === question.correctAnswer;

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showExplanation}
                className={`w-full text-left p-4 rounded-2xl transition-all ${
                  showResult
                    ? isThisCorrect
                      ? 'bg-green-100 border-2 border-green-500 shadow-[0_4px_16px_rgba(34,197,94,0.2)]'
                      : isSelected
                      ? 'bg-red-100 border-2 border-red-500'
                      : 'bg-gray-50'
                    : isSelected
                    ? 'bg-[#0084C7]/10 border-2 border-[#0084C7] shadow-[0_4px_16px_rgba(0,132,199,0.2)]'
                    : 'bg-white hover:bg-gray-50 shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_-2px_-2px_8px_rgba(0,0,0,0.05),inset_2px_2px_8px_rgba(255,255,255,0.9)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.1)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    showResult
                      ? isThisCorrect
                        ? 'bg-green-500'
                        : isSelected
                        ? 'bg-red-500'
                        : 'bg-gray-200'
                      : isSelected
                      ? 'bg-[#0084C7]'
                      : 'bg-gray-200'
                  }`}>
                    {showResult && isThisCorrect && <CheckCircle className="w-5 h-5 text-white" />}
                    {showResult && !isThisCorrect && isSelected && <XCircle className="w-5 h-5 text-white" />}
                    {!showResult && (
                      <span className={isSelected ? 'text-white' : 'text-gray-600'}>
                        {String.fromCharCode(65 + index)}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-800">{option}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className={`rounded-3xl p-6 shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)] ${
          isCorrect 
            ? 'bg-green-50' 
            : 'bg-orange-50'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isCorrect ? 'bg-green-500' : 'bg-orange-500'
            }`}>
              {isCorrect ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : (
                <span className="text-white text-xl">!</span>
              )}
            </div>
            <div className="flex-1">
              <h4 className={`mb-2 ${isCorrect ? 'text-green-900' : 'text-orange-900'}`}>
                {isCorrect ? 'Correct!' : 'Not quite right'}
              </h4>
              <p className={isCorrect ? 'text-green-800' : 'text-orange-800'}>
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        {!showExplanation ? (
          <Button
            onClick={handleCheckAnswer}
            disabled={selectedAnswer === null}
            className={`w-full py-6 rounded-2xl transition-all ${
              selectedAnswer !== null
                ? 'bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:from-[#0074b7] hover:to-[#0098d8] shadow-[0_4px_16px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)]'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Check Answer
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-[#0084C7] to-[#00a8e8] text-white hover:from-[#0074b7] hover:to-[#0098d8] rounded-2xl py-6 shadow-[0_4px_16px_rgba(0,132,199,0.3),inset_-2px_-2px_8px_rgba(0,0,0,0.1),inset_2px_2px_8px_rgba(255,255,255,0.2)]"
          >
            {isLastQuestion ? 'Complete Quiz' : 'Next Question'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
