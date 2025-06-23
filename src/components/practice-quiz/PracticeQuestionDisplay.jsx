import React, { useState, useEffect } from 'react';

const PracticeQuestionDisplay = ({ question, onAnswered }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Handle selecting an answer
  const handleSelectAnswer = (answer) => {
    if (showFeedback) return; // Prevent changing answer after feedback is shown

    setSelectedAnswer(answer);

    // Check if answer is correct
    let correct = false;
    switch (question.question_type) {
      case 'multiple_choice':
        correct = answer === question.correct_answer;
        break;
      case 'check_all_that_apply':
        if (Array.isArray(answer) && Array.isArray(question.correct_answer)) {
          correct =
            answer.length === question.correct_answer.length &&
            answer.every(a => question.correct_answer.includes(a));
        }
        break;
      case 'true_false':
        correct = answer === question.correct_answer;
        break;
      default:
        break;
    }

    if (question.question_type !== 'check_all_that_apply') {
      setIsCorrect(correct);
      setShowFeedback(true);
      onAnswered(); // Notify parent that question is answered
    }
  };

  // Handle submitting check-all-that-apply answers
  const handleCheckAllSubmit = () => {
    if (!Array.isArray(selectedAnswer)) return;

    const correct =
      selectedAnswer.length === question.correct_answer.length &&
      selectedAnswer.every(a => question.correct_answer.includes(a));

    setIsCorrect(correct);
    setShowFeedback(true);
    onAnswered(); // Notify parent that question is answered
  };

  // Reset internal state when the question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrect(false);
  }, [question]); // Dependency array ensures this runs when question prop changes

  // Render different question types
  const renderQuestionContent = () => {
    switch (question.question_type) {
      case 'multiple_choice':
        return (
          <ul className="list-none p-0 m-0">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = showFeedback && index === question.correct_answer;
              const isIncorrectSelection = showFeedback && isSelected && !isCorrectAnswer;

              return (
                <li
                  key={index}
                  className={`p-4 mb-3 border rounded cursor-pointer transition-all
                    ${showFeedback ? 'pointer-events-none' : 'hover:border-primary hover:bg-primary/10'}
                    ${isSelected ? 'border-primary bg-primary/10' : 'border-slate-200 bg-white'}
                    ${isCorrectAnswer ? 'border-green-500 bg-green-50' : ''}
                    ${isIncorrectSelection ? 'border-red-500 bg-red-50' : ''}`}
                  onClick={() => handleSelectAnswer(index)}
                >
                  {option}
                  {isCorrectAnswer && <span className="ml-2 text-green-500">✓</span>}
                  {isIncorrectSelection && <span className="ml-2 text-red-500">✗</span>}
                </li>
              );
            })}
          </ul>
        );

      case 'check_all_that_apply':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = Array.isArray(selectedAnswer) && selectedAnswer.includes(index);
              const isCorrectAnswer = showFeedback && question.correct_answer.includes(index);
              const isIncorrectSelection = showFeedback && isSelected && !isCorrectAnswer;

              return (
                <label
                  key={index}
                  className={`flex items-center p-4 border rounded cursor-pointer transition-all
                    ${showFeedback ? 'pointer-events-none' : 'hover:border-primary hover:bg-primary/10'}
                    ${isSelected ? 'border-primary bg-primary/10' : 'border-slate-200 bg-white'}
                    ${isCorrectAnswer ? 'border-green-500 bg-green-50' : ''}
                    ${isIncorrectSelection ? 'border-red-500 bg-red-50' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary border-slate-300 rounded"
                    checked={isSelected}
                    onChange={() => {
                      if (showFeedback) return;

                      const newSelection = Array.isArray(selectedAnswer) ? [...selectedAnswer] : [];
                      if (isSelected) {
                        const idx = newSelection.indexOf(index);
                        if (idx !== -1) newSelection.splice(idx, 1);
                      } else {
                        newSelection.push(index);
                      }
                      setSelectedAnswer(newSelection);
                    }}
                    disabled={showFeedback}
                  />
                  <span className="ml-2">{option}</span>
                  {isCorrectAnswer && <span className="ml-2 text-green-500">✓</span>}
                  {isIncorrectSelection && <span className="ml-2 text-red-500">✗</span>}
                </label>
              );
            })}

            {!showFeedback && (
              <button
                className="mt-4 bg-teal-700 hover:bg-teal-800 text-white border-none rounded py-2 px-3 text-sm font-bold cursor-pointer transition-colors"
                onClick={handleCheckAllSubmit}
                disabled={!Array.isArray(selectedAnswer) || selectedAnswer.length === 0}
              >
                Check Answer
              </button>
            )}
          </div>
        );

      case 'true_false':
        return (
          <div className="flex space-x-4">
            {[true, false].map((value) => {
              const isSelected = selectedAnswer === value;
              const isCorrectAnswer = showFeedback && value === question.correct_answer;
              const isIncorrectSelection = showFeedback && isSelected && !isCorrectAnswer;

              return (
                <button
                  key={value.toString()}
                  className={`flex-1 p-4 border rounded cursor-pointer transition-all
                    ${showFeedback ? 'pointer-events-none' : 'hover:border-primary hover:bg-primary/10'}
                    ${isSelected ? 'border-primary bg-primary/10' : 'border-slate-200 bg-white'}
                    ${isCorrectAnswer ? 'border-green-500 bg-green-50' : ''}
                    ${isIncorrectSelection ? 'border-red-500 bg-red-50' : ''}`}
                  onClick={() => handleSelectAnswer(value)}
                  disabled={showFeedback}
                >
                  {value ? 'True' : 'False'}
                  {isCorrectAnswer && <span className="ml-2 text-green-500">✓</span>}
                  {isIncorrectSelection && <span className="ml-2 text-red-500">✗</span>}
                </button>
              );
            })}
          </div>
        );

      default:
        return <p>Unsupported question type</p>;
    }
  };

  // Render feedback
  const renderFeedback = () => {
    if (!showFeedback) return null;

    return (
      <div className={`mt-6 p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <h4 className={`font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
          {isCorrect ? 'Correct!' : 'Incorrect'}
        </h4>

        {!isCorrect && (
          <div className="mt-2">
            <p className="font-medium mb-2">Correct answer:</p>
            {question.question_type === 'multiple_choice' && (
              <p>{question.options[question.correct_answer]}</p>
            )}

            {question.question_type === 'check_all_that_apply' && (
              <ul className="list-disc pl-5 mt-1">
                {question.correct_answer.map(index => (
                  <li key={index}>{question.options[index]}</li>
                ))}
              </ul>
            )}

            {question.question_type === 'true_false' && (
              <p>{question.correct_answer ? 'True' : 'False'}</p>
            )}

            {question.explanation && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="font-medium">Explanation:</p>
                <p>{question.explanation}</p>
              </div>
            )}
          </div>
        )}
        {/* Next Question button is now handled by the parent */}
      </div>
    );
  };

  if (!question) {
    return <div>No question available</div>;
  }

  return (
    <div className="mb-8">
      <p className="text-xl font-bold mb-6 text-slate-900">
        {question.question_text}
      </p>

      {renderQuestionContent()}
      {renderFeedback()}
    </div>
  );
};

export default PracticeQuestionDisplay;
