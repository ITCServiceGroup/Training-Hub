import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { isAnswerCorrect } from '../../utils/pdfGenerator';

const styles = StyleSheet.create({
  // Main container - optimized for 5 questions per page
  questionContainer: {
    flex: 1,
    paddingTop: 5,
    minHeight: 0, // Allow shrinking
  },

  // Very compact section header
  sectionHeader: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#1a202c',
    textAlign: 'center',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 9,
    color: '#718096',
    textAlign: 'center',
  },

  // Very compact question card - designed to fit 5 per page
  questionCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 8,
    marginBottom: 6,
    maxHeight: 130, // Strict height limit to ensure 5 fit
  },
  questionCardCorrect: {
    borderLeftWidth: 3,
    borderLeftColor: '#38a169',
    backgroundColor: '#f0fff4',
  },
  questionCardIncorrect: {
    borderLeftWidth: 3,
    borderLeftColor: '#e53e3e',
    backgroundColor: '#fffafa',
  },

  // Compact question header
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
  },
  questionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionNumber: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    backgroundColor: '#718096',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 8,
  },
  questionNumberCorrect: {
    backgroundColor: '#38a169',
  },
  questionNumberIncorrect: {
    backgroundColor: '#e53e3e',
  },
  questionProgress: {
    fontSize: 9,
    color: '#718096',
    fontFamily: 'Helvetica-Bold',
  },
  questionType: {
    fontSize: 8,
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    fontFamily: 'Helvetica-Bold',
    backgroundColor: '#edf2f7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },

  // Very compact question text
  questionText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1a202c',
    lineHeight: 1.3,
    marginBottom: 6,
  },

  // Very compact response sections
  responseRow: {
    flexDirection: 'row',
    marginBottom: 5,
    gap: 8,
  },
  responseColumn: {
    flex: 1,
  },
  responseHeader: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#4a5568',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  responseBox: {
    padding: 5,
    borderRadius: 3,
    borderWidth: 1,
  },
  responseText: {
    fontSize: 8,
    lineHeight: 1.2,
  },

  // Response styling
  userResponseCorrect: {
    backgroundColor: '#f0fff4',
    borderColor: '#38a169',
  },
  userResponseTextCorrect: {
    color: '#2f855a',
  },
  userResponseIncorrect: {
    backgroundColor: '#fffafa',
    borderColor: '#e53e3e',
  },
  userResponseTextIncorrect: {
    color: '#c53030',
  },
  correctResponseBox: {
    backgroundColor: '#f0fff4',
    borderColor: '#38a169',
  },
  correctResponseText: {
    color: '#2f855a',
  },

  // Compact explanation section
  explanationSection: {
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 3,
    borderLeftColor: '#4299e1',
    borderRadius: 4,
    padding: 10,
    marginTop: 8,
  },
  explanationHeader: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#4a5568',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  explanationText: {
    fontSize: 10,
    color: '#2d3748',
    lineHeight: 1.4,
  },
});

const QuizQuestionSection = ({ questions, selectedAnswers, startIndex, isPractice, showSectionTitle = true, totalQuestions }) => {
  const formatQuestionType = (type) => {
    switch (type) {
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'true_false':
        return 'True/False';
      case 'check_all_that_apply':
        return 'Check All That Apply';
      default:
        return 'Unknown';
    }
  };

  const getAnswerText = (question, answer) => {
    if (answer === undefined || answer === null) {
      return 'No Answer Provided';
    }

    switch (question.question_type) {
      case 'multiple_choice':
        return question.options?.[answer] ?? 'Invalid Answer Index';
      case 'true_false':
        return answer === true ? 'True' : 'False';
      case 'check_all_that_apply':
        if (Array.isArray(answer) && answer.length > 0) {
          return answer.map(idx => question.options?.[idx] ?? 'Invalid Index').join(', ');
        }
        return 'No Selection';
      default:
        return 'Unknown Answer Type';
    }
  };

  const getCorrectAnswerText = (question) => {
    switch (question.question_type) {
      case 'multiple_choice':
        return question.options?.[question.correct_answer] ?? 'N/A';
      case 'true_false':
        return question.correct_answer === true ? 'True' : 'False';
      case 'check_all_that_apply':
        if (Array.isArray(question.correct_answer)) {
          return question.correct_answer.map(idx => question.options?.[idx] ?? 'Invalid Index').join(', ');
        }
        return 'N/A';
      default:
        return 'N/A';
    }
  };

  return (
    <View style={styles.questionContainer}>
      {showSectionTitle && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Question Analysis</Text>
          <Text style={styles.sectionSubtitle}>Detailed Review of Assessment Responses</Text>
        </View>
      )}

      {questions.map((question, index) => {
        const answerData = selectedAnswers[question.id];
        const answer = isPractice ? answerData?.answer : answerData;
        const correct = isAnswerCorrect(question, answerData, isPractice);
        const questionNumber = startIndex + index + 1;

        return (
          <View
            key={question.id}
            style={[
              styles.questionCard,
              correct ? styles.questionCardCorrect : styles.questionCardIncorrect
            ]}
          >
            {/* Compact Question Header */}
            <View style={styles.questionHeader}>
              <View style={styles.questionInfo}>
                <Text style={[
                  styles.questionNumber,
                  correct ? styles.questionNumberCorrect : styles.questionNumberIncorrect
                ]}>
                  Q{questionNumber}
                </Text>
                <Text style={styles.questionProgress}>
                  {questionNumber} of {totalQuestions || 'N/A'}
                </Text>
              </View>
              <Text style={styles.questionType}>
                {formatQuestionType(question.question_type)}
              </Text>
            </View>

            {/* Question Text */}
            <Text style={styles.questionText}>
              {question.question_text}
            </Text>

            {/* Compact Response Layout - Side by Side */}
            <View style={styles.responseRow}>
              <View style={styles.responseColumn}>
                <Text style={styles.responseHeader}>Your Answer</Text>
                <View style={[
                  styles.responseBox,
                  correct ? styles.userResponseCorrect : styles.userResponseIncorrect
                ]}>
                  <Text style={[
                    styles.responseText,
                    correct ? styles.userResponseTextCorrect : styles.userResponseTextIncorrect
                  ]}>
                    {getAnswerText(question, answer)}
                  </Text>
                </View>
              </View>

              <View style={styles.responseColumn}>
                <Text style={styles.responseHeader}>Correct Answer</Text>
                <View style={styles.correctResponseBox}>
                  <Text style={[styles.responseText, styles.correctResponseText]}>
                    {getCorrectAnswerText(question)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Compact Explanation */}
            {question.explanation && (
              <View style={styles.explanationSection}>
                <Text style={styles.explanationHeader}>Explanation</Text>
                <Text style={styles.explanationText}>
                  {question.explanation}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default QuizQuestionSection;
