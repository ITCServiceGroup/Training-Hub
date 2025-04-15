import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { categoriesService } from '../../services/api/categories';
import { questionsService } from '../../services/api/questions';
import PracticeQuestionDisplay from './PracticeQuestionDisplay';

const PracticeQuizPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch category and questions
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch category
        const categoryData = await categoriesService.getById(categoryId);
        setCategory(categoryData);
        
        // Fetch questions for category
        const questionsData = await questionsService.getByCategory(categoryId);
        setQuestions(questionsData);
      } catch (error) {
        setError('Failed to load practice quiz');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [categoryId]);
  
  // Handle moving to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // End of questions, show completion message
      setCurrentQuestionIndex(-1);
    }
  };
  
  // Handle restarting the quiz
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-slate-600">Loading practice quiz...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
        {error}
        <div className="mt-4">
          <button
            className="bg-slate-500 hover:bg-slate-600 text-white border-none rounded py-2 px-3 text-sm font-bold cursor-pointer transition-colors"
            onClick={() => navigate('/study-guide')}
          >
            Back to Study Guide
          </button>
        </div>
      </div>
    );
  }
  
  if (!category || questions.length === 0) {
    return (
      <div className="bg-amber-50 text-amber-600 p-4 rounded-lg mb-6">
        No practice questions available for this category.
        <div className="mt-4">
          <button
            className="bg-slate-500 hover:bg-slate-600 text-white border-none rounded py-2 px-3 text-sm font-bold cursor-pointer transition-colors"
            onClick={() => navigate('/study-guide')}
          >
            Back to Study Guide
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-4 max-w-full">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-4xl text-teal-700 m-0">Practice Quiz</h2>
          <p className="text-slate-500 mt-2">{category.name}</p>
        </div>
        <button
          className="bg-slate-500 hover:bg-slate-600 text-white border-none rounded py-2 px-3 text-sm font-bold cursor-pointer transition-colors"
          onClick={() => navigate('/study-guide')}
        >
          Back to Study Guide
        </button>
      </div>
      
      <div className="bg-white rounded-lg p-8 shadow">
        {currentQuestionIndex === -1 ? (
          // Quiz completion screen
          <div className="text-center">
            <h3 className="text-xl font-bold mb-6">Practice Complete!</h3>
            <p className="mb-6">You've completed all practice questions for this category.</p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-teal-700 hover:bg-teal-800 text-white border-none rounded py-3 px-4 text-sm font-bold cursor-pointer transition-colors"
                onClick={handleRestart}
              >
                Restart Practice
              </button>
              <button
                className="bg-slate-500 hover:bg-slate-600 text-white border-none rounded py-3 px-4 text-sm font-bold cursor-pointer transition-colors"
                onClick={() => navigate(`/study-guide/category/${categoryId}`)}
              >
                Back to Category
              </button>
            </div>
          </div>
        ) : (
          // Question display
          <>
            <div className="flex justify-between mb-6">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <div className="h-2 bg-slate-200 rounded w-64 overflow-hidden">
                <div
                  className="h-full bg-teal-700 rounded transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <PracticeQuestionDisplay
              question={questions[currentQuestionIndex]}
              onNext={handleNextQuestion}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default PracticeQuizPage;
