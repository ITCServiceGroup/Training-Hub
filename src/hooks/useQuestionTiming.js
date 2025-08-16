import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for tracking individual question timing
 * @returns {Object} - Question timing state and controls
 */
export const useQuestionTiming = () => {
  const [questionStartTimes, setQuestionStartTimes] = useState({});
  const [questionTimings, setQuestionTimings] = useState({});
  const currentQuestionStartTimeRef = useRef(null);

  // Start timing for a question
  const startQuestionTimer = useCallback((questionId) => {
    const now = Date.now();
    setQuestionStartTimes(prev => ({
      ...prev,
      [questionId]: now
    }));
    currentQuestionStartTimeRef.current = now;
  }, []);

  // Stop timing for a question
  const stopQuestionTimer = useCallback((questionId) => {
    if (!currentQuestionStartTimeRef.current) return 0;

    const now = Date.now();
    const timeSpent = (now - currentQuestionStartTimeRef.current) / 1000; // Convert to seconds

    setQuestionTimings(prev => ({
      ...prev,
      [questionId]: (prev[questionId] || 0) + timeSpent
    }));

    currentQuestionStartTimeRef.current = null;
    return timeSpent;
  }, []);

  // Update question timing manually
  const updateQuestionTiming = useCallback((questionId, additionalTime = 0) => {
    setQuestionTimings(prev => ({
      ...prev,
      [questionId]: (prev[questionId] || 0) + additionalTime
    }));
  }, []);

  // Reset all timings
  const resetTimings = useCallback(() => {
    setQuestionStartTimes({});
    setQuestionTimings({});
    currentQuestionStartTimeRef.current = null;
  }, []);

  // Get formatted timing data for submission
  const getTimingData = useCallback(() => {
    const timingData = {};
    Object.keys(questionTimings).forEach(questionId => {
      const timing = questionTimings[questionId] || 0;
      if (timing > 0) {
        timingData[questionId] = Math.round(timing * 10) / 10;
      }
    });
    return timingData;
  }, [questionTimings]);

  return {
    questionStartTimes,
    questionTimings,
    startQuestionTimer,
    stopQuestionTimer,
    updateQuestionTiming,
    resetTimings,
    getTimingData
  };
};

export default useQuestionTiming;