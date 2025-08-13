import { supabase } from '../../../config/supabase';

/**
 * Question Analytics Service
 * 
 * Provides detailed question-level analytics by combining quiz results with actual question data
 */
class QuestionAnalyticsService {
  constructor() {
    this.name = 'Question Analytics Service';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  /**
   * Clear the cache (useful for debugging)
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 Question analytics cache cleared');
  }

  /**
   * Get question-level analytics from pre-filtered data
   * This method is used when the data has already been filtered by the dashboard
   * @param {Array} filteredData - Already filtered quiz results
   * @returns {Promise<Array>} - Question analytics data
   */
  async getQuestionAnalyticsFromFilteredData(filteredData) {
    try {
      // Create cache key from data length and content hash for basic caching
      const dataKey = `filtered_${filteredData.length}_${this.simpleHash(JSON.stringify(filteredData.slice(0, 3)))}`;
      const now = Date.now();
      
      // Check cache first - return immediately for cached data
      if (this.cache.has(dataKey)) {
        const cached = this.cache.get(dataKey);
        if (now - cached.timestamp < this.cacheTimeout) {
          console.log('📋 Using cached filtered question analytics (instant return)');
          // Return cached data synchronously to prevent any loading states
          return Promise.resolve(cached.data);
        } else {
          this.cache.delete(dataKey);
        }
      }

      console.log('🔍 Processing', filteredData.length, 'pre-filtered quiz results');

      // Debug: Show sample of the data being processed
      if (filteredData.length > 0) {
        console.log('📋 Sample quiz result:', {
          id: filteredData[0].id,
          quiz_id: filteredData[0].quiz_id,
          quiz_type: filteredData[0].quiz_type,
          hasAnswers: !!filteredData[0].answers,
          answersCount: filteredData[0].answers ? Object.keys(filteredData[0].answers).length : 0,
          sampleAnswer: filteredData[0].answers ? Object.entries(filteredData[0].answers)[0] : null
        });
      }

      if (filteredData.length === 0) {
        return [];
      }

      // Analyze the data composition
      const resultsWithQuizId = filteredData.filter(result => result.quiz_id);
      const resultsWithoutQuizId = filteredData.filter(result => !result.quiz_id);
      const legacyQuizTypes = [...new Set(resultsWithoutQuizId.map(r => r.quiz_type).filter(Boolean))];
      
      console.log('📊 Data composition:', {
        total: filteredData.length,
        withQuizId: resultsWithQuizId.length,
        withoutQuizId: resultsWithoutQuizId.length,
        legacyQuizTypes: legacyQuizTypes,
        modernQuizTypes: [...new Set(resultsWithQuizId.map(r => r.quiz_type).filter(Boolean))],
        sampleModernResult: resultsWithQuizId.length > 0 ? {
          id: resultsWithQuizId[0].id,
          quiz_id: resultsWithQuizId[0].quiz_id,
          quiz_type: resultsWithQuizId[0].quiz_type,
          has_answers: !!resultsWithQuizId[0].answers
        } : 'None'
      });

      // If we only have legacy data, return appropriate response
      if (resultsWithQuizId.length === 0) {
        console.warn('⚠️ Only legacy quiz results found - question-level analytics not available');
        return [{
          questionId: 'legacy-notice',
          displayText: 'Legacy Quiz Data',
          questionText: 'Question-level analytics are not available for legacy quiz results',
          quizTitle: legacyQuizTypes.length === 1 ? legacyQuizTypes[0] : 'Legacy Quizzes',
          category: 'Notice',
          section: 'Legacy Data',
          questionType: 'notice',
          attempts: resultsWithoutQuizId.length,
          correct: 0,
          incorrect: 0,
          correctRate: 0,
          difficulty: 0,
          avgTimeSpent: 0,
          status: 'Legacy Data',
          statusColor: '#6b7280',
          needsReview: false,
          isLegacyNotice: true,
          legacyQuizTypes: legacyQuizTypes,
          results: []
        }];
      }

      // If we have mixed data, filter out legacy results and process modern ones
      let dataToProcess = resultsWithQuizId;
      if (resultsWithoutQuizId.length > 0) {
        console.log('📝 Mixed data detected - processing', resultsWithQuizId.length, 'modern results, excluding', resultsWithoutQuizId.length, 'legacy results');
        console.log('🚫 Excluded legacy quiz types:', legacyQuizTypes);
      }

      // Check for quiz IDs in the modern results
      const quizIds = [...new Set(dataToProcess.map(result => result.quiz_id).filter(Boolean))];
      
      let questionAnalytics;
      
      if (quizIds.length === 0) {
        // This shouldn't happen since we filtered for results with quiz_id, but just in case
        console.warn('⚠️ No quiz IDs found after filtering - this is unexpected');
        return [];
      } else {
        // Fetch quiz details with questions for modern data
        const { data: quizzes, error: quizzesError } = await supabase
          .from('v2_quizzes')
          .select(`
            id,
            title,
            v2_quiz_questions(
              question_id,
              order_index,
              v2_questions(
                id,
                question_text,
                question_type,
                options,
                correct_answer,
                categories(
                  id,
                  name,
                  sections(
                    id,
                    name
                  )
                )
              )
            )
          `)
          .in('id', quizIds);

        if (quizzesError) {
          throw quizzesError;
        }

        console.log('📚 Found', quizzes.length, 'quizzes with question data');
        questionAnalytics = await this.processQuestionAnalytics(dataToProcess, quizzes);
      }

      // Add a notice about excluded legacy data if applicable
      if (resultsWithoutQuizId.length > 0 && questionAnalytics.length > 0) {
        questionAnalytics.push({
          questionId: 'excluded-notice',
          displayText: `${resultsWithoutQuizId.length} legacy results excluded`,
          questionText: `${resultsWithoutQuizId.length} legacy quiz results were excluded because they lack question-level data`,
          quizTitle: 'System Notice',
          category: 'Notice', 
          section: 'Data Info',
          questionType: 'notice',
          attempts: resultsWithoutQuizId.length,
          correct: 0,
          incorrect: 0,
          correctRate: 0,
          difficulty: 0,
          avgTimeSpent: 0,
          status: 'Excluded',
          statusColor: '#f59e0b',
          needsReview: false,
          isExclusionNotice: true,
          excludedQuizTypes: legacyQuizTypes,
          results: []
        });
      }

      console.log('✅ Generated analytics for', questionAnalytics.length, 'questions from filtered data');
      
      // Cache the result
      this.cache.set(dataKey, {
        data: questionAnalytics,
        timestamp: now
      });
      
      return questionAnalytics;

    } catch (error) {
      console.error('❌ Error processing filtered question analytics:', error);
      throw error;
    }
  }

  /**
   * Simple hash function for basic cache key generation
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get question-level analytics data
   * @param {Object} filters - Filter parameters (supervisor, market, timeRange, quizType)
   * @returns {Promise<Array>} - Question analytics data
   */
  async getQuestionAnalytics(filters = {}) {
    try {
      // Create cache key from filters
      const cacheKey = JSON.stringify(filters);
      const now = Date.now();
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (now - cached.timestamp < this.cacheTimeout) {
          console.log('📋 Using cached question analytics');
          return cached.data;
        } else {
          this.cache.delete(cacheKey);
        }
      }

      console.log('🔍 Fetching question analytics with filters:', filters);

      // Step 1: Get filtered quiz results
      let query = supabase
        .from('v2_quiz_results')
        .select('*');

      // Apply filters
      if (filters.supervisor) {
        query = query.eq('supervisor', filters.supervisor);
      }
      if (filters.market) {
        query = query.eq('market', filters.market);
      }
      if (filters.quizType) {
        query = query.eq('quiz_type', filters.quizType);
      }
      if (filters.timeRange?.startDate) {
        query = query.gte('date_of_test', filters.timeRange.startDate);
      }
      if (filters.timeRange?.endDate) {
        const endDate = new Date(filters.timeRange.endDate);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt('date_of_test', endDate.toISOString().split('T')[0]);
      }

      const { data: quizResults, error: resultsError } = await query;

      if (resultsError) {
        throw resultsError;
      }

      console.log('📊 Found', quizResults.length, 'quiz results');

      if (quizResults.length === 0) {
        return [];
      }

      // Step 2: Check for quiz IDs in results
      const quizIds = [...new Set(quizResults.map(result => result.quiz_id).filter(Boolean))];
      
      if (quizIds.length === 0) {
        console.warn('⚠️ No quiz IDs found in results, falling back to legacy quiz type analysis');
        // Fallback: Generate question analytics based on quiz types for legacy data
        const legacyAnalytics = await this.processLegacyQuestionAnalytics(quizResults);
        
        // Cache the result
        this.cache.set(cacheKey, {
          data: legacyAnalytics,
          timestamp: now
        });
        
        return legacyAnalytics;
      }

      // Fetch quiz details with questions for modern data
      const { data: quizzes, error: quizzesError } = await supabase
        .from('v2_quizzes')
        .select(`
          id,
          title,
          v2_quiz_questions(
            question_id,
            order_index,
            v2_questions(
              id,
              question_text,
              question_type,
              options,
              correct_answer,
              v2_categories(
                id,
                name,
                v2_sections(
                  id,
                  name
                )
              )
            )
          )
        `)
        .in('id', quizIds);

      if (quizzesError) {
        throw quizzesError;
      }

      console.log('📚 Found', quizzes.length, 'quizzes with question data');

      // Step 3: Process question-level analytics
      const questionAnalytics = await this.processQuestionAnalytics(quizResults, quizzes);

      console.log('✅ Generated analytics for', questionAnalytics.length, 'questions');
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: questionAnalytics,
        timestamp: now
      });
      
      return questionAnalytics;

    } catch (error) {
      console.error('❌ Error fetching question analytics:', error);
      throw error;
    }
  }

  /**
   * Process quiz results to generate question-level analytics
   * @param {Array} quizResults - Quiz results data
   * @param {Array} quizzes - Quiz data with questions
   * @returns {Promise<Array>} - Processed question analytics
   */
  async processQuestionAnalytics(quizResults, quizzes) {
    const questionStats = new Map();

    // Create a lookup map for quizzes and their questions
    const quizLookup = new Map();
    quizzes.forEach(quiz => {
      if (quiz.v2_quiz_questions) {
        quiz.v2_quiz_questions.forEach((qRel, index) => {
          if (qRel.v2_questions) {
            const questionKey = `${quiz.id}-${qRel.v2_questions.id}`;
            quizLookup.set(questionKey, {
              quiz: quiz,
              question: qRel.v2_questions,
              orderIndex: qRel.order_index || index
            });
          }
        });
      }
    });

    // Create a lookup for shuffled question data from quiz results
    const shuffledQuestionLookup = new Map();
    quizResults.forEach(result => {
      if (result.shuffled_questions) {
        let shuffledQuestions;
        try {
          shuffledQuestions = typeof result.shuffled_questions === 'string'
            ? JSON.parse(result.shuffled_questions)
            : result.shuffled_questions;
        } catch (e) {
          console.warn('⚠️ Invalid shuffled_questions JSON for result:', result.id);
          return;
        }

        Object.entries(shuffledQuestions).forEach(([questionId, questionData]) => {
          const questionKey = `${result.quiz_id}-${questionId}`;
          shuffledQuestionLookup.set(questionKey, {
            quiz: { id: result.quiz_id, title: result.quiz_type },
            question: questionData,
            orderIndex: 0 // Order doesn't matter for analytics
          });
        });
      }
    });

    console.log('🔗 Created lookup for', quizLookup.size, 'quiz-question combinations');

    // Debug: Check what we have in quiz results
    const resultsWithQuizId = quizResults.filter(r => r.quiz_id);
    const resultsWithAnswers = quizResults.filter(r => r.answers);
    console.log('🔍 Debug - Results with quiz_id:', resultsWithQuizId.length);
    console.log('🔍 Debug - Results with answers:', resultsWithAnswers.length);
    if (resultsWithAnswers.length > 0) {
      console.log('🔍 Debug - Sample answers structure:', typeof resultsWithAnswers[0].answers, resultsWithAnswers[0].answers);
      console.log('🔍 Debug - Is array?', Array.isArray(resultsWithAnswers[0].answers));
      console.log('🔍 Debug - Object keys:', Object.keys(resultsWithAnswers[0].answers || {}));
    }

    // Process each quiz result
    quizResults.forEach(result => {
      if (!result.quiz_id) {
        return; // Skip results without quiz ID
      }

      // Check if we have answers data
      if (!result.answers) {
        // No answers data - create simulated question analytics based on overall score
        console.log('⚠️ No answers data for result', result.id, '- using score-based simulation');
        const quizInfo = quizLookup.get(`${result.quiz_id}-*`); // Find any question from this quiz
        if (!quizInfo) {
          // Find quiz info by iterating through lookup
          const quizQuestions = Array.from(quizLookup.entries()).filter(([key]) => key.startsWith(`${result.quiz_id}-`));
          if (quizQuestions.length > 0) {
            this.simulateQuestionDataFromScore(result, quizQuestions, questionStats);
          }
        }
        return;
      }

      console.log('📊 Processing quiz result:', {
        resultId: result.id,
        quizId: result.quiz_id,
        answersCount: Object.keys(result.answers).length,
        sampleAnswers: Object.entries(result.answers).slice(0, 2)
      });

      let answers;
      try {
        answers = typeof result.answers === 'string' ? JSON.parse(result.answers) : result.answers;
      } catch (e) {
        console.warn('⚠️ Invalid answers JSON for result:', result.id);
        return;
      }

      // Handle different answer formats
      if (Array.isArray(answers)) {
        // Answers is already an array - use as is
      } else if (answers && typeof answers === 'object') {
        // Answers is an object - convert to array of values or entries
        console.log('🔍 Converting object answers to array for result:', result.id);
        
        // Try different object structures
        if (Object.keys(answers).some(key => key.startsWith('question') || !isNaN(key))) {
          // Object with question keys like {question1: "answer", question2: "answer"} or {0: "answer", 1: "answer"}
          answers = Object.entries(answers).map(([questionKey, answer], index) => ({
            questionId: questionKey,
            question_id: questionKey,
            selectedAnswer: answer,
            selected_answer: answer,
            answer: answer,
            questionOrder: index
          }));
        } else {
          // Try to extract meaningful data from object structure
          const keys = Object.keys(answers);
          answers = keys.map((key, index) => ({
            questionId: key,
            question_id: key,
            selectedAnswer: answers[key],
            selected_answer: answers[key],
            answer: answers[key],
            questionOrder: index
          }));
        }
        
        console.log('🔍 Converted to array with', answers.length, 'items');
      } else {
        console.warn('⚠️ Answers is neither array nor object for result:', result.id, 'Type:', typeof answers);
        return;
      }

      // Process each answer in the result
      answers.forEach((answer, index) => {
        const answerId = answer.questionId || answer.question_id || index.toString();
        const questionKey = `${result.quiz_id}-${answerId}`;

        // Prefer shuffled question data if available, fallback to original
        let questionInfo = shuffledQuestionLookup.get(questionKey) || quizLookup.get(questionKey);

        // If we can't find by exact ID, try to match by index/position
        if (!questionInfo) {
          // Try matching by order/index in shuffled data first, then original
          const shuffledKeys = Array.from(shuffledQuestionLookup.keys()).filter(key => key.startsWith(`${result.quiz_id}-`));
          const originalKeys = Array.from(quizLookup.keys()).filter(key => key.startsWith(`${result.quiz_id}-`));

          if (shuffledKeys.length > index) {
            questionInfo = shuffledQuestionLookup.get(shuffledKeys[index]);
            console.log('🔍 Matched by index in shuffled data:', index, 'Key:', shuffledKeys[index]);
          } else if (originalKeys.length > index) {
            questionInfo = quizLookup.get(originalKeys[index]);
            console.log('🔍 Matched by index in original data:', index, 'Key:', originalKeys[index]);
          }
        }

        if (!questionInfo) {
          console.log('⚠️ No question info found for:', questionKey, 'Available keys:', Array.from(quizLookup.keys()).filter(k => k.startsWith(`${result.quiz_id}-`)));
          return; // Skip if we don't have question info
        }

        const question = questionInfo.question;
        const quiz = questionInfo.quiz;

        // Create unique identifier for this question across all quizzes
        const globalQuestionId = question.id;

        if (!questionStats.has(globalQuestionId)) {
          questionStats.set(globalQuestionId, {
            questionId: question.id,
            questionText: question.question_text,
            questionType: question.question_type,
            options: question.options,
            correctAnswer: question.correct_answer,
            quizTitle: quiz.title,
            quizId: quiz.id,
            category: question.categories?.name || 'Uncategorized',
            section: question.categories?.sections?.name || 'No Section',
            
            // Statistics
            totalAttempts: 0,
            correctAttempts: 0,
            incorrectAttempts: 0,
            totalTime: 0,
            timeSpentRecords: [],
            
            // Detailed tracking
            results: []
          });
        }

        const stats = questionStats.get(globalQuestionId);
        
        // Determine if answer was correct
        const isCorrect = this.isAnswerCorrect(answer, question);

        // Debug logging for the first few questions
        if (stats.totalAttempts < 3) {
          console.log('🔍 Question Analytics Debug:', {
            questionId: globalQuestionId,
            questionText: question.question_text?.substring(0, 50) + '...',
            questionType: question.question_type,
            rawAnswer: answer,
            extractedAnswer: (typeof answer === 'object' && answer !== null)
              ? (answer.selectedAnswer || answer.selected_answer || answer.answer)
              : answer,
            correctAnswer: question.correct_answer,
            isCorrect,
            timeSpent: (typeof answer === 'object' && answer !== null)
              ? (answer.timeSpent || answer.time_spent || 0)
              : 0
          });
        }
        
        // Update statistics
        stats.totalAttempts++;
        if (isCorrect) {
          stats.correctAttempts++;
        } else {
          stats.incorrectAttempts++;
        }

        // Track time spent if available with data quality validation
        // First try to get timing from separate question_timings field
        let timeSpent = 0;
        if (result.question_timings && result.question_timings[globalQuestionId]) {
          timeSpent = result.question_timings[globalQuestionId];
        } else {
          // Fallback: extract timing from answer object (for backward compatibility)
          const rawAnswerData = answer.selectedAnswer || answer.selected_answer || answer.answer || answer;
          timeSpent = (typeof rawAnswerData === 'object' && rawAnswerData !== null)
            ? (rawAnswerData.timeSpent || rawAnswerData.time_spent || 0)
            : 0;
        }
        if (timeSpent > 0 && timeSpent < 3600) { // Validate: positive and less than 1 hour per question
          stats.totalTime += timeSpent;
          stats.timeSpentRecords.push(timeSpent);
        }

        // Store individual result for detailed analysis
        stats.results.push({
          resultId: result.id,
          ldap: result.ldap,
          supervisor: result.supervisor,
          market: result.market,
          dateOfTest: result.date_of_test,
          overallScore: result.score_value,
          isCorrect,
          timeSpent,
          userAnswer: (typeof answer === 'object' && answer !== null)
            ? (answer.selectedAnswer || answer.selected_answer || answer.answer)
            : answer,
          questionOrder: index
        });
      });
    });

    // Convert to array and calculate final metrics
    const analyticsData = Array.from(questionStats.values()).map(stats => {
      const correctRate = stats.totalAttempts > 0 ? (stats.correctAttempts / stats.totalAttempts) * 100 : 0;
      const avgTimeSpent = stats.timeSpentRecords.length > 0 
        ? stats.timeSpentRecords.reduce((a, b) => a + b, 0) / stats.timeSpentRecords.length 
        : 0;
      
      // Determine difficulty and status
      const difficulty = 100 - correctRate;
      let status = 'Good';
      let statusColor = '#10b981';
      
      if (correctRate < 40) {
        status = 'Very Hard';
        statusColor = '#dc2626';
      } else if (correctRate < 60) {
        status = 'Hard';  
        statusColor = '#ef4444';
      } else if (correctRate < 80) {
        status = 'Moderate';
        statusColor = '#f59e0b';
      }

      // Create display text for the question (first 100 characters)
      const displayText = stats.questionText.length > 100 
        ? stats.questionText.substring(0, 100) + '...'
        : stats.questionText;

      // Check if this question has any simulated data
      const hasSimulatedData = stats.results.some(r => r.isSimulated);

      return {
        // Identifiers
        questionId: stats.questionId,
        fullQuestionId: `${stats.quizTitle} - ${stats.questionText.substring(0, 50)}...`,
        displayText,
        
        // Question details
        questionText: stats.questionText,
        questionType: stats.questionType,
        options: stats.options,
        correctAnswer: stats.correctAnswer,
        
        // Context
        quizTitle: stats.quizTitle,
        quizId: stats.quizId,
        category: stats.category,
        section: stats.section,
        
        // Metrics
        attempts: stats.totalAttempts,
        correct: stats.correctAttempts,
        incorrect: stats.incorrectAttempts,
        correctRate: Math.round(correctRate * 10) / 10, // Round to 1 decimal
        difficulty: Math.round(difficulty * 10) / 10,
        avgTimeSpent: Math.round(avgTimeSpent * 10) / 10,
        
        // Status
        status,
        statusColor,
        needsReview: correctRate < 60 || avgTimeSpent > 120,
        
        // Data source indicators
        isSimulatedData: hasSimulatedData,
        hasTimingData: stats.timeSpentRecords.length > 0,
        
        // For debugging/drill-down
        results: stats.results
      };
    });

    // Sort by difficulty (most difficult first)
    return analyticsData.sort((a, b) => b.difficulty - a.difficulty);
  }

  /**
   * Process legacy quiz results to generate question-level analytics
   * This is used when quiz results don't have quiz_id (legacy data)
   * @param {Array} quizResults - Quiz results data
   * @returns {Promise<Array>} - Simulated question analytics based on quiz types and scores
   */
  async processLegacyQuestionAnalytics(quizResults) {
    console.log('🔄 Processing legacy quiz results for question analytics');

    // Group results by quiz type
    const quizTypeGroups = new Map();
    
    quizResults.forEach(result => {
      const quizType = result.quiz_type || 'Unknown Quiz';
      if (!quizTypeGroups.has(quizType)) {
        quizTypeGroups.set(quizType, []);
      }
      quizTypeGroups.get(quizType).push(result);
    });

    console.log('📝 Found', quizTypeGroups.size, 'unique quiz types');

    const questionAnalytics = [];
    let questionCounter = 1;

    // For each quiz type, simulate question-level data based on patterns
    quizTypeGroups.forEach((results, quizType) => {
      // Determine number of questions based on quiz type or use a reasonable default
      const questionCount = this.estimateQuestionCount(quizType, results);
      
      console.log(`🎯 Generating ${questionCount} questions for "${quizType}" (${results.length} results)`);

      for (let i = 1; i <= questionCount; i++) {
        const questionStats = this.generateQuestionStatsFromLegacyData(
          quizType, 
          i, 
          results,
          `legacy-q-${questionCounter++}`
        );
        
        if (questionStats) {
          questionAnalytics.push(questionStats);
        }
      }
    });

    console.log('✅ Generated', questionAnalytics.length, 'legacy question analytics');
    return questionAnalytics;
  }

  /**
   * Estimate the number of questions in a quiz based on quiz type and results
   * @param {string} quizType - Quiz type name
   * @param {Array} results - Quiz results for this type
   * @returns {number} - Estimated question count
   */
  estimateQuestionCount(quizType, results) {
    // Use common patterns in quiz types to estimate question counts
    const typeLower = quizType.toLowerCase();
    
    if (typeLower.includes('final') || typeLower.includes('comprehensive')) {
      return 15; // Final exams usually have more questions
    } else if (typeLower.includes('quiz') || typeLower.includes('test')) {
      return 10; // Regular quizzes
    } else if (typeLower.includes('module') || typeLower.includes('chapter')) {
      return 8; // Module tests
    } else if (typeLower.includes('practice') || typeLower.includes('review')) {
      return 12; // Practice tests
    }
    
    // Default based on score patterns - higher variance might indicate more questions
    const scores = results.map(r => parseFloat(r.score_value) || 0);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    if (avgScore > 0.85) {
      return 8; // Easier quizzes might be shorter
    } else if (avgScore < 0.65) {
      return 15; // Harder quizzes might be longer
    }
    
    return 10; // Default
  }

  /**
   * Generate question statistics from legacy data
   * @param {string} quizType - Quiz type
   * @param {number} questionNumber - Question number in quiz
   * @param {Array} results - Quiz results
   * @param {string} questionId - Unique question ID
   * @returns {Object} - Question analytics data
   */
  generateQuestionStatsFromLegacyData(quizType, questionNumber, results, questionId) {
    // Create realistic question patterns based on question position and quiz type
    const baseCorrectRate = this.calculateBaseCorrectRate(questionNumber, results);
    const questionText = this.generateQuestionText(quizType, questionNumber);
    const questionType = this.inferQuestionType(quizType, questionNumber);
    
    // Simulate attempts and correct/incorrect based on overall quiz performance
    let totalAttempts = 0;
    let correctAttempts = 0;
    let totalTime = 0;

    results.forEach(result => {
      const score = parseFloat(result.score_value) || 0;
      const timeSpent = parseFloat(result.time_taken) || 0;
      
      totalAttempts++;
      
      // Determine if this person would have gotten this question right
      // Based on their overall score and question difficulty patterns
      const questionDifficulty = this.calculateQuestionDifficulty(questionNumber, quizType);
      const personalCorrectProbability = score * (1 - questionDifficulty * 0.3);
      
      // Use a deterministic approach based on result ID and question number to avoid randomness
      const seed = (parseInt(result.id) || 0) * questionNumber;
      const deterministic = (seed % 100) / 100;
      
      if (deterministic < personalCorrectProbability) {
        correctAttempts++;
      }
      
      // Estimate time spent on this question (portion of total quiz time)
      if (timeSpent > 0) {
        totalTime += timeSpent / this.estimateQuestionCount(quizType, results);
      }
    });

    const correctRate = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
    const difficulty = 100 - correctRate;
    const avgTimeSpent = totalTime / Math.max(totalAttempts, 1);

    // Determine status
    let status = 'Good';
    let statusColor = '#10b981';
    
    if (correctRate < 40) {
      status = 'Very Hard';
      statusColor = '#dc2626';
    } else if (correctRate < 60) {
      status = 'Hard';  
      statusColor = '#ef4444';
    } else if (correctRate < 80) {
      status = 'Moderate';
      statusColor = '#f59e0b';
    }

    return {
      // Identifiers
      questionId: questionId,
      fullQuestionId: `${quizType} - Q${questionNumber}`,
      displayText: questionText.length > 100 ? questionText.substring(0, 100) + '...' : questionText,
      
      // Question details
      questionText: questionText,
      questionType: questionType,
      options: null, // Not available for legacy data
      correctAnswer: null, // Not available for legacy data
      
      // Context
      quizTitle: quizType,
      quizId: null,
      category: 'Legacy Quiz',
      section: 'Historical Data',
      
      // Metrics
      attempts: totalAttempts,
      correct: correctAttempts,
      incorrect: totalAttempts - correctAttempts,
      correctRate: Math.round(correctRate * 10) / 10,
      difficulty: Math.round(difficulty * 10) / 10,
      avgTimeSpent: Math.round(avgTimeSpent * 10) / 10,
      
      // Status
      status,
      statusColor,
      needsReview: correctRate < 60 || avgTimeSpent > 120,
      
      // Mark as legacy data
      isLegacyData: true,
      results: results.map(r => ({
        resultId: r.id,
        ldap: r.ldap,
        supervisor: r.supervisor,
        market: r.market,
        dateOfTest: r.date_of_test,
        overallScore: r.score_value
      }))
    };
  }

  /**
   * Calculate base correct rate for a question based on position and overall results
   */
  calculateBaseCorrectRate(questionNumber, results) {
    const avgScore = results.reduce((sum, r) => sum + (parseFloat(r.score_value) || 0), 0) / results.length;
    
    // Questions at different positions have different difficulty patterns
    let positionModifier = 1;
    if (questionNumber <= 3) {
      positionModifier = 1.1; // Earlier questions slightly easier
    } else if (questionNumber >= 8) {
      positionModifier = 0.9; // Later questions slightly harder
    }
    
    return Math.min(0.95, Math.max(0.25, avgScore * positionModifier));
  }

  /**
   * Generate realistic question text based on quiz type and question number
   */
  generateQuestionText(quizType, questionNumber) {
    const topics = [
      'Safety procedures and protocols',
      'Customer service best practices', 
      'Technical specifications and requirements',
      'Regulatory compliance standards',
      'Quality assurance processes',
      'Emergency response procedures',
      'Equipment operation guidelines',
      'Data handling and privacy policies',
      'Performance metrics and KPIs',
      'Communication protocols',
      'Risk assessment procedures',
      'Documentation requirements',
      'Training and certification standards',
      'Incident reporting processes',
      'Troubleshooting methodologies'
    ];
    
    const questionStems = [
      'What is the correct procedure for',
      'Which of the following best describes',
      'When should you implement',
      'What are the key requirements for',
      'How do you properly handle',
      'Which regulation governs',
      'What is the recommended approach for',
      'In what situation would you use',
      'What steps are required to',
      'Which factor is most important when'
    ];
    
    const topic = topics[(questionNumber - 1) % topics.length];
    const stem = questionStems[(questionNumber - 1) % questionStems.length];
    
    return `${stem} ${topic.toLowerCase()} in the context of ${quizType}?`;
  }

  /**
   * Infer question type based on patterns
   */
  inferQuestionType(quizType, questionNumber) {
    const types = ['multiple_choice', 'true_false', 'multiple_choice', 'multiple_choice'];
    return types[(questionNumber - 1) % types.length];
  }

  /**
   * Calculate question difficulty based on position and quiz type
   */
  calculateQuestionDifficulty(questionNumber, quizType) {
    let baseDifficulty = 0.3;
    
    // Adjust based on question position
    if (questionNumber <= 2) {
      baseDifficulty *= 0.8; // Easier intro questions
    } else if (questionNumber >= 8) {
      baseDifficulty *= 1.2; // Harder final questions
    }
    
    // Adjust based on quiz type
    const typeLower = quizType.toLowerCase();
    if (typeLower.includes('final') || typeLower.includes('comprehensive')) {
      baseDifficulty *= 1.3;
    } else if (typeLower.includes('practice')) {
      baseDifficulty *= 0.9;
    }
    
    // Add some variation based on question number (deterministic)
    const variation = 0.8 + ((questionNumber * 37) % 40) / 100; // Creates variation between 0.8-1.2
    baseDifficulty *= variation;
    
    return Math.min(0.7, Math.max(0.1, baseDifficulty));
  }

  /**
   * Simulate question data from overall quiz score when detailed answers aren't available
   * @param {Object} result - Quiz result
   * @param {Array} quizQuestions - Quiz questions from lookup
   * @param {Map} questionStats - Question statistics map to update
   */
  simulateQuestionDataFromScore(result, quizQuestions, questionStats) {
    const overallScore = parseFloat(result.score_value) || 0;
    
    quizQuestions.forEach(([questionKey, questionInfo]) => {
      const question = questionInfo.question;
      const quiz = questionInfo.quiz;
      const globalQuestionId = question.id;

      if (!questionStats.has(globalQuestionId)) {
        questionStats.set(globalQuestionId, {
          questionId: question.id,
          questionText: question.question_text,
          questionType: question.question_type,
          options: question.options,
          correctAnswer: question.correct_answer,
          quizTitle: quiz.title,
          quizId: quiz.id,
          category: question.categories?.name || 'Uncategorized',
          section: question.categories?.sections?.name || 'No Section',
          
          totalAttempts: 0,
          correctAttempts: 0,
          incorrectAttempts: 0,
          totalTime: 0,
          timeSpentRecords: [],
          results: []
        });
      }

      const stats = questionStats.get(globalQuestionId);
      
      // Simulate question difficulty based on position and type
      const questionIndex = questionInfo.orderIndex || 0;
      const baseDifficulty = this.calculateQuestionDifficulty(questionIndex + 1, quiz.title);
      
      // Determine if this person likely got this question right based on overall performance
      const personalCorrectProbability = overallScore * (1 - baseDifficulty * 0.4);
      
      // Use deterministic approach based on result ID and question ID
      const seed = (parseInt(result.id) || 0) + (question.id ? parseInt(question.id.replace(/\D/g, '')) || 0 : 0);
      const isCorrect = (seed % 100) / 100 < personalCorrectProbability;
      
      stats.totalAttempts++;
      if (isCorrect) {
        stats.correctAttempts++;
      } else {
        stats.incorrectAttempts++;
      }
      
      // Estimate time spent (portion of total quiz time)
      const timeSpent = result.time_taken ? (result.time_taken / quizQuestions.length) || 0 : 0;
      if (timeSpent > 0) {
        stats.totalTime += timeSpent;
        stats.timeSpentRecords.push(timeSpent);
      }

      stats.results.push({
        resultId: result.id,
        ldap: result.ldap,
        supervisor: result.supervisor,
        market: result.market,
        dateOfTest: result.date_of_test,
        overallScore: result.score_value,
        isCorrect,
        timeSpent,
        userAnswer: isCorrect ? 'Simulated Correct' : 'Simulated Incorrect',
        questionOrder: questionIndex,
        isSimulated: true
      });
    });
  }

  /**
   * Check if an answer is correct based on question type
   * @param {Object} answer - User's answer
   * @param {Object} question - Question data
   * @returns {boolean} - Whether the answer is correct
   */
  isAnswerCorrect(answer, question) {
    const correctAnswer = question.correct_answer;

    // Extract user answer - handle both simple format and object format
    let userAnswer;
    if (typeof answer === 'object' && answer !== null && 'selectedAnswer' in answer) {
      // This is the object format from the analytics processing
      userAnswer = answer.selectedAnswer || answer.selected_answer || answer.answer;
    } else {
      // This is the simple format directly from the database
      userAnswer = answer;
    }

    // Debug logging for first few questions
    if (Math.random() < 0.1) { // Log ~10% of questions to avoid spam
      console.log('🔍 Correctness Debug:', {
        questionId: question.id,
        questionType: question.question_type,
        userAnswer,
        correctAnswer,
        userAnswerType: typeof userAnswer,
        correctAnswerType: typeof correctAnswer
      });
    }

    if (userAnswer === undefined || userAnswer === null || correctAnswer === undefined || correctAnswer === null) {
      return false;
    }

    switch (question.question_type) {
      case 'multiple_choice':
        return userAnswer === correctAnswer;
      
      case 'true_false':
        return Boolean(userAnswer) === Boolean(correctAnswer);
      
      case 'check_all_that_apply':
        // Correct answer should be an array for check all that apply
        if (!Array.isArray(correctAnswer) || !Array.isArray(userAnswer)) {
          return false;
        }
        
        // Sort both arrays and compare
        const sortedCorrect = [...correctAnswer].sort();
        const sortedUser = [...userAnswer].sort();
        
        if (sortedCorrect.length !== sortedUser.length) {
          return false;
        }
        
        return sortedCorrect.every((val, index) => val === sortedUser[index]);
      
      default:
        console.warn('Unknown question type:', question.question_type);
        return false;
    }
  }
}

export const questionAnalyticsService = new QuestionAnalyticsService();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.questionAnalyticsService = questionAnalyticsService;
  window.clearQuestionAnalyticsCache = () => {
    questionAnalyticsService.clearCache();
    console.log('🧹 Question analytics cache cleared. Refresh the Question Analytics chart to see new data.');
  };
}