import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { questionsService } from '../../services/api/questions';
import { categoriesService } from '../../services/api/categories';
import { quizzesService } from '../../services/api/quizzes';
import QuestionForm from './QuestionForm';
import ConfirmationDialog from '../common/ConfirmationDialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaBars } from 'react-icons/fa';

// Helper function to convert hex to rgba
const hexToRgba = (hex, alpha) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(15, 118, 110, ${alpha})`; // fallback to default teal

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const QuestionManager = ({ quiz, onChange, isLoading }) => {
  const { theme, themeColors } = useTheme();
  const isDark = theme === 'dark';

  // Get current primary color for the theme
  const currentPrimaryColor = themeColors.primary[isDark ? 'dark' : 'light'];
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [error, setError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, questionId: null });
  const [questionQuizMap, setQuestionQuizMap] = useState({});

  // Scroll position preservation - use refs to store positions
  const scrollPositionsRef = React.useRef({
    selectedQuestions: 0,
    availableQuestions: 0
  });
  const selectedQuestionsRef = React.useRef(null);
  const availableQuestionsRef = React.useRef(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for reordering questions
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const selectedQuestionIds = getQuestionIdsFromQuiz();
      const oldIndex = selectedQuestionIds.findIndex(id => id === active.id);
      const newIndex = selectedQuestionIds.findIndex(id => id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedIds = arrayMove(selectedQuestionIds, oldIndex, newIndex);
        onChange({
          ...quiz,
          questions: reorderedIds
        });
      }
    }
  };

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

  // Restore scroll positions when returning from question form
  useEffect(() => {
    if (!isAddingQuestion) {
      // Check if we have stored scroll positions to restore
      const stored = localStorage.getItem('questionManagerScrollPositions');
      if (stored) {
        restoreScrollPositions();
      }
    }
  }, [isAddingQuestion]);

  // Also restore scroll positions when the question list is rendered
  useEffect(() => {
    if (!isAddingQuestion && questions.length > 0) {
      const stored = localStorage.getItem('questionManagerScrollPositions');
      if (stored) {
        setTimeout(() => restoreScrollPositions(), 100);
      }
    }
  }, [questions, isAddingQuestion]);

  // Fetch quiz information for questions
  useEffect(() => {
    const fetchQuestionQuizMap = async () => {
      if (questions.length === 0) {
        setQuestionQuizMap({});
        return;
      }

      try {
        const questionIds = questions.map(q => q.id);
        const quizMap = await quizzesService.getQuizzesForQuestions(questionIds);
        setQuestionQuizMap(quizMap);
      } catch (error) {
        console.error('Failed to load quiz information for questions', error);
        // Don't set error state for this as it's not critical
      }
    };

    fetchQuestionQuizMap();
  }, [questions]);

  // Fetch valid categories and find the first valid one
  useEffect(() => {
    const fetchValidCategories = async () => {
      if (quiz.category_ids.length === 0) {
        setCategories([]);
        return;
      }

      try {
        // Try to find the first valid category from the list
        let validCategory = null;
        for (const categoryId of quiz.category_ids) {
          const category = await categoriesService.getById(categoryId);
          if (category) {
            validCategory = category;
            break;
          }
        }

        setCategories(validCategory ? [validCategory] : []);

        // Clear any previous errors if a valid category is found
        if (validCategory) {
          setError(null);
        } else {
          setError(`No valid categories found. All associated categories may have been deleted. Please select a valid category in the Quiz Details tab.`);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
        setError('Failed to load categories');
      }
    };

    fetchValidCategories();
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

  // Save current scroll positions before navigating to question form
  const saveScrollPositions = () => {
    // Get scroll positions from multiple potential containers
    const selectedScrollTop = selectedQuestionsRef.current?.scrollTop || 0;
    const availableScrollTop = availableQuestionsRef.current?.scrollTop || 0;
    const windowScrollY = window.scrollY || 0;

    // Also check parent containers that might be scrollable
    let parentScrollTop = 0;
    let element = selectedQuestionsRef.current?.parentElement;
    while (element && element !== document.body) {
      if (element.scrollTop > 0) {
        parentScrollTop = element.scrollTop;
        break;
      }
      element = element.parentElement;
    }

    // Store all scroll positions
    const positions = {
      selectedQuestions: selectedScrollTop,
      availableQuestions: availableScrollTop,
      windowScrollY: windowScrollY,
      parentScrollTop: parentScrollTop
    };

    scrollPositionsRef.current = positions;
    localStorage.setItem('questionManagerScrollPositions', JSON.stringify(positions));
  };

  // Restore scroll positions when returning from question form
  const restoreScrollPositions = () => {
    // Try to get positions from localStorage first, then ref
    let positions = scrollPositionsRef.current;
    try {
      const stored = localStorage.getItem('questionManagerScrollPositions');
      if (stored) {
        positions = JSON.parse(stored);
      }
    } catch (e) {
      // Silently fall back to ref positions if localStorage fails
      positions = scrollPositionsRef.current;
    }

    // Use multiple animation frames to ensure DOM is ready
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          // Restore window scroll if it was scrolled
          if (positions.windowScrollY > 0) {
            window.scrollTo(0, positions.windowScrollY);
          }

          // Restore parent container scroll if it was scrolled
          if (positions.parentScrollTop > 0) {
            let element = selectedQuestionsRef.current?.parentElement;
            while (element && element !== document.body) {
              if (element.scrollHeight > element.clientHeight) {
                element.scrollTop = positions.parentScrollTop;
                break;
              }
              element = element.parentElement;
            }
          }

          // Restore individual container scrolls
          if (selectedQuestionsRef.current && positions.selectedQuestions > 0) {
            selectedQuestionsRef.current.scrollTop = positions.selectedQuestions;
          }
          if (availableQuestionsRef.current && positions.availableQuestions > 0) {
            availableQuestionsRef.current.scrollTop = positions.availableQuestions;
          }

          // Clear the stored positions after restoring
          localStorage.removeItem('questionManagerScrollPositions');
        }, 100);
      });
    });
  };

  // Handle successful question save
  const handleQuestionSave = async (questionData) => {
    try {
      // Use the first valid category (from the categories state which contains the valid category)
      const validCategoryId = categories.length > 0 ? categories[0].id : quiz.category_ids[0];
      const dataWithCategory = {
        ...questionData,
        category_id: validCategoryId
      };

      let savedQuestion;
      if (selectedQuestion) {
        savedQuestion = await questionsService.update(selectedQuestion.id, dataWithCategory);
      } else {
        savedQuestion = await questionsService.create(dataWithCategory);
      }

      // Refresh questions list from database to get proper ordering
      const refreshedQuestions = await questionsService.getByCategoryIds(quiz.category_ids);
      setQuestions(refreshedQuestions);

      // Add new question to quiz if it's not already included
      if (!isQuestionIncluded(savedQuestion.id)) {
        handleAddQuestion(savedQuestion.id);
      }

      setIsAddingQuestion(false);
      setSelectedQuestion(null);
      restoreScrollPositions();
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

  // Get selected and available questions
  const selectedQuestionIds = getQuestionIdsFromQuiz();
  // Maintain the order of selected questions based on the quiz.questions array
  const selectedQuestions = selectedQuestionIds
    .map(id => questions.find(q => q.id === id))
    .filter(Boolean); // Remove any undefined questions
  const availableQuestions = questions.filter(q => !selectedQuestionIds.includes(q.id));

  // Sortable question item component for drag and drop
  const SortableQuestionItem = ({ question, isSelected, questionNumber }) => {
    const {
      setNodeRef,
      transform,
      transition,
      isDragging,
      attributes,
      listeners,
    } = useSortable({ id: question.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 1000 : 'auto',
      opacity: isDragging ? 0.8 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`p-4 rounded-lg border ${
          isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
        } ${isDragging ? 'shadow-lg' : ''}`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              {/* Drag handle and question number - only show when randomize is disabled */}
              {!quiz.randomize_questions && isSelected && (
                <div className="flex flex-col items-center gap-1">
                  <div
                    {...attributes}
                    {...listeners}
                    className={`cursor-grab active:cursor-grabbing p-1 rounded ${
                      isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-600'
                    }`}
                    title="Drag to reorder"
                  >
                    <FaBars />
                  </div>
                  {questionNumber && (
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isDark ? 'bg-primary/20 text-primary-light' : 'bg-primary/10 text-primary-dark'
                    }`}>
                      {questionNumber}
                    </div>
                  )}
                </div>
              )}
              <div className="flex-1">
                <p className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {question.question_text}
                </p>
                <div className="text-sm text-slate-500">
                  <span className={`inline-block px-2 py-1 ${isDark ? 'bg-slate-700 text-gray-300' : 'bg-slate-100 text-slate-700'} rounded mr-2`}>
                    {question.question_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  {question.explanation && (
                    <span className="text-primary">Has Explanation</span>
                  )}
                </div>
                {/* Quiz badges */}
                {(() => {
                  const otherQuizzes = questionQuizMap[question.id]?.filter(quizTitle => quizTitle !== quiz.title) || [];
                  return otherQuizzes.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-slate-500 mb-1">Used in other quizzes:</div>
                      <div className="flex flex-wrap gap-1">
                        {otherQuizzes.map((quizTitle, index) => (
                          <span
                            key={index}
                            className={`inline-block px-2 py-1 text-xs rounded-full ${
                              isDark
                                ? 'bg-blue-900/50 text-blue-300 border border-blue-700'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                            title={quizTitle}
                          >
                            {quizTitle.length > 20 ? `${quizTitle.substring(0, 20)}...` : quizTitle}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <button
              className={`inline-flex justify-center py-2 px-4 border shadow-sm text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isSelected
                  ? 'border-transparent text-white bg-primary hover:bg-primary-dark focus:ring-primary'
                  : 'border-transparent text-white bg-primary hover:bg-primary-dark focus:ring-primary'
              }`}
              onClick={() => {
                if (isSelected) {
                  handleRemoveQuestion(question.id);
                } else {
                  handleAddQuestion(question.id);
                }
              }}
            >
              {isSelected ? 'Remove' : 'Add'}
            </button>
            <button
              className="inline-flex justify-center py-2 px-4 border border-secondary shadow-sm text-sm font-medium rounded-md text-secondary bg-white dark:bg-slate-800 hover:bg-secondary/10 dark:hover:bg-secondary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors"
              onClick={() => {
                saveScrollPositions();
                setSelectedQuestion(question);
                setIsAddingQuestion(true);
              }}
            >
              Edit
            </button>
            <button
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              onClick={() => openDeleteConfirmation(question.id)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render question item component (for non-sortable items)
  const renderQuestionItem = (question, isSelected) => (
    <div
      key={question.id}
      className={`p-4 rounded-lg border ${
        isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {question.question_text}
          </p>
          <div className="text-sm text-slate-500">
            <span className={`inline-block px-2 py-1 ${isDark ? 'bg-slate-700 text-gray-300' : 'bg-slate-100 text-slate-700'} rounded mr-2`}>
              {question.question_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            {question.explanation && (
              <span className="text-primary">Has Explanation</span>
            )}
          </div>
          {/* Quiz badges */}
          {(() => {
            const otherQuizzes = questionQuizMap[question.id]?.filter(quizTitle => quizTitle !== quiz.title) || [];
            return otherQuizzes.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-slate-500 mb-1">Used in other quizzes:</div>
                <div className="flex flex-wrap gap-1">
                  {otherQuizzes.map((quizTitle, index) => (
                    <span
                      key={index}
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        isDark
                          ? 'bg-blue-900/50 text-blue-300 border border-blue-700'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                      title={quizTitle}
                    >
                      {quizTitle.length > 20 ? `${quizTitle.substring(0, 20)}...` : quizTitle}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
        <div className="flex gap-2 ml-4">
          <button
            className={`inline-flex justify-center py-2 px-4 border shadow-sm text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isSelected
                ? 'border-transparent text-white bg-primary hover:bg-primary-dark focus:ring-primary'
                : 'border-transparent text-white bg-primary hover:bg-primary-dark focus:ring-primary'
            }`}
            onClick={() => {
              if (isSelected) {
                handleRemoveQuestion(question.id);
              } else {
                handleAddQuestion(question.id);
              }
            }}
          >
            {isSelected ? 'Remove' : 'Add'}
          </button>
          <button
            className="inline-flex justify-center py-2 px-4 border border-secondary shadow-sm text-sm font-medium rounded-md text-secondary bg-white dark:bg-slate-800 hover:bg-secondary/10 dark:hover:bg-secondary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors"
            onClick={() => {
              saveScrollPositions();
              setSelectedQuestion(question);
              setIsAddingQuestion(true);
            }}
          >
            Edit
          </button>
          <button
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            onClick={() => openDeleteConfirmation(question.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {error && (
        <div className={`${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'} p-4 rounded-lg mb-6`}>
          {error}
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Questions</h3>
          <button
            className="bg-primary-dark hover:bg-primary text-white border-none rounded py-2 px-3 text-sm font-bold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            Category: {categories[0].name}
          </div>
        )}
      </div>

      {!quiz.category_ids[0] ? (
        <div className={`text-center p-8 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} rounded-lg border`}>
          <p className={`${isDark ? 'text-gray-300' : 'text-slate-600'}`}>Please select a category to manage questions.</p>
        </div>
      ) : categories.length === 0 && quiz.category_ids[0] ? (
        <div className={`text-center p-8 ${isDark ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} rounded-lg border`}>
          <div className={`${isDark ? 'text-yellow-400' : 'text-yellow-600'} mb-4`}>
            <h3 className="font-medium mb-2">Category Not Found</h3>
            <p className="text-sm">
              This quiz is associated with a category that no longer exists.
              Please go back to the Quiz Details tab and select a valid category.
            </p>
          </div>
        </div>
      ) : isAddingQuestion ? (
        <QuestionForm
          question={selectedQuestion}
          categoryId={quiz.category_ids[0]}
          onSave={handleQuestionSave}
          onCancel={() => {
            setIsAddingQuestion(false);
            setSelectedQuestion(null);
            restoreScrollPositions();
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Left Column - Selected Questions */}
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg border ${isDark ? 'border-slate-700' : 'border-slate-200'} p-6 flex flex-col`}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Selected Questions
                </h4>
                {quiz.randomize_questions ? (
                  <span className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    Question order will be randomized
                  </span>
                ) : selectedQuestions.length > 1 && (
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Drag questions to reorder
                  </span>
                )}
              </div>
              <span className={`text-sm px-2 py-1 rounded-full ${isDark ? 'bg-primary/20 text-primary-light' : 'bg-primary/10 text-primary-dark'}`}>
                {selectedQuestions.length} question{selectedQuestions.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div ref={selectedQuestionsRef} className="space-y-4 flex-1 overflow-y-auto">
              {selectedQuestions.length === 0 ? (
                <div className={`text-center p-8 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                  <p className={`${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                    No questions selected for this quiz.
                  </p>
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Add questions from the available list on the right.
                  </p>
                </div>
              ) : !quiz.randomize_questions ? (
                // Use sortable context when randomize is disabled
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selectedQuestionIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {selectedQuestions.map((question, index) => (
                      <SortableQuestionItem
                        key={question.id}
                        question={question}
                        isSelected={true}
                        questionNumber={index + 1}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                // Use regular rendering when randomize is enabled
                selectedQuestions.map(question => renderQuestionItem(question, true))
              )}
            </div>
          </div>

          {/* Right Column - Available Questions */}
          <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg border ${isDark ? 'border-slate-700' : 'border-slate-200'} p-6 flex flex-col`}>
            <div className="flex justify-between items-center mb-4">
              <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Available Questions
              </h4>
              <span className={`text-sm px-2 py-1 rounded-full ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                {availableQuestions.length} question{availableQuestions.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div ref={availableQuestionsRef} className="space-y-4 flex-1 overflow-y-auto">
              {availableQuestions.length === 0 ? (
                <div className={`text-center p-8 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                  <p className={`${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                    {questions.length === 0
                      ? 'No questions found in this category.'
                      : 'All questions have been added to this quiz.'
                    }
                  </p>
                </div>
              ) : (
                availableQuestions.map(question => (
                  <SortableQuestionItem
                    key={question.id}
                    question={question}
                    isSelected={false}
                    questionNumber={null}
                  />
                ))
              )}
            </div>
          </div>
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
