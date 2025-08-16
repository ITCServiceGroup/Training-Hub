import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for managing quiz timer functionality
 * @param {Object} options - Timer configuration
 * @param {number} options.timeLimit - Time limit in seconds
 * @param {boolean} options.quizStarted - Whether quiz has started
 * @param {boolean} options.quizCompleted - Whether quiz is completed
 * @param {Function} options.onTimeout - Callback when timer reaches zero
 * @returns {Object} - Timer state and controls
 */
export const useQuizTimer = ({ timeLimit, quizStarted, quizCompleted, onTimeout }) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [timeTaken, setTimeTaken] = useState(0);
  const timeoutPromiseRef = useRef(null);
  const timeoutTimeoutRef = useRef(null);

  // Format time helper
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Timeout handler
  const handleTimeout = useCallback(async (clearTimer) => {
    if (timeoutPromiseRef.current) return; // Prevent multiple timeouts

    // Clear timer if provided
    if (clearTimer) clearTimer();
    setTimeLeft(0);

    try {
      timeoutPromiseRef.current = onTimeout(true);
      await timeoutPromiseRef.current;
    } catch (error) {
      console.error('Failed to handle timeout:', error);
    } finally {
      timeoutPromiseRef.current = null;
    }
  }, [onTimeout]);

  // Timer effect
  useEffect(() => {
    let timer;

    const startTimer = () => {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime <= 0 && !timeoutPromiseRef.current) {
            // Schedule timeout handling for next tick to avoid state update conflicts
            timeoutTimeoutRef.current = setTimeout(() => {
              handleTimeout(() => {
                if (timer) clearInterval(timer);
              });
            }, 0);
            return 0;
          }
          return newTime;
        });
        setTimeTaken(prev => prev + 1);
      }, 1000);
    };

    if (quizStarted && !quizCompleted && timeLeft !== null && !timeoutPromiseRef.current) {
      startTimer();
    }

    return () => {
      if (timer) clearInterval(timer);
      if (timeoutTimeoutRef.current) clearTimeout(timeoutTimeoutRef.current);

      // Cleanup pending submission promise
      if (timeoutPromiseRef.current) {
        timeoutPromiseRef.current
          .catch(error => {
            console.error('Error during cleanup of timeout submission:', error);
          })
          .finally(() => {
            timeoutPromiseRef.current = null;
          });
      }
    };
  }, [quizStarted, quizCompleted, timeLeft, handleTimeout]);

  // Initialize timer when timeLimit changes
  useEffect(() => {
    if (timeLimit) {
      setTimeLeft(timeLimit);
    }
  }, [timeLimit]);

  // Reset timer
  const resetTimer = useCallback(() => {
    setTimeLeft(timeLimit);
    setTimeTaken(0);
  }, [timeLimit]);

  return {
    timeLeft,
    timeTaken,
    formatTime,
    resetTimer,
    setTimeLeft,
    setTimeTaken
  };
};

export default useQuizTimer;