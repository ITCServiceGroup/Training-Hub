import React from 'react';
import { useParams } from 'react-router-dom';

const QuizPage = () => {
  const { quizId } = useParams();
  
  return (
    <div className="quiz-page">
      <h2>Quizzes</h2>
      
      {quizId ? (
        <div className="quiz-content">
          <h3>Quiz: {quizId}</h3>
          <p>This is a placeholder for the quiz content.</p>
          <div className="access-code-form">
            <h4>Enter Access Code</h4>
            <p>This quiz requires an access code to begin.</p>
            <div className="form-group">
              <input type="text" placeholder="Enter access code" />
              <button className="btn-primary">Submit</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="quiz-list">
          <h3>Available Quizzes</h3>
          <p>Please select a quiz to begin or enter an access code.</p>
          <div className="coming-soon">
            <p>Quiz functionality is coming soon!</p>
            <p>In the meantime, please use the study guides to prepare.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
