import React, { useState, useEffect } from 'react';
import { questionsService } from '../../services/api/questions';
import QuestionForm from './QuestionForm';
import { supabase } from '../../config/supabase';
import ConfirmationDialog from '../common/ConfirmationDialog';

const QuestionManager = ({ quiz, onChange, isLoading }) => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [error, setError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, questionId: null });

  // Fetch questions for selected categories
  useEffect(() => {
    const fetchQuestions = async () => {
      if (quiz.category_ids.length === 0) {
        setQuestions([]);
        return;
      }

      try {
        const data = await questionsService.getByCategoryIds(quiz.category_ids);
        setQuestions(data);
      } catch (error) {
        setError('Failed to load questions');
        console.error('Failed to load questions', error);
      }
    };

    fetchQuestions();
  }, [quiz.category_ids]);

  // Fetch single category name
  useEffect(() => {
    const fetchCategory = async () => {
      if (!quiz.category_ids[0]) {
        setCategories([]);
        return;
      }

      try {
        const { data: category, error } = await supabase
          .from('v2_categories')
          .select('id, name')
          .eq('id', quiz.category_ids[0])
          .single();

        if (error) throw error;
        setCategories(category ? [category] : []);
      } catch (error) {
        console.error('Failed to load category:', error);
        setError('Failed to load category');
      }
    };

    fetchCategory();
  }, [quiz.category_ids]);

  // Get question IDs from quiz questions array
  const getQuestionIdsFromQuiz = () => {
    if (!Array.isArray(quiz.questions)) return [];
    return quiz.questions.map(q => q.id || q);
  };

  // Handle adding a question to the quiz
  const handleAddQuestion = (questionId) => {
    const existingIds = getQuestionIdsFromQuiz();
    if (!existingIds.includes(questionId)) {
      onChange({
        ...quiz,
        questions: [...existingIds, questionId]
      });
    }
  };

  // Handle removing a question from the quiz
  const handleRemoveQuestion = (questionId) => {
    const existingIds = getQuestionIdsFromQuiz();
    onChange({
      ...quiz,
      questions: existingIds.filter(id => id !== questionId)
    });
  };

  // Check if a question is included in the quiz
  const isQuestionIncluded = (questionId) => {
    return getQuestionIdsFromQuiz().includes(questionId);
  };

  // Handle successful question save
  const handleQuestionSave = async (questionData) => {
    try {
      // Always set the category to the quiz's category
      const dataWithCategory = {
        ...questionData,
        category_id: quiz.category_ids[0]
      };

      let savedQuestion;
      if (selectedQuestion) {
        savedQuestion = await questionsService.update(selectedQuestion.id, dataWithCategory);
      } else {
        savedQuestion = await questionsService.create(dataWithCategory);
      }

      // Refresh questions list
      setQuestions(prevQuestions => {
        const updatedQuestions = selectedQuestion
          ? prevQuestions.map(q => q.id === savedQuestion.id ? savedQuestion : q)
          : [...prevQuestions, savedQuestion];
        return updatedQuestions;
      });

      // Add new question to quiz if it's not already included
      if (!isQuestionIncluded(savedQuestion.id)) {
        handleAddQuestion(savedQuestion.id);
      }

      setIsAddingQuestion(false);
      setSelectedQuestion(null);
    } catch (error) {
      setError('Failed to save question');
      console.error('Failed to save question', error);
    }
  };

  // Handle question deletion confirmation
  const openDeleteConfirmation = (questionId) => {
    setDeleteConfirmation({ isOpen: true, questionId });
  };

  // Handle actual question deletion
  const handleDeleteQuestion = async (questionId) => {

    try {
      await questionsService.delete(questionId);
      setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== questionId));
      handleRemoveQuestion(questionId);
    } catch (error) {
      setError('Failed to delete question');
      console.error('Failed to delete question', error);
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold">Questions</h3>
          <button
            className="bg-teal-700 hover:bg-teal-800 text-white border-none rounded py-2 px-3 text-sm font-bold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              setSelectedQuestion(null);
              setIsAddingQuestion(true);
            }}
            disabled={isLoading || !quiz.category_ids[0]}
          >
            Create New Question
          </button>
        </div>
        {categories[0] && (
          <div className="text-sm text-slate-500">
            Category: {categories[0].name}
          </div>
        )}
      </div>

      {!quiz.category_ids[0] ? (
        <div className="text-center p-8 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-slate-600">Please select a category to manage questions.</p>
        </div>
      ) : isAddingQuestion ? (
        <QuestionForm
          question={selectedQuestion}
          categoryId={quiz.category_ids[0]}
          onSave={handleQuestionSave}
          onCancel={() => {
            setIsAddingQuestion(false);
            setSelectedQuestion(null);
          }}
        />
      ) : (
        <div className="space-y-4">
          {questions.map(question => (
            <div
              key={question.id}
              className={`p-4 rounded-lg border ${
                isQuestionIncluded(question.id)
                  ? 'border-teal-200 bg-teal-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium mb-2">{question.question_text}</p>
                  <div className="text-sm text-slate-500">
                    <span className="inline-block px-2 py-1 bg-slate-100 rounded mr-2">
                      {question.question_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    {question.explanation && (
                      <span className="text-teal-600">Has Explanation</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    className={`px-3 py-1 text-sm rounded ${
                      isQuestionIncluded(question.id)
                        ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    onClick={() => {
                      if (isQuestionIncluded(question.id)) {
                        handleRemoveQuestion(question.id);
                      } else {
                        handleAddQuestion(question.id);
                      }
                    }}
                  >
                    {isQuestionIncluded(question.id) ? 'Remove' : 'Add'}
                  </button>
                  <button
                    className="px-3 py-1 text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 rounded"
                    onClick={() => {
                      setSelectedQuestion(question);
                      setIsAddingQuestion(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded"
                    onClick={() => openDeleteConfirmation(question.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {questions.length === 0 && (
            <div className="text-center p-8 bg-slate-50 rounded-lg">
              <p className="text-slate-600">No questions found in this category.</p>
            </div>
          )}
        </div>
      )}

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, questionId: null })}
        onConfirm={() => {
          handleDeleteQuestion(deleteConfirmation.questionId);
          setDeleteConfirmation({ isOpen: false, questionId: null });
        }}
        title="Delete Question"
        description="Are you sure you want to delete this question? This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default QuestionManager;
