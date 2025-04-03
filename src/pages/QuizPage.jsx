import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds

  // Mock quizzes data
  const quizzes = [
    {
      id: 'installation-basics',
      title: 'Installation Basics',
      description: 'Test your knowledge of basic installation procedures.',
      category: 'Installation',
      questions: 10,
      timeLimit: '30 minutes',
      difficulty: 'Beginner',
      icon: '📥',
      color: '#0891b2'
    },
    {
      id: 'service-procedures',
      title: 'Service Procedures',
      description: 'Test your knowledge of service and maintenance procedures.',
      category: 'Service',
      questions: 15,
      timeLimit: '30 minutes',
      difficulty: 'Intermediate',
      icon: '🔧',
      color: '#0e7490'
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting Techniques',
      description: 'Test your ability to diagnose and resolve common issues.',
      category: 'Troubleshooting',
      questions: 12,
      timeLimit: '30 minutes',
      difficulty: 'Advanced',
      icon: '🔍',
      color: '#0c4a6e'
    },
    {
      id: 'networking-basics',
      title: 'Networking Basics',
      description: 'Test your knowledge of network setup and configuration.',
      category: 'Networking',
      questions: 10,
      timeLimit: '30 minutes',
      difficulty: 'Intermediate',
      icon: '🌐',
      color: '#0369a1'
    }
  ];

  // Mock questions for a quiz
  const mockQuestions = [
    {
      id: 1,
      question: 'What is the first step in the installation process?',
      options: [
        'Power on the device',
        'Check the package contents',
        'Read the manual',
        'Call customer support'
      ],
      correctAnswer: 1
    },
    {
      id: 2,
      question: 'Which tool is required for the basic installation?',
      options: [
        'Phillips screwdriver',
        'Hammer',
        'Wrench',
        'All of the above'
      ],
      correctAnswer: 0
    },
    {
      id: 3,
      question: 'What should you do before connecting the power cable?',
      options: [
        'Turn on the main power',
        'Ensure the device is switched off',
        'Connect all other cables first',
        'Test the power outlet'
      ],
      correctAnswer: 1
    },
    {
      id: 4,
      question: 'How many screws are typically included in the installation kit?',
      options: [
        '2',
        '4',
        '6',
        '8'
      ],
      correctAnswer: 2
    },
    {
      id: 5,
      question: 'What is the recommended distance between the device and the wall?',
      options: [
        '1 inch',
        '3 inches',
        '6 inches',
        'It depends on the device'
      ],
      correctAnswer: 3
    }
  ];

  // Filter quizzes based on search query
  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find the current quiz if quizId is provided
  const currentQuiz = quizId ?
    quizzes.find(quiz => quiz.id === quizId) : null;

  // Format time (seconds) to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate quiz score
  const calculateScore = () => {
    let correctCount = 0;
    mockQuestions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    return {
      correct: correctCount,
      total: mockQuestions.length,
      percentage: Math.round((correctCount / mockQuestions.length) * 100)
    };
  };

  // Handle quiz submission
  const handleSubmitQuiz = () => {
    setQuizCompleted(true);
  };

  // Handle starting a new quiz
  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
  };

  // Handle answer selection
  const handleSelectAnswer = (questionIndex, optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex
    });
  };

  // Handle navigation to next question
  const handleNextQuestion = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Handle navigation to previous question
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Handle quiz selection
  const handleQuizSelect = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  // All styles have been converted to Tailwind classes

  // Timer effect for countdown
  useEffect(() => {
    let timer;
    if (quizStarted && !quizCompleted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleSubmitQuiz(); // Auto-submit when time runs out
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, quizCompleted, timeLeft]);

  // Calculate progress percentage
  const progressPercentage = quizStarted
    ? Math.round(((currentQuestion + 1) / mockQuestions.length) * 100)
    : 0;

  // Get quiz score if completed
  const score = quizCompleted ? calculateScore() : null;

  // Get result message based on score
  const getResultMessage = (score) => {
    if (score >= 80) return 'Excellent work!';
    if (score >= 60) return 'Good job!';
    return 'Keep practicing!';
  };

  return (
    <div className="py-4 max-w-full">
      <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-4xl text-teal-700 m-0">Quizzes</h2>
        {!quizId && (
          <div className="flex items-center max-w-md w-full">
            <input
              type="text"
              placeholder="Search quizzes..."
              className="py-3 px-3 border border-slate-200 rounded text-base w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {quizId ? (
        <>
          <div className="flex items-center mb-6 text-sm text-slate-500">
            <Link to="/quiz" className="text-teal-700 no-underline mr-2">Quizzes</Link>
            <span className="mx-2">›</span>
            <span>{currentQuiz?.title || quizId}</span>
          </div>

          <div className="bg-white rounded-lg p-8 shadow">
            {!quizStarted && !quizCompleted ? (
              <>
                <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-slate-900">{currentQuiz?.title || quizId}</h3>
                    <p className="text-slate-500 mb-4 flex-1">{currentQuiz?.description || 'Test your knowledge with this quiz.'}</p>
                  </div>
                  <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-2xl mb-4" style={{ backgroundColor: currentQuiz?.color || '#0f766e' }}>
                    <span>{currentQuiz?.icon || '📝'}</span>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex gap-8 flex-wrap">
                    <div>
                      <strong>Category:</strong> {currentQuiz?.category || 'General'}
                    </div>
                    <div>
                      <strong>Questions:</strong> {currentQuiz?.questions || mockQuestions.length}
                    </div>
                    <div>
                      <strong>Time Limit:</strong> {currentQuiz?.timeLimit || '30 minutes'}
                    </div>
                    <div>
                      <strong>Difficulty:</strong> {currentQuiz?.difficulty || 'Intermediate'}
                    </div>
                  </div>
                </div>

                <div className="max-w-md mx-auto my-8 p-8 bg-slate-50 rounded-lg shadow">
                  <h4 className="mt-0 mb-4">Enter Access Code</h4>
                  <p className="mb-6">This quiz requires an access code to begin.</p>
                  <div className="mb-6">
                    <input
                      type="text"
                      placeholder="Enter access code"
                      className="w-full py-3 px-3 border border-slate-200 rounded text-base mb-4"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                    />
                    <button
                      className="bg-teal-700 hover:bg-teal-800 text-white border-none rounded py-3 px-4 text-sm font-bold cursor-pointer transition-colors w-full"
                      onClick={handleStartQuiz}
                    >
                      Start Quiz
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 mt-4">
                    Note: For this demo, you can start the quiz without an access code.
                  </p>
                </div>
              </>
            ) : quizCompleted ? (
              <div className="text-center p-8">
                <h3 className="mb-8">Quiz Results</h3>
                <div className="text-5xl font-bold text-teal-700 mb-4">{score.percentage}%</div>
                <p className={`text-2xl font-bold mb-8 ${score.percentage >= 80 ? 'text-green-500' : score.percentage >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                  {getResultMessage(score.percentage)}
                </p>
                <p>You answered {score.correct} out of {score.total} questions correctly.</p>

                <div className="flex justify-center gap-4 mt-8">
                  <button
                    className="bg-slate-500 hover:bg-slate-600 text-white border-none rounded py-3 px-4 text-sm font-bold cursor-pointer transition-colors"
                    onClick={() => navigate('/quiz')}
                  >
                    Back to Quizzes
                  </button>
                  <button
                    className="bg-teal-700 hover:bg-teal-800 text-white border-none rounded py-3 px-4 text-sm font-bold cursor-pointer transition-colors"
                    onClick={handleStartQuiz}
                  >
                    Retry Quiz
                  </button>
                </div>

                <div className="mt-12 text-left">
                  <h4 className="mb-6">Question Review</h4>

                  {mockQuestions.map((question, index) => {
                    return (
                      <div key={question.id} className="mb-8 p-6 bg-slate-50 rounded-lg">
                        <p className="font-bold mb-4">
                          {index + 1}. {question.question}
                        </p>

                        {question.options.map((option, optionIndex) => {
                          const isSelected = optionIndex === selectedAnswers[index];
                          const isCorrectAnswer = optionIndex === question.correctAnswer;
                          let className = "p-3 mb-2 rounded ";

                          if (isSelected) {
                            className += isCorrectAnswer ? "bg-green-100 text-green-800 border border-green-500 " : "bg-red-100 text-red-800 border border-red-500 ";
                          } else {
                            className += isCorrectAnswer ? "bg-teal-50 border border-slate-200 " : "bg-white border border-slate-200 text-slate-900 ";
                          }

                          return (
                            <div key={optionIndex} className={className}>
                              {option}
                              {isCorrectAnswer &&
                                <span className="ml-2 text-green-500">✓</span>}
                              {isSelected && !isCorrectAnswer &&
                                <span className="ml-2 text-red-500">✗</span>}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-slate-900">{currentQuiz?.title || quizId}</h3>
                  </div>
                  <div className={`flex items-center gap-2 ${timeLeft < 300 ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                    <span>⏱️</span> {formatTime(timeLeft)}
                  </div>
                </div>

                <div className="h-2 bg-slate-200 rounded mb-4 overflow-hidden">
                  <div
                    className="h-full bg-teal-700 rounded transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mb-8">
                  <span>Question {currentQuestion + 1} of {mockQuestions.length}</span>
                  <span>{progressPercentage}% Complete</span>
                </div>

                <div className="mb-8">
                  <p className="text-xl font-bold mb-6 text-slate-900">
                    {mockQuestions[currentQuestion].question}
                  </p>

                  <ul className="list-none p-0 m-0">
                    {mockQuestions[currentQuestion].options.map((option, index) => {
                      const isSelected = selectedAnswers[currentQuestion] === index;
                      return (
                      <li
                        key={index}
                        className={`p-4 mb-3 border rounded cursor-pointer transition-all ${isSelected ? 'border-teal-700 bg-teal-50' : 'border-slate-200 bg-white hover:border-teal-700 hover:bg-teal-50'}`}
                        onClick={() => handleSelectAnswer(currentQuestion, index)}
                      >
                        {option}
                      </li>
                    )})}
                  </ul>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    className={`bg-slate-500 text-white border-none rounded py-3 px-4 text-sm font-bold transition-colors ${currentQuestion === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-600 cursor-pointer'}`}
                    onClick={handlePrevQuestion}
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </button>

                  {currentQuestion < mockQuestions.length - 1 ? (
                    <button
                      className="bg-teal-700 hover:bg-teal-800 text-white border-none rounded py-3 px-4 text-sm font-bold cursor-pointer transition-colors"
                      onClick={handleNextQuestion}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      className="bg-teal-700 hover:bg-teal-800 text-white border-none rounded py-3 px-4 text-sm font-bold cursor-pointer transition-colors"
                      onClick={handleSubmitQuiz}
                    >
                      Submit Quiz
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <p>Select a quiz below to begin or enter an access code.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {filteredQuizzes.map(quiz => (
              <div
                key={quiz.id}
                className="bg-white rounded-lg shadow p-6 cursor-pointer flex flex-col h-full transition-all hover:translate-y-[-5px] hover:shadow-md"
                onClick={() => handleQuizSelect(quiz.id)}
              >
                <div
                  className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-2xl mb-4"
                  style={{ backgroundColor: quiz.color || '#0f766e' }}
                >
                  <span>{quiz.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">{quiz.title}</h3>
                <p className="text-slate-500 mb-4 flex-1">{quiz.description}</p>
                <div className="flex justify-between text-slate-400 text-sm mt-auto mb-4">
                  <span>{quiz.questions} Questions</span>
                  <span>{quiz.difficulty}</span>
                </div>
                <button className="bg-teal-700 hover:bg-teal-800 text-white border-none rounded py-3 px-4 text-sm font-bold cursor-pointer transition-colors w-full">
                  Start Quiz
                </button>
              </div>
            ))}
          </div>

          {filteredQuizzes.length === 0 && (
            <div className="text-center p-8 text-slate-500">
              <p>No quizzes found matching "{searchQuery}"</p>
            </div>
          )}

          <div className="mt-12 p-8 bg-slate-50 rounded-lg">
            <h3 className="mt-0">Have an Access Code?</h3>
            <p>If you have an access code for a specific quiz, enter it below to begin.</p>
            <div className="flex max-w-md gap-4 mt-4">
              <input
                type="text"
                placeholder="Enter access code"
                className="w-full py-3 px-3 border border-slate-200 rounded text-base"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
              />
              <button
                className="bg-teal-700 hover:bg-teal-800 text-white border-none rounded py-3 px-4 text-sm font-bold cursor-pointer transition-colors"
                onClick={() => navigate(`/quiz/access-code-${accessCode}`)}
              >
                Submit
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuizPage;
