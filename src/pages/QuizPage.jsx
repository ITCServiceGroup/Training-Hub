import React, { useState } from 'react';
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
  
  // Styles
  const pageStyles = {
    padding: '1rem 0',
    maxWidth: '100%'
  };
  
  const headerStyles = {
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  };
  
  const titleStyles = {
    fontSize: '2rem',
    color: '#0f766e',
    margin: '0'
  };
  
  const searchContainerStyles = {
    display: 'flex',
    alignItems: 'center',
    maxWidth: '400px',
    width: '100%'
  };
  
  const searchInputStyles = {
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.25rem',
    width: '100%',
    fontSize: '1rem'
  };
  
  const breadcrumbStyles = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
    color: '#64748b'
  };
  
  const breadcrumbLinkStyles = {
    color: '#0f766e',
    textDecoration: 'none',
    marginRight: '0.5rem'
  };
  
  const breadcrumbSeparatorStyles = {
    margin: '0 0.5rem'
  };
  
  const quizGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginTop: '1.5rem'
  };
  
  const quizCardStyles = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  };
  
  const quizCardHoverStyles = {
    transform: 'translateY(-5px)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };
  
  const iconContainerStyles = (color) => ({
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: color || '#0f766e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    marginBottom: '1rem'
  });
  
  const quizTitleStyles = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#0f172a'
  };
  
  const quizDescStyles = {
    color: '#64748b',
    marginBottom: '1rem',
    flex: '1'
  };
  
  const quizMetaStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#94a3b8',
    fontSize: '0.875rem',
    marginTop: 'auto',
    marginBottom: '1rem'
  };
  
  const buttonStyles = {
    backgroundColor: '#0f766e',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    width: '100%'
  };
  
  const buttonHoverStyles = {
    backgroundColor: '#0c5e57'
  };
  
  const secondaryButtonStyles = {
    ...buttonStyles,
    backgroundColor: '#64748b'
  };
  
  const secondaryButtonHoverStyles = {
    backgroundColor: '#475569'
  };
  
  const quizContentStyles = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };
  
  const quizHeaderStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem'
  };
  
  const quizInfoStyles = {
    marginBottom: '2rem'
  };
  
  const accessCodeFormStyles = {
    maxWidth: '400px',
    margin: '2rem auto',
    padding: '2rem',
    backgroundColor: '#f8fafc',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };
  
  const formGroupStyles = {
    marginBottom: '1.5rem'
  };
  
  const inputStyles = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.25rem',
    fontSize: '1rem',
    marginBottom: '1rem'
  };
  
  const questionContainerStyles = {
    marginBottom: '2rem'
  };
  
  const questionTextStyles = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    color: '#0f172a'
  };
  
  const optionsListStyles = {
    listStyle: 'none',
    padding: 0,
    margin: 0
  };
  
  const optionItemStyles = (isSelected) => ({
    padding: '1rem',
    marginBottom: '0.75rem',
    border: `1px solid ${isSelected ? '#0f766e' : '#e2e8f0'}`,
    borderRadius: '0.25rem',
    cursor: 'pointer',
    backgroundColor: isSelected ? '#f0fdfa' : 'white',
    transition: 'all 0.2s'
  });
  
  const optionItemHoverStyles = {
    borderColor: '#0f766e',
    backgroundColor: '#f0fdfa'
  };
  
  const navigationStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '2rem'
  };
  
  const progressBarContainerStyles = {
    height: '0.5rem',
    backgroundColor: '#e2e8f0',
    borderRadius: '0.25rem',
    marginBottom: '1rem',
    overflow: 'hidden'
  };
  
  const progressBarStyles = (progress) => ({
    height: '100%',
    width: `${progress}%`,
    backgroundColor: '#0f766e',
    borderRadius: '0.25rem',
    transition: 'width 0.3s ease'
  });
  
  const timerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: timeLeft < 300 ? '#ef4444' : '#64748b',
    fontWeight: timeLeft < 300 ? 'bold' : 'normal'
  };
  
  const resultsStyles = {
    textAlign: 'center',
    padding: '2rem'
  };
  
  const scoreStyles = {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#0f766e',
    marginBottom: '1rem'
  };
  
  const resultMessageStyles = (score) => ({
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444',
    marginBottom: '2rem'
  });
  
  const questionReviewStyles = {
    marginTop: '3rem',
    textAlign: 'left'
  };
  
  const reviewQuestionStyles = {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '0.5rem'
  };
  
  const reviewAnswerStyles = (isCorrect, isSelected) => ({
    padding: '0.75rem',
    marginBottom: '0.5rem',
    borderRadius: '0.25rem',
    backgroundColor: isSelected 
      ? (isCorrect ? '#d1fae5' : '#fee2e2')
      : isCorrect ? '#f0fdfa' : 'white',
    color: isSelected 
      ? (isCorrect ? '#065f46' : '#b91c1c')
      : '#0f172a',
    border: `1px solid ${isSelected 
      ? (isCorrect ? '#10b981' : '#ef4444')
      : '#e2e8f0'}`
  });
  
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
    <div style={pageStyles}>
      <div style={headerStyles}>
        <h2 style={titleStyles}>Quizzes</h2>
        {!quizId && (
          <div style={searchContainerStyles}>
            <input
              type="text"
              placeholder="Search quizzes..."
              style={searchInputStyles}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>
      
      {quizId ? (
        <>
          <div style={breadcrumbStyles}>
            <Link to="/quiz" style={breadcrumbLinkStyles}>Quizzes</Link>
            <span style={breadcrumbSeparatorStyles}>›</span>
            <span>{currentQuiz?.title || quizId}</span>
          </div>
          
          <div style={quizContentStyles}>
            {!quizStarted && !quizCompleted ? (
              <>
                <div style={quizHeaderStyles}>
                  <div>
                    <h3 style={quizTitleStyles}>{currentQuiz?.title || quizId}</h3>
                    <p style={quizDescStyles}>{currentQuiz?.description || 'Test your knowledge with this quiz.'}</p>
                  </div>
                  <div style={iconContainerStyles(currentQuiz?.color)}>
                    <span>{currentQuiz?.icon || '📝'}</span>
                  </div>
                </div>
                
                <div style={quizInfoStyles}>
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
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
                
                <div style={accessCodeFormStyles}>
                  <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Enter Access Code</h4>
                  <p style={{ marginBottom: '1.5rem' }}>This quiz requires an access code to begin.</p>
                  <div style={formGroupStyles}>
                    <input
                      type="text"
                      placeholder="Enter access code"
                      style={inputStyles}
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                    />
                    <button 
                      style={buttonStyles}
                      onClick={handleStartQuiz}
                      onMouseEnter={(e) => {
                        Object.assign(e.currentTarget.style, buttonHoverStyles);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#0f766e';
                      }}
                    >
                      Start Quiz
                    </button>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '1rem' }}>
                    Note: For this demo, you can start the quiz without an access code.
                  </p>
                </div>
              </>
            ) : quizCompleted ? (
              <div style={resultsStyles}>
                <h3 style={{ marginBottom: '2rem' }}>Quiz Results</h3>
                <div style={scoreStyles}>{score.percentage}%</div>
                <p style={resultMessageStyles(score.percentage)}>
                  {getResultMessage(score.percentage)}
                </p>
                <p>You answered {score.correct} out of {score.total} questions correctly.</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                  <button 
                    style={secondaryButtonStyles}
                    onClick={() => navigate('/quiz')}
                    onMouseEnter={(e) => {
                      Object.assign(e.currentTarget.style, secondaryButtonHoverStyles);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#64748b';
                    }}
                  >
                    Back to Quizzes
                  </button>
                  <button 
                    style={buttonStyles}
                    onClick={handleStartQuiz}
                    onMouseEnter={(e) => {
                      Object.assign(e.currentTarget.style, buttonHoverStyles);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#0f766e';
                    }}
                  >
                    Retry Quiz
                  </button>
                </div>
                
                <div style={questionReviewStyles}>
                  <h4 style={{ marginBottom: '1.5rem' }}>Question Review</h4>
                  
                  {mockQuestions.map((question, index) => (
                    <div key={question.id} style={reviewQuestionStyles}>
                      <p style={{ fontWeight: 'bold', marginBottom: '1rem' }}>
                        {index + 1}. {question.question}
                      </p>
                      
                      {question.options.map((option, optionIndex) => (
                        <div 
                          key={optionIndex}
                          style={reviewAnswerStyles(
                            optionIndex === question.correctAnswer,
                            optionIndex === selectedAnswers[index]
                          )}
                        >
                          {option}
                          {optionIndex === question.correctAnswer && 
                            <span style={{ marginLeft: '0.5rem', color: '#10b981' }}>✓</span>}
                          {optionIndex === selectedAnswers[index] && optionIndex !== question.correctAnswer && 
                            <span style={{ marginLeft: '0.5rem', color: '#ef4444' }}>✗</span>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div style={quizHeaderStyles}>
                  <div>
                    <h3 style={quizTitleStyles}>{currentQuiz?.title || quizId}</h3>
                  </div>
                  <div style={timerStyles}>
                    <span>⏱️</span> {formatTime(timeLeft)}
                  </div>
                </div>
                
                <div style={progressBarContainerStyles}>
                  <div style={progressBarStyles(progressPercentage)}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <span>Question {currentQuestion + 1} of {mockQuestions.length}</span>
                  <span>{progressPercentage}% Complete</span>
                </div>
                
                <div style={questionContainerStyles}>
                  <p style={questionTextStyles}>
                    {mockQuestions[currentQuestion].question}
                  </p>
                  
                  <ul style={optionsListStyles}>
                    {mockQuestions[currentQuestion].options.map((option, index) => (
                      <li 
                        key={index}
                        style={optionItemStyles(selectedAnswers[currentQuestion] === index)}
                        onClick={() => handleSelectAnswer(currentQuestion, index)}
                        onMouseEnter={(e) => {
                          if (selectedAnswers[currentQuestion] !== index) {
                            Object.assign(e.currentTarget.style, optionItemHoverStyles);
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedAnswers[currentQuestion] !== index) {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.backgroundColor = 'white';
                          }
                        }}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div style={navigationStyles}>
                  <button 
                    style={{
                      ...secondaryButtonStyles,
                      opacity: currentQuestion === 0 ? 0.5 : 1,
                      cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                      width: 'auto'
                    }}
                    onClick={handlePrevQuestion}
                    disabled={currentQuestion === 0}
                    onMouseEnter={(e) => {
                      if (currentQuestion !== 0) {
                        Object.assign(e.currentTarget.style, secondaryButtonHoverStyles);
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#64748b';
                    }}
                  >
                    Previous
                  </button>
                  
                  {currentQuestion < mockQuestions.length - 1 ? (
                    <button 
                      style={{
                        ...buttonStyles,
                        width: 'auto'
                      }}
                      onClick={handleNextQuestion}
                      onMouseEnter={(e) => {
                        Object.assign(e.currentTarget.style, buttonHoverStyles);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#0f766e';
                      }}
                    >
                      Next
                    </button>
                  ) : (
                    <button 
                      style={{
                        ...buttonStyles,
                        width: 'auto'
                      }}
                      onClick={handleSubmitQuiz}
                      onMouseEnter={(e) => {
                        Object.assign(e.currentTarget.style, buttonHoverStyles);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#0f766e';
                      }}
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
          
          <div style={quizGridStyles}>
            {filteredQuizzes.map(quiz => (
              <div 
                key={quiz.id}
                style={quizCardStyles}
                onClick={() => handleQuizSelect(quiz.id)}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, quizCardHoverStyles);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div style={iconContainerStyles(quiz.color)}>
                  <span>{quiz.icon}</span>
                </div>
                <h3 style={quizTitleStyles}>{quiz.title}</h3>
                <p style={quizDescStyles}>{quiz.description}</p>
                <div style={quizMetaStyles}>
                  <span>{quiz.questions} Questions</span>
                  <span>{quiz.difficulty}</span>
                </div>
                <button 
                  style={buttonStyles}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, buttonHoverStyles);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0f766e';
                  }}
                >
                  Start Quiz
                </button>
              </div>
            ))}
          </div>
          
          {filteredQuizzes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <p>No quizzes found matching "{searchQuery}"</p>
            </div>
          )}
          
          <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
            <h3 style={{ marginTop: 0 }}>Have an Access Code?</h3>
            <p>If you have an access code for a specific quiz, enter it below to begin.</p>
            <div style={{ display: 'flex', maxWidth: '400px', gap: '1rem', marginTop: '1rem' }}>
              <input
                type="text"
                placeholder="Enter access code"
                style={{ ...inputStyles, marginBottom: 0 }}
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
              />
              <button 
                style={{ ...buttonStyles, width: 'auto' }}
                onClick={() => navigate(`/quiz/access-code-${accessCode}`)}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, buttonHoverStyles);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0f766e';
                }}
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
